import { ref, computed, onBeforeUnmount } from 'vue'
import snippets from '../data/snippets.json'

const PB_STORAGE_KEY = 'typingSpeedTest.personalBest'
const HISTORY_STORAGE_KEY = 'typingSpeedTest.history'
const SETTINGS_STORAGE_KEY = 'typingSpeedTest.settings'
const WEAK_KEYS_STORAGE_KEY = 'typingSpeedTest.weakKeys'
const BADGES_STORAGE_KEY = 'typingSpeedTest.badges'
const TIMED_DURATION = 60
const MAX_HISTORY = 10

let lastPassage = null

function pickPassage(language, difficulty) {
  const list = snippets[language][difficulty]
  const candidates = list.length > 1 ? list.filter((s) => s !== lastPassage) : list
  const choice = candidates[Math.floor(Math.random() * candidates.length)]
  lastPassage = choice
  return choice
}

function generateDrillPassage(weakKeysData) {
  const topChars = Object.entries(weakKeysData)
  .filter(([char]) => char !== ' ' && char !== '\n')
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([char]) => char)

  if (topChars.length === 0) return null

  const words = []
  for (let i = 0; i < 15; i++) {
    const char = topChars[Math.floor(Math.random() * topChars.length)]
    const repeatCount = 2 + Math.floor(Math.random() * 3)
    words.push(char.repeat(repeatCount))
  }
  return words.join(' ')
}

function loadPersonalBest() {
  const raw = localStorage.getItem(PB_STORAGE_KEY)
  return raw ? Number(raw) : null
}

function loadHistory() {
  const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
  return raw ? JSON.parse(raw) : []
}

function loadSettings() {
  const defaults = { language: 'javascript', difficulty: 'easy', mode: 'timed' }
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!raw) return defaults
  try {
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

function loadWeakKeys() {
  const raw = localStorage.getItem(WEAK_KEYS_STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function loadBadgeState() {
  const defaults = { unlocked: {}, totalTestCompleted: 0, languagesCompleted: {} }
  const raw = localStorage.getItem(BADGES_STORAGE_KEY)
  if (!raw) return defaults
  try {
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return defaults
  }
}

const BADGE_DEFINITIONS = [
  {
    id: 'speedDemon',
    label: 'Speed Demon',
    description: 'Achieve a WPM of 100 or more in a single test.',
    check: (ctx) => ctx.wpm >= 100,
  },
    {
    id: 'perfectionist',
    label: 'Perfectionist',
    description: 'Complete a test at 100% accuracy.',
    check: (ctx) => ctx.accuracy === 100,
  },
    {
    id: 'marathon',
    label: 'Marathon',
    description: 'Complete 10 tests.',
    check: (ctx) => ctx.totalTestsCompleted >= 10,
  },
    {
    id: 'polyglot',
    label: 'Polyglot',
    description: 'Complete a test in JavaScript, PHP, and SQL.',
    check: (ctx) => Object.keys(ctx.languagesCompleted).length >= 3,
  },
]


export function useTypingTest({ onCorrectKey, onErrorKey, onFinish } = {}) {
  // ----- settings -----
  const savedSettings = loadSettings()
  const language = ref(savedSettings.language) // 'javascript' | 'php' | 'sql'
  const difficulty = ref(savedSettings.difficulty) // 'easy' | 'medium' | 'hard'
  const mode = ref(savedSettings.mode) // 'timed' | 'passage'

  function saveSettings() {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ language: language.value, difficulty: difficulty.value, mode: mode.value }))
}

  // ----- passage + input state -----
  const passageText = ref(pickPassage(language.value, difficulty.value))
  const typed = ref('')

  // status: 'idle' -> 'running' -> 'finished'
  const status = ref('idle')

  // cumulative keystroke tallies (never decrease, even on backspace,
  // so corrected mistakes still count against accuracy)
  const totalKeystrokes = ref(0)
  const totalCorrectKeystrokes = ref(0)
  const errorCounts = ref({}) // { char: count, ... }

  // timing
  const startTime = ref(null)
  const elapsedSeconds = ref(0)
  let timerId = null

  // results (populated when a test finishes)
  const result = ref(null) // { wpm, accuracy, correctChars, incorrectChars, resultType }

  const personalBest = ref(loadPersonalBest())
  const runHistory = ref(loadHistory())
  const isCustomSnippet = ref(false) // true if the user has pasted a custom snippet
  const weakKeys = ref(loadWeakKeys())
  const isDrillMode = ref(false)
  const badgeState = ref(loadBadgeState())

  function saveWeakKeys() {
    localStorage.setItem(WEAK_KEYS_STORAGE_KEY, JSON.stringify(weakKeys.value))
  }

  function saveBadgeState() {
    localStorage.setItem(BADGES_STORAGE_KEY, JSON.stringify(badgeState.value))
  }

  const timeLabel = computed(() => {
    if (mode.value === 'timed') {
      const remaining = status.value === 'idle' ? TIMED_DURATION : Math.max(0, TIMED_DURATION - Math.floor(elapsedSeconds.value))
      return `0:${String(remaining).padStart(2, '0')}`
    }
    return `0:${String(Math.floor(elapsedSeconds.value)).padStart(2, '0')}`
  })

  const liveWpm = computed(() => {
    const minutes = elapsedSeconds.value / 60
    if (minutes <= 0) return 0
    const correctChars = countCorrectChars(typed.value, passageText.value)
    return Math.round(correctChars / 5 / minutes)
  })

  const liveAccuracy = computed(() => {
    if (totalKeystrokes.value === 0) return 100
    return Math.round((totalCorrectKeystrokes.value / totalKeystrokes.value) * 100)
  })

  const hasWeakKeyData = computed(() => Object.keys(weakKeys.value).length > 0)

  const allBadgesWithStatus = computed(() => 
    BADGE_DEFINITIONS.map((b) => ({ ...b, unlocked: !!badgeState.value.unlocked[b.id] }))
  )

  function countCorrectChars(typedStr, passage) {
    let count = 0
    for (let i = 0; i < typedStr.length; i++) {
      if (typedStr[i] === passage[i]) count++
    }
    return count
  }

  function tick() {
    elapsedSeconds.value = (Date.now() - startTime.value) / 1000
    if (mode.value === 'timed' && elapsedSeconds.value >= TIMED_DURATION) {
      elapsedSeconds.value = TIMED_DURATION
      finishTest()
    }
  }

  function startTest() {
    if (status.value !== 'idle') return
    status.value = 'running'
    startTime.value = Date.now()
    elapsedSeconds.value = 0
    timerId = setInterval(tick, 100)
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  function formatChar(char) {
    if (char === ' ') return 'Space'
    if (char === '\n') return 'Enter'
    return char
  }

  function finishTest() {
    if (status.value !== 'running') return
    stopTimer()
    status.value = 'finished'

    const correctChars = countCorrectChars(typed.value, passageText.value)
    const incorrectChars = typed.value.length - correctChars
    const minutes = Math.max(elapsedSeconds.value, 1) / 60
    const wpm = Math.round(correctChars / 5 / minutes)
    const rawWpm = Math.round(totalKeystrokes.value / 5 /  minutes)
    const accuracy = totalKeystrokes.value === 0 ? 100 : Math.round((totalCorrectKeystrokes.value / totalKeystrokes.value) * 100)

    let resultType = 'normal'
    if (personalBest.value === null) {
      resultType = 'baseline'
      personalBest.value = wpm
      localStorage.setItem(PB_STORAGE_KEY, String(wpm))
    } else if (wpm > personalBest.value) {
      resultType = 'newBest'
      personalBest.value = wpm
      localStorage.setItem(PB_STORAGE_KEY, String(wpm))
    }

    for (const [char, count] of Object.entries(errorCounts.value)) {
      weakKeys.value[char] = (weakKeys.value[char] || 0) + count
    }
    saveWeakKeys()

    badgeState.value.totalTestCompleted++
    badgeState.value.languagesCompleted[language.value] = true

    const badgeContext = {
      wpm,
      accuracy,
      totalTestsCompleted: badgeState.value.totalTestsCompleted,
      languagesCompleted: badgeState.value.languagesCompleted,
    }

    const newlyUnlockedBadges = []
    for (const badge of BADGE_DEFINITIONS) {
      const alreadyUnlocked = badgeState.value.unlocked[badge.id]
      if (!alreadyUnlocked && badge.check(badgeContext)) {
        badgeState.value.unlocked[badge.id] = true
        newlyUnlockedBadges.push(badge)
      }
    }
    saveBadgeState()

    const errorBreakdown = Object.entries(errorCounts.value)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([char, count]) => ({ char: formatChar(char), count }))

    result.value = { wpm, rawWpm, accuracy, correctChars, incorrectChars, resultType, errorBreakdown, newlyUnlockedBadges }
    onFinish?.()

    const historyEntry = { wpm, accuracy, timestamp: Date.now() }
    const updatedHistory = [...runHistory.value, historyEntry].slice(-MAX_HISTORY)
    runHistory.value = updatedHistory
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory))
  }

  function handleTyping(newValue) {
    if (status.value === 'finished') return
    if (status.value === 'idle') startTest()

    if (newValue.length > typed.value.length) {
      // forward keystrokes only count toward totals; ignore extra chars
      // beyond the passage length (e.g. holding a key down)

      const added = newValue.slice(typed.value.length)
      for (const ch of added) {
        const idx = typed.value.length
        if (idx >= passageText.value.length) break
        totalKeystrokes.value++
        const isCorrect = ch === passageText.value[idx]
        if (isCorrect) { totalCorrectKeystrokes.value++
        onCorrectKey?.()
      } else {
        const expectedChar = passageText.value[idx]
        errorCounts.value[expectedChar] = (errorCounts.value[expectedChar] || 0) + 1
        onErrorKey?.()
      }
        typed.value += ch
      }
    } else {
      // backspace / deletion — sync visible text, totals stay as-is
      typed.value = newValue
    }

    if (typed.value.length >= passageText.value.length) {
      finishTest()
    }
  }

  function resetPassage() {
    passageText.value = pickPassage(language.value, difficulty.value)
    isCustomSnippet.value = false
    isDrillMode.value = false
  }

  function setCustomPassage(text, customLanguage) {
    if (status.value !== 'idle') return
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    if (customLanguage) language.value = customLanguage
    passageText.value = trimmed
    isCustomSnippet.value = true
  }

  function startWeakKeyDrill() {
    if (status.value !== 'idle') return false
    const drill = generateDrillPassage(weakKeys.value)
    if (!drill) return false
    passageText.value = drill
    isDrillMode.value = true
    isCustomSnippet.value = false
    return true
  }

  function restart({ keepPassage = false } = {}) {
    stopTimer()
    status.value = 'idle'
    typed.value = ''
    totalKeystrokes.value = 0
    totalCorrectKeystrokes.value = 0
    errorCounts.value = {}
    elapsedSeconds.value = 0
    startTime.value = null
    result.value = null
    if (!keepPassage) resetPassage()
  }

  function setDifficulty(value) {
    difficulty.value = value
    saveSettings()
    if (status.value === 'idle') resetPassage()
  }

  function setLanguage(value) {
    language.value = value
    saveSettings()
    if (status.value === 'idle') resetPassage()
  }

  function setMode(value) {
    mode.value = value
    saveSettings()
    if (status.value === 'idle') resetPassage()
  }

  // Tab key inserts real indentation instead of moving browser focus.
  // It "smart-fills" whatever run of spaces comes next in the snippet,
  // so it always matches the target regardless of 2- vs 4-space style.
  function handleTab() {
    if (status.value === 'finished') return
    let spaceCount = 0
    while (passageText.value[typed.value.length + spaceCount] === ' ') {
      spaceCount++
    }
    if (spaceCount === 0) return
    handleTyping(typed.value + ' '.repeat(spaceCount))
  }
    const soundEnabled = ref(true)

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  onBeforeUnmount(stopTimer)

  return {
    language,
    difficulty,
    mode,
    passageText,
    typed,
    status,
    result,
    personalBest,
    runHistory,
    timeLabel,
    liveWpm,
    liveAccuracy,
    setCustomPassage,
    isCustomSnippet,
    weakKeys,
    hasWeakKeyData,
    isDrillMode,
    startWeakKeyDrill,
    allBadgesWithStatus,
    soundEnabled,
    toggleSound,
    handleTyping,
    handleTab,
    startTest,
    restart,
    setLanguage,
    setDifficulty,
    setMode,
  }
}

