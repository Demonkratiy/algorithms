import type { CaseResult, RunError, RunResult } from './types'

export const MAX_CODE_BYTES = 100 * 1024
export const RUN_TIMEOUT_MS = 2000
export const SETUP_TIMEOUT_MS = 5000
export const MAX_LOGS = 100
export const MAX_LOG_LENGTH = 1000
export const MAX_LOG_CHARS = 20_000

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown, max = 4000): value is string {
  return typeof value === 'string' && value.length <= max
}

function validCase(value: unknown): value is CaseResult {
  return record(value) && text(value.name, 200) && text(value.input)
    && text(value.expected) && text(value.actual) && typeof value.passed === 'boolean'
    && validLogs(value.logs)
    && (value.error === undefined || (!value.passed && validError(value.error)))
}

function validLogs(value: unknown): value is string[] {
  return Array.isArray(value) && value.length <= MAX_LOGS
    && value.every((line: unknown) => text(line, MAX_LOG_LENGTH))
}

function validError(value: unknown): value is RunError {
  return record(value) && text(value.name, 100) && text(value.message, 2000)
    && (value.line === undefined || (Number.isSafeInteger(value.line) && Number(value.line) > 0))
    && (value.column === undefined || (Number.isSafeInteger(value.column) && Number(value.column) > 0))
}

export function isRunResult(value: unknown, expectedCaseCount: number): value is RunResult {
  if (!record(value) || !Array.isArray(value.cases) || value.cases.length > expectedCaseCount
    || !value.cases.every(validCase) || !validLogs(value.logs)
    || typeof value.logsTruncated !== 'boolean'
    || typeof value.durationMs !== 'number' || !Number.isFinite(value.durationMs) || value.durationMs < 0
    || (value.error !== undefined && !validError(value.error))) return false

  const cases: CaseResult[] = value.cases
  const logs = [...value.logs, ...cases.flatMap(item => item.logs)]
  if (logs.length > MAX_LOGS || logs.reduce((sum, line) => sum + line.length, 0) > MAX_LOG_CHARS) return false

  if (value.status === 'passed' || value.status === 'failed') {
    if (value.error !== undefined || cases.some(item => item.error) || cases.length !== expectedCaseCount) return false
    const allPassed = value.cases.every((item: CaseResult) => item.passed)
    return value.status === 'passed' ? allPassed : !allPassed
  }
  return (value.status === 'error' || value.status === 'timeout') && validError(value.error)
}

export function isEnvelope(value: unknown, token: string): value is Record<string, unknown> {
  return record(value) && value.token === token
}
