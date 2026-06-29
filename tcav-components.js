(function () {
    async function includeComponents() {
        const nodes = document.querySelectorAll('[data-component]');
        if (!nodes.length) {
            window.dispatchEvent(new CustomEvent('tcav:components-loaded'));
            return;
        }

        await Promise.all(Array.from(nodes).map(async (node) => {
            const path = node.getAttribute('data-component');
            if (!path) return;
            try {
                const res = await fetch(path, { cache: 'no-store' });
                if (!res.ok) throw new Error('Failed to load ' + path);
                node.outerHTML = await res.text();
            } catch (err) {
                console.error(err);
            }
        }));

        window.dispatchEvent(new CustomEvent('tcav:components-loaded'));
    }

    class TcavTeamCard extends HTMLElement {
        connectedCallback() {
            const name = this.getAttribute('name') || '';
            const role = this.getAttribute('role') || '';
            const image = this.getAttribute('image') || '';
            const linkedin = this.getAttribute('linkedin') || '#';
            const bioEs = this.getAttribute('bio-es') || '';
            const bioEn = this.getAttribute('bio-en') || '';
            const delay = this.getAttribute('delay') || '';
            const extraClass = this.getAttribute('class') || '';

            this.outerHTML = `
                <article class="team-card reveal-growth ${delay} ${extraClass}">
                    <img src="${image}" alt="${name}" class="team-image">
                    <div class="p-7 space-y-4 text-center">
                        <p class="team-role">${role}</p>
                        <h2 class="text-2xl font-bold heading-text">${name}</h2>
                        <p class="body-text text-sm leading-relaxed">
                            <span class="lang-es">${bioEs}</span>
                            <span class="lang-en">${bioEn}</span>
                        </p>
                        <a class="team-link justify-center" href="${linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </article>
            `;
        }
    }

    if (!customElements.get('tcav-team-card')) {
        customElements.define('tcav-team-card', TcavTeamCard);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', includeComponents);
    } else {
        includeComponents();
    }
})();
