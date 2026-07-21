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

document.addEventListener('DOMContentLoaded', updateVerificationUI);

        function isCodeVerified() {
            const uploadBtn = document.querySelector('.upload-btn');
            if (uploadBtn && uploadBtn.hasAttribute('data-verified')) {
                return uploadBtn.getAttribute('data-verified') === 'true';
            }
            const ideContainer = document.querySelector('.ide-container');
            return ideContainer && ideContainer.getAttribute('data-verified') === 'true';
        }

        function updateVerificationUI() {
            const badge = document.getElementById('codeVerificationBadge');
            if (!badge) return;

            const verified = isCodeVerified();
            if (verified) {
                badge.className = 'verification-badge verified';
                badge.innerHTML = `
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                    Verified
                `;
            } else {
                badge.className = 'verification-badge unverified';
                badge.innerHTML = `
                    <svg viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 6h2v6h-2V7zm1 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/></svg>
                    Unverified
                `;
            }
        }

        function checkVerificationGuard() {
            if (!isCodeVerified()) {
                return confirm("Notice: The project code was not verified / currently under process. Please proceed with caution.\n\nDo you wish to continue?");
            }
            return true;
        }

        function handleUploadClick() {
            if (checkVerificationGuard()) {
                openFlasher();
            }
        }

        function handleCopyCode() {
            if (checkVerificationGuard()) {
                if (typeof copyCode === 'function') {
                    copyCode();
                }
            }
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
        alert("Project link saved to clipboard!");
    }
}

function copyCode() {
    const codeElement = document.getElementById('sourceCode');
    if (codeElement) {
        navigator.clipboard.writeText(codeElement.innerText);
        alert("Project code copied to clipboard!");
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