const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with Service Role (Admin) for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = { supabase };
