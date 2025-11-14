// Environment configuration helper
// This allows using environment variables both during build time and runtime

interface RuntimeEnv {
  VITE_API_URL?: string;
  VITE_API_BASE_URL?: string;
}

declare global {
  interface Window {
    ENV?: RuntimeEnv;
  }
}

/**
 * Get environment variable with fallback to build-time variable
 * @param key - Environment variable key
 * @param defaultValue - Default value if not found
 */
export function getEnv(key: keyof RuntimeEnv, defaultValue = ''): string {
  // Try runtime config first (injected by OpenShift)
  if (window.ENV && window.ENV[key]) {
    const value = window.ENV[key];
    // Check if it's still a template variable (not replaced)
    if (value && !value.startsWith('${')) {
      return value;
    }
  }
  
  // Fallback to Vite build-time environment variable
  const viteKey = `VITE_${key.replace('VITE_', '')}` as keyof ImportMetaEnv;
  return import.meta.env[viteKey] || defaultValue;
}

/**
 * Get API base URL
 */
export function getApiUrl(): string {
  return getEnv('VITE_API_URL', 
    getEnv('VITE_API_BASE_URL', 
      'http://localhost:8000/api'
    )
  );
}

export default {
  getEnv,
  getApiUrl,
};
