export interface CaseResult {
  name: string
  input: string
  expected: string
  actual: string
  passed: boolean
  logs: string[]
  error?: RunError
  feedback?: string
}

export interface RunError {
  name: string
  message: string
  line?: number
  column?: number
}

export interface RunResult {
  status: 'passed' | 'failed' | 'error' | 'timeout' | 'cancelled'
  cases: CaseResult[]
  logs: string[]
  logsTruncated: boolean
  error?: RunError
  durationMs: number
}
