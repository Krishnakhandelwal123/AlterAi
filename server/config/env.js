const requiredInProduction = [
  'VITE_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CLIENT_URL',
  'PUBLIC_APP_URL',
  'GOOGLE_GEMINI_API_KEY',
  'ENCRYPTION_KEY'
];

export const isProduction = process.env.NODE_ENV === 'production';

export const requireEnv = (name, options = {}) => {
  const value = process.env[name];
  if (value) return value;

  if (isProduction || options.always) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return options.fallback;
};

export const validateProductionEnv = () => {
  if (!isProduction) return;

  const missing = requiredInProduction.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
  }

  if ((process.env.ENCRYPTION_KEY || '').length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters in production');
  }
};
