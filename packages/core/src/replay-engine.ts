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
import { JsoncLoader } from './serialization/jsonc-loader';
import { NdjsonLoader } from './serialization/ndjson-loader';
import { ReplayLoader, ReplaySerializationFormat } from './serialization/replay-loader';

export interface SeekQuery {
  /** Absolute frame index (0 = initial snapshot frame). */
  frame?: number;
  /** Event timestamp in milliseconds; seeks to the latest frame at or before that timestamp. */
  timestamp?: number;
}

/**
 * Immutable replay timeline over game snapshots.
 *
 * The model is:
 * - frame `0`: `initialState`
 * - frame `n > 0`: `{ event, snapshot }`
 *
 * This keeps deterministic playback while still preserving the event stream.
 */
export class ReplayEngine {
  private readonly frames: ReplayFrame[];
  private currentIndex: number;

  /**
   * Builds a replay timeline from an initial snapshot plus optional frame entries.
   */
  constructor(initialState: GameSnapshot, entries: ReplayFrameInput[] = []) {
    this.frames = [{ index: 0, snapshot: deepClone(initialState) }];
    this.currentIndex = 0;

    for (const entry of entries) {
      this.appendSnapshot(entry.snapshot, entry.event);
    }
  }

  /**
   * Appends a new frame and moves the cursor to it.
   *
   * If `event` is omitted, a synthetic `SNAPSHOT` event is generated.
   * Any frames ahead of the current cursor are discarded (branch rewrite).
   */
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

  /** Moves the cursor one frame forward. Returns `null` if already at the end. */
  stepForward(): ReplayFrame | null {
    if (this.currentIndex >= this.frames.length - 1) {
      return null;
    }

    this.currentIndex += 1;
    return this.getCurrentFrame();
  }

  /** Moves the cursor one frame back. Returns `null` if already at the beginning. */
  stepBack(): ReplayFrame | null {
    if (this.currentIndex === 0) {
      return null;
    }

    this.currentIndex -= 1;
    return this.getCurrentFrame();
  }

  /**
   * Seeks by frame index or timestamp.
   *
   * - `frame`: exact frame position.
   * - `timestamp`: last frame whose event timestamp is `<=` query value.
   */
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

  /** Returns the current frame as a deep clone to prevent external mutation. */
  getCurrentFrame(): ReplayFrame {
    return deepClone(this.frames[this.currentIndex]);
  }

  /** Convenience accessor for `getCurrentFrame().snapshot`. */
  getCurrentState(): GameSnapshot {
    return this.getCurrentFrame().snapshot;
  }

  /** Total amount of frames in the timeline, including frame `0` (initial state). */
  getTotalFrames(): number {
    return this.frames.length;
  }

  /** Serializes the timeline back to `ReplayData` (`initialState + events[]`). */
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

  /** Creates a replay engine from YAML payload. */
  static fromYaml(yamlString: string): ReplayEngine {
    return YamlLoader.loadReplay(yamlString);
  }

  /** Creates a replay engine from JSON payload. */
  static fromJson(jsonString: string): ReplayEngine {
    return JsonLoader.loadReplay(jsonString);
  }

  /** Creates a replay engine from JSONC payload. */
  static fromJsonc(jsoncString: string): ReplayEngine {
    return JsoncLoader.loadReplay(jsoncString);
  }

  /** Creates a replay engine from NDJSON payload. */
  static fromNdjson(ndjsonString: string): ReplayEngine {
    return NdjsonLoader.loadReplay(ndjsonString);
  }

  /** Creates a replay engine from serialized payload with optional explicit format. */
  static fromSerialized(payload: string, format?: ReplaySerializationFormat): ReplayEngine {
    return ReplayLoader.loadReplay(payload, format);
  }
}
