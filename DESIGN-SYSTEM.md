# Sistema de diseño — Bordes y espaciado (Token City)

Parámetros fijos que se deben mantener en **todas** las páginas del sitio. Implementados como variables CSS en [`styles-tcav.css`](styles-tcav.css) (líneas 64–95), disponibles automáticamente en cualquier página que incluya:

```html
<link rel="stylesheet" href="styles-tcav.css">
```

## 1. Bordes redondeados

Escala fija de 4 valores, múltiplos de 8. No usar ningún otro valor de `border-radius` fuera de esta lista (salvo las 2 excepciones de forma) ni valores arbitrarios tipo `rounded-[12px]`/`rounded-[20px]`.

| Token | Valor | Uso |
|---|---|---|
| `var(--radius-xs)` | 8px | mínimo — inputs, chips pequeños, badges |
| `var(--radius-sm)` | 16px | tarjetas pequeñas, iconos, imágenes/videos internos |
| `var(--radius-md)` | 32px | tarjetas, paneles, modales (sin elemento anidado) |
| `var(--radius-lg)` | 64px | máximo — bloques hero, contenedores grandes |
| `var(--radius-button)` | 16px | **fijo para todos los botones/CTAs** rectangulares |

**Excepciones de forma** (no son "esquinas redondeadas", son formas completas):

| Token | Valor | Uso |
|---|---|---|
| `var(--radius-pill)` | 999px | pills, tags, toggles |
| `var(--radius-circle)` | 50% | avatares, iconos circulares, botones circulares |

```css
.card { border-radius: var(--radius-md); }
.btn-primary { border-radius: var(--radius-button); }
.avatar { border-radius: var(--radius-circle); }
```

## 2. Botones

Todo botón o CTA rectangular usa **siempre 16px** (`var(--radius-button)`), sin excepciones. Los botones circulares (iconos) usan `var(--radius-circle)`.

## 3. Espaciado (gap, padding, margin)

Misma lógica de escala fija, con 5 pasos, múltiplos de 8:

| Token | Desktop | Móvil (≤768px) |
|---|---|---|
| `var(--space-1)` | 8px | 8px |
| `var(--space-2)` | 16px | 8px |
| `var(--space-3)` | 32px | 16px |
| `var(--space-4)` | 64px | 32px |
| `var(--space-5)` | 128px | 64px |

Cada variable ya resuelve el par desktop/móvil automáticamente (media query en `styles-tcav.css`) — nunca hay que escribir un `@media` aparte para esto.

```css
.section { padding: var(--space-3); }      /* 32px desktop → 16px móvil */
.hero { padding: var(--space-4) var(--space-3); }
.grid { gap: var(--space-2); }
```

## 4. Radio de contenedores anidados — regla R2 = R1 + D

Cuando un contenedor con padding envuelve un elemento hijo que también tiene esquinas redondeadas (icono, imagen, video, ring), **el radio del contenedor exterior no debe ser igual ni menor que el del hijo** — debe ser `radio del hijo + la distancia (padding) entre ambos bordes`, para que ambas curvas queden concéntricas y proporcionadas.

```
R2 (exterior) = R1 (interior) + D (padding entre los dos bordes)
```

En CSS, esto se expresa con `calc()` en vez de un número fijo, para que siga la escala automáticamente si los tokens cambian:

```css
.card {
    padding: var(--space-3);
    border-radius: calc(var(--radius-sm) + var(--space-3)); /* 16 + 32 = 48px */
}
.card .icon {
    border-radius: var(--radius-sm); /* 16px */
}
```

**Dónde SÍ aplica** (ya implementado): `.info-card` + `.info-icon`, `.case-card` + `.content-image-frame`/`.video-embed`, `.modal-box` + `.modal-icon-ring`.

**Dónde NO aplica** — el hijo está pegado al borde sin padding (`overflow: hidden` clipping directo, radio 0 efectivo) o es un pill/círculo exento de la regla de esquinas:
- `.blog-card` + `.blog-card-media` (imagen a ras del borde superior)
- `.team-card` + `.team-image` (igual, sin padding)
- `.promo-card` + `.promo-button` (el botón es pill, no esquina)
- `.testimonial-card` + avatar circular

Antes de aplicar la fórmula a un componente nuevo, comprobar si el hijo tiene padding real respecto al padre. Si no lo tiene, dejar el contenedor en `var(--radius-md)` plano.

## 5. Páginas de "sector" (migradas)

`scaleups.html`, `energy.html` y `real-estate.html` usan la plantilla `hero-team`/`lead-form-scaleups`. Antes tenían espaciados en Tailwind arbitrario desligados de la escala (`pb-48`, `-mt-40`/`-mt-56`, `space-y-[2.5px]`), lo que causaba solapamiento del formulario sobre el texto del hero en desktop. Ya migrados a tokens vía Tailwind arbitrario referenciando las variables (`pb-[var(--space-5)]`, `-mt-[var(--space-3)]`, `space-y-[var(--space-1)]`), que se ajustan solos por breakpoint sin necesitar clases `md:` separadas.

## 6. Estado actual

Estas reglas se aplicaron de forma sistemática a las ~70 páginas del repo (border-radius, botones, padding/margin/gap y la fórmula de anidado). Se conservaron sin tocar:
- Valores usados como truco de borde/máscara (`mask`, `border-image`, bordes tipo "LED").
- Márgenes negativos y valores `auto`, `%`, `calc()` no relacionados con radios.
- Las páginas de sector listadas en la sección 5.

## 7. Para páginas nuevas

Enlazar siempre `styles-tcav.css` y usar los tokens de arriba en vez de valores sueltos en px/rem. Si el componente anida un elemento con radio propio, aplicar la fórmula de la sección 4 con `calc()`.
