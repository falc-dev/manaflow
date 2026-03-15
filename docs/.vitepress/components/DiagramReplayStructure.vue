<script setup lang="ts">
const props = defineProps<{
  width?: number;
  height?: number;
}>();
</script>

<template>
  <svg 
    :viewBox="`0 0 ${width || 400} ${height || 300}`" 
    xmlns="http://www.w3.org/2000/svg"
    class="diagram-svg"
  >
    <!-- Background -->
    <rect x="10" y="10" :width="(width || 400) - 20" :height="(height || 300) - 20" fill="#1e293b" rx="8" />
    
    <!-- Title -->
    <text :x="(width || 400) / 2" y="35" fill="#e2e8f0" text-anchor="middle" font-size="14" font-weight="bold">
      replay.json
    </text>
    
    <!-- Schema version -->
    <text :x="30" y="65" fill="#94a3b8" font-size="11" font-family="monospace">
      schemaVersion: 1
    </text>
    
    <!-- Initial state box -->
    <rect x="30" y="80" :width="(width || 400) - 60" height="80" fill="#334155" rx="4" />
    <text :x="45" y="100" fill="#fbbf24" font-size="12" font-weight="bold">
      initialState
    </text>
    <text :x="45" y="120" fill="#cbd5e1" font-size="10" font-family="monospace">
      id, players, currentPhase
    </text>
    <text :x="45" y="135" fill="#cbd5e1" font-size="10" font-family="monospace">
      turn, entities, zones
    </text>
    <text :x="45" y="150" fill="#cbd5e1" font-size="10" font-family="monospace">
      metadata
    </text>
    
    <!-- Events box -->
    <rect x="30" y="170" :width="(width || 400) - 60" height="80" fill="#334155" rx="4" />
    <text :x="45" y="190" fill="#34d399" font-size="12" font-weight="bold">
      events[]
    </text>
    <text :x="45" y="210" fill="#cbd5e1" font-size="10" font-family="monospace">
      [0] event + snapshot
    </text>
    <text :x="45" y="225" fill="#cbd5e1" font-size="10" font-family="monospace">
      [1] event + snapshot
    </text>
    <text :x="45" y="240" fill="#94a3b8" font-size="10" font-family="monospace">
      ...
    </text>
    
    <!-- Arrow -->
    <path :d="`M ${(width || 400) / 2} 265 L ${(width || 400) / 2} 285`" stroke="#64748b" stroke-width="2" marker-end="url(#arrowhead)" />
    
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
      </marker>
    </defs>
  </svg>
</template>

<style scoped>
.diagram-svg {
  width: 100%;
  max-width: 500px;
  height: auto;
}
</style>
