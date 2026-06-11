<p align="center">
  <img src="https://api.iconify.design/mdi/transit-connection-variant.svg?color=%231565c0&width=96&height=96" width="96" height="96" alt="Main Orchestrator" />
</p>

<h1 align="center">main-orchestrator-front</h1>

<p align="center"><strong>Hub del ecosistema Jeff-Aporta</strong> — catálogo de apps con enlaces a cada pantalla y documentación de API.</p>

## Arquitectura
![Diagrama de arquitectura](https://mermaid.ink/img/JSV7aW5pdDogeyJmbG93Y2hhcnQiOiB7ImN1cnZlIjogInN0ZXBBZnRlciIsICJodG1sTGFiZWxzIjogdHJ1ZSwgIm5vZGVTcGFjaW5nIjogNDQsICJyYW5rU3BhY2luZyI6IDUyLCAicGFkZGluZyI6IDE4fX19JSUKZmxvd2NoYXJ0IExSCiAgc3ViZ3JhcGggaHViIFttYWluLW9yY2hlc3RyYXRvci1mcm9udF0KICAgIFVJW0NhcmRzICsgdGFibGEgcnV0YXNdCiAgZW5kCiAgc3ViZ3JhcGggb3JjaCBbbWFpbi1vcmNoZXN0cmF0b3IgV29ya2VyXQogICAgQ0FUWyJHRVQgL2FwaS9jYXRhbG9nIl0KICAgIFJUWyJHRVQgL2FwaS9yb3V0ZXMiXQogIGVuZAogIHN1YmdyYXBoIHRhcmdldHMgW0Rlc3Rpbm9zXQogICAgUFtHSCBQYWdlcyBwb3IgYXBwXQogICAgU1tTd2FnZ2VyIC9hcGkvdWldCiAgZW5kCiAgVUkgLS0-fGZldGNofCBDQVQgJiBSVAogIFVJIC0tPnxlbmxhY2VzfCBQICYgUw==)

> **Fuente del diagrama:** [`docs/arquitectura.mmd`](docs/arquitectura.mmd) — editar el `.mmd`; regenerar imagen: `node scripts/mermaid-ink-url.mjs main-orchestrator/frontend/docs/arquitectura.mmd` (desde `apps/`).

| Recurso | URL |
|---------|-----|
| **Panel (GH Pages)** | https://jeff-aporta.github.io/main-orchestrator-front/ |
| **Swagger unificado** | https://main-orchestrator.jeffaporta.workers.dev/api/ui |
| **Catálogo JSON** | `GET /api/catalog` |

## Qué muestra

- **Cards** por servicio: front (GH Pages) y Swagger (`/api/ui`).
- Copiar URL y abrir en nueva pestaña.
- Toggle orquestador local `:8780` / producción.
- Tabla de enrutamiento (opcional, incl. legacy Azure).

Datos desde `GET /api/catalog` (fuente canónica en `backend/src/catalog.ts`).

## Metadatos

Favicon, Open Graph y `theme-color` vía [`JeffAppMeta`](https://github.com/Jeff-Aporta/front-shared/blob/main/cdn/isa/js/core/app-meta.js) + [Iconify API](https://iconify.design/) (`mdi:transit-connection-variant`).

## Desarrollo

```bash
npx serve .
# wrangler dev en ../backend (:8780)
```

MIT · [Jeff-Aporta](https://github.com/Jeff-Aporta)
