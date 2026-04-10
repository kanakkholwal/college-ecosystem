import { browser } from '$app/environment';
import { getRuntime } from './runtime';

export const getExecutionContext = async () => {
  const runtime = getRuntime();

  if (browser) {
    const { getClientEnv } = await import('./client');
    return { runtime, ...getClientEnv() };
  }

  const { getServerEnv } = await import('./server');
  return { runtime, ...getServerEnv() };
};