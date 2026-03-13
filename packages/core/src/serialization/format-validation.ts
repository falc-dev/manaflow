import { ZodError } from 'zod';
import { GameFormatSchema, GameFormatSchemaType } from './format-schema';

export interface FormatValidationIssue {
  path: string;
  message: string;
}

export interface FormatValidationSuccess {
  ok: true;
  format: GameFormatSchemaType;
}

export interface FormatValidationFailure {
  ok: false;
  issues: FormatValidationIssue[];
}

export type FormatValidationResult = FormatValidationSuccess | FormatValidationFailure;

export class FormatValidationError extends Error {
  readonly issues: FormatValidationIssue[];

  constructor(issues: FormatValidationIssue[]) {
    const summary = issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    super(summary);
    this.name = 'FormatValidationError';
    this.issues = issues;
  }
}

function zodIssuesToValidationIssues(error: ZodError): FormatValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join('.') : 'root',
    message: issue.message
  }));
}

export function validateGameFormat(data: unknown): FormatValidationResult {
  const parsed = GameFormatSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, issues: zodIssuesToValidationIssues(parsed.error) };
  }
  return { ok: true, format: parsed.data };
}

export function parseGameFormat(data: unknown): GameFormatSchemaType {
  const result = validateGameFormat(data);
  if (!result.ok) {
    throw new FormatValidationError(result.issues);
  }
  return result.format;
}
