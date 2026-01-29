const { supabase } = require('./_utils');

export default async function handler(req, res) {
  // Check Maintenance Mode
  const { data: settings } = await supabase.from('settings').select('*');
  const maintenance = settings.find(s => s.key === 'maintenance_mode')?.value === 'true';

  // Allow admin to bypass, but for public list:
  if (maintenance && req.query.role !== 'admin') {
    return res.status(503).json({ error: 'Maintenance Mode Active' });
  }

  // Fetch Categories and Services
  const { data: categories } = await supabase.from('categories').select(`
    id, name,
    services ( id, name, rate, min_order, max_order, status )
  `);

  res.status(200).json(categories);
}
