const API_BASE_URL = 'http://20.219.1.165:8099';

export async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!res.ok) throw new Error('API error');
  return res.json();
}