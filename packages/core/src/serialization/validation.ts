import yaml from 'js-yaml';
import { ZodError } from 'zod';
import { normalizeReplayAliases } from './normalization';
import { collectReplayProfileIssues } from './profile-validation';
import { ReplaySchema, ReplaySchemaStrict, ReplaySchemaType } from './schema';

export interface ReplayValidationIssue {
  path: string;
  message: string;
  source: 'schema' | 'profile' | 'json' | 'jsonc' | 'ndjson' | 'yaml';
  code?: string;
  suggestion?: string;
}

export interface ReplayValidationOptions {
  /** Normalizes known legacy Riftbound zone aliases before profile checks. */
  normalizeRiftboundAliases?: boolean;
  /** Enforces typed payload validation for known replay action types. Defaults to `true`. */
  strictActionPayloads?: boolean;
}

export interface ReplayValidationSuccess {
  ok: true;
  replay: ReplaySchemaType;
}

export interface ReplayValidationFailure {
  ok: false;
  issues: ReplayValidationIssue[];
}

export type ReplayValidationResult = ReplayValidationSuccess | ReplayValidationFailure;

/** Thrown by parse helpers when payload validation fails. */
export class ReplayValidationError extends Error {
  readonly issues: ReplayValidationIssue[];

  constructor(issues: ReplayValidationIssue[]) {
    const summary = issues
      .map((issue) => {
        let line = `${issue.path}: ${issue.message}`;
        if (issue.suggestion) {
          line += ` (hint: ${issue.suggestion})`;
        }
        return line;
      })
      .join('; ');
    super(summary);
    this.name = 'ReplayValidationError';
    this.issues = issues;
  }
}

/** Formats validation issues as a user-friendly string with suggestions. */
export function formatValidationIssues(issues: ReplayValidationIssue[]): string {
  return issues
    .map((issue) => {
      let line = `❌ ${issue.path}: ${issue.message}`;
      if (issue.suggestion) {
        line += `\n   💡 ${issue.suggestion}`;
      }
      return line;
    })
    .join('\n');
}

function zodIssuesToValidationIssues(error: ZodError): ReplayValidationIssue[] {
  return error.issues.map((issue) => {
    let suggestion: string | undefined;
    
    if (issue.code === 'invalid_type') {
      const expected = issue.expected;
      const received = issue.received;
      if (expected === 'number' && received === 'string') {
        suggestion = `Expected a number, got "${issue.path.join('.')}". Did you forget quotes?`;
      } else if (expected === 'string' && received === 'number') {
        suggestion = `Expected a string, got a number. Add quotes around the value.`;
      } else if (expected === 'array' && received === 'object') {
        suggestion = `Expected an array [...], got an object {}. Check if you used curly braces instead of brackets.`;
      }
    }
    
    if (issue.code === 'unrecognized_keys') {
      suggestion = `Unknown key "${issue.keys[0]}". Did you mean one of: ${issue.allowed[0] || 'valid keys'}?`;
    }
    
    if (issue.code === 'missing_keys') {
      suggestion = `Required field missing. Add: ${issue.keys.join(', ')}`;
    }

    return {
      path: issue.path.length > 0 ? issue.path.join('.') : 'root',
      message: issue.message,
      source: 'schema',
      code: issue.code,
      suggestion
    };
  });
}

function profileIssuesToValidationIssues(replay: ReplaySchemaType): ReplayValidationIssue[] {
  return collectReplayProfileIssues(replay).map((issue) => ({
    path: issue.path,
    message: issue.message,
    source: 'profile'
  }));
}

function parseAndValidateReplay(data: unknown, options: ReplayValidationOptions = {}): ReplayValidationResult {
  const strictActionPayloads = options.strictActionPayloads ?? true;
  const parser = strictActionPayloads ? ReplaySchemaStrict : ReplaySchema;
  const parsed = parser.safeParse(data);
  if (!parsed.success) {
    return { ok: false, issues: zodIssuesToValidationIssues(parsed.error) };
  }

  const replay = options.normalizeRiftboundAliases ? normalizeReplayAliases(parsed.data) : parsed.data;
  const profileIssues = profileIssuesToValidationIssues(replay);
  if (profileIssues.length > 0) {
    return { ok: false, issues: profileIssues };
  }

  return { ok: true, replay };
}

export function validateReplayData(data: unknown, options: ReplayValidationOptions = {}): ReplayValidationResult {
  return parseAndValidateReplay(data, options);
}

/** Validates and returns parsed replay data; throws on failure. */
export function parseReplayData(data: unknown, options: ReplayValidationOptions = {}): ReplaySchemaType {
  const result = validateReplayData(data, options);
  if (!result.ok) {
    throw new ReplayValidationError(result.issues);
  }
  return result.replay;
}

/** Validates replay payload in strict JSON format. */
export function validateReplayJson(
  jsonString: string,
  options: ReplayValidationOptions = {}
): ReplayValidationResult {
  try {
    const data = JSON.parse(jsonString);
    return validateReplayData(data, options);
  } catch (error) {
    if (error instanceof ReplayValidationError) {
      return { ok: false, issues: error.issues };
    }
    return {
      ok: false,
      issues: [{ path: 'root', message: error instanceof Error ? error.message : String(error), source: 'json' }]
    };
  }
}

/** Parses replay JSON payload and throws `ReplayValidationError` if invalid. */
export function parseReplayJson(jsonString: string, options: ReplayValidationOptions = {}): ReplaySchemaType {
  const result = validateReplayJson(jsonString, options);
  if (!result.ok) {
    throw new ReplayValidationError(result.issues);
  }
  return result.replay;
}

function stripJsonComments(jsonLike: string): string {
  let result = '';
  let i = 0;
  let inString = false;
  let escaped = false;

  while (i < jsonLike.length) {
    const current = jsonLike[i];
    const next = jsonLike[i + 1];

    if (inString) {
      result += current;
      if (escaped) {
        escaped = false;
      } else if (current === '\\') {
        escaped = true;
      } else if (current === '"') {
        inString = false;
      }
      i += 1;
      continue;
    }

    if (current === '"') {
      inString = true;
      result += current;
      i += 1;
      continue;
    }

    if (current === '/' && next === '/') {
      i += 2;
      while (i < jsonLike.length && jsonLike[i] !== '\n') {
        i += 1;
      }
      continue;
    }

    if (current === '/' && next === '*') {
      i += 2;
      while (i < jsonLike.length && !(jsonLike[i] === '*' && jsonLike[i + 1] === '/')) {
        i += 1;
      }
      i += 2;
      continue;
    }

    result += current;
    i += 1;
  }

  return result;
}

function stripTrailingCommas(jsonLike: string): string {
  let result = '';
  let i = 0;
  let inString = false;
  let escaped = false;

  while (i < jsonLike.length) {
    const current = jsonLike[i];

    if (inString) {
      result += current;
      if (escaped) {
        escaped = false;
      } else if (current === '\\') {
        escaped = true;
      } else if (current === '"') {
        inString = false;
      }
      i += 1;
      continue;
    }

    if (current === '"') {
      inString = true;
      result += current;
      i += 1;
      continue;
    }

    if (current === ',') {
      let cursor = i + 1;
      while (cursor < jsonLike.length && /\s/.test(jsonLike[cursor])) {
        cursor += 1;
      }
      if (cursor < jsonLike.length && (jsonLike[cursor] === '}' || jsonLike[cursor] === ']')) {
        i += 1;
        continue;
      }
    }

    result += current;
    i += 1;
  }

  return result;
}

function parseJsonc(jsoncString: string): unknown {
  const withoutComments = stripJsonComments(jsoncString);
  const normalized = stripTrailingCommas(withoutComments);
  return JSON.parse(normalized);
}

/** Validates replay payload in JSONC format (comments and trailing commas supported). */
export function validateReplayJsonc(
  jsoncString: string,
  options: ReplayValidationOptions = {}
): ReplayValidationResult {
  try {
    const data = parseJsonc(jsoncString);
    return validateReplayData(data, options);
  } catch (error) {
    if (error instanceof ReplayValidationError) {
      return { ok: false, issues: error.issues };
    }
    return {
      ok: false,
      issues: [{ path: 'root', message: error instanceof Error ? error.message : String(error), source: 'jsonc' }]
    };
  }
}

/** Parses replay JSONC payload and throws `ReplayValidationError` if invalid. */
export function parseReplayJsonc(jsoncString: string, options: ReplayValidationOptions = {}): ReplaySchemaType {
  const result = validateReplayJsonc(jsoncString, options);
  if (!result.ok) {
    throw new ReplayValidationError(result.issues);
  }
  return result.replay;
}

function parseNdjson(ndjsonString: string): unknown {
  const lines = ndjsonString
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    throw new Error('NDJSON payload is empty');
  }

  const first = JSON.parse(lines[0]) as Record<string, unknown>;
  const hasReplayHeader =
    typeof first === 'object' && first !== null && 'schemaVersion' in first && 'initialState' in first;
  const hasReplayEvents = typeof first === 'object' && first !== null && Array.isArray(first.events);

  if (!hasReplayHeader) {
    throw new Error('NDJSON first line must contain replay header (schemaVersion + initialState)');
  }

  if (lines.length === 1) {
    return first;
  }

  if (hasReplayEvents && (first.events as unknown[]).length > 0) {
    throw new Error('NDJSON header cannot include events when additional event lines are present');
  }

  const events = lines.slice(1).map((line, index) => {
    const entry = JSON.parse(line) as Record<string, unknown>;
    const hasEvent = typeof entry === 'object' && entry !== null && 'event' in entry;
    const hasSnapshot = typeof entry === 'object' && entry !== null && 'snapshot' in entry;
    if (!hasEvent || !hasSnapshot) {
      throw new Error(`NDJSON line ${index + 2} must be a replay frame entry with event and snapshot`);
    }
    return entry;
  });

  return {
    ...first,
    events
  };
}

/** Validates replay payload in NDJSON format (header line + frame lines). */
export function validateReplayNdjson(
  ndjsonString: string,
  options: ReplayValidationOptions = {}
): ReplayValidationResult {
  try {
    const data = parseNdjson(ndjsonString);
    return validateReplayData(data, options);
  } catch (error) {
    if (error instanceof ReplayValidationError) {
      return { ok: false, issues: error.issues };
    }
    return {
      ok: false,
      issues: [{ path: 'root', message: error instanceof Error ? error.message : String(error), source: 'ndjson' }]
    };
  }
}

/** Parses replay NDJSON payload and throws `ReplayValidationError` if invalid. */
export function parseReplayNdjson(ndjsonString: string, options: ReplayValidationOptions = {}): ReplaySchemaType {
  const result = validateReplayNdjson(ndjsonString, options);
  if (!result.ok) {
    throw new ReplayValidationError(result.issues);
  }
  return result.replay;
}

/** Validates replay payload in YAML format. */
export function validateReplayYaml(
  yamlString: string,
  options: ReplayValidationOptions = {}
): ReplayValidationResult {
  try {
    const data = yaml.load(yamlString);
    return validateReplayData(data, options);
  } catch (error) {
    if (error instanceof ReplayValidationError) {
      return { ok: false, issues: error.issues };
    }
    return {
      ok: false,
      issues: [{ path: 'root', message: error instanceof Error ? error.message : String(error), source: 'yaml' }]
    };
  }
}

/** Parses replay YAML payload and throws `ReplayValidationError` if invalid. */
export function parseReplayYaml(yamlString: string, options: ReplayValidationOptions = {}): ReplaySchemaType {
  const result = validateReplayYaml(yamlString, options);
  if (!result.ok) {
    throw new ReplayValidationError(result.issues);
  }
  return result.replay;
}
