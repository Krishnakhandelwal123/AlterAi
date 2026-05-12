import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure env vars are loaded before creating the admin client.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'test-service-role-key';

if (!supabaseUrl || !serviceRoleKey) {
  // Keep booting for local dev/tests; routes will fail with clear message.
  // eslint-disable-next-line no-console
  console.warn('Supabase admin env vars are missing.');
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
