import yaml from 'js-yaml';
import { ZodError } from 'zod';
import { normalizeReplayAliases } from './normalization';
import { collectReplayProfileIssues } from './profile-validation';
import { ReplaySchema, ReplaySchemaType } from './schema';

export interface ReplayValidationIssue {
  path: string;
  message: string;
  source: 'schema' | 'profile' | 'json';
}

export interface ReplayValidationOptions {
  normalizeRiftboundAliases?: boolean;
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

export class ReplayValidationError extends Error {
  readonly issues: ReplayValidationIssue[];

  constructor(issues: ReplayValidationIssue[]) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    super(summary);
    this.name = 'ReplayValidationError';
    this.issues = issues;
  }
}

function zodIssuesToValidationIssues(error: ZodError): ReplayValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join('.') : 'root',
    message: issue.message,
    source: 'schema'
  }));
}

function profileIssuesToValidationIssues(replay: ReplaySchemaType): ReplayValidationIssue[] {
  return collectReplayProfileIssues(replay).map((issue) => ({
    path: issue.path,
    message: issue.message,
    source: 'profile'
  }));
}

function parseAndValidateReplay(data: unknown, options: ReplayValidationOptions = {}): ReplayValidationResult {
  const parsed = ReplaySchema.safeParse(data);
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

export function parseReplayData(data: unknown, options: ReplayValidationOptions = {}): ReplaySchemaType {
  const result = validateReplayData(data, options);
  if (!result.ok) {
    throw new ReplayValidationError(result.issues);
  }
  return result.replay;
}

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

export function parseReplayJson(jsonString: string, options: ReplayValidationOptions = {}): ReplaySchemaType {
  const result = validateReplayJson(jsonString, options);
  if (!result.ok) {
    throw new ReplayValidationError(result.issues);
  }
  return result.replay;
}

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
      issues: [{ path: 'root', message: error instanceof Error ? error.message : String(error), source: 'schema' }]
    };
  }
}

export function parseReplayYaml(yamlString: string, options: ReplayValidationOptions = {}): ReplaySchemaType {
  const result = validateReplayYaml(yamlString, options);
  if (!result.ok) {
    throw new ReplayValidationError(result.issues);
  }
  return result.replay;
}
