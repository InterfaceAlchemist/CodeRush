<script setup>
import { ref, onMounted, onBeforeMount } from "vue";
import { useTypingTest } from "./composables/useTypingTest";
import AppHeader from "./components/AppHeader.vue";
import ControlsBar from "./components/ControlsBar.vue";
import TypingPassage from "./components/TypingPassage.vue";
import ResultsScreen from "./components/ResultsScreen.vue";
import { useSounds } from "./composables/useSounds";
import CustomSnippetInput from "./components/CustomSnippetInput.vue";

const passageComponent = ref(null);
const { playCorrect, playError, playFinish } = useSounds();
const soundEnabled = ref(true);
const showCustomInput = ref(false);

const {
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
  handleTyping,
  handleTab,
  startTest,
  restart,
  setLanguage,
  setDifficulty,
  setMode,
  setCustomPassage,
} = useTypingTest({
  onCorrectKey: () => soundEnabled.value && playCorrect(),
  onErrorKey: () => soundEnabled.value && playError(),
  onFinish: () => soundEnabled.value && playFinish(),
});

function toggleSound() {
  soundEnabled.value = !soundEnabled.value;
}

function handleRestart() {
  restart();
}
function handleRetry() {
  restart({ keepPassage: true }); // Pass true to keep the same passage
}

function handleOpenCustom() {
  showCustomInput.value = true;
}

function handleUseCustom({ text, language: customLang }) {
  setCustomPassage(text, customLang);
  showCustomInput.value = false;
}

function handleCancelCustom() {
  showCustomInput.value = false;
}

function handleGlobalKeydown(e) {
  const isButtonFocused = e.target.tagname === "BUTTON";

  if (showCustomInput.value && e.key === "Escape") {
    handleCancelCustom();
    return;
  }

  if (status.value === "finished" && e.key === "Enter" && !isButtonFocused) {
    handleRestart();
  }
}

onMounted(() => window.addEventListener("keydown", handleGlobalKeydown));
onBeforeMount(() => window.removeEventListener("keydown", handleGlobalKeydown));
</script>

<template>
  <div
    class="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-12"
  >
    <AppHeader
      :personal-best="personalBest"
      :sound-enabled="soundEnabled"
      @toggle-sound="toggleSound"
    />

    <main class="flex flex-1 flex-col">
      <template v-if="status !== 'finished'">
        <ControlsBar
          v-if="!showCustomInput"
          :wpm="liveWpm"
          :accuracy="liveAccuracy"
          :time-label="timeLabel"
          :language="language"
          :difficulty="difficulty"
          :mode="mode"
          :disabled="status === 'running'"
          @update:language="setLanguage"
          @update:difficulty="setDifficulty"
          @update:mode="setMode"
          @open-custom="handleOpenCustom"
        />

        <CustomSnippetInput
          v-if="showCustomInput"
          :current-language="language"
          @use-custom="handleUseCustom"
          @cancel="handleCancelCustom"
        />

        <TypingPassage
          v-else
          ref="passageComponent"
          class="mt-8"
          :passage-text="passageText"
          :typed="typed"
          :status="status"
          :language="language"
          @type="handleTyping"
          @tab="handleTab"
          @start="startTest"
          @restart="handleRestart"
        />
      </template>

      <ResultsScreen
        v-else
        :result="result"
        :run-History="runHistory"
        @restart="handleRestart"
        @retry="handleRetry"
      />
    </main>

    <footer class="mt-auto pt-8 text-center text-xs text-neutral-500">
      Built by
      <a
        class="text-orange-400 hover:underline"
        href="https://github.com/InterfaceAlchemist"
        target="_blank"
        rel="noreferrer"
        >Interface Alchemist</a
      >.
    </footer>
  </div>
</template>
