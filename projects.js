/**
 * projects.js
 * Controls core UI layout components, responsive styling triggers, 
 * regional currency dynamic transformations, and state sharing mechanics.
 */

// === Theme Configuration Elements ===
const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const btn = document.getElementById('themeToggleBtn');
    if (btn) btn.innerHTML = isDark ? sunIcon : moonIcon;
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

// === Native Context Sharing Operations ===
async function shareProject() {
    if (navigator.share) {
        try {
            await navigator.share({
                title: document.title,
                text: 'Check out this awesome embedded system application on Tantra!',
                url: window.location.href
            });
        } catch (err) {
            console.warn("Share operations canceled by client context.");
        }
    } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Project link saved to clipboard data memory!");
    }
}

function copyCode() {
    const codeElement = document.getElementById('sourceCode');
    if (codeElement) {
        navigator.clipboard.writeText(codeElement.innerText);
        alert("Source matrix text copied to execution clipboard buffer.");
    }
}

// === Automatic Location-Based Pricing System ===
async function fetchLocationAndConvertPrices() {
    try {
        const geoResponse = await fetch('https://ipapi.co/json/');
        if (!geoResponse.ok) throw new Error("Geolocation access routing dropped.");
        const geoData = await geoResponse.json();

        const targetCurrency = geoData.currency || 'USD';
        const countryName = geoData.country_name || 'your region';

        const exchangeResponse = await fetch(`https://open.er-api.com/v6/latest/USD`);
        if (!exchangeResponse.ok) throw new Error("Market metrics tracking down.");
        const exchangeData = await exchangeResponse.json();

        const rate = exchangeData.rates[targetCurrency];
        if (!rate) throw new Error("Target mapping index array currency value unavailable.");

        document.querySelectorAll('.price-tag').forEach(el => {
            const baseUsd = parseFloat(el.getAttribute('data-base-usd'));
            const convertedPrice = baseUsd * rate;
            
            el.innerText = new Intl.NumberFormat(navigator.language, {
                style: 'currency',
                currency: targetCurrency
            }).format(convertedPrice);
        });

        const badge = document.getElementById('locationBadge');
        if (badge) badge.innerText = `(Estimated pricing structure mapped for ${countryName})`;

    } catch (error) {
        console.warn("Pricing localization routine timed out; running native base currency tags:", error);
    }
}

// Global Core UI Initialization DOM hook
window.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon();
    fetchLocationAndConvertPrices();
});