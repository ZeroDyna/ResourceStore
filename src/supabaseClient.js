
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://kakizyhncglgokewjxhy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtha2l6eWhuY2dsZ29rZXdqeGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNzIzMzcsImV4cCI6MjA2MzY0ODMzN30.pmuthw25LmcT6P4pUlS_m4Nw96tgA7Y3JT905klCx9U';
export const supabase = createClient(supabaseUrl, supabaseKey);
