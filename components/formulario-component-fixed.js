// Componente de formulario reutilizable SIN shadow DOM, hereda estilos globales correctamente
class FormularioComponent extends HTMLElement {
  connectedCallback() {
    // Leer atributos personalizados
    const title = this.getAttribute('title') || 'Contacto Directo';
    const btnText = this.getAttribute('btn-text') || 'Contactar';
    const nombreLabel = this.getAttribute('nombre-label') || 'Nombre Completo';
    const nombrePlaceholder = this.getAttribute('nombre-placeholder') || 'Ej. Juan Pérez';
    const emailLabel = this.getAttribute('email-label') || 'Email Corporativo';
    const emailPlaceholder = this.getAttribute('email-placeholder') || 'nombre@empresa.com';
    const mensajeLabel = this.getAttribute('mensaje-label') || 'Mensaje';
    const mensajePlaceholder = this.getAttribute('mensaje-placeholder') || 'Describe tu interés...';
    const legalText = this.getAttribute('legal-text') || 'He leído y acepto la <a href="policy-template.html" class="underline hover:text-[#1855BA]" style="color:#1855BA;">Política de Privacidad</a>.';

    this.innerHTML = `
    <div class="glass p-1 rounded-3xl relative reveal-growth delay-300 shadow-2xl">
      <div class="rounded-[1.3rem] p-5 md:p-8 overflow-hidden relative" style="background-color: var(--glass-bg);">
        <div class="flex items-center justify-between mb-6 md:mb-8 relative z-10">
          <h3 class="font-bold text-lg md:text-xl flex items-center gap-2" style="color: var(--text-main);">
            <span class="bg-[#1855BA]/10 p-2 rounded-lg"><i data-lucide="user-plus" class="text-[#1855BA] w-5 h-5"></i></span>
            <span id="form-title">${title}</span>
          </h3>
          <div class="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span class="text-xs font-mono text-green-600 font-bold">ONLINE</span>
          </div>
        </div>
        <form id="reusableForm" class="space-y-4 md:space-y-5 relative z-10" onsubmit="handleReusableFormSubmit(event)">
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);" for="form-nombre">${nombreLabel}</label>
            <input id="form-nombre" name="nombre" type="text" required placeholder="${nombrePlaceholder}"
              class="w-full rounded-[15px] px-4 py-3 focus:outline-none focus:border-[#1855BA] transition-all text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);" for="form-email">${emailLabel}</label>
            <input id="form-email" name="email" type="email" required placeholder="${emailPlaceholder}"
              class="w-full rounded-[15px] px-4 py-3 focus:outline-none focus:border-[#1855BA] transition-all text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);" for="form-mensaje">${mensajeLabel}</label>
            <textarea id="form-mensaje" name="mensaje" required rows="3" placeholder="${mensajePlaceholder}"
              class="w-full rounded-[15px] px-4 py-3 focus:outline-none focus:border-[#1855BA] transition-all text-sm resize-none font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);"></textarea>
          </div>
          <div class="flex items-start gap-3 mt-4">
            <input type="checkbox" id="form-legal" class="mt-1 flex-shrink-0" required>
            <label for="form-legal" class="text-xs font-medium cursor-pointer leading-tight" style="color: var(--text-muted);">
              ${legalText}
            </label>
          </div>
          <button type="submit"
            class="w-full py-4 bg-[#1855BA] hover:bg-[#144a9e] text-white font-bold rounded-[15px] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group mt-2">
            <span id="form-btn-text">${btnText}</span> <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
          </button>
        </form>
      </div>
    </div>
    `;
    if (window.lucide) window.lucide.createIcons();
  }
}
customElements.define('formulario-component', FormularioComponent);
// Función global para el submit (solo una vez en window)
if (!window.handleReusableFormSubmit) {
  window.handleReusableFormSubmit = function (e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 animate-spin"></i> <span>Enviando...</span>';
    if (window.lucide) window.lucide.createIcons();
    setTimeout(() => {
      btn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> <span>¡Enviado!</span>';
      if (window.lucide) window.lucide.createIcons();
      e.target.reset();
      setTimeout(() => { btn.innerHTML = original; if (window.lucide) window.lucide.createIcons(); }, 2500);
    }, 800);
  }
}
