<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { createDemoReplay } from '../../../packages/core/src';
import { createVueReplayStore, ReplayViewport, ReplayControls } from '../../../packages/vue/src';
import '../../../packages/vue/src/styles.css';

const props = defineProps<{
  players?: number;
  cardsPerHand?: number;
  turns?: number;
  compact?: boolean;
}>();

const replayData = createDemoReplay({
  players: props.players ?? 2,
  cardsPerHand: props.cardsPerHand ?? 3,
  turns: props.turns ?? 2
});

const store = createVueReplayStore(replayData);
const state = ref(store.getState());

const unsubscribe = store.subscribe((newState) => {
  state.value = newState;
});

onUnmounted(() => {
  unsubscribe();
});

const playing = ref(false);

const togglePlay = () => {
  playing.value = !playing.value;
};
</script>

<template>
  <div class="doc-demo">
    <ReplayViewport
      :state="state"
      :class-name="compact ? 'doc-demo__viewport--compact' : ''"
    />
    <div class="doc-demo__controls">
      <button type="button" @click="store.previous()" :disabled="!state.canStepBack">◀◀</button>
      <button type="button" @click="togglePlay">{{ playing ? '❚❚' : '▶' }}</button>
      <button type="button" @click="store.next()" :disabled="!state.canStepForward">▶▶</button>
      <span class="doc-demo__frame">{{ state.currentFrame + 1 }} / {{ state.totalFrames }}</span>
    </div>
  </div>
</template>

<style scoped>
.doc-demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.doc-demo__viewport--compact {
  max-height: 300px;
}

.doc-demo__controls {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
  border-top: 1px solid var(--vp-c-divider);
}

.doc-demo__controls button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
}

.doc-demo__controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.doc-demo__frame {
  margin-left: auto;
  font-family: monospace;
  font-size: 12px;
  color: var(--vp-c-text-2);
  align-self: center;
}
</style>
