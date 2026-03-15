<script setup lang="ts">
</script>

<template>
  <svg viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg" class="diagram-svg">
    <!-- Default card -->
    <text x="80" y="15" fill="#64748b" text-anchor="middle" font-size="10">POR DEFECTO</text>
    <rect x="30" y="25" width="100" height="80" fill="#1e293b" rx="6" stroke="#64748b" stroke-width="2" />
    <circle cx="55" cy="45" r="12" fill="#3b82f6" />
    <text x="55" y="49" fill="#fff" text-anchor="middle" font-size="10" font-weight="bold">5</text>
    <rect x="40" y="65" width="80" height="30" fill="#334155" rx="3" />
    <text x="80" y="85" fill="#cbd5e1" text-anchor="middle" font-size="10">Dragon</text>
    <text x="80" y="100" fill="#94a3b8" text-anchor="middle" font-size="8">legendary</text>
    
    <!-- Arrow -->
    <path d="M 145 65 L 165 65" stroke="#fbbf24" stroke-width="2" marker-end="url(#arrow2)" />
    
    <!-- Custom card -->
    <text x="280" y="15" fill="#fbbf24" text-anchor="middle" font-size="10" font-weight="bold">PERSONALIZADA</text>
    <rect x="220" y="25" width="100" height="80" fill="url(#grad1)" rx="6" stroke="#fbbf24" stroke-width="2" />
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:#7c3aed;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#4c1d95;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="245" cy="45" r="12" fill="#fbbf24" />
    <text x="245" y="49" fill="#1e293b" text-anchor="middle" font-size="10" font-weight="bold">5</text>
    <rect x="230" y="60" width="80" height="35" fill="rgba(0,0,0,0.3)" rx="3" stroke="rgba(255,255,255,0.2)" />
    <text x="270" y="78" fill="#fff" text-anchor="middle" font-size="9" font-weight="bold">DRAGON</text>
    <text x="270" y="92" fill="#fbbf24" text-anchor="middle" font-size="8">ROJO 🔥</text>
    <text x="270" y="103" fill="#fbbf24" text-anchor="middle" font-size="7" font-weight="bold">⚡ LEGENDARY</text>
    
    <defs>
      <marker id="arrow2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" />
      </marker>
    </defs>
  </svg>
</template>

<style scoped>
.diagram-svg {
  width: 100%;
  max-width: 450px;
  height: auto;
}
</style>
