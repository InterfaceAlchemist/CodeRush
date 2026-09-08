<script setup>
import iconDownArrow from "../assets/images/icon-down-arrow.svg";

const props = defineProps({
  wpm: { type: Number, required: true },
  accuracy: { type: Number, required: true },
  timeLabel: { type: String, required: true },
  language: { type: String, required: true },
  difficulty: { type: String, required: true },
  mode: { type: String, required: true },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:language",
  "update:difficulty",
  "update:mode",
  "open-custom",
]);

const LANGUAGES = [
  { value: "javascript", label: "JS" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
];
const DIFFICULTIES = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];
const MODES = [
  { value: "timed", label: "Timed (60s)" },
  { value: "passage", label: "Passage" },
];

function pillClasses(isActive) {
  return [
    "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
    isActive
      ? "border-blue-600 text-blue-400"
      : "border-neutral-800 text-neutral-0 hover:border-neutral-500",
  ];
}
const DIFFICULTY_ACTIVE_CLASSES = {
  easy: "border-green-500 text-green-500",
  medium: "border-yellow-600 text-yellow-400",
  hard: "border-red-500 text-red-500",
};
function difficultyPillClasses(value, isActive) {
  return [
    "whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400",
    isActive
      ? DIFFICULTY_ACTIVE_CLASSES[value]
      : "border-neutral-800 text-neutral-0 hover:border-neutral-500",
  ];
}
</script>

<template>
  <div
    class="flex flex-col gap-10 border-b border-neutral-800 pb-6 sm:flex-row sm:items-right sm:justify-between"
  >
    <!-- live stats -->
    <div
      class="flex flex-wrap items-center gap-x-4 gap-y-2 divide-x divide-neutral-800 text-sm sm:text-base"
    >
      <span class="text-neutral-400"
        >WPM: <strong class="text-neutral-0 font-bold">{{ wpm }}</strong></span
      >
      <span class="pl-4 text-neutral-400"
        >Accuracy:
        <strong class="font-bold text-red-500">{{ accuracy }}%</strong></span
      >
      <span class="pl-6 text-neutral-400"
        >Time:
        <strong class="font-bold text-yellow-400">{{ timeLabel }}</strong></span
      >
    </div>

    <!-- desktop pill controls -->
    <div class="hidden flex-wrap items-center gap-x-8 gap-y-3 md:flex">
      <div class="flex items-center gap-2">
        <span class="text-neutral-400">Language:</span>
        <div class="flex gap-2">
          <button
            v-for="l in LANGUAGES"
            :key="l.value"
            type="button"
            :disabled="disabled"
            :class="pillClasses(language === l.value)"
            :aria-pressed="language === l.value"
            @click="emit('update:language', l.value)"
          >
            {{ l.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-neutral-400">Difficulty:</span>
        <div class="flex gap-2">
          <button
            v-for="d in DIFFICULTIES"
            :key="d.value"
            type="button"
            :disabled="disabled"
            :class="difficultyPillClasses(d.value, difficulty === d.value)"
            :aria-pressed="difficulty === d.value"
            @click="emit('update:difficulty', d.value)"
          >
            {{ d.label }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-neutral-400">Mode:</span>
        <div class="flex gap-2">
          <button
            v-for="m in MODES"
            :key="m.value"
            type="button"
            :disabled="disabled"
            :class="pillClasses(mode === m.value)"
            :aria-pressed="mode === m.value"
            @click="emit('update:mode', m.value)"
          >
            {{ m.label }}
          </button>
        </div>
      </div>

      <button
        type="button"
        :disabled="disabled"
        class="whitespace-nowrap rounded-full border border-neutral-800 px-4 py-1.5 text-sm font-semibold text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-0"
        @click="emit('open-custom')"
      >
        Use My Own Code
      </button>
    </div>

    <!-- mobile dropdown controls -->
    <div class="flex flex-wrap gap-3 md:hidden">
      <div class="relative min-w-[9rem] flex-1">
        <label class="sr-only" for="language-select">Language</label>
        <select
          id="language-select"
          :disabled="disabled"
          class="w-full appearance-none rounded-full border border-neutral-800 bg-transparent px-4 py-2 pr-9 text-sm font-semibold text-neutral-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          :value="language"
          @change="emit('update:language', $event.target.value)"
        >
          <option
            v-for="l in LANGUAGES"
            :key="l.value"
            :value="l.value"
            class="bg-neutral-900"
          >
            {{ l.label }}
          </option>
        </select>
        <img
          :src="iconDownArrow"
          alt=""
          class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
        />
      </div>

      <div class="relative min-w-[9rem] flex-1">
        <label class="sr-only" for="difficulty-select">Difficulty</label>
        <select
          id="difficulty-select"
          :disabled="disabled"
          class="w-full appearance-none rounded-full border border-neutral-800 bg-transparent px-4 py-2 pr-9 text-sm font-semibold text-neutral-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          :value="difficulty"
          @change="emit('update:difficulty', $event.target.value)"
        >
          <option
            v-for="d in DIFFICULTIES"
            :key="d.value"
            :value="d.value"
            class="bg-neutral-900"
          >
            {{ d.label }}
          </option>
        </select>
        <img
          :src="iconDownArrow"
          alt=""
          class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
        />
      </div>

      <div class="relative min-w-[9rem] flex-1">
        <label class="sr-only" for="mode-select">Mode</label>
        <select
          id="mode-select"
          :disabled="disabled"
          class="w-full appearance-none rounded-full border border-neutral-800 bg-transparent px-4 py-2 pr-9 text-sm font-semibold text-neutral-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          :value="mode"
          @change="emit('update:mode', $event.target.value)"
        >
          <option
            v-for="m in MODES"
            :key="m.value"
            :value="m.value"
            class="bg-neutral-900"
          >
            {{ m.label }}
          </option>
        </select>
        <img
          :src="iconDownArrow"
          alt=""
          class="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2"
        />
      </div>

      <button
        type="button"
        :disabled="disabled"
        class="whitespace-nowrap rounded-full border border-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-0"
        @click="emit('open-custom')"
      >
        Use My Own Code
      </button>
    </div>
  </div>
</template>
