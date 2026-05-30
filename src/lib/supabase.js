import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cglymxlsitkvcvlnoghv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbHlteGxzaXRrdmN2bG5vZ2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDQwMDcsImV4cCI6MjA5NTcyMDAwN30.Cc7tgy8JrJFzqgELEi4KIsn6D94VhbfuQroLNn-R1V4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
