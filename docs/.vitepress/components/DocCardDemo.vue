<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  name?: string;
  cost?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  type?: 'unit' | 'spell' | 'rune';
}>();

const rarityColors: Record<string, string> = {
  common: '#888888',
  rare: '#0066ff',
  epic: '#aa00ff',
  legendary: '#ff8800'
};

const typeIcons: Record<string, string> = {
  unit: '⚔️',
  spell: '✨',
  rune: '💎'
};
</script>

<template>
  <div 
    class="doc-card"
    :style="{ '--rarity-color': rarityColors[rarity || 'common'] }"
  >
    <div class="doc-card__cost">{{ cost ?? '-' }}</div>
    <div class="doc-card__art"></div>
    <div class="doc-card__name">{{ name ?? 'Card Name' }}</div>
    <div class="doc-card__type">{{ typeIcons[type || 'unit'] }} {{ type || 'unit' }}</div>
    <div class="doc-card__rarity">{{ rarity || 'common' }}</div>
  </div>
</template>

<style scoped>
.doc-card {
  width: 100px;
  height: 140px;
  background: linear-gradient(180deg, #2a3a4a 0%, #1a2530 100%);
  border: 2px solid var(--rarity-color);
  border-radius: 8px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 10px;
  color: #fff;
}

.doc-card__cost {
  width: 24px;
  height: 24px;
  background: #4a90d9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.doc-card__art {
  flex: 1;
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}

.doc-card__name {
  font-weight: bold;
  text-align: center;
  font-size: 11px;
}

.doc-card__type {
  text-align: center;
  opacity: 0.8;
}

.doc-card__rarity {
  text-align: center;
  font-size: 9px;
  text-transform: uppercase;
  color: var(--rarity-color);
}
</style>
