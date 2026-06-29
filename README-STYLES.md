# TCAV Design System - Guía de Uso Reutilizable

Haz guardado el sistema de estilos completo de TokenCity que puede ser reutilizado en otras páginas y proyectos.

## Archivos Creados

### 1. **styles-tcav.css**
Archivo CSS completo que contiene:
- ✅ Variables CSS (colores, tamaños, efectos)
- ✅ Modo oscuro y modo claro
- ✅ Animaciones y transiciones
- ✅ Componentes principales (glass morphism, cards, buttons)
- ✅ Estilos de flip cards para servicios
- ✅ Sistema de tema toggle
- ✅ Responsive design configurado

### 2. **template-ejemplo.html**
Un ejemplo funcional que muestra cómo:
- Importar el archivo CSS de TCAV
- Implementar la navegación
- Usar componentes estilizados
- Implementar el toggle de tema (modo claro/oscuro)
- Usar animaciones y efectos

## Cómo Usar en Nuevas Páginas

### Paso 1: Copiar los archivos base
```
TCAV/
├── styles-tcav.css          (CSS reutilizable)
├── template-ejemplo.html    (Referencia)
└── INdex2.html             (Original)
```

### Paso 2: Crear una nueva página HTML

Copia la estructura básica del `template-ejemplo.html` o usa este mínimo:

```html
<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Página | Token City</title>
    
    <!-- Tailwind CSS (requerido) -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Lucide Icons (requerido para iconos) -->
    <script src="https://unpkg.com/lucide@latest"></script>
    
    <!-- Fuentes de Google (requerido) -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    
    <!-- ⭐ IMPORTAR EL ARCHIVO CSS DE TCAV ⭐ -->
    <link rel="stylesheet" href="styles-tcav.css">
</head>

<body class="light-mode">
    <!-- Tu contenido aquí -->
</body>
</html>
```

### Paso 3: Usar las variables CSS

Todas las variables están disponibles:

```css
/* Colores */
background-color: var(--bg-color);
color: var(--text-main);
border-color: var(--glass-border);

/* Componentes predefinidos */
background-color: var(--glass-bg);
background-color: var(--card-highlight-bg);

/* Estados */
color: var(--text-muted);
background-color: var(--input-bg);
```

## Variables CSS Disponibles

### Colores Principales
- `--primary-blue`: #1855BA
- `--bg-color`: Color de fondo (cambia con modo claro/oscuro)
- `--text-main`: Texto principal
- `--text-muted`: Texto secundario

### Componentes
- `--glass-bg`: Fondo glass morphism
- `--glass-border`: Borde glass morphism
- `--card-highlight-bg`: Fondo de tarjetas destacadas
- `--card-hover-bg`: Hover de tarjetas

### Navegación
- `--nav-bg`: Fondo de navegación
- `--nav-text`: Texto de navegación

### Inputs y Formularios
- `--input-bg`: Fondo de inputs
- `--input-border`: Borde de inputs

### Modal
- `--modal-bg`: Fondo de modal
- `--modal-border`: Borde de modal

## Clases Reutilizables

### Glass Morphism
```html
<div class="glass p-6 rounded-xl">Contenido</div>
```

### Tarjetas Destacadas
```html
<div class="highlight-card glass p-6 border-l-4 border-l-[#1855BA]">
    Contenido
</div>
```

### Animaciones
```html
<!-- Animación de entrada -->
<div class="reveal-growth">Contenido animado</div>

<!-- Con retardo -->
<div class="reveal-growth delay-100">Retardo 100ms</div>
<div class="reveal-growth delay-200">Retardo 200ms</div>
<div class="reveal-growth delay-500">Retardo 500ms</div>
```

### Modo Tema (Light/Dark)
```html
<body class="light-mode">
    <!-- En luz por defecto -->
</body>

<!-- Toggle tema con JavaScript -->
<script>
    window.toggleTheme = function () {
        document.body.classList.toggle('light-mode');
    };
</script>
```

### Botones
```html
<!-- Principal -->
<button class="bg-[#1855BA] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#144a9e]">
    Botón Principal
</button>

<!-- Secundario -->
<button class="bg-[#1e293b] text-white px-4 py-2 rounded-xl hover:bg-[#0f172a]">
    Botón Secundario
</button>
```

### Cards de Servicios (Flip Card)
```html
<div class="flip-card perspective-1000 h-[320px]">
    <div class="flip-card-inner">
        <div class="flip-card-front glass p-6">Front</div>
        <div class="flip-card-back glass p-6">Back</div>
    </div>
</div>
```

### Filtros y Botones Activos
```html
<button class="service-filter-btn active">Activo</button>
<button class="service-filter-btn">Inactivo</button>
```

## Archivos Necesarios (CDN)

El archivo CSS de TCAV depende de estos recursos externos:
1. **Tailwind CSS** - Framework CSS utility-first
2. **Lucide Icons** - Librería de iconos
3. **Google Fonts** - Montserrat, JetBrains Mono, Playfair Display

Todos están incluidos en el `<head>` como se muestra arriba.

## Personalización

### Cambiar el color primario
En tu CSS personalizado o inline styles:
```css
:root {
    --primary-blue: #TU_COLOR;
}
```

### Cambiar fuentes
Reemplaza los links de Google Fonts en el `<head>`.

### Agregar nuevas variables
Agrega directamente en `:root` en el HTML:
```html
<style>
    :root {
        --tu-variable: #valor;
    }
</style>
```

## Estructura para nuevas páginas

Template mínimo recomendado:

```html
<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu Página</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@100;300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles-tcav.css">
</head>
<body class="light-mode">
    <!-- Navegación (opcional) -->
    <nav class="glass">Tu nav aquí</nav>
    
    <!-- Contenido principal -->
    <main>
        <section class="reveal-growth">Tu contenido</section>
    </main>
    
    <!-- Scripts comunes -->
    <script>
        // Toggle tema
        window.toggleTheme = () => document.body.classList.toggle('light-mode');
        
        // Intersection observer para animaciones
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal-growth').forEach(el => observer.observe(el));
    </script>
</body>
</html>
```

## Notas Importantes

✅ El archivo CSS ya contiene responsive design
✅ Compatible con Tailwind CSS utilities
✅ Variables CSS para cambios dinámicos
✅ Soporta modo claro y oscuro
✅ Todas las animaciones incluidas

⚠️ Requiere Tailwind CSS
⚠️ Requiere fuentes de Google
⚠️ Requiere Lucide Icons

## Soporte

Para usar características específicas de INdex2.html:
- Consulta la sección de `.flip-card` para cards girables
- Consulta `.reveal-growth` para animaciones de entrada
- Usa `.glass` como base para componentes

¡Listo para crear nuevas páginas con el diseño de TCAV!
