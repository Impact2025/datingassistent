import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
      query: {},
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock environment variables
process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3000'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.NEXT_PUBLIC_GA4_PROPERTY_ID = 'G-TEST123'

// Global test utilities
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})

// Mock database for tests
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(() => Promise.resolve({ rows: [] })),
}))

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withSentryConfig: jest.fn((config) => config),
}))

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
})