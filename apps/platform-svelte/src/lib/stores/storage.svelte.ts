import { browser } from '$app/environment';

type StorageType = 'localStorage' | 'sessionStorage';

/**
 * Svelte 5 rune-based storage sync. Replaces React's `useStorage` hook.
 * Syncs with `localStorage` or `sessionStorage` and reacts to cross-tab changes.
 *
 * Usage:
 * ```svelte
 * <script>
 *   import { createStorage } from '$lib/stores/storage.svelte';
 *   const theme = createStorage('theme-brand', { id: 'teal', color: '#0d9488' });
 * </script>
 * <button onclick={() => theme.current = { ...theme.current, id: 'violet' }}>
 *   {theme.current.id}
 * </button>
 * ```
 */
export function createStorage<T>(
	key: string,
	initialValue: T,
	storageType: StorageType = 'localStorage'
) {
	let value = $state<T>(initialValue);

	const parse = (raw: string): T => {
		try {
			if (typeof initialValue === 'string') return raw as T;
			if (typeof initialValue === 'number') {
				const n = Number(raw);
				return (isNaN(n) ? initialValue : n) as T;
			}
			if (typeof initialValue === 'boolean') return (raw === 'true') as T;
			return JSON.parse(raw) as T;
		} catch {
			return initialValue;
		}
	};

	const serialize = (val: T): string => {
		if (typeof val === 'string') return val;
		if (typeof val === 'number' || typeof val === 'boolean') return String(val);
		return JSON.stringify(val);
	};

	if (browser) {
		try {
			const stored = window[storageType].getItem(key);
			if (stored !== null) value = parse(stored);
		} catch (e) {
			console.error(`[createStorage] read error for "${key}":`, e);
		}

		window.addEventListener('storage', (event) => {
			if (event.key === key && event.storageArea === window[storageType] && event.newValue) {
				value = parse(event.newValue);
			}
		});
	}

	return {
		get current() {
			return value;
		},
		set current(next: T) {
			value = next;
			if (!browser) return;
			try {
				window[storageType].setItem(key, serialize(next));
			} catch (e) {
				console.error(`[createStorage] write error for "${key}":`, e);
			}
		}
	};
}
