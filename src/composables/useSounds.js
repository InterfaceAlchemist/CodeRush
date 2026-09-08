const AudioContextClass = window.AudioContext || window.webkitAudioContext

export function useSounds() {
    let ctx = null

    function getContext() {
        if (!ctx) ctx = new AudioContextClass()
        return ctx
    }

    function beep({ frequency, duration, type = 'sine', volume = 0.15 }) {
        const audioCtx = getContext()
        const oscillator = audioCtx.createOscillator()
        const gain = audioCtx.createGain()

        oscillator.type = type
        oscillator.frequency.value = frequency
        gain.gain.value = volume

        oscillator.connect(gain)
        gain.connect(audioCtx.destination)

        oscillator.start()
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration)
        oscillator.stop(audioCtx.currentTime + duration)
    }

    function playCorrect() {
        beep({ frequency: 600, duration: 0.04, type: 'sine', volume: 0.06 })
    }

    function playError() {
        beep({ frequency: 150, duration: 0.12, type: 'sine', volume: 0.08 })
    }

    function playFinish() {
        beep({ frequency: 525, duration: 0.15 })
        setTimeout(() => {
            beep({ frequency: 659, duration: 0.15 })
        }, 120)
        setTimeout(() => {
            beep({ frequency: 784, duration: 0.25 })
        }, 240)

    }

    return {
        playCorrect,
        playError,
        playFinish
    }
}   
