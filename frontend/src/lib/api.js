export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (res.status === 401) {
    document.cookie = 'user_info=; Max-Age=0; path=/';
    window.location.href = '/login';
    return null;
  }
  return res;
}
