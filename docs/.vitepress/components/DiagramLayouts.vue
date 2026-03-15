<script setup lang="ts">
</script>

<template>
  <svg viewBox="0 0 500 160" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <!-- STACKED layout -->
    <text x="125" y="20" fill="#f8fafc" text-anchor="middle" font-size="12" font-weight="bold">
      stacked
    </text>
    
    <!-- Hand -->
    <rect x="50" y="30" width="150" height="40" fill="#334155" rx="4" stroke="#64748b" />
    <text x="125" y="55" fill="#cbd5e1" text-anchor="middle" font-size="11">MANO</text>
    
    <!-- Arrow down -->
    <path d="M 125 75 L 125 85" stroke="#64748b" stroke-width="1" />
    
    <!-- Board -->
    <rect x="20" y="90" width="210" height="50" fill="#334155" rx="4" stroke="#fbbf24" />
    <text x="125" y="120" fill="#fbbf24" text-anchor="middle" font-size="11">⚔️ TABLERO</text>
    
    <!-- Arrow down -->
    <path d="M 125 145 L 125 155" stroke="#64748b" stroke-width="1" />
    
    <!-- Deck -->
    <rect x="50" y="160" width="150" height="40" fill="#334155" rx="4" stroke="#64748b" />
    <text x="125" y="185" fill="#cbd5e1" text-anchor="middle" font-size="11">📚 MAZO</text>
    
    <!-- BOARD layout -->
    <text x="375" y="20" fill="#f8fafc" text-anchor="middle" font-size="12" font-weight="bold">
      board
    </text>
    
    <!-- Left hand -->
    <rect x="280" y="30" width="80" height="40" fill="#334155" rx="4" stroke="#64748b" />
    <text x="320" y="55" fill="#cbd5e1" text-anchor="middle" font-size="9">MANO</text>
    <text x="320" y="68" fill="#94a3b8" text-anchor="middle" font-size="8">(p1)</text>
    
    <!-- Right hand -->
    <rect x="420" y="30" width="80" height="40" fill="#334155" rx="4" stroke="#64748b" />
    <text x="460" y="55" fill="#cbd5e1" text-anchor="middle" font-size="9">MANO</text>
    <text x="460" y="68" fill="#94a3b8" text-anchor="middle" font-size="8">(p2)</text>
    
    <!-- Board -->
    <rect x="280" y="90" width="220" height="50" fill="#334155" rx="4" stroke="#fbbf24" />
    <text x="320" y="120" fill="#cbd5e1" text-anchor="middle" font-size="9">⚔️ TABLERO</text>
    <text x="460" y="120" fill="#cbd5e1" text-anchor="middle" font-size="9">⚔️ TABLERO</text>
  </svg>
</template>

<style scoped>
.diagram-svg {
  width: 100%;
  max-width: 500px;
  height: auto;
}
</style>
