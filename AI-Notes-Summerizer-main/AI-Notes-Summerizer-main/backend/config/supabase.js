const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://dictjhfgyefcfpcwrxfh.supabase.co";
const supabaseKey = "YOUR_ANON_KEY_HERE";

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ENV not loaded");
  console.log(process.env);
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
