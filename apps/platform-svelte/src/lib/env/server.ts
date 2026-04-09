import { env } from '$env/dynamic/private';

export const getServerEnv = () => {
  const vercelEnv = env.VERCEL_ENV;
  const nodeEnv = env.NODE_ENV;

  return {
    vercel: vercelEnv ?? 'unknown',
    node: nodeEnv ?? 'unknown',

    isProd: vercelEnv === 'production' || nodeEnv === 'production',
    isPreview: vercelEnv === 'preview',
    isDev: vercelEnv === 'development' || nodeEnv === 'development'
  };
};