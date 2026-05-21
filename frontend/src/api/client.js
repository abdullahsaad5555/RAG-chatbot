export const API_BASE = "http://localhost:8000";

export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, options);
    const text = await res.text();

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${text}`);
    }

    // Return JSON if possible, otherwise raw text
    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return text+'hello';
    }
} 