import { env } from '$env/dynamic/public';

export const getClientEnv = () => {
  const vercelEnv = env.PUBLIC_VERCEL_ENV;

  return {
    vercel: vercelEnv ?? 'unknown',

    isProd: vercelEnv === 'production',
    isPreview: vercelEnv === 'preview',
    isDev: vercelEnv === 'development'
  };
};