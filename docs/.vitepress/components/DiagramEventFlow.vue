<script setup lang="ts">
</script>

<template>
  <svg viewBox="0 0 500 180" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <!-- BEFORE box -->
    <rect x="20" y="20" width="140" height="120" fill="#1e293b" rx="6" />
    <text x="90" y="45" fill="#f8fafc" text-anchor="middle" font-size="13" font-weight="bold">
      BEFORE
    </text>
    <text x="30" y="70" fill="#94a3b8" font-size="10" font-family="monospace">
      hand_p1: [c1]
    </text>
    <rect x="30" y="80" width="80" height="24" fill="#334155" rx="3" />
    <text x="70" y="95" fill="#cbd5e1" text-anchor="middle" font-size="10">
      🃏 c1
    </text>
    <text x="30" y="120" fill="#94a3b8" font-size="10" font-family="monospace">
      board_p1: []
    </text>
    <rect x="30" y="130" width="80" height="4" fill="#334155" rx="2" />
    
    <!-- Arrow -->
    <path d="M 175 80 L 235 80" stroke="#fbbf24" stroke-width="2" marker-end="url(#arrow)" />
    <text x="205" y="70" fill="#fbbf24" text-anchor="middle" font-size="11" font-weight="bold">
      MOVE_ENTITY
    </text>
    <text x="205" y="95" fill="#64748b" text-anchor="middle" font-size="9">
      cardId: c1
    </text>
    <text x="205" y="108" fill="#64748b" text-anchor="middle" font-size="9">
      from: hand → board
    </text>
    
    <!-- AFTER box -->
    <rect x="250" y="20" width="140" height="120" fill="#1e293b" rx="6" />
    <text x="320" y="45" fill="#f8fafc" text-anchor="middle" font-size="13" font-weight="bold">
      AFTER
    </text>
    <text x="260" y="70" fill="#94a3b8" font-size="10" font-family="monospace">
      hand_p1: []
    </text>
    <rect x="260" y="80" width="80" height="4" fill="#334155" rx="2" />
    <text x="260" y="120" fill="#94a3b8" font-size="10" font-family="monospace">
      board_p1: [c1]
    </text>
    <rect x="260" y="130" width="80" height="24" fill="#334155" rx="3" />
    <text x="300" y="145" fill="#34d399" text-anchor="middle" font-size="10">
      ⚔️ c1
    </text>
    
    <!-- Event box -->
    <rect x="100" y="150" width="300" height="25" fill="#0f172a" rx="4" stroke="#fbbf24" stroke-width="1" />
    <text x="250" y="167" fill="#fbbf24" text-anchor="middle" font-size="10" font-family="monospace">
      event: { type: "MOVE_ENTITY", playerId: "p1", payload: { cardId: "c1", from: "hand_p1", to: "board_p1" } }
    </text>
    
    <defs>
      <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
      </marker>
    </defs>
  </svg>
</template>

<style scoped>
.diagram-svg {
  width: 100%;
  max-width: 550px;
  height: auto;
}
</style>
