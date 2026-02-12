import {
  GameSnapshot,
  ReplayData,
  ReplayEvent,
  ReplayFrame,
  ReplayFrameInput,
  createSnapshotId
} from '@manaflow/types';
import { deepClone } from './utils';
import { YamlLoader } from './serialization/yaml-loader';
import { JsonLoader } from './serialization/json-loader';

export interface SeekQuery {
  frame?: number;
  timestamp?: number;
}

export class ReplayEngine {
  private readonly frames: ReplayFrame[];
  private currentIndex: number;

  constructor(initialState: GameSnapshot, entries: ReplayFrameInput[] = []) {
    this.frames = [{ index: 0, snapshot: deepClone(initialState) }];
    this.currentIndex = 0;

    for (const entry of entries) {
      this.appendSnapshot(entry.snapshot, entry.event);
    }
  }

  appendSnapshot(snapshot: GameSnapshot, event?: ReplayEvent): ReplayFrame {
    const normalizedEvent = event
      ? deepClone(event)
      : {
          id: createSnapshotId('event'),
          action: { type: 'SNAPSHOT', playerId: snapshot.currentPlayer, payload: {}, timestamp: Date.now() },
          timestamp: Date.now(),
          playerId: snapshot.currentPlayer
        };

    this.frames.splice(this.currentIndex + 1);

    const frame: ReplayFrame = {
      index: this.frames.length,
      event: normalizedEvent,
      snapshot: deepClone(snapshot)
    };

    this.frames.push(frame);
    this.currentIndex = frame.index;
    return this.getCurrentFrame();
  }

  stepForward(): ReplayFrame | null {
    if (this.currentIndex >= this.frames.length - 1) {
      return null;
    }

    this.currentIndex += 1;
    return this.getCurrentFrame();
  }

  stepBack(): ReplayFrame | null {
    if (this.currentIndex === 0) {
      return null;
    }

    this.currentIndex -= 1;
    return this.getCurrentFrame();
  }

  seek(query: SeekQuery): ReplayFrame | null {
    if (typeof query.frame === 'number') {
      if (query.frame < 0 || query.frame >= this.frames.length) {
        return null;
      }
      this.currentIndex = query.frame;
      return this.getCurrentFrame();
    }

    if (typeof query.timestamp === 'number') {
      let selected = 0;
      for (let index = 1; index < this.frames.length; index += 1) {
        const ts = this.frames[index].event?.timestamp ?? -Infinity;
        if (ts <= query.timestamp) {
          selected = index;
        } else {
          break;
        }
      }
      this.currentIndex = selected;
      return this.getCurrentFrame();
    }

    return null;
  }

  getCurrentFrame(): ReplayFrame {
    return deepClone(this.frames[this.currentIndex]);
  }

  getCurrentState(): GameSnapshot {
    return this.getCurrentFrame().snapshot;
  }

  getTotalFrames(): number {
    return this.frames.length;
  }

  toReplayData(): ReplayData {
    const initialState = deepClone(this.frames[0].snapshot);
    const events: ReplayFrameInput[] = this.frames
      .slice(1)
      .map((frame) => ({ event: deepClone(frame.event!), snapshot: deepClone(frame.snapshot) }));

    return {
      schemaVersion: 1,
      initialState,
      events
    };
  }

  static fromYaml(yamlString: string): ReplayEngine {
    return YamlLoader.loadReplay(yamlString);
  }

  static fromJson(jsonString: string): ReplayEngine {
    return JsonLoader.loadReplay(jsonString);
  }
}
