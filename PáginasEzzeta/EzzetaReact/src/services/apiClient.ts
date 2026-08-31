type HttpMethod = 'GET' | 'POST' | 'DELETE';

const buildUrl = (path: string) => {
  if (/^https?:\/\//.test(path)) return path;
  return path.startsWith('/') ? path : `/${path}`;
};

const parseJson = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
};

const request = async <T>(method: HttpMethod, path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildUrl(path), {
    method,
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return parseJson<T>(response);
};

export const apiClient = {
  get: <T>(path: string, init?: RequestInit) => request<T>('GET', path, init),
  post: <T>(path: string, body: unknown, init?: RequestInit) =>
    request<T>('POST', path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  postForm: <T>(path: string, formData: FormData, init?: RequestInit) =>
    request<T>('POST', path, {
      ...init,
      body: formData,
      headers: {
        ...(init?.headers ?? {}),
      },
    }),
  delete: <T>(path: string, init?: RequestInit) => request<T>('DELETE', path, init),
};
