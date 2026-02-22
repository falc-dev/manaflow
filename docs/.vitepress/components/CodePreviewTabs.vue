<script setup lang="ts">
import { ref } from 'vue';

withDefaults(
  defineProps<{
    code: string;
    language?: string;
  }>(),
  {
    language: 'ts'
  }
);

const activeTab = ref<'preview' | 'code'>('preview');
</script>

<template>
  <div class="code-preview-tabs">
    <div class="code-preview-tabs__nav" role="tablist" aria-label="Example tabs">
      <button
        class="code-preview-tabs__tab"
        :class="{ 'code-preview-tabs__tab--active': activeTab === 'preview' }"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'preview'"
        @click="activeTab = 'preview'"
      >
        Preview
      </button>
      <button
        class="code-preview-tabs__tab"
        :class="{ 'code-preview-tabs__tab--active': activeTab === 'code' }"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'code'"
        @click="activeTab = 'code'"
      >
        Codigo
      </button>
    </div>

    <div v-if="activeTab === 'preview'" class="code-preview-tabs__panel" role="tabpanel">
      <slot name="preview" />
    </div>

    <div v-else class="code-preview-tabs__panel" role="tabpanel">
      <pre class="code-preview-tabs__code"><code :class="`language-${language}`">{{ code }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.code-preview-tabs {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin: 16px 0;
}

.code-preview-tabs__nav {
  display: flex;
  gap: 6px;
  padding: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.code-preview-tabs__tab {
  appearance: none;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  cursor: pointer;
}

.code-preview-tabs__tab--active {
  background: var(--vp-c-brand-1);
  color: white;
  border-color: var(--vp-c-brand-1);
}

.code-preview-tabs__panel {
  padding: 12px;
}

.code-preview-tabs__code {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-code-block-bg);
  overflow-x: auto;
}
</style>
