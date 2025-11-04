import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pnkjdhyvyxkkrfkhnfkz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBua2pkaHl2eXhra3Jma2huZmt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxNTUzNjMsImV4cCI6MjA3NzczMTM2M30.N9DjcQDL1n7XbciaBfjtQsG5pi6mZWFKNXS8Lj2GJiM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
