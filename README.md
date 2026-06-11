<p align="center">
  <img src="https://api.iconify.design/mdi/transit-connection-variant.svg?color=%231565c0&width=96&height=96" width="96" height="96" alt="Main Orchestrator" />
</p>

<h1 align="center">main-orchestrator-front</h1>

<p align="center"><strong>Hub del ecosistema Jeff-Aporta / ISA</strong> — catálogo de microservicios con enlaces a GitHub Pages y Swagger.</p>

| Recurso | URL |
|---------|-----|
| **Panel (GH Pages)** | https://jeff-aporta.github.io/main-orchestrator-front/ |
| **Swagger unificado** | https://main-orchestrator.jeffaporta.workers.dev/ui |
| **Catálogo JSON** | `GET /catalog` |

## Qué muestra

- **Cards** por servicio: front (GH Pages) y Swagger (`/ui`).
- Copiar URL y abrir en nueva pestaña.
- Toggle orquestador local `:8780` / producción.
- Tabla de enrutamiento (opcional, incl. legacy Azure).

Datos desde `GET /catalog` (fuente canónica en `backend/src/catalog.ts`).

## Metadatos

Favicon, Open Graph y `theme-color` vía [`JeffAppMeta`](https://github.com/Jeff-Aporta/front-shared/blob/main/cdn/isa/js/core/app-meta.js) + [Iconify API](https://iconify.design/) (`mdi:transit-connection-variant`).

## Desarrollo

```bash
npx serve .
# wrangler dev en ../backend (:8780)
```

MIT · [Jeff-Aporta](https://github.com/Jeff-Aporta)
