import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || 'https://lxksoojimkleldsjiofu.supabase.co';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4a3Nvb2ppbWtsZWxkc2ppb2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzMzgwMzcsImV4cCI6MjA5NDkxNDAzN30.tzJu0UrILv0Cisx2606aLMY4W5yhjOHGEVk4aEWKTGk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

