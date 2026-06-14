import type { Config } from 'jest'
import nextJest from 'next/jest.js'
 
const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})
 
// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Only pick up *.test.* files so helper files in __tests__/ aren't run as suites
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/*.spec.[jt]s?(x)'],
  // Explicit alias mapping so jest.mock('@/…') resolves correctly
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^motion/react$': '<rootDir>/src/__tests__/mocks/motion.ts',
  },
}
 
// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)