// Function to update theme setting
async function updateTheme(themeName) {
    const { error } = await supabase
        .from('settings')
        .update({ value: themeName })
        .eq('key', 'active_theme');
    
    if(!error) alert('Theme Updated Globally!');
}

// API Management
async function addAPI(url, key) {
    // Call backend function to save securely or save to DB directly if RLS allows admins
    await supabase.from('providers').insert({ url, api_key: key });
      }
