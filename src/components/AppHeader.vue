<script setup>
import logoSmall from "../assets/images/icon-wasd.svg";
import iconPersonalBest from "../assets/images/icon-trophy.svg";

defineProps({
  personalBest: {
    type: Number,
    default: null,
  },
  soundEnabled: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["toggle-sound"]);
</script>

<template>
  <header class="flex items-start justify-between gap-4 sm:items-center">
    <div class="flex items-center gap-4">
      <img :src="logoSmall" alt="" class="h-10 w-10 shrink-0" />
      <div>
        <h1 class="font-sora text-lg font-bold text-orange-400 sm:text-xl">
          CodeRush
        </h1>
        <p class="hidden text-sm text-white sm:block">
          Typing Speed Test - Coding Edition
        </p>
      </div>
    </div>

    <div
      class="flex items-center gap-2 whitespace-nowrap text-sm text-neutral-400 sm:text-base"
    >
      <img :src="iconPersonalBest" alt="" class="h-10 w-10" />
      <span class="hidden sm:inline">Personal best:</span>
      <span class="sm:hidden">Best:</span>
      <span class="font-bold text-neutral-0">{{
        personalBest !== null ? `${personalBest} WPM` : "—"
      }}</span>
    </div>
    <button
      type="button"
      class="text-neutral-400 hover:text-neutral-0"
      :aria-label="soundEnabled ? 'Mute sounds' : 'Unmute sounds'"
      @click="emit('toggle-sound')"
    >
      {{ soundEnabled ? "🔊" : "🔇" }}
    </button>
  </header>
</template>
