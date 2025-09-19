import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock window.ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn(() => Promise.resolve({})),
    ready: Promise.resolve({
      active: { postMessage: vi.fn() },
      sync: { register: vi.fn() }
    }),
    getRegistrations: vi.fn(() => Promise.resolve([])),
    getRegistration: vi.fn(() => Promise.resolve(null)),
  },
  writable: true,
});

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.HTMLMediaElement
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
  writable: true,
  value: vi.fn(() => Promise.resolve()),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
  writable: true,
  value: vi.fn(),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
(global as any).localStorage = localStorageMock;

// Mock indexedDB
const indexedDBMock = {
  open: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
  })),
  cmp: vi.fn(),
  databases: vi.fn(() => Promise.resolve([])),
  deleteDatabase: vi.fn(),
};
(global as any).indexedDB = indexedDBMock;

// Mock Notification API
global.Notification = {
  requestPermission: vi.fn(() => Promise.resolve('granted')),
  permission: 'granted',
} as any;

// Mock Geolocation API
const mockGeolocation = {
  getCurrentPosition: vi.fn((success) =>
    success({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 100,
      },
    })
  ),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
};
(global as any).navigator.geolocation = mockGeolocation;

// Mock window.URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
    rpc: vi.fn(() => ({
      data: [],
      error: null,
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({
          data: { path: 'test-path' },
          error: null,
        })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: 'https://test.com/image.jpg' },
        })),
      })),
    },
  },
  handleSupabaseError: vi.fn((error) => error?.message || 'Unknown error'),
}));