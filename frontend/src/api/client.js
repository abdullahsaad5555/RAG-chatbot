export const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            ...(options.headers || {}),
        },
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
    }

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return text;
    }
}