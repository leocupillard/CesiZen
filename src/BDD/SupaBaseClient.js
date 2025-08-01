import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://brtumvrxurcpytdajejx.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJydHVtdnJ4dXJjcHl0ZGFqZWp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNTM2NDksImV4cCI6MjA2NTkyOTY0OX0.TQlm2ia3r9oV0ZOF4l6yaTo5CWCnm8Afgk4M5zzBiuk';

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
