import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dcyyjyfzymlnfguakjwg.supabase.co'; // Tu URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjeXlqeWZ6eW1sbmZndWFrandnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4NTk2NzcsImV4cCI6MjA2MTQzNTY3N30.SlutE_KQK1RC9DvJ2vSLAIGaSgoqOxYPbc863e96plQ'; // ⚡ Pega aquí directamente tu anon-key

export const supabase = createClient(supabaseUrl, supabaseKey);
