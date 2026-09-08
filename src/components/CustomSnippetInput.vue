<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  currentLanguage: { type: String, required: true },
});
const emit = defineEmits(["use-custom", "cancel"]);

const text = ref("");
const selectedLanguage = ref(props.currentLanguage);
const LANGUAGES = [
  { value: "javascript", label: "JS" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
];

const FILE_EXTENSIONS = {
  javascript: "js",
  php: "php",
  sql: "sql",
};

const filename = computed(
  () => `snippet.${FILE_EXTENSIONS[selectedLanguage.value] || "txt"}`,
);

function submit() {
  if (!text.value.trim()) return;
  emit("use-custom", { text: text.value, language: selectedLanguage.value });
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg border border-neutral-800 p-4">
    <div class="flex items-center gap-2">
      <span class="text-neutral-400">Language:</span>
      <button
        v-for="lang in LANGUAGES"
        :key="lang.value"
        type="button"
        class="rounded-full border px-3 py-1 text-sm font-semibold transition-colors"
        :class="
          selectedLanguage === lang.value
            ? 'border-blue-600 text-blue-400'
            : 'border-neutral-800 text-neutral-0 hover:border-neutral-500'
        "
        @click="selectedLanguage = lang.value"
      >
        {{ lang.label }}
      </button>
    </div>

    <div>
      <div
        class="flex items-center gap-2 rounded-t-lg border border-b-0 border-neutral-800 bg-neutral-800/40 px-4 py-2.5"
      >
        <span class="h-3 w-3 rounded-full bg-red-500"></span>
        <span class="h-3 w-3 rounded-full bg-yellow-400"></span>
        <span class="h-3 w-3 rounded-full bg-green-500"></span>
        <span class="ml-2 font-mono text-xs text-neutral-500">{{
          filename
        }}</span>
      </div>
      <textarea
        v-model="text"
        rows="8"
        placeholder="Paste your own code here..."
        class="w-full rounded-b-lg border border-t-0 border-neutral-800 bg-transparent p-3 font-mono text-sm text-neutral-0 focus-visible:outline-1 focus-visible:outline-blue-300"
      ></textarea>
    </div>

    <div class="flex justify-end gap-3">
      <button
        type="button"
        class="rounded-lg border border-neutral-800 px-4 py-2 font-sora font-bold text-neutral-0 transition-colors hover:border-neutral-500"
        @click="emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="button"
        class="rounded-lg bg-blue-600 px-4 py-2 font-sora font-bold text-neutral-0 transition-colors hover:bg-blue-400"
        @click="submit"
      >
        Use This Code
      </button>
    </div>
  </div>
</template>
