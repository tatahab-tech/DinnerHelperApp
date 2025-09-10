// Jest setup file for Dinner Helper App tests

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Make localStorage methods available as jest mocks
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock DOM methods that might not be available in jsdom
Object.defineProperty(window, 'alert', {
  value: jest.fn(),
  writable: true
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockImplementation(() => {});
  localStorageMock.removeItem.mockImplementation(() => {});
  localStorageMock.clear.mockImplementation(() => {});
});
