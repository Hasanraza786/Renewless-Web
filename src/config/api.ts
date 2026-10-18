const configuredUrl = import.meta.env.VITE_API_BASE_URL

if (!configuredUrl || !String(configuredUrl).trim()) {
  throw new Error('VITE_API_BASE_URL is missing. Set it in .env.')
}

export const API_BASE_URL = String(configuredUrl).trim().replace(/\/$/, '')
