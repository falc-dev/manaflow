<script setup lang="ts">
import { ReplayEngine } from '../../../packages/core/src';
import { ReplayPlayer, createVueReplayStore } from '../../../packages/vue/src';
import '../../../packages/vue/src/styles.css';

const replayPayload = {
  schemaVersion: 1,
  initialState: {
    id: 'demo_snapshot_0',
    players: [
      {
        id: 'p1',
        name: 'Alice',
        health: 20,
        resources: [],
        hand: [],
        deck: ['c1', 'c2'],
        discard: [],
        zones: { hand: [], board: [], deck: ['c1', 'c2'], graveyard: [], stack: [] }
      },
      {
        id: 'p2',
        name: 'Bob',
        health: 20,
        resources: [],
        hand: [],
        deck: [],
        discard: [],
        zones: { hand: [], board: [], deck: [], graveyard: [], stack: [] }
      }
    ],
    currentPhase: 'DRAW',
    currentPlayer: 'p1',
    turn: 1,
    entities: {
      c1: {
        id: 'c1',
        type: 'card',
        components: [
          {
            componentType: 'CARD',
            entityId: 'c1',
            metadata: { name: 'Sky Drake', description: 'Flying unit', cost: 2, rarity: 'common' }
          }
        ]
      },
      c2: {
        id: 'c2',
        type: 'card',
        components: [
          {
            componentType: 'CARD',
            entityId: 'c2',
            metadata: { name: 'Iron Guard', description: 'Defender unit', cost: 3, rarity: 'rare' }
          }
        ]
      }
    },
    zones: { hand: [], board: [], deck: ['c1', 'c2'], graveyard: [], stack: [] },
    metadata: {}
  },
  events: [
    {
      event: {
        id: 'draw_1',
        action: { type: 'DRAW_CARD', playerId: 'p1', payload: { cardId: 'c1' }, timestamp: 1700000000100 },
        timestamp: 1700000000100,
        playerId: 'p1'
      },
      snapshot: {
        id: 'demo_snapshot_1',
        players: [
          {
            id: 'p1',
            name: 'Alice',
            health: 20,
            resources: [],
            hand: ['c1'],
            deck: ['c2'],
            discard: [],
            zones: { hand: ['c1'], board: [], deck: ['c2'], graveyard: [], stack: [] }
          },
          {
            id: 'p2',
            name: 'Bob',
            health: 20,
            resources: [],
            hand: [],
            deck: [],
            discard: [],
            zones: { hand: [], board: [], deck: [], graveyard: [], stack: [] }
          }
        ],
        currentPhase: 'MAIN',
        currentPlayer: 'p1',
        turn: 1,
        entities: {
          c1: {
            id: 'c1',
            type: 'card',
            components: [
              {
                componentType: 'CARD',
                entityId: 'c1',
                metadata: { name: 'Sky Drake', description: 'Flying unit', cost: 2, rarity: 'common' }
              }
            ]
          },
          c2: {
            id: 'c2',
            type: 'card',
            components: [
              {
                componentType: 'CARD',
                entityId: 'c2',
                metadata: { name: 'Iron Guard', description: 'Defender unit', cost: 3, rarity: 'rare' }
              }
            ]
          }
        },
        zones: { hand: ['c1'], board: [], deck: ['c2'], graveyard: [], stack: [] },
        metadata: {}
      }
    },
    {
      event: {
        id: 'play_1',
        action: { type: 'PLAY_CARD', playerId: 'p1', payload: { cardId: 'c1' }, timestamp: 1700000000200 },
        timestamp: 1700000000200,
        playerId: 'p1'
      },
      snapshot: {
        id: 'demo_snapshot_2',
        players: [
          {
            id: 'p1',
            name: 'Alice',
            health: 20,
            resources: [],
            hand: [],
            deck: ['c2'],
            discard: [],
            zones: { hand: [], board: ['c1'], deck: ['c2'], graveyard: [], stack: [] }
          },
          {
            id: 'p2',
            name: 'Bob',
            health: 20,
            resources: [],
            hand: [],
            deck: [],
            discard: [],
            zones: { hand: [], board: [], deck: [], graveyard: [], stack: [] }
          }
        ],
        currentPhase: 'COMBAT',
        currentPlayer: 'p1',
        turn: 1,
        entities: {
          c1: {
            id: 'c1',
            type: 'card',
            components: [
              {
                componentType: 'CARD',
                entityId: 'c1',
                metadata: { name: 'Sky Drake', description: 'Flying unit', cost: 2, rarity: 'common' }
              }
            ]
          },
          c2: {
            id: 'c2',
            type: 'card',
            components: [
              {
                componentType: 'CARD',
                entityId: 'c2',
                metadata: { name: 'Iron Guard', description: 'Defender unit', cost: 3, rarity: 'rare' }
              }
            ]
          }
        },
        zones: { hand: [], board: ['c1'], deck: ['c2'], graveyard: [], stack: [] },
        metadata: {}
      }
    }
  ]
};

const replay = ReplayEngine.fromJson(JSON.stringify(replayPayload));
const store = createVueReplayStore(replay);
</script>

<template>
  <div class="vue-replay-doc-demo">
    <ReplayPlayer :store="store" :autoplay-interval-ms="900" />
    <div class="vue-replay-doc-demo__actions">
      <button type="button" class="vue-replay-doc-demo__button" @click="store.seek(0)">Reset</button>
      <button type="button" class="vue-replay-doc-demo__button" @click="store.next()">Next</button>
      <button type="button" class="vue-replay-doc-demo__button" @click="store.previous()">Prev</button>
    </div>
  </div>
</template>

<style scoped>
.vue-replay-doc-demo {
  display: grid;
  gap: 12px;
}

.vue-replay-doc-demo__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.vue-replay-doc-demo__button {
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}
</style>
