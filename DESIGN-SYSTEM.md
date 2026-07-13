# Sistema de diseño — Bordes y espaciado (Token City)

Parámetros fijos que se deben mantener en **todas** las páginas del sitio. Implementados como variables CSS en [`styles-tcav.css`](styles-tcav.css) (líneas 64–95), disponibles automáticamente en cualquier página que incluya:

```html
<link rel="stylesheet" href="styles-tcav.css">
```

## 1. Bordes redondeados

Escala fija de 4 valores. No usar ningún otro valor de `border-radius` fuera de esta lista (salvo las 2 excepciones de forma).

| Token | Valor | Uso |
|---|---|---|
| `var(--radius-xs)` | 5px | mínimo — inputs, chips pequeños, badges |
| `var(--radius-sm)` | 15px | tarjetas pequeñas |
| `var(--radius-md)` | 30px | tarjetas, paneles, modales |
| `var(--radius-lg)` | 60px | máximo — bloques hero, contenedores grandes |
| `var(--radius-button)` | 15px | **fijo para todos los botones/CTAs** rectangulares |

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

Todo botón o CTA rectangular usa **siempre 15px** (`var(--radius-button)`), sin excepciones. Los botones circulares (iconos) usan `var(--radius-circle)`.

## 3. Espaciado (gap, padding, margin)

Misma lógica de escala fija, con 5 pasos:

| Token | Desktop | Móvil (≤768px) |
|---|---|---|
| `var(--space-1)` | 5px | 5px |
| `var(--space-2)` | 15px | 5px |
| `var(--space-3)` | 30px | 15px |
| `var(--space-4)` | 60px | 30px |
| `var(--space-5)` | 120px | 60px |

Cada variable ya resuelve el par desktop/móvil automáticamente (media query en `styles-tcav.css`) — nunca hay que escribir un `@media` aparte para esto. Ejemplo pedido originalmente (30px desktop / 15px móvil) = `var(--space-3)`.

```css
.section { padding: var(--space-3); }      /* 30px desktop → 15px móvil */
.hero { padding: var(--space-4) var(--space-3); }
.grid { gap: var(--space-2); }
```

## 4. Estado actual

Estas reglas ya se aplicaron de forma automática a las 59 páginas del repo (border-radius, botones y padding/margin/gap snapeados al valor de escala más cercano). Se conservaron sin tocar:
- Valores usados como truco de borde/máscara (`mask`, `border-image`, bordes tipo "LED").
- Márgenes negativos y valores `auto`, `%`, `calc()`.

## 5. Para páginas nuevas

Enlazar siempre `styles-tcav.css` y usar los tokens de arriba en vez de valores sueltos en px/rem.
