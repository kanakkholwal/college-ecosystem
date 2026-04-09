import type { Session, SessionUser } from '$lib/server/auth';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		// interface Error {}
		interface Locals {
			user: SessionUser | null;
			session: Session['session'] | null;
		}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
