<script setup>
import { computed } from "vue";
import iconCompleted from "../assets/images/icon-completed.svg";
import iconNewPb from "../assets/images/icon-new-pb.svg";
import iconRestart from "../assets/images/icon-restart.svg";
import patternStar1 from "../assets/images/pattern-star-1.svg";
import patternStar2 from "../assets/images/pattern-star-2.svg";
import patternConfetti from "../assets/images/pattern-confetti.svg";

const props = defineProps({
  result: { type: Object, required: true }, // { wpm, accuracy, correctChars, incorrectChars, resultType }
  runHistory: { type: Array, default: () => [] }, // Array of { wpm, accuracy, timestamp }
});

const emit = defineEmits(["restart", "retry"]);

const COPY = {
  normal: {
    icon: iconCompleted,
    title: "Test Complete!",
    subtitle: "Solid run. Keep it up to beat your high score.",
    button: "Go Again",
  },
  baseline: {
    icon: iconCompleted,
    title: "Baseline Established!",
    subtitle:
      "You've set the bar. Now the real challenge begins—time to beat it.",
    button: "Beat This Score",
  },
  newBest: {
    icon: iconNewPb,
    title: "High Score Smashed!",
    subtitle: "You're getting faster. That was incredible typing.",
    button: "Beat This Score",
  },
};

const copy = computed(() => COPY[props.result.resultType] ?? COPY.normal);
const isCelebration = computed(() => props.result.resultType === "newBest");

const chartPoints = computed(() => {
  if (props.runHistory.length < 2) return null;

  const width = 200;
  const height = 50;
  const wpmValues = props.runHistory.map((r) => r.wpm);
  const maxWpm = Math.max(...wpmValues);
  const minWpm = Math.min(...wpmValues);
  const range = maxWpm - minWpm || 1;

  return wpmValues
    .map((wpm, i) => {
      const x = (i / (wpmValues.length - 1)) * width;
      const y = height - ((wpm - minWpm) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
});
</script>

<template>
  <div
    class="relative flex min-h-135 flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-16 text-center"
  >
    <!-- side decorations -->
    <img
      :src="patternStar2"
      alt=""
      class="absolute left-4 top-1/4 h-6 w-6 sm:left-12"
    />
    <img
      :src="patternStar1"
      alt=""
      class="absolute right-4 top-[45%] h-8 w-8 sm:right-16"
    />

    <div
      class="flex h-16 w-16 items-center justify-center rounded-full"
      :class="isCelebration ? '' : 'bg-green-500/15'"
    >
      <img :src="copy.icon" alt="" class="h-12 w-12" />
    </div>

    <h2 class="mt-6 font-sora text-2xl font-bold text-neutral-0 sm:text-3xl">
      {{ copy.title }}
    </h2>
    <p class="mt-2 max-w-sm text-neutral-400">{{ copy.subtitle }}</p>

    <div class="mt-8 flex flex-wrap items-stretch justify-center gap-3">
      <div class="rounded-lg border border-neutral-800 px-6 py-3 text-left">
        <p class="text-sm text-neutral-400">WPM:</p>
        <p class="font-sora text-xl font-bold text-neutral-0">
          {{ result.wpm }}
        </p>
      </div>
      <div class="rounded-lg border border-neutral-800 px-6 py-3 text-left">
        <p class="text-sm text-neutral-400">Raw WPM:</p>
        <p class="font-sora text-xl font-bold text-neutral-400">
          {{ result.rawWpm }}
        </p>
      </div>
      <div class="rounded-lg border border-neutral-800 px-6 py-3 text-left">
        <p class="text-sm text-neutral-400">Accuracy:</p>
        <p
          class="font-sora text-xl font-bold"
          :class="isCelebration ? 'text-green-500' : 'text-red-500'"
        >
          {{ result.accuracy }}%
        </p>
      </div>
      <div class="rounded-lg border border-neutral-800 px-6 py-3 text-left">
        <p class="text-sm text-neutral-400">Characters</p>
        <p class="font-sora text-xl font-bold">
          <span class="text-green-500">{{ result.correctChars }}</span
          ><span class="text-neutral-400">/</span
          ><span class="text-red-500">{{ result.incorrectChars }}</span>
        </p>
      </div>
    </div>

    <div
      v-if="result.errorBreakdown.length > 0"
      class="mt-6 flex flex-col items-center gap-2"
    >
      <p class="text-sm text-neutral-400">Most missed keys</p>
      <div class="flex flex-wrap justify-center gap-2">
        <span
          v-for="item in result.errorBreakdown"
          :key="item.char"
          class="rounded-full border border-neutral-800 px-3 py-1 text-sm text-neutral-0"
        >
          {{ item.char }} <span class="text-red-500">×{{ item.count }}</span>
        </span>
      </div>
    </div>

    <div v-if="chartPoints" class="mt-6 flex flex-col items-center gap-2">
      <p class="text-sm text-neutral-400">Last {{ runHistory.length }} runs</p>
      <svg viewBox="0 0 200 50" class="h-12 w-48">
        <polyline
          :points="chartPoints"
          fill="none"
          stroke="#3b82f6"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <button
      type="button"
      class="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-neutral-0 px-8 py-4 font-sora text-lg font-bold text-neutral-900 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      @click="emit('restart')"
    >
      {{ copy.button }}
      <img :src="iconRestart" alt="" class="h-4 w-4 invert" />
    </button>

    <button
      type="button"
      class="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 px-6 py-3 font-sora font-bold text-neutral-0 transition-colors hover:border-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
      @click="emit('retry')"
    >
      Retry This One
    </button>
  </div>

  <img
    v-if="isCelebration"
    :src="patternConfetti"
    alt=""
    class="pointer-events-none absolute bottom-0 left-0 h-24 w-full object-cover object-top opacity-90 sm:h-40"
  />
</template>
