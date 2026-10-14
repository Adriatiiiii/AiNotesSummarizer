import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dictjhfgyefcfpcwrxfh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3RqaGZneWVmY2ZwY3dyeGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2NjE3MTAsImV4cCI6MjA4OTIzNzcxMH0.9vZDourlNOJSroMj0TIZSrJNv1FTF-u5khZTgQExfrI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);