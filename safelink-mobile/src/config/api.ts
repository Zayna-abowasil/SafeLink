export const API_BASE_URL = 'http://192.168.1.35:5000/api';
export const customFetch = (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'bypass-tunnel-reminder': 'true',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
};