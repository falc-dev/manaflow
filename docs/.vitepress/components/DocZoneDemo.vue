<script setup lang="ts">
import { ref } from 'vue';
import DocCardDemo from './DocCardDemo.vue';

const props = defineProps<{
  title?: string;
  cards?: number;
  emoji?: string;
}>();
</script>

<template>
  <div class="doc-zone">
    <div class="doc-zone__header">
      <span class="doc-zone__emoji">{{ emoji ?? '📁' }}</span>
      <span class="doc-zone__title">{{ title ?? 'Zone' }}</span>
      <span class="doc-zone__count">({{ cards ?? 0 }})</span>
    </div>
    <div class="doc-zone__content">
      <slot>
        <div v-if="!cards || cards === 0" class="doc-zone__empty">
          Empty
        </div>
        <div v-else class="doc-zone__cards">
          <DocCardDemo 
            v-for="i in Math.min(cards, 5)" 
            :key="i" 
            :name="`Card ${i}`"
            :cost="i + 1"
            :rarity="i === 1 ? 'legendary' : i === 2 ? 'rare' : 'common'"
          />
          <span v-if="cards > 5" class="doc-zone__more">+{{ cards - 5 }} more</span>
        </div>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.doc-zone {
  border: 2px dashed var(--vp-c-divider);
  border-radius: 12px;
  padding: 12px;
  background: var(--vp-c-bg-soft);
}

.doc-zone__header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-weight: bold;
}

.doc-zone__emoji {
  font-size: 16px;
}

.doc-zone__title {
  font-size: 14px;
}

.doc-zone__count {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.doc-zone__content {
  min-height: 60px;
}

.doc-zone__empty {
  color: var(--vp-c-text-3);
  font-size: 12px;
  text-align: center;
  padding: 20px;
}

.doc-zone__cards {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.doc-zone__more {
  align-self: center;
  font-size: 11px;
  color: var(--vp-c-text-2);
}
</style>
