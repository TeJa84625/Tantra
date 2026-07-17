class CustomHeader extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <style>
                custom-header {
                    position: sticky;
                    top: 0;
                    z-index: 100;
                    display: block;
                }

                :root {
                    --bg: #f8f9fa; 
                    --surface: #ffffff; 
                    --text: #111827; 
                    --text-muted: #6b7280;
                    --border: #e5e7eb; 
                    --primary: #3b82f6; 
                    --primary-hover: #2563eb;
                    --radius: 12px; 
                    --shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                [data-theme="dark"] {
                    --bg: #000000; 
                    --surface: #0a0a0a; 
                    --text: #ededed; 
                    --text-muted: #a1a1aa;
                    --border: #27272a; 
                    --shadow: 0 10px 15px -3px rgba(0,0,0,0.9);
                }
                
                * { 
                    box-sizing: border-box; 
                    margin: 0; 
                    padding: 0; 
                }
                body { 
                    font-family: system-ui, -apple-system, sans-serif; 
                    background: var(--bg); 
                    color: var(--text); 
                    transition: background-color 0.3s, color 0.3s; 
                    display: flex; 
                    flex-direction: column; 
                    min-height: 100vh; 
                }
                a { 
                    text-decoration: none; 
                    color: inherit; 
                }

                /* === Header Navigation === */
                nav {
                    background: var(--surface); 
                    border-bottom: 1px solid var(--border);
                    padding: 1rem 2rem; 
                    display: flex; 
                    justify-content: space-between;
                    align-items: center; 
                    flex-wrap: wrap; 
                    gap: 1rem; 
                    transition: background-color 0.3s, border-color 0.3s;
                }
                .nav-left { 
                    display: flex; 
                    align-items: center; 
                    gap: 2rem; 
                    flex: 1; 
                }
                .logo { 
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem; 
                    font-weight: bold; 
                    font-size: 1.25rem; 
                    color: var(--text);
                }
                .logo svg { 
                    color: var(--primary); 
                }
                
                .search-form {
                    display: flex; 
                    align-items: center; 
                    gap: 0.5rem;
                    background: var(--bg); 
                    border: 1px solid var(--border);
                    padding: 0.5rem 1rem; 
                    border-radius: 99px; 
                    flex: 1; 
                    max-width: 400px;
                    transition: border-color 0.2s, background-color 0.3s;
                }
                .search-form input { 
                    border: none; 
                    background: transparent; 
                    color: var(--text); 
                    outline: none; 
                    width: 100%; 
                    font-size: 0.95rem;
                }
                .search-form input::placeholder {
                    color: var(--text-muted);
                }
                
                .nav-links { 
                    display: flex; 
                    align-items: center; 
                    gap: 1.5rem; 
                }
                .nav-links a { 
                    color: var(--text);
                    font-size: 0.95rem;
                    font-weight: 500;
                    transition: color 0.2s; 
                }
                .nav-links a:hover { 
                    color: var(--primary); 
                }
                .icon-btn { 
                    background: transparent; 
                    border: none; 
                    color: var(--text); 
                    cursor: pointer; 
                    padding: 0.5rem; 
                    border-radius: 50%; 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    transition: background-color 0.2s;
                }
                .icon-btn:hover {
                    background-color: var(--border);
                }
                .btn-auth { 
                    background: var(--primary); 
                    color: white; 
                    border: none; 
                    padding: 0.6rem 1.25rem; 
                    border-radius: 99px; 
                    cursor: pointer; 
                    font-weight: 500; 
                    font-size: 0.95rem;
                    transition: background-color 0.2s, transform 0.1s; 
                }
                .btn-auth:hover { 
                    background: var(--primary-hover); 
                    transform: translateY(-1px);
                }

                /* === Responsive Mobile Styles === */
                @media (max-width: 768px) {
                    nav { 
                        flex-direction: column; 
                        padding: 1rem; 
                        gap: 1rem; 
                    }
                    .nav-left { 
                        flex-direction: column; 
                        width: 100%; 
                        gap: 1rem;
                    }
                    .search-form { 
                        max-width: 100%; 
                        width: 100%; 
                    }
                    .nav-links { 
                        width: 100%; 
                        justify-content: space-around; 
                        border-top: 1px solid var(--border);
                        padding-top: 0.75rem;
                    }
                }

                /* Light theme state: Force the logo to be solid black */
                [data-theme="light"] .logo-img {
                    filter: brightness(0) saturate(100%);
                }

                /* Dark theme state: Invert the color profile completely to solid white */
                [data-theme="dark"] .logo-img {
                    filter: brightness(0) invert(1);
                }
            </style>

            <nav>
                <div class="nav-left">
                    <a href="/index.html" class="logo">
                        <a href="/index.html" class="logo">
                        <img src="/images/anahata.png" alt="Tantra Logo" class="logo-img" style="height: 24px; width: auto; object-fit: contain; transition: filter 0.3s ease;">
                        Tantra
                    </a>
                    <form class="search-form" action="/projects.html" method="GET">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" name="q" placeholder="Search projects, authors..." required>
                    </form>
                </div>
                <div class="nav-links">
                    <a href="/projects.html">Projects</a>
                    <a href="/learn.html">Learn</a>
                    <a href="/shop.html">Shop</a>
                    <button class="icon-btn" id="themeToggleBtn" aria-label="Toggle Theme">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    </button>
                    <button class="btn-auth" onclick="window.location.href='/addproject.html'">Add My Project</button>
                </div>
            </nav>
        `;

        this.setupThemeToggle();
    }

    setupThemeToggle() {
        const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"></path></svg>`;
        
        const themeToggleBtn = this.querySelector('#themeToggleBtn');
        if (!themeToggleBtn) return;

        const updateThemeIcon = () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            themeToggleBtn.innerHTML = isDark ? sunIcon : moonIcon;
        };

        const toggleTheme = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon();
        };

        // Set initial icon and attach toggle listener
        updateThemeIcon();
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
}

customElements.define('custom-header', CustomHeader);

class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <style>
            /* Fallback variables in case the parent page does not have them defined */
            :host, .reusable-footer {
                --footer-bg: var(--surface, #1e293b);
                --footer-border: var(--border, #334155);
                --footer-text: var(--text, #f8fafc);
                --footer-text-muted: var(--text-muted, #94a3b8);
                --footer-primary: var(--primary, #3b82f6);
            }

            .reusable-footer { 
                background: var(--footer-bg); 
                border-top: 1px solid var(--footer-border); 
                padding: 4rem 2rem 1.5rem; 
                margin-top: auto; 
                width: 100%; 
                box-sizing: border-box;
                font-family: system-ui, -apple-system, sans-serif;
            }
            .footer-container { max-width: 1200px; margin: 0 auto; }
            .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
            .footer-brand p { color: var(--footer-text-muted); font-size: 0.95rem; margin-top: 1rem; line-height: 1.6; max-width: 350px; }
            
            .footer-col h3 { font-size: 1rem; font-weight: 600; margin-bottom: 1.25rem; color: var(--footer-text); }
            .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; padding: 0; margin: 0; }
            .footer-col a { color: var(--footer-text-muted); font-size: 0.9rem; transition: color 0.2s; text-decoration: none; }
            .footer-col a:hover { color: var(--footer-primary); }
            
            .social-icons { display: flex; gap: 1rem; margin-top: 1.5rem; }
            .social-icons a { color: var(--footer-text-muted); transition: color 0.2s; display: flex; text-decoration: none; }
            .social-icons a:hover { color: var(--footer-primary); }
            
            .footer-bottom { padding-top: 1.5rem; border-top: 1px solid var(--footer-border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
            .footer-bottom p { color: var(--footer-text-muted); font-size: 0.85rem; margin: 0; }
            .footer-bottom-links { display: flex; gap: 1.5rem; }
            .footer-bottom-links a { color: var(--footer-text-muted); font-size: 0.85rem; text-decoration: none; }
            .footer-bottom-links a:hover { color: var(--footer-primary); }

            @media (max-width: 768px) {
                .footer-grid { grid-template-columns: 1fr; gap: 2rem; }
                .footer-bottom { flex-direction: column; text-align: center; justify-content: center; }
            }
        </style>

        <footer class="reusable-footer">
            <div class="footer-container">
                <div class="footer-grid">
                    <div class="footer-brand">
                        <a href="/index.html" class="logo" style="display: flex; align-items: center; gap: 0.5rem; font-weight: bold; font-size: 1.25rem; color: var(--footer-text); text-decoration: none;">
                            <img src="/images/anahata.png" alt="Tantra Logo" class="logo-img" style="height: 24px; width: auto; object-fit: contain; transition: filter 0.3s ease;">
                            Tantra
                        </a>
                        <p>Empowering the next generation of engineers with open-source hardware tutorials, IoT platforms, and community-driven projects.</p>
                        <!-- <div class="social-icons">
                            <a href="#" aria-label="Twitter"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0_0-.08-.83A7.72_7.72_0_0_0_23_3z"></path></svg></a>
                            <a href="#" aria-label="GitHub"><svg width="20" height="20" viewBox="0_0_24_24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9_19c-5_1.5-5-2.5-7-3m14_6v-3.87a3.37_3.37_0_0_0-.94-2.61c3.14-.35_6.44-1.54_6.44-7A5.44_5.44_0_"
                                </svg></a>
                                    <path d="M7 12h.01M17 12h.01M12 15h.01"></path>
                                </svg>
                            <a href="#" aria-label="Discord"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>
                            </a>
                        </div> -->
                    </div>
                    
                    <div class="footer-col">
                        <h3>Explore</h3>
                        <ul>
                            <li><a href="/projects.html">Community Projects</a></li>
                            <li><a href="/learn.html">Learn & Courses</a></li>
                            <li><a href="/index.html#main-content">Active Contests</a></li>
                            <li><a href="/shop.html">Hardware Store</a></li>
                        </ul>
                    </div>

                    <div class="footer-col">
                        <h3>Hardware</h3>
                        <ul>
                            <li><a href="/projects.html?category=esp32">ESP32 & ESP8266</a></li>
                            <li><a href="/projects.html?category=arduino">Arduino Boards</a></li>
                            <li><a href="/projects.html?category=raspberry-pi">Raspberry Pi</a></li>
                            <li><a href="javascript:void(0)" style="cursor: default;">Sensors & Modules</a></li>
                        </ul>
                    </div>

                    <div class="footer-col">
                        <h3>Developers</h3>
                        <ul>
                            <li><a href="javascript:void(0)" style="cursor: default;">Web Serial API Docs</a></li>
                            <li><a href="javascript:void(0)" style="cursor: default;">Code Sandbox</a></li>
                            <li><a href="javascript:void(0)" style="cursor: default;">Host a Hackathon</a></li>
                            <li><a href="javascript:void(0)" style="cursor: default;">Open Source License</a></li>
                        </ul>
                    </div>
                </div>
                
                <div class="footer-bottom">
                    <p style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; flex-wrap: wrap;">
                        &copy; <span id="current-year"></span>
                        <img src="/images/anahata.png" alt="Tantra Logo" class="logo-img" style="height: 18px; width: auto; object-fit: contain; transition: filter 0.3s ease;">
                        <span>Tantra. Build the future.</span>
                    </p>
                    <div class="footer-bottom-links">
                        <a href="javascript:void(0)" style="cursor: default;">Privacy Policy</a>
                        <a href="javascript:void(0)" style="cursor: default;">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
        `;
    }
}
customElements.define('custom-footer', CustomFooter);

document.getElementById('current-year').textContent = new Date().getFullYear();