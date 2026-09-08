<script setup>
import { ref, computed, watch, nextTick } from "vue";
import iconRestart from "../assets/images/icon-restart.svg";
import { tokenize } from "../utils/tokenizer";

const props = defineProps({
  passageText: { type: String, required: true },
  typed: { type: String, required: true },
  status: { type: String, required: true }, // idle | running |
  language: { type: String, required: true }, // 'en' | 'es' | 'fr' | 'de' | 'it'
});

const emit = defineEmits(["type", "start", "restart", "tab"]);

const inputEl = ref(null);
const passageRef = ref(null);

const FILE_EXTENSIONS = {
  javascript: "js",
  php: "php",
  sql: "sql",
};

const filename = computed(
  () => `snippet.${FILE_EXTENSIONS[props.language] || "txt"}`,
);

const tokenTypes = computed(() => tokenize(props.passageText, props.language));

const characters = computed(() =>
  props.passageText.split("").map((char, i) => {
    let state = "pending";
    if (i < props.typed.length) {
      state = props.typed[i] === char ? "correct" : "incorrect";
    } else if (i === props.typed.length) {
      state = "cursor";
    }
    return { char, state, tokenType: tokenTypes.value[i], key: i };
  }),
);

const lines = computed(() => {
  const result = [];
  let current = [];
  characters.value.forEach((c) => {
    current.push(c);
    if (c.char === "\n") {
      result.push(current);
      current = [];
    }
  });
  if (current.length) result.push(current);
  return result;
});

function focusInput() {
  inputEl.value?.focus();
}

function handleInput(e) {
  emit("type", e.target.value);
}

// Tab bypasses the browser's native input event entirely (it just moves
// focus by default), so after handleTab() updates `typed` in the parent,
// we have to manually push that value into the textarea ourselves —
// otherwise the textarea's own native value falls behind, and the next
// real keystroke's length-diff would misread it as a backspace.
//
// A plain synchronous read of props.typed right after emit() (even after
// nextTick) isn't reliable here, so instead we set a flag and let a
// watcher react once Vue actually delivers the updated prop.
const pendingTabSync = ref(false);

function handleKeydown(e) {
  if (e.key === "Tab") {
    e.preventDefault();
    pendingTabSync.value = true;
    emit("tab");
    // If handleTab() decided there was nothing to fill (cursor isn't at
    // an indentation run), `typed` never changes and the watcher above
    // never fires. Clear the flag anyway so a later unrelated keystroke
    // doesn't get wrongly treated as a pending tab-sync.
    nextTick(() => {
      pendingTabSync.value = false;
    });
  }
}

watch(
  () => props.typed,
  (val) => {
    if (pendingTabSync.value) {
      pendingTabSync.value = false;
      if (inputEl.value) inputEl.value.value = val;
    }
  },
);

function handleContainerClick() {
  if (props.status !== "finished") focusInput();
}

// only force-clear the native input when a fresh test starts (restart).
// Syncing on every keystroke would fight the browser's own input value
// while the user is actively typing.
watch(
  () => props.status,
  async (newStatus) => {
    if (newStatus === "idle") {
      await nextTick();
      if (inputEl.value) inputEl.value.value = "";
    }
  },
);

defineExpose({ focusInput });
</script>

<template>
  <div class="relative">
    <!-- editor window chrome-->
    <div
      class="flex items-center gap-2 rounded-t-lg border border-b-0 border-neutral-800 bg-neutral-800/40 px-4 py-2.5"
    >
      <span class="flex h-3 w-3 rounded-full bg-red-500"></span>
      <span class="flex h-3 w-3 rounded-full bg-yellow-400"></span>
      <span class="flex h-3 w-3 rounded-full bg-green-500"></span>
      <span class="ml-2 font-mono text-xs text-neutral-500">{{
        filename
      }}</span>
    </div>
    <div
      ref="passageRef"
      data-testid="passage-text"
      class="relative flex cursor-text select-none gap-4 rounded-lg py-6 font-mono text-lg leading-relaxed sm:text-xl"
      :class="status === 'idle' ? 'blur-[2px]' : ''"
      @click="handleContainerClick"
    >
      <!-- line number gutter -->
      <div
        class="select-none border-r border-neutral-800 pr-3 text-right text-neutral-600"
        aria-hidden="true"
      >
        <div v-for="(line, i) in lines" :key="i">{{ i + 1 }}</div>
      </div>

      <!-- the actual code, grouped by line-->
      <div class="flex-1 whitespace-pre-wrap">
        <div v-for="(line, i) in lines" :key="i">
          <span
            v-for="c in line"
            :key="c.key"
            :class="{
              'text-green-500': c.state === 'correct',
              'text-red-500 underline decoration-2 underline-offset-2':
                c.state === 'incorrect',
              'rounded-sm bg-neutral-500/40 text-neutral-0':
                c.state === 'cursor',
              'text-purple-400':
                c.state === 'pending' && c.tokenType === 'keyword',
              'text-yellow-200':
                c.state === 'pending' && c.tokenType === 'string',
              'text-orange-400':
                c.state === 'pending' && c.tokenType === 'number',
              'text-neutral-500':
                c.state === 'pending' && c.tokenType === 'default',
            }"
            >{{ c.char }}</span
          >
        </div>
      </div>

      <!-- visually hidden textarea that actually captures keystrokes.
           A textarea (not input) is required so Enter can insert real
           newlines to match multi-line code snippets. -->
      <textarea
        ref="inputEl"
        rows="1"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        aria-label="Type the code snippet above"
        class="absolute -left-full top-0 h-px w-px resize-none opacity-0"
        :disabled="status === 'finished'"
        @input="handleInput"
        @keydown="handleKeydown"
        @paste.prevent
        @focus="status === 'idle' && emit('start')"
      ></textarea>
    </div>

    <!-- idle overlay -->
    <div
      v-if="status === 'idle'"
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4"
    >
      <button
        type="button"
        class="pointer-events-auto rounded-lg bg-blue-600 px-8 py-4 font-sora text-lg font-bold text-neutral-0 transition-colors hover:bg-blue-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        @click="focusInput()"
      >
        Start Typing Test
      </button>
      <p class="text-center font-sora font-bold text-neutral-0">
        Or click the text and start typing
      </p>
    </div>

    <!-- restart control while running -->
    <div
      v-if="status === 'running'"
      class="mt-6 flex justify-center border-t border-neutral-800 pt-6"
    >
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg bg-neutral-800 px-6 py-3.5 font-sora text-lg font-bold text-neutral-0 transition-colors hover:bg-neutral-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        @click="emit('restart')"
      >
        Restart Test
        <img :src="iconRestart" alt="" class="h-4 w-4" />
      </button>
    </div>
  </div>
</template>
