// Init Supabase Client (Use your Anon Key here - safe for public)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let servicesData = [];
let currentService = null;

// Check Auth
async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) window.location.href = '/index.html';
    
    // Fetch User Details
    const { data: user } = await supabase.from('users').select('*').eq('id', session.user.id).single();
    document.getElementById('balance').innerText = `${user.balance} PKR`;
    
    // Check Settings for Theme & Announcement
    const { data: settings } = await supabase.from('settings').select('*');
    
    // Apply Theme
    const activeTheme = settings.find(s => s.key === 'active_theme')?.value || 'light';
    document.documentElement.setAttribute('data-theme', activeTheme);

    // Show Announcement
    const announceOn = settings.find(s => s.key === 'announcement_on')?.value === 'true';
    if(announceOn) {
        document.getElementById('announcement-bar').style.display = 'block';
        document.getElementById('announcement-text').innerText = settings.find(s => s.key === 'announcement_text')?.value;
    }

    loadServices();
    loadOrders(session.user.id);
}

// Load Categories & Services
async function loadServices() {
    // Determine Role
    // In real app, fetch from /api/services to hide disabled ones securely
    const { data, error } = await supabase.from('categories').select(`
        id, name,
        services ( id, name, rate, min_order, max_order )
    `);

    servicesData = data;
    const catSelect = document.getElementById('category-select');
    
    data.forEach((cat, index) => {
        if(cat.services.length > 0) {
            let option = new Option(cat.name, index);
            catSelect.add(option);
        }
    });
}

// Handle Interactions
document.getElementById('category-select').addEventListener('change', (e) => {
    const catIndex = e.target.value;
    const servSelect = document.getElementById('service-select');
    servSelect.innerHTML = '<option>Select Service</option>';
    
    if(servicesData[catIndex]) {
        servicesData[catIndex].services.forEach(serv => {
            let option = new Option(`${serv.name} - ${serv.rate} PKR/1k`, serv.id);
            // Store data in element for easy access
            option.dataset.rate = serv.rate;
            option.dataset.min = serv.min_order;
            option.dataset.max = serv.max_order;
            servSelect.add(option);
        });
    }
});

document.getElementById('service-select').addEventListener('change', (e) => {
    const id = e.target.value;
    // Find service object
    const selectedOption = e.target.selectedOptions[0];
    if(selectedOption.value === 'Select Service') return;

    currentService = {
        rate: parseFloat(selectedOption.dataset.rate),
        min: parseInt(selectedOption.dataset.min),
        max: parseInt(selectedOption.dataset.max)
    };

    document.getElementById('min-qty').innerText = currentService.min;
    document.getElementById('max-qty').innerText = currentService.max;
    calculatePrice();
});

document.getElementById('qty-input').addEventListener('input', calculatePrice);

function calculatePrice() {
    if(!currentService) return;
    const qty = parseInt(document.getElementById('qty-input').value) || 0;
    const total = (qty * currentService.rate) / 1000;
    document.getElementById('total-price').innerText = total.toFixed(2);
}

// UI Switcher
window.showSection = (id) => {
    document.getElementById('new-order').style.display = 'none';
    document.getElementById('orders').style.display = 'none';
    document.getElementById(id).style.display = 'block';
}

// Logout
document.getElementById('logout-btn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = '/index.html';
});

// Initialize
checkAuth();
