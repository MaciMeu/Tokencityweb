// global-scripts.js

// --- THEME LOGIC ---
window.updateToggleVisuals = function () {
    const isLight = document.body.classList.contains('light-mode');
    const activeIconName = isLight ? 'sun' : 'moon';
    const trackHTML = `
        <div class="absolute left-1 md:left-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? '' : 'opacity-0'} transition-opacity duration-300">
            <i data-lucide="moon" class="toggle-track-icon"></i>
        </div>
        <div class="absolute right-1 md:right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'opacity-0' : ''} transition-opacity duration-300">
            <i data-lucide="sun" class="toggle-track-icon"></i>
        </div>
        <div class="theme-toggle-thumb">
            <i data-lucide="${activeIconName}" class="thumb-icon"></i>
        </div>
    `;

    document.querySelectorAll('.theme-toggle').forEach(toggle => {
        toggle.innerHTML = trackHTML;
    });
    if (window.lucide) window.lucide.createIcons();
};

window.toggleTheme = function () {
    const isLight = document.body.classList.toggle('light-mode');
    // Also toggle 'dark' class on html element for Tailwind's dark mode variant
    if (isLight) {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
    localStorage.setItem('themePreference', isLight ? 'light' : 'dark');
    window.updateToggleVisuals();
};

// --- LANGUAGE LOGIC ---
window.toggleLanguage = function () {
    const body = document.body;
    const isEn = body.classList.toggle('lang-en');
    localStorage.setItem('tcav-lang', isEn ? 'en' : 'es');
    window.updateToggleVisuals(); // Update theme toggle visuals as they might depend on language (e.g., active state of labels)
};

// Initialize language on load
(function () {
    if (localStorage.getItem('tcav-lang') === 'en') {
        document.body.classList.add('lang-en');
    }
})();

// --- TOAST NOTIFICATIONS ---
window.showToast = function (message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast p-4 rounded-[15px] shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 transform translate-x-full transition-transform duration-300`;

    if (type === 'success') {
        toast.style.backgroundColor = 'rgba(22, 163, 74, 0.9)'; // Green
        toast.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-white"></i><span class="text-sm font-bold text-white">${message}</span>`;
    } else {
        toast.style.backgroundColor = 'rgba(220, 38, 38, 0.9)'; // Red
        toast.innerHTML = `<i data-lucide="alert-octagon" class="w-5 h-5 text-white"></i><span class="text-sm font-bold text-white">${message}</span>`;
    }

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    requestAnimationFrame(() => {
        toast.classList.remove('translate-x-full');
    });

    setTimeout(() => {
        toast.classList.add('translate-x-full');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
};

// --- NEWSLETTER FORM HANDLER (used in footer) ---
window.handleNewsletterSubmit = function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');
    const originalText = btnText.textContent;

    btnText.textContent = "";
    btnLoader.classList.remove('hidden');
    btn.disabled = true;

    setTimeout(() => {
        btnText.textContent = originalText;
        btnLoader.classList.add('hidden');
        btn.disabled = false;
        e.target.reset();
        window.showToast('¡Suscrito a la newsletter!', 'success');
    }, 1500);
};

// --- MODAL HANDLERS (for agendaModal) ---
window.openModal = function (modalId = 'agendaModal') {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const content = modal.querySelector('.modal-content');
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('flex');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
};

window.closeModal = function (modalId = 'agendaModal') {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    const content = modal.querySelector('.modal-content');
    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        // Reset form if it's the agenda modal
        if (modalId === 'agendaModal' && typeof window.resetAgendaForm === 'function') {
            window.resetAgendaForm();
        }
    }, 300);
};

// --- MOBILE MENU LOGIC ---
window.toggleMobileMenu = function () {
    const drawer = document.getElementById('mobileDrawer');
    if (!drawer) return;
    const isOpen = drawer.classList.toggle('open');
    const overlay = document.getElementById('navOverlay');
    const controlsBar = document.querySelector('.controls-bar');

    if (overlay) {
        overlay.style.visibility = isOpen ? 'visible' : 'hidden';
        overlay.style.opacity = isOpen ? '1' : '0';
    }
    if (controlsBar) controlsBar.style.display = isOpen ? 'none' : 'flex';
};

window.toggleSubmenu = function (id) {
    const node = document.getElementById(id);
    if (node) node.classList.toggle('open');
};

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
    const modalEl = document.getElementById('agendaModal');
    if (modalEl) {
        modalEl.addEventListener('click', function (e) {
            if (e.target === this) window.closeModal();
        });
    }
});

// --- NETWORK CANVAS ANIMATION (global background) ---
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                const isLight = document.body.classList.contains('light-mode');
                ctx.fillStyle = isLight ? 'rgba(24, 85, 186, 0.4)' : 'rgba(24, 85, 186, 0.5)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        for (let i = 0; i < 50; i++) particles.push(new Particle());

        function animateNetwork() {
            ctx.clearRect(0, 0, width, height);
            const isLight = document.body.classList.contains('light-mode');

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.strokeStyle = isLight ? `rgba(24, 85, 186, ${0.15 - dist / 1000})` : `rgba(24, 85, 186, ${0.1 - dist / 1500})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateNetwork);
        }
        animateNetwork();
    }
});

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    window.updateToggleVisuals(); // Initialize theme toggle visuals
});

// Re-initialize visuals and icons when dynamic components are loaded
window.addEventListener('tcav:components-loaded', () => {
    window.updateToggleVisuals();
    if (window.lucide) window.lucide.createIcons();
});

// Intersection Observer for reveal-growth animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-growth').forEach(element => {
        observer.observe(element);
    });
});