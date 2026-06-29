<script setup>
import { ref, onMounted, watch } from 'vue'

// --- ESTADO REACTIVO ---
const isLightMode = ref(false)
const isMobileMenuOpen = ref(false)
const isModalOpen = ref(false)
const activeProjectFilter = ref('all') // 'all', 'primary', 'secondary'
const activeServiceMode = ref('investor') // 'investor', 'issuer'

// Referencias a elementos del DOM para animaciones
const canvasRef = ref(null)
const sparkFill2 = ref(null)
const sparkLine2 = ref(null)
const sparkFill3 = ref(null)
const sparkLine3 = ref(null)

// --- LÓGICA & MÉTODOS ---

const toggleTheme = () => {
  isLightMode.value = !isLightMode.value
  // Re-inicializar iconos por si acaso cambian de color (aunque CSS lo maneja)
  setTimeout(() => { if(window.lucide) window.lucide.createIcons() }, 100)
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const openModal = () => {
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  // Resetear formularios si es necesario
}

const filterProjects = (category) => {
  activeProjectFilter.value = category
}

const toggleServiceMode = (mode) => {
  activeServiceMode.value = mode
}

// Manejadores de Formularios (Simulados)
const handleContactSubmit = (e) => {
  // Lógica de envío simulada
  const btn = e.target.querySelector('button')
  const originalContent = btn.innerHTML
  btn.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Enviando...`
  if(window.lucide) window.lucide.createIcons()
  btn.disabled = true
  
  setTimeout(() => {
    btn.innerHTML = originalContent
    btn.disabled = false
    e.target.reset()
    alert('Mensaje enviado con éxito (Simulación)')
  }, 1500)
}

const handleAgendaSubmit = (e) => {
  const btn = e.target.querySelector('button')
  const btnText = btn.querySelector('.btn-text')
  const btnLoader = btn.querySelector('.btn-loader')
  const btnIcon = btn.querySelector('.btn-icon')
  
  btn.disabled = true
  btnText.textContent = "Enviando..."
  btnIcon.classList.add('hidden')
  btnLoader.classList.remove('hidden')

  setTimeout(() => {
    btn.disabled = false
    btnText.textContent = "Confirmar Agenda"
    btnIcon.classList.remove('hidden')
    btnLoader.classList.add('hidden')
    closeModal()
    alert('Agenda confirmada (Simulación)')
  }, 1500)
}

const handleNewsletterSubmit = (e) => {
  const btn = e.target.querySelector('button')
  const btnText = btn.querySelector('.btn-text')
  const btnLoader = btn.querySelector('.btn-loader')
  const originalText = btnText.textContent
  
  btnText.textContent = ""
  btnLoader.classList.remove('hidden')
  btn.disabled = true

  setTimeout(() => {
    btnText.textContent = originalText
    btnLoader.classList.add('hidden')
    btn.disabled = false
    e.target.reset()
    alert('Suscrito correctamente (Simulación)')
  }, 1500)
}

// --- WATCH: Toggle body class cuando cambia el tema ---
watch(isLightMode, (val) => {
  document.body.classList.toggle('light-mode', val)
}, { immediate: true })

// --- ANIMACIONES & EFECTOS (ON MOUNTED) ---
onMounted(() => {
  // 0. Configurar head
  document.title = 'Token City | European Exchange AV'

  // 1. Detección Horaria para Modo Oscuro
  const hour = new Date().getHours()
  if (hour >= 19 || hour < 8) {
    isLightMode.value = false
  } else {
    isLightMode.value = true // Opcional: forzar claro si es de día
  }

  // 2. Animación Canvas (Red neuronal)
  if (canvasRef.value) {
    const ctx = canvasRef.value.getContext('2d')
    let width, height
    let particles = []
    
    const resize = () => {
      width = canvasRef.value.width = window.innerWidth
      height = canvasRef.value.height = window.innerHeight
    }
    window.addEventListener('resize', resize)
    resize()

    class Particle {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.size = Math.random() * 2
      }
      update() {
        this.x += this.vx
        this.y += this.vy
        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1
      }
      draw() {
        ctx.fillStyle = isLightMode.value ? 'rgba(24, 85, 186, 0.4)' : 'rgba(24, 85, 186, 0.5)'
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (let i = 0; i < 50; i++) particles.push(new Particle())

    const animateNetwork = () => {
      ctx.clearRect(0, 0, width, height)
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.strokeStyle = isLightMode.value 
              ? `rgba(24, 85, 186, ${0.15 - dist/1000})` 
              : `rgba(24, 85, 186, ${0.1 - dist/1500})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      requestAnimationFrame(animateNetwork)
    }
    animateNetwork()
  }

  // 3. Intersection Observer (Reveal, Contadores, Barras)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active')
        
        // Live Activity trigger
        if(entry.target.classList.contains('live-card') && !entry.target.classList.contains('live-active')) {
             entry.target.classList.add('live-active');
             setTimeout(() => startLiveActivity(entry.target), 2000);
        }

        // Contadores
        const counters = entry.target.querySelectorAll('.counter')
        counters.forEach(counter => {
          if (counter.classList.contains('animated')) return
          counter.classList.add('animated')
          const target = parseFloat(counter.getAttribute('data-target'))
          const isCurrency = counter.getAttribute('data-format') === 'currency'
          const duration = 1500
          const start = 0
          const startTime = performance.now()

          const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 4)
            const current = start + (target - start) * ease

            if (isCurrency) {
              counter.innerText = Math.floor(current).toLocaleString('es-ES')
            } else if (target % 1 !== 0) {
              counter.innerText = current.toFixed(1)
            } else {
              counter.innerText = Math.floor(current)
            }

            if (progress < 1) requestAnimationFrame(updateCounter)
            else counter.innerText = isCurrency ? target.toLocaleString('es-ES') : target
          }
          requestAnimationFrame(updateCounter)
        })

        // Barras de progreso
        const progressBars = entry.target.querySelectorAll('.progress-fill')
        progressBars.forEach(bar => {
          setTimeout(() => {
            bar.style.width = bar.getAttribute('data-width')
          }, 200)
        })
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.reveal-growth, .live-card').forEach(el => observer.observe(el))

  // 4. Sparklines Animados
  createDynamicSparkline(sparkFill2.value, sparkLine2.value, 15)
  createDynamicSparkline(sparkFill3.value, sparkLine3.value, 15)

  // Inicializar Iconos Lucide
  if(window.lucide) window.lucide.createIcons()
})

// Función helper para sparklines
function createDynamicSparkline(fillPath, linePath, startVal) {
    if (!fillPath || !linePath) return;

    const points = 20;
    let data = [];
    let val = startVal;
    
    for(let i=0; i<points; i++) {
        val += (Math.random() - 0.5) * 8;
        if(val < 5) val = 5;
        if(val > 25) val = 25;
        data.push(val);
    }

    function updateSparkline() {
        data.shift(); 
        const last = data[data.length - 1];
        let change = (Math.random() - 0.5) * 6; 
        
        let next = last + change;
        if (next < 2) next = 2; 
        if (next > 28) next = 28; 
        data.push(next);

        const width = 100;
        const height = 30;
        
        let d = `M 0,${height - data[0]}`;
        for (let i = 0; i < data.length - 1; i++) {
            const x0 = (i / (data.length - 1)) * width;
            const y0 = height - data[i];
            const x1 = ((i + 1) / (data.length - 1)) * width;
            const y1 = height - data[i + 1];
            
            const cp1x = (x0 + x1) / 2;
            const cp2x = (x0 + x1) / 2;
            d += ` C ${cp1x},${y0} ${cp2x},${y1} ${x1},${y1}`;
        }
        
        linePath.setAttribute('d', d);
        fillPath.setAttribute('d', d + ` L ${width},${height} L 0,${height} Z`);
        
        setTimeout(() => requestAnimationFrame(updateSparkline), 800);
    }
    updateSparkline();
}

// Función helper para Live Activity
function startLiveActivity(card) {
    const price = parseInt(card.getAttribute('data-price') || 0);
    const soldEl = card.querySelector('.token-sold-counter');
    const saleEl = card.querySelector('.token-sale-counter');
    const fundedEl = card.querySelector('.funded-counter');
    const progressEl = card.querySelector('.progress-fill');
    
    const interval = Math.floor(Math.random() * 4000) + 4000;

    setTimeout(() => {
        const amount = Math.floor(Math.random() * 2) + 1;
        
        if(soldEl) {
            let currentSold = parseInt(soldEl.innerText.replace(/\./g, ''));
            currentSold += amount;
            soldEl.innerText = currentSold.toLocaleString('es-ES');
            soldEl.style.color = '#22c55e'; 
            setTimeout(() => soldEl.style.color = '', 800);
        }

        if(saleEl) {
            let currentSale = parseInt(saleEl.innerText.replace(/\./g, ''));
            currentSale -= amount;
            if(currentSale < 0) currentSale = 0;
            saleEl.innerText = currentSale.toLocaleString('es-ES');
        }

        if(fundedEl && price > 0) {
            let currentFunded = parseInt(fundedEl.innerText.replace(/\./g, ''));
            let targetFunded = currentFunded + (amount * price);
            
            const duration = 1500;
            const startTimestamp = performance.now();
            
            function step(timestamp) {
                const progress = Math.min((timestamp - startTimestamp) / duration, 1);
                const val = Math.floor(currentFunded + (targetFunded - currentFunded) * progress);
                fundedEl.innerText = val.toLocaleString('es-ES');
                if(progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    fundedEl.innerText = targetFunded.toLocaleString('es-ES');
                }
            }
            window.requestAnimationFrame(step);

            if(progressEl) {
                const max = 130000; 
                const pct = Math.min((targetFunded / max) * 100, 100);
                progressEl.style.width = `${pct}%`;
            }
        }
        startLiveActivity(card);
    }, interval);
}
</script>

<template>
  <div class="main-wrapper pb-24 md:pb-0">
    <canvas id="network-canvas" ref="canvasRef"></canvas>

    <!-- Navegación Superior -->
    <nav class="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md border-b" id="navbar" style="background-color: var(--nav-bg); border-color: var(--glass-border);">
        <div class="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 h-16 md:h-20">
            <div class="flex items-center gap-2 select-none">
                <div class="flex items-baseline tracking-tighter leading-none" style="color: var(--nav-text);">
                    <span class="text-sm md:text-2xl font-bold tracking-tight">TOKEN CITY</span>
                    <span class="text-sm md:text-2xl font-thin ml-1 tracking-wide">EXCHANGE</span>
                </div>
                <div class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse self-start mt-1"></div>
            </div>
            
            <div class="hidden items-center gap-8 text-sm font-medium transition-colors" style="color: var(--nav-text-muted);">
                <!-- Links ocultos -->
            </div>

            <div class="flex items-center gap-2 md:gap-4">
                <button class="text-[10px] md:text-sm font-bold px-3 py-1.5 md:px-4 md:py-2 border border-white rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap flex items-center gap-2" style="color: white;">
                    <i data-lucide="user" class="w-4 h-4"></i> Iniciar sesión
                </button>
                <div class="theme-toggle flex-shrink-0" @click="toggleTheme">
                    <div class="absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300" :class="{ 'opacity-0': isLightMode }"><i data-lucide="moon" class="toggle-track-icon"></i></div>
                    <div class="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300" :class="{ 'opacity-0': !isLightMode }"><i data-lucide="sun" class="toggle-track-icon"></i></div>
                    <div class="theme-toggle-thumb absolute top-0.5 transition-transform duration-300" style="left: 2px;" :style="{ transform: isLightMode ? 'translateX(30px)' : 'translateX(0)' }">
                        <i :data-lucide="isLightMode ? 'sun' : 'moon'" class="thumb-icon"></i>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div class="fixed inset-0 z-40 flex-col transition-all duration-300 transform md:hidden" :class="isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full hidden'" style="background-color: var(--nav-bg); padding-top: 5rem;">
        <div class="flex flex-col p-6 gap-6 text-lg font-medium h-full overflow-y-auto">
             <button class="mt-auto mb-20 text-gray-400 text-sm flex items-center gap-2" @click="toggleMobileMenu">
                <i data-lucide="x" class="w-4 h-4"></i> Cerrar Menú
            </button>
        </div>
    </div>

    <!-- Navegación Inferior Flotante (Móvil) -->
    <nav class="fixed bottom-0 left-0 w-full z-[60] md:hidden bottom-nav pb-safe px-4 py-3 h-16 flex items-center">
        <div class="flex justify-between items-center gap-4 w-full">
             <div class="theme-toggle flex-shrink-0 relative ml-auto" @click="toggleTheme" style="height: 48px; width: 80px; border-radius: 9999px;">
                 <div class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300" :class="{ 'opacity-0': isLightMode }"><i data-lucide="moon" class="toggle-track-icon" style="width: 20px; height: 20px;"></i></div>
                 <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-300" :class="{ 'opacity-0': !isLightMode }"><i data-lucide="sun" class="toggle-track-icon" style="width: 20px; height: 20px;"></i></div>
                 <div class="theme-toggle-thumb absolute transition-transform duration-300 flex items-center justify-center shadow-md" style="width: 36px; height: 36px; top: 6px; left: 6px;" :style="{ transform: isLightMode ? 'translateX(32px)' : 'translateX(0px)' }">
                     <i :data-lucide="isLightMode ? 'sun' : 'moon'" class="thumb-icon" style="width: 20px; height: 20px;"></i>
                 </div>
            </div>
        </div>
    </nav>

    <main class="pt-0"> 
        <!-- Hero Section -->
        <div class="relative w-full overflow-hidden mb-16 md:mb-32 pt-28 pb-12 md:pt-40 md:pb-20">
            <video autoplay muted loop playsinline class="absolute top-0 left-0 w-full h-full object-cover z-0">
                <source src="https://cdn.pixabay.com/video/2024/03/15/204306-923909642_large.mp4" type="video/mp4">
            </video>
            <div class="absolute top-0 left-0 w-full h-full z-0 transition-colors duration-500" 
                 style="background: linear-gradient(to bottom, var(--hero-overlay-start), var(--hero-overlay-mid), var(--hero-overlay-end));"></div>
            
            <section class="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10 px-4 md:px-6">
                <!-- Hero Content -->
                <div class="space-y-6 md:space-y-8">
                    <div class="reveal-growth delay-100 inline-flex items-center gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] md:text-xs font-bold uppercase tracking-widest backdrop-blur-md animate-pulse">
                        <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                        El futuro de los mercados financieros
                    </div>
                    
                    <h1 class="reveal-growth delay-200 text-3xl md:text-5xl lg:text-6xl font-bold leading-tight drop-shadow-sm tracking-tight hero-title-text" style="color: var(--hero-text-main);">
                        Infraestructura <br>
                        regulada de activos <br>
                        <span class="hero-text-glow">tokenizados</span>
                    </h1>
                    
                    <p class="reveal-growth delay-300 text-base md:text-lg font-light leading-relaxed max-w-lg hero-desc-text" style="color: var(--hero-text-muted);">
                        Agencia de Valores autorizada por la CNMV para operar con instrumentos financieros tokenizados con pleno reconocimiento jurídico y 100% digital.
                    </p>

                    <!-- Sello de Confianza -->
                    <div class="reveal-growth delay-400 relative flex w-full group cursor-default">
                        <div class="absolute -inset-0.5 bg-gradient-to-r from-[#1855BA] to-green-500 rounded-2xl blur animate-slow-pulse"></div>
                        <div class="relative flex items-center gap-3 p-3 md:p-4 rounded-2xl glass w-full" style="background-color: var(--seal-bg); border-color: var(--glass-border);">
                            <div class="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#1855BA] to-blue-800 flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(24,85,186,0.4)]">
                                <i data-lucide="shield-check" class="w-5 h-5 md:w-6 md:h-6"></i>
                            </div>
                            <div class="text-left flex-1">
                                <p class="text-[10px] md:text-[11px] leading-snug" style="color: var(--text-muted);">
                                    Inscrita en el Registro de Agencias de Valores de la <strong style="color: var(--text-main);">CNMV con el número 334</strong>.<br> 
                                    Adherida al Fondo General de Garantía de Inversiones <strong style="color: var(--text-main);">(FOGAIN)</strong>.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="reveal-growth delay-500 flex flex-col sm:flex-row gap-4 w-full">
                        <button @click="openModal" class="bg-[#1855BA] text-white px-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#144a9e] transition-all shadow-xl shadow-blue-900/20 w-full sm:flex-1 text-sm md:text-base">
                            Empezar a Invertir <i data-lucide="trending-up" class="w-5 h-5"></i>
                        </button>
                        <button @click="openModal" class="px-4 py-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-[#1e293b] hover:bg-[#0f172a] text-white transition-all shadow-md w-full sm:flex-1 text-sm md:text-base">
                            Para Emisores <i data-lucide="briefcase" class="w-5 h-5"></i>
                        </button>
                    </div>

                    <div class="reveal-growth delay-500 grid grid-cols-3 gap-4 pt-6 md:pt-8 border-t hero-stat-border" style="transition-delay: 600ms;">
                        <div>
                            <div class="text-xl md:text-2xl font-bold font-mono counter hero-stat-number" data-target="334">0</div>
                            <div class="text-[10px] md:text-xs uppercase font-semibold tracking-wider hero-stat-label">Registro CNMV</div>
                        </div>
                        <div>
                            <div class="text-sm md:text-base font-bold leading-tight hero-stat-number pt-1">Renta fija y variable</div>
                            <div class="text-[10px] md:text-xs uppercase font-semibold tracking-wider hero-stat-label mt-1">Productos</div>
                        </div>
                        <div>
                            <div class="text-sm md:text-base font-bold leading-tight hero-stat-number pt-1">Institucionales y minoristas</div>
                            <div class="text-[10px] md:text-xs uppercase font-semibold tracking-wider hero-stat-label mt-1">Inversores</div>
                        </div>
                    </div>
                </div>

                <!-- Formulario Hero -->
                <div class="glass p-1 rounded-3xl relative reveal-growth delay-300 shadow-2xl">
                    <div class="rounded-[1.3rem] p-5 md:p-8 overflow-hidden relative" style="background-color: var(--glass-bg);">
                        <div class="flex items-center justify-between mb-6 md:mb-8 relative z-10">
                            <h3 class="font-bold text-lg md:text-xl flex items-center gap-2" style="color: var(--text-main);">
                                <span class="bg-[#1855BA]/10 p-2 rounded-lg"><i data-lucide="user-plus" class="text-[#1855BA] w-5 h-5"></i></span>
                                Contacto Directo
                            </h3>
                            <div class="flex items-center gap-2 px-3 py-1 bg-green-500/10 rounded-full border border-green-500/20">
                                <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span class="text-xs font-mono text-green-600 font-bold">ONLINE</span>
                            </div>
                        </div>

                        <form class="space-y-4 md:space-y-5 relative z-10" @submit.prevent="handleContactSubmit">
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Nombre Completo</label>
                                <input type="text" required placeholder="Ej. Juan Pérez" class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] transition-all text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Email Corporativo</label>
                                <input type="email" required placeholder="nombre@empresa.com" class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] transition-all text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
                            </div>
                            <div class="space-y-2">
                                <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Mensaje</label>
                                <textarea required rows="3" placeholder="Describe tu interés..." class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] transition-all text-sm resize-none font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);"></textarea>
                            </div>
                            <div class="flex items-start gap-3 mt-4">
                                <input type="checkbox" id="legalHero" class="mt-1 flex-shrink-0" required>
                                <label for="legalHero" class="text-xs font-medium cursor-pointer leading-tight" style="color: var(--text-muted);">He leído y acepto la <a href="#" class="underline hover:text-[#1855BA]">Política de Privacidad</a>.</label>
                            </div>
                            <button type="submit" class="w-full py-4 bg-[#1855BA] hover:bg-[#144a9e] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group mt-2">
                                <span>Contactar</span> <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>

        <!-- Ecosistema de Activos -->
        <section class="max-w-7xl mx-auto mb-16 md:mb-32 px-4 md:px-6">
            <div class="mb-10 md:mb-14 text-center max-w-4xl mx-auto reveal-growth">
                <h2 class="text-3xl md:text-4xl font-bold mb-4" style="color: var(--text-main);">
                    Agencia de Valores y tokenización en un único <span style="color: var(--primary-blue);">entorno regulado</span>
                </h2>
                <p class="text-base md:text-lg" style="color: var(--text-muted);">
                    Integramos estructuración, emisión, registro, colocación y negociación de valores tokenizados bajo supervisión de la CNMV, en una arquitectura diseñada para operar como mercado financiero digital europeo.
                </p>
            </div>

            <div class="relative group-panel"> 
                <div class="led-border-wrapper reveal-growth delay-100">
                    <div class="led-spinner led-spinner-glow"></div>
                    <div class="led-spinner"></div>
                </div>

                <div class="glass rounded-[2.5rem] overflow-hidden border shadow-2xl reveal-growth delay-100 flex flex-col md:flex-row relative z-0" style="background-color: var(--card-highlight-bg); border-color: var(--glass-border);">
                    <div class="group flex-1 p-8 relative overflow-hidden transition-all duration-500 hover:bg-black/5 dark:hover:bg-white/5 border-b md:border-b-0 md:border-r" style="border-color: var(--glass-border);">
                        <div class="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 text-[#1855BA]">
                            <i data-lucide="filter" class="w-40 h-40"></i>
                        </div>
                        <div class="relative z-10 flex flex-col h-full items-start">
                            <span class="text-xs font-bold tracking-widest mb-4" style="color: var(--text-main);">01. ADMISIÓN</span>
                            <div class="w-14 h-14 rounded-2xl bg-[#1855BA]/10 flex items-center justify-center text-[#1855BA] mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <i data-lucide="filter" class="w-7 h-7"></i>
                            </div>
                            <h4 class="text-xl font-bold mb-3" style="color: var(--text-main);">Filtrado y selección</h4>
                            <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Evaluamos cada operación para admitir únicamente productos financieros sólidos y rentables.</p>
                        </div>
                    </div>
                    <div class="group flex-1 p-8 relative overflow-hidden transition-all duration-500 hover:bg-black/5 dark:hover:bg-white/5 border-b md:border-b-0 md:border-r" style="border-color: var(--glass-border);">
                        <div class="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 text-purple-500">
                            <i data-lucide="scale" class="w-40 h-40"></i>
                        </div>
                        <div class="relative z-10 flex flex-col h-full items-start">
                            <span class="text-xs font-bold tracking-widest mb-4" style="color: var(--text-main);">02. MARCO LEGAL</span>
                            <div class="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <i data-lucide="scale" class="w-7 h-7"></i>
                            </div>
                            <h4 class="text-xl font-bold mb-3" style="color: var(--text-main);">Marco Legal Europeo</h4>
                            <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Reconocimiento jurídico pleno en entorno europeo con cumplimiento normativo MiFID II.</p>
                        </div>
                    </div>
                    <div class="group flex-1 p-8 relative overflow-hidden transition-all duration-500 hover:bg-black/5 dark:hover:bg-white/5 border-b md:border-b-0 md:border-r" style="border-color: var(--glass-border);">
                        <div class="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 text-[#1855BA]">
                            <i data-lucide="shield" class="w-40 h-40"></i>
                        </div>
                        <div class="relative z-10 flex flex-col h-full items-start">
                            <span class="text-xs font-bold tracking-widest mb-4" style="color: var(--text-main);">03. CUSTODIA</span>
                            <div class="w-14 h-14 rounded-2xl bg-[#1855BA]/10 flex items-center justify-center text-[#1855BA] mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <i data-lucide="shield" class="w-7 h-7"></i>
                            </div>
                            <h4 class="text-xl font-bold mb-3" style="color: var(--text-main);">Custodia (ERIR)</h4>
                            <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Infraestructura regulada para máxima seguridad en el registro de activos tokenizados.</p>
                        </div>
                    </div>
                    <div class="group flex-1 p-8 relative overflow-hidden transition-all duration-500 hover:bg-black/5 dark:hover:bg-white/5" style="border-color: var(--glass-border);">
                        <div class="absolute -right-6 -bottom-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 transform group-hover:scale-110 text-green-500">
                            <i data-lucide="activity" class="w-40 h-40"></i>
                        </div>
                        <div class="relative z-10 flex flex-col h-full items-start">
                            <span class="text-xs font-bold tracking-widest mb-4" style="color: var(--text-main);">04. LIQUIDEZ</span>
                            <div class="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                <i data-lucide="activity" class="w-7 h-7"></i>
                            </div>
                            <h4 class="text-xl font-bold mb-3" style="color: var(--text-main);">Liquidez</h4>
                            <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Trading secundario fluido y transparente con liquidación instantánea T+0.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Proyectos Destacados -->
        <section class="max-w-7xl mx-auto mb-16 md:mb-32 px-4 md:px-6">
            <div class="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-10 gap-6 reveal-growth">
                <div class="max-w-2xl">
                    <div class="mb-4">
                        <h2 class="text-3xl md:text-4xl font-bold flex items-center gap-4" style="color: var(--text-main);">
                            <span class="w-1.5 h-8 bg-[#1855BA]"></span> 
                            Oportunidades de 
                            <span class="relative inline-block" style="color: var(--primary-blue);">
                                inversión
                                <span class="absolute -top-3 -right-6 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide leading-none transform translate-x-1/2">Próximamente</span>
                            </span>
                        </h2>
                    </div>
                    <p class="text-base md:text-lg leading-relaxed" style="color: var(--text-muted);">
                        Consulta los instrumentos financieros tokenizados seleccionados por nuestro equipo de analistas y disponibles para inversión a través de nuestro entorno regulado.
                    </p>
                </div>
                
                <div class="flex p-1 rounded-xl border backdrop-blur-sm opacity-60 pointer-events-none" style="background-color: var(--input-bg); border-color: var(--glass-border);">
                    <button class="px-5 py-2.5 rounded-lg text-xs font-bold transition-all project-filter-btn active">Todos</button>
                    <button class="px-5 py-2.5 rounded-lg text-xs font-bold transition-all project-filter-btn">Primario</button>
                    <button class="px-5 py-2.5 rounded-lg text-xs font-bold transition-all project-filter-btn">Secundario</button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[30px] reveal-growth delay-200 filter blur-sm opacity-80 pointer-events-none select-none grayscale-[0.3]" id="projectsGrid">
                <div class="rounded-[24px] p-[15px] pt-[30px] flex flex-col shadow-lg border hover:shadow-2xl transition-all live-card project-card" data-category="primary" data-price="5000" style="background-color: var(--tv-card-bg); border-color: var(--glass-border);">
                    <div class="flex justify-between items-start mb-4 px-3">
                        <div><span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Fondo Inmobiliario</span><h4 class="text-lg font-bold mt-1" style="color: var(--text-main);">Madrid Prime</h4></div>
                        <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-[#1855BA]/10 text-[#1855BA] border border-[#1855BA]/20">PRIMARIO</span>
                    </div>
                    <div class="rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-[#1855BA]/20 to-purple-600/20 h-40 flex items-center justify-center"><i data-lucide="building-2" class="w-16 h-16 opacity-40" style="color: var(--text-muted);"></i></div>
                    <div class="space-y-3 px-3 pb-3">
                        <div class="flex justify-between text-sm"><span style="color: var(--text-muted);">Objetivo</span><span class="font-bold" style="color: var(--text-main);">5.000.000 €</span></div>
                        <div class="w-full h-2 rounded-full bg-gray-700/50"><div class="h-full rounded-full bg-gradient-to-r from-[#1855BA] to-green-500" style="width: 42%;"></div></div>
                        <div class="flex justify-between text-xs"><span style="color: var(--text-muted);">Recaudado: <strong style="color: var(--text-main);">2.100.000 €</strong></span><span style="color: var(--text-muted);">42%</span></div>
                    </div>
                </div>
                <div class="rounded-[24px] p-[15px] pt-[30px] flex flex-col shadow-lg border hover:shadow-2xl transition-all live-card project-card" data-category="primary" data-price="3000" style="background-color: var(--tv-card-bg); border-color: var(--glass-border);">
                    <div class="flex justify-between items-start mb-4 px-3">
                        <div><span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Energías Renovables</span><h4 class="text-lg font-bold mt-1" style="color: var(--text-main);">Solar Yield</h4></div>
                        <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">PRIMARIO</span>
                    </div>
                    <div class="rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-green-500/20 to-cyan-600/20 h-40 flex items-center justify-center"><i data-lucide="sun" class="w-16 h-16 opacity-40" style="color: var(--text-muted);"></i></div>
                    <div class="space-y-3 px-3 pb-3">
                        <div class="flex justify-between text-sm"><span style="color: var(--text-muted);">Objetivo</span><span class="font-bold" style="color: var(--text-main);">8.000.000 €</span></div>
                        <div class="w-full h-2 rounded-full bg-gray-700/50"><div class="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-500" style="width: 28%;"></div></div>
                        <div class="flex justify-between text-xs"><span style="color: var(--text-muted);">Recaudado: <strong style="color: var(--text-main);">2.240.000 €</strong></span><span style="color: var(--text-muted);">28%</span></div>
                    </div>
                </div>
                <div class="rounded-[24px] p-[15px] pt-[30px] flex flex-col shadow-lg border hover:shadow-2xl transition-all live-card project-card" data-category="secondary" data-price="10000" style="background-color: var(--tv-card-bg); border-color: var(--glass-border);">
                    <div class="flex justify-between items-start mb-4 px-3">
                        <div><span class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Capital Privado</span><h4 class="text-lg font-bold mt-1" style="color: var(--text-main);">Tech Growth Fund</h4></div>
                        <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">SECUNDARIO</span>
                    </div>
                    <div class="rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 h-40 flex items-center justify-center"><i data-lucide="trending-up" class="w-16 h-16 opacity-40" style="color: var(--text-muted);"></i></div>
                    <div class="space-y-3 px-3 pb-3">
                        <div class="flex justify-between text-sm"><span style="color: var(--text-muted);">Objetivo</span><span class="font-bold" style="color: var(--text-main);">12.000.000 €</span></div>
                        <div class="w-full h-2 rounded-full bg-gray-700/50"><div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style="width: 65%;"></div></div>
                        <div class="flex justify-between text-xs"><span style="color: var(--text-muted);">Recaudado: <strong style="color: var(--text-main);">7.800.000 €</strong></span><span style="color: var(--text-muted);">65%</span></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Servicios -->
        <section class="max-w-7xl mx-auto mb-16 md:mb-32 reveal-growth px-4 md:px-6">
            <div class="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-6">
                <div>
                    <h2 class="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-3" style="color: var(--text-main);">
                        <span class="w-1.5 h-8 bg-green-500"></span> 
                        Servicios <span style="color: var(--primary-blue);">Integrales</span>
                    </h2>
                    <p class="text-sm md:text-base max-w-xl" style="color: var(--text-muted);">
                        Soluciones tecnológicas y financieras reguladas adaptadas a cada perfil.
                    </p>
                </div>
                
                <div class="flex p-1 rounded-xl border backdrop-blur-sm" style="background-color: var(--input-bg); border-color: var(--glass-border);">
                    <button @click="toggleServiceMode('investor')" class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all service-filter-btn" :class="{ 'active': activeServiceMode === 'investor' }">Inversores</button>
                    <button @click="toggleServiceMode('issuer')" class="px-6 py-2.5 rounded-lg text-sm font-bold transition-all service-filter-btn" :class="{ 'active': activeServiceMode === 'issuer' }">Emisores</button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Tarjetas Servicios con clase flip-card -->
                 <div class="flip-card perspective-1000 h-[320px]" :class="{ 'flipped': activeServiceMode === 'issuer' }">
                    <div class="flip-card-inner">
                        <!-- FRONT -->
                        <div class="flip-card-front glass highlight-card p-6 flex flex-col gap-4 border-l-4 border-l-[#1855BA] justify-start group">
                             <div class="w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-100 text-[#1855BA] shrink-0">
                                <i data-lucide="target" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2" style="color: var(--text-main);">Mercado primario</h4>
                                <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Accede a emisiones de activos tokenizados exclusivos.</p>
                            </div>
                        </div>
                        <!-- BACK -->
                        <div class="flip-card-back glass highlight-card p-6 flex flex-col gap-4 border-r-4 border-r-[#1855BA] justify-start group">
                            <div class="w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-blue-100 text-[#1855BA] shrink-0">
                                <i data-lucide="users" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2" style="color: var(--text-main);">Asesoramiento</h4>
                                <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Definimos el instrumento financiero óptimo.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flip-card perspective-1000 h-[320px]" :class="{ 'flipped': activeServiceMode === 'issuer' }">
                    <div class="flip-card-inner">
                        <div class="flip-card-front glass highlight-card p-6 flex flex-col gap-4 border-l-4 border-l-green-500 justify-start group">
                            <div class="w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-green-100 text-green-500 shrink-0">
                                <i data-lucide="layers" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2" style="color: var(--text-main);">Tokenización</h4>
                                <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Transforma activos reales en instrumentos digitales negociables.</p>
                            </div>
                        </div>
                        <div class="flip-card-back glass highlight-card p-6 flex flex-col gap-4 border-r-4 border-r-green-500 justify-start group">
                            <div class="w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-green-100 text-green-500 shrink-0">
                                <i data-lucide="file-code" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2" style="color: var(--text-main);">Estructuración</h4>
                                <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Diseñamos el vehículo de inversión tokenizado óptimo para tu activo.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flip-card perspective-1000 h-[320px]" :class="{ 'flipped': activeServiceMode === 'issuer' }">
                    <div class="flip-card-inner">
                        <div class="flip-card-front glass highlight-card p-6 flex flex-col gap-4 border-l-4 border-l-purple-500 justify-start group">
                            <div class="w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-purple-100 text-purple-500 shrink-0">
                                <i data-lucide="shield-check" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2" style="color: var(--text-main);">Cumplimiento Legal</h4>
                                <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Aseguramos el cumplimiento normativo en cada operación.</p>
                            </div>
                        </div>
                        <div class="flip-card-back glass highlight-card p-6 flex flex-col gap-4 border-r-4 border-r-purple-500 justify-start group">
                            <div class="w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-purple-100 text-purple-500 shrink-0">
                                <i data-lucide="book-open" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2" style="color: var(--text-main);">Regulación</h4>
                                <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Asesoramiento en materia regulatoria y documentación legal.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flip-card perspective-1000 h-[320px]" :class="{ 'flipped': activeServiceMode === 'issuer' }">
                    <div class="flip-card-inner">
                        <div class="flip-card-front glass highlight-card p-6 flex flex-col gap-4 border-l-4 border-l-cyan-500 justify-start group">
                            <div class="w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-cyan-100 text-cyan-500 shrink-0">
                                <i data-lucide="bar-chart-3" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2" style="color: var(--text-main);">Mercado Secundario</h4>
                                <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Proporcionamos liquidez continua a los inversores.</p>
                            </div>
                        </div>
                        <div class="flip-card-back glass highlight-card p-6 flex flex-col gap-4 border-r-4 border-r-cyan-500 justify-start group">
                            <div class="w-16 h-16 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-cyan-100 text-cyan-500 shrink-0">
                                <i data-lucide="refresh-cw" class="w-10 h-10"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-lg mb-2" style="color: var(--text-main);">Trading</h4>
                                <p class="text-sm leading-relaxed" style="color: var(--text-muted);">Operativa de compraventa con liquidación instantánea T+0.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Infraestructura -->
        <section class="max-w-7xl mx-auto mb-16 md:mb-32 reveal-growth px-4 md:px-6">
            <div class="grid md:grid-cols-2 gap-8 md:gap-16 items-center glass p-8 md:p-16 rounded-[2.5rem]" style="background-color: var(--card-highlight-bg);">
                <div>
                    <h2 class="text-3xl md:text-4xl font-bold mb-8 leading-tight" style="color: var(--text-main);">Seguridad jurídica en <br>cada operación</h2>
                    <ul class="space-y-8">
                        <li class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                                <i data-lucide="check-circle-2" class="w-6 h-6 text-[#1855BA]"></i>
                            </div>
                            <div>
                                <strong class="block text-lg mb-1" style="color: var(--text-main);">Supervisión CNMV</strong>
                                <span class="text-sm leading-relaxed" style="color: var(--text-muted);">Entidad regulada, sujeta a control y supervisión continua de la CNMV.</span>
                            </div>
                        </li>
                        <li class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0 mt-1">
                                <i data-lucide="cpu" class="w-6 h-6 text-purple-500"></i>
                            </div>
                            <div>
                                <strong class="block text-lg mb-1" style="color: var(--text-main);">DLT Pilot Regime</strong>
                                <span class="text-sm leading-relaxed" style="color: var(--text-muted);">Pioneros en infraestructura blockchain autorizada por la UE.</span>
                            </div>
                        </li>
                        <li class="flex items-start gap-4">
                            <div class="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-1">
                                <i data-lucide="zap" class="w-6 h-6 text-green-500"></i>
                            </div>
                            <div>
                                <strong class="block text-lg mb-1" style="color: var(--text-main);">Liquidación Instantánea (T+0)</strong>
                                <span class="text-sm leading-relaxed" style="color: var(--text-muted);">Menos fricción, más velocidad operativa en cada transacción.</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div class="relative h-full flex flex-col justify-center gap-6 w-full">
                    <!-- Tarjeta Agencia Valores -->
                    <div class="w-full infra-card-style p-8 rounded-[1.5rem]" style="border-left-color: #1855BA;">
                        <h4 class="text-2xl font-bold mb-2" style="color: var(--accent-blue);">Agencia de Valores</h4>
                        <p class="text-xs font-bold tracking-widest uppercase" style="color: var(--text-muted);">Entorno Regulado</p>
                    </div>
                    <!-- Tarjeta Blockchain -->
                    <div class="w-full infra-card-style p-8 rounded-[1.5rem]" style="border-left-color: #22c55e;">
                        <h4 class="text-2xl font-bold mb-2" style="color: var(--accent-green);">Blockchain</h4>
                        <p class="text-xs font-bold tracking-widest uppercase" style="color: var(--text-muted);">Infraestructura</p>
                    </div>
                    <div class="absolute inset-0 bg-gradient-to-br from-[#1855BA]/5 to-green-500/5 rounded-3xl -z-10 blur-3xl"></div>
                </div>
            </div>
        </section>

        <!-- CTA Final -->
        <section class="max-w-4xl mx-auto mb-24 md:mb-40 px-4 md:px-6 reveal-growth">
            <div class="relative rounded-[2rem] overflow-hidden p-8 md:p-10 text-center shadow-2xl border border-white/10 bg-[#020617]">
                <div class="absolute inset-0 bg-[#020617] z-0"></div>
                <div class="meta-fluid-bg"></div>
                <div class="relative z-10 flex flex-col items-center">
                    <div class="mb-4">
                        <span class="block text-xs font-bold text-blue-200 uppercase tracking-widest mb-1 shadow-black drop-shadow-md">Volumen Transaccionado</span>
                        <div class="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-baseline justify-center gap-1 drop-shadow-xl">
                            <span>+</span>
                            <span class="counter" data-target="125000" data-format="currency">0</span>
                            <span class="text-2xl md:text-3xl text-blue-300">€</span>
                        </div>
                    </div>
                    <h2 class="text-xl md:text-2xl font-bold text-white mb-3 max-w-xl leading-snug drop-shadow-lg">
                        Todo bajo una estructura centralizada y <br>
                        <span class="text-blue-400">regulada por la CNMV</span>
                    </h2>
                    <div class="flex flex-col sm:flex-row gap-3 w-full justify-center mt-6">
                        <button @click="openModal" class="px-6 py-3 rounded-xl bg-[#1855BA] text-white font-bold text-xs md:text-sm hover:bg-[#144a9e] transition-all shadow-lg flex items-center justify-center gap-2">
                            Empezar ahora <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </button>
                        <button @click="openModal" class="px-6 py-3 rounded-xl border border-white text-white font-bold text-xs md:text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-sm">
                            Contactar equipo
                        </button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Medios -->
        <section class="max-w-7xl mx-auto mb-16 md:mb-32 reveal-growth px-4 md:px-6">
            <h2 class="text-center text-sm font-bold uppercase tracking-widest mb-8" style="color: var(--text-muted);">Reconocimiento de los <span style="color: var(--primary-blue);">Medios</span></h2>
             <div class="overflow-hidden relative w-full">
                <div class="flex gap-12 md:gap-20 animate-marquee whitespace-nowrap items-center justify-center w-max mx-auto">
                    <div class="typo-logo">EXPANSIÓN</div>
                    <div class="typo-logo">CincoDías</div>
                    <img src="https://s1.eestatic.com/assets_css/img/elespanol-logo-lion.svg" alt="El Español" class="h-6 md:h-8 media-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bloomberg_logo.svg/960px-Bloomberg_logo.svg.png" alt="Bloomberg" class="h-5 md:h-6 media-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/TechCrunch_logo.svg" alt="TechCrunch" class="h-5 md:h-6 media-logo">
                    <img src="https://forbes.es/wp-content/themes/tapasmagazine23/images/forbes-logo-negro.png" alt="Forbes" class="h-5 md:h-6 media-logo">
                    <div class="typo-logo">EXPANSIÓN</div>
                    <div class="typo-logo">CincoDías</div>
                    <img src="https://s1.eestatic.com/assets_css/img/elespanol-logo-lion.svg" alt="El Español" class="h-6 md:h-8 media-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bloomberg_logo.svg/960px-Bloomberg_logo.svg.png" alt="Bloomberg" class="h-5 md:h-6 media-logo">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b9/TechCrunch_logo.svg" alt="TechCrunch" class="h-5 md:h-6 media-logo">
                    <img src="https://forbes.es/wp-content/themes/tapasmagazine23/images/forbes-logo-negro.png" alt="Forbes" class="h-5 md:h-6 media-logo">
                </div>
            </div>
        </section>
    </main>

    <!-- Modals -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center modal-overlay p-4">
        <div class="modal-content p-6 md:p-8 rounded-2xl w-full max-w-lg relative mx-auto overflow-hidden">
            <button @click="closeModal" class="absolute top-4 right-4 modal-close-btn"><i data-lucide="x" class="w-6 h-6"></i></button>
            <h3 class="text-xl md:text-2xl font-bold mb-6" style="color: var(--text-main);">Agendar una Llamada</h3>
             <form @submit.prevent="handleAgendaSubmit" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-1">
                        <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Nombre y Apellidos</label>
                        <input type="text" required placeholder="Tu nombre" class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
                    </div>
                    <div class="space-y-1">
                        <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Teléfono</label>
                        <input type="tel" placeholder="+34 000 000 000" class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
                    </div>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Email Corporativo</label>
                    <input type="email" required placeholder="nombre@empresa.com" class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Empresa</label>
                    <input type="text" placeholder="Nombre de la empresa" class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Fecha y Hora Preferente</label>
                    <div class="grid grid-cols-2 gap-2">
                        <input type="date" required class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
                        <input type="time" required class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] text-sm font-medium" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);">
                    </div>
                </div>
                <div class="flex items-start gap-3 mt-4">
                    <input type="checkbox" id="legalModal" class="mt-1 flex-shrink-0" required>
                    <label for="legalModal" class="text-xs font-medium cursor-pointer leading-tight" style="color: var(--text-muted);">He leído y acepto la <a href="#" class="underline hover:text-[#1855BA]">Política de Privacidad</a> y el tratamiento de mis datos personales.</label>
                </div>
                <div class="space-y-1">
                    <label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Mensaje / Consulta</label>
                    <textarea required rows="3" placeholder="¿En qué podemos ayudarte?" class="w-full rounded-xl px-4 py-3 focus:outline-none focus:border-[#1855BA] text-sm font-medium resize-none" style="background-color: var(--input-bg); border: 1px solid var(--input-border); color: var(--text-main);"></textarea>
                </div>
                <button type="submit" class="w-full py-4 bg-[#1855BA] hover:bg-[#144a9e] text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-4">
                    <span class="btn-text">Confirmar Agenda</span>
                    <i data-lucide="calendar-check" class="w-4 h-4 btn-icon"></i>
                    <i data-lucide="loader-2" class="w-4 h-4 animate-spin hidden btn-loader"></i>
                </button>
             </form>
        </div>
    </div>
  </div>
</template>

<style>
:root {
    --primary-blue: #1855BA;
    --accent-blue: #60a5fa;
    --accent-green: #4ade80;
    --bg-color: #05070a;
    --text-main: #ffffff;
    --text-muted: #9ca3af;
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.08);
    --card-hover-bg: rgba(255, 255, 255, 0.20);
    --card-highlight-bg: rgba(30, 41, 59, 0.5);
    --card-border: rgba(255, 255, 255, 0.08);
    --seal-bg: rgba(5, 7, 10, 0.95);
    --nav-bg: rgba(5, 7, 10, 0.95);
    --nav-text: #ffffff;
    --nav-text-muted: #9ca3af;
    --input-bg: rgba(255, 255, 255, 0.05);
    --input-border: rgba(255, 255, 255, 0.1);
    --tv-card-bg: #111827;
    --hero-overlay-start: rgba(5, 7, 10, 0.9);
    --hero-overlay-mid: rgba(5, 7, 10, 0.7);
    --hero-overlay-end: rgba(5, 7, 10, 1);
    --toggle-thumb-bg: #ffffff;
    --toggle-icon-color: #000000;
    --toggle-track-bg: rgba(255, 255, 255, 0.1);
    --toggle-track-icon: #64748b;
    --modal-bg: #111827;
    --modal-border: rgba(255, 255, 255, 0.15);
    --close-btn-hover: #ffffff;
    --bottom-bar-bg: rgba(5, 7, 10, 0.95);
    --bottom-bar-border: rgba(255, 255, 255, 0.1);
    --hero-stats-border: rgba(255, 255, 255, 0.15);
    --hero-stats-number: #ffffff;
    --hero-stats-label: #9ca3af;
    --hero-text-main: #ffffff;
    --hero-text-muted: #cbd5e1;
}

.light-mode {
    --bg-color: #f8fafc;
    --text-main: #0f172a;
    --text-muted: #334155;
    --glass-bg: rgba(255, 255, 255, 0.85);
    --glass-border: rgba(0, 0, 0, 0.1);
    --card-hover-bg: #ffffff;
    --card-highlight-bg: #ffffff;
    --card-border: rgba(0, 0, 0, 0.05);
    --accent-blue: #1855BA;
    --accent-green: #15803d;
    --seal-bg: rgba(255, 255, 255, 0.85);
    --nav-bg: rgba(5, 7, 10, 0.95);
    --nav-text: #ffffff;
    --nav-text-muted: #9ca3af;
    --input-bg: #f1f5f9;
    --input-border: #cbd5e1;
    --tv-card-bg: #ffffff;
    --hero-overlay-start: rgba(5, 7, 10, 0.85);
    --hero-overlay-mid: rgba(5, 7, 10, 0.4);
    --hero-overlay-end: #f8fafc;
    --toggle-thumb-bg: #ffffff;
    --toggle-icon-color: #000000;
    --toggle-track-bg: rgba(255, 255, 255, 0.2);
    --toggle-track-icon: #94a3b8;
    --modal-bg: #ffffff;
    --modal-border: #e2e8f0;
    --close-btn-hover: #000000;
    --bottom-bar-bg: rgba(5, 7, 10, 0.95);
    --bottom-bar-border: rgba(255, 255, 255, 0.1);
    --hero-stats-border: rgba(0, 0, 0, 0.15);
    --hero-stats-number: #0f172a;
    --hero-stats-label: #475569;
    --hero-text-main: #0f172a;
    --hero-text-muted: #334155;
}
</style>

<style scoped>
.main-wrapper {
    background-color: var(--bg-color);
    color: var(--text-main);
    transition: background-color 0.5s ease, color 0.5s ease;
    font-family: 'Montserrat', sans-serif;
}

.reveal-growth { opacity: 0; transform: scale(0.9) translateY(40px); transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
.reveal-growth.active { opacity: 1; transform: scale(1) translateY(0); }
.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }
.delay-500 { transition-delay: 500ms; }

@keyframes slow-pulse-glow {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.02); }
}
.animate-slow-pulse { animation: slow-pulse-glow 3s ease-in-out infinite; }

.perspective-1000 { perspective: 1000px; }
.flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
}
.flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }
.flip-card-front, .flip-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 1rem;
    top: 0;
    left: 0;
}
.flip-card-back { transform: rotateY(180deg); }

.highlight-card {
    background-color: var(--card-highlight-bg);
    transition: all 0.3s ease;
}
.highlight-card:hover {
    background-color: var(--card-hover-bg) !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.highlight-card.border-b-4:hover {
    border-bottom-color: var(--primary-blue);
    box-shadow: 0 10px 20px -10px rgba(24, 85, 186, 0.3);
}

.service-filter-btn { color: var(--text-muted); }
.service-filter-btn.active {
    background-color: var(--primary-blue);
    color: white !important;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.infra-card-style {
    background-color: #1e293b;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-left-width: 4px;
    border-left-style: solid;
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.5);
    transition: all 0.3s ease;
}
.light-mode .infra-card-style {
    background-color: #ffffff;
    border-top: 1px solid transparent;
    border-right: 1px solid transparent;
    border-bottom: 1px solid transparent;
    border-left-width: 4px;
    border-left-style: solid;
    box-shadow: 0 20px 40px -5px rgba(0, 0, 0, 0.15);
}

@keyframes meta-swirl {
    0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
    50% { transform: translate(-50%, -50%) rotate(180deg) scale(1.1); }
    100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
}
.meta-fluid-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent 0deg, #1855BA 60deg, transparent 120deg, #4f46e5 180deg, transparent 240deg, #06b6d4 300deg, transparent 360deg);
    filter: blur(60px);
    animation: meta-swirl 20s linear infinite;
    opacity: 0.6;
}

@keyframes rotate-led {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}
.led-border-wrapper {
    position: absolute;
    inset: 0;
    border-radius: 2.5rem;
    padding: 2px;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    z-index: 10;
}
.led-spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent 40%, transparent 80%, #1855BA 100%);
    animation: rotate-led 4s linear infinite;
    opacity: 1;
}
.led-spinner-glow { filter: blur(10px); opacity: 0.6; }

.hero-stat-number { color: #ffffff; }
.hero-stat-label { color: rgba(255,255,255,0.8); }
.hero-stat-border { border-color: rgba(255,255,255,0.2) !important; }
.hero-stat-green { color: #ffffff; }

@media (max-width: 768px) {
    .light-mode {
        --hero-overlay-start: rgba(5, 7, 10, 0.85);
        --hero-overlay-mid: rgba(5, 7, 10, 0.8);
        --hero-overlay-end: rgba(5, 7, 10, 0.95);
    }
}
@media (min-width: 768px) {
    .hero-stat-number { color: var(--hero-stats-number); }
    .hero-stat-label { color: var(--hero-stats-label); }
    .hero-stat-border { border-color: var(--hero-stats-border) !important; }
    .hero-stat-green { color: #22c55e; }
}

.media-logo { filter: grayscale(100%) invert(1) opacity(0.7); transition: all 0.4s ease; max-height: 24px; width: auto; }
.media-logo:hover { filter: grayscale(100%) invert(1) opacity(1) brightness(1.2); }
.light-mode .media-logo { filter: grayscale(100%) invert(0) opacity(0.6); }
.light-mode .media-logo:hover { filter: grayscale(100%) invert(0) opacity(1) brightness(0); }

.typo-logo { font-family: 'Playfair Display', serif; font-weight: 700; font-size: 1.5rem; color: #888; opacity: 0.6; transition: all 0.3s ease; white-space: nowrap; }
.typo-logo:hover { color: white; opacity: 1; }
.light-mode .typo-logo { color: #666; }
.light-mode .typo-logo:hover { color: #000; }

.font-mono { font-family: 'JetBrains Mono', monospace; }
.glass { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.5s ease, border-color 0.5s ease; }
.glass:hover { background: var(--card-hover-bg); border-color: rgba(24, 85, 186, 0.4); transform: translateY(-5px); box-shadow: 0 0 30px rgba(24, 85, 186, 0.15); }
.modal-overlay { background-color: rgba(0, 0, 0, 0.6); backdrop-filter: blur(8px); }
.modal-content { background-color: var(--modal-bg); border: 1px solid var(--modal-border); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
.modal-close-btn { color: var(--text-muted); transition: color 0.3s ease; }
.modal-close-btn:hover { color: var(--close-btn-hover); }
.hero-text-glow { background: linear-gradient(to right, #4f86ed, #a5b4fc, #4f86ed); background-size: 200% auto; -webkit-background-clip: text; background-clip: text; color: transparent; animation: shine 4s linear infinite; }
@keyframes shine { to { background-position: 200% center; } }
@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
.animate-marquee { animation: marquee 30s linear infinite; }
</style>