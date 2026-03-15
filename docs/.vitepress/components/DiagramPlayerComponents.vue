<script setup lang="ts">
</script>

<template>
  <svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <!-- Controls box -->
    <rect x="10" y="10" width="480" height="35" fill="#1e293b" rx="4" />
    <text x="25" y="32" fill="#f8fafc" font-size="11" font-weight="bold">
      CONTROLS
    </text>
    <circle cx="60" cy="27" r="10" fill="#334155" stroke="#64748b" />
    <text x="60" y="31" fill="#cbd5e1" text-anchor="middle" font-size="10">◀◀</text>
    <circle cx="100" cy="27" r="10" fill="#334155" stroke="#64748b" />
    <text x="100" y="31" fill="#cbd5e1" text-anchor="middle" font-size="10">▶</text>
    <rect x="130" y="20" width="200" height="14" fill="#334155" rx="3" />
    <circle cx="225" cy="27" r="6" fill="#3b82f6" />
    <rect x="340" y="22" width="40" height="10" fill="#334155" rx="2" />
    <text x="350" y="30" fill="#cbd5e1" text-anchor="middle" font-size="8">0.5x</text>
    <rect x="385" y="22" width="40" height="10" fill="#3b82f6" rx="2" />
    <text x="395" y="30" fill="#fff" text-anchor="middle" font-size="8">1x</text>
    <rect x="430" y="22" width="40" height="10" fill="#334155" rx="2" />
    <text x="440" y="30" fill="#cbd5e1" text-anchor="middle" font-size="8">2x</text>
    
    <!-- Timeline box -->
    <rect x="10" y="55" width="480" height="30" fill="#1e293b" rx="4" />
    <text x="25" y="75" fill="#f8fafc" font-size="11" font-weight="bold">
      TIMELINE
    </text>
    <circle cx="100" cy="70" r="6" fill="#fbbf24" />
    <line x1="110" y1="70" x2="180" y2="70" stroke="#64748b" stroke-width="2" />
    <circle cx="190" cy="70" r="6" fill="#64748b" />
    <line x1="200" y1="70" x2="280" y2="70" stroke="#64748b" stroke-width="2" />
    <circle cx="290" cy="70" r="6" fill="#64748b" />
    <line x1="300" y1="70" x2="380" y2="70" stroke="#64748b" stroke-width="2" />
    <circle cx="390" cy="70" r="6" fill="#64748b" />
    <line x1="400" y1="70" x2="460" y2="70" stroke="#64748b" stroke-width="2" />
    <circle cx="470" cy="70" r="6" fill="#64748b" />
    <text x="100" y="88" fill="#94a3b8" font-size="8">F1</text>
    <text x="190" y="88" fill="#94a3b8" font-size="8">F2</text>
    <text x="290" y="88" fill="#94a3b8" font-size="8">F3</text>
    <text x="390" y="88" fill="#94a3b8" font-size="8">F4</text>
    <text x="470" y="88" fill="#94a3b8" font-size="8">F5</text>
    
    <!-- Viewport box -->
    <rect x="10" y="95" width="480" height="100" fill="#1e293b" rx="4" />
    <text x="25" y="115" fill="#f8fafc" font-size="11" font-weight="bold">
      VIEWPORT
    </text>
    
    <!-- Hand zone -->
    <rect x="25" y="125" width="100" height="60" fill="#334155" rx="4" stroke="#64748b" />
    <text x="75" y="142" fill="#cbd5e1" text-anchor="middle" font-size="10">MANO</text>
    <rect x="35" y="150" width="30" height="25" fill="#475569" rx="2" />
    <rect x="70" y="150" width="30" height="25" fill="#475569" rx="2" />
    
    <!-- Board zone -->
    <rect x="140" y="125" width="220" height="60" fill="#334155" rx="4" stroke="#fbbf24" />
    <text x="250" y="142" fill="#fbbf24" text-anchor="middle" font-size="10">⚔️ TABLERO</text>
    <rect x="155" y="150" width="40" height="25" fill="#475569" rx="2" />
    <text x="175" y="165" fill="#94a3b8" text-anchor="middle" font-size="8">⚔️</text>
    <rect x="205" y="150" width="40" height="25" fill="#475569" rx="2" />
    <rect x="255" y="150" width="40" height="25" fill="#475569" rx="2" />
    <rect x="305" y="150" width="40" height="25" fill="#475569" rx="2" />
    
    <!-- Deck zone -->
    <rect x="375" y="125" width="100" height="60" fill="#334155" rx="4" stroke="#64748b" />
    <text x="425" y="142" fill="#cbd5e1" text-anchor="middle" font-size="10">📚 MAZO</text>
    <rect x="385" y="150" width="30" height="25" fill="#475569" rx="2" />
    <rect x="420" y="150" width="30" height="25" fill="#475569" rx="2" />
    <rect x="385" y="165" width="65" height="4" fill="#334155" rx="1" />
    <rect x="385" y="172" width="65" height="4" fill="#334155" rx="1" />
  </svg>
</template>

<style scoped>
.diagram-svg {
  width: 100%;
  max-width: 550px;
  height: auto;
}
</style>
