# main-orchestrator-front

**Diccionario central** del ecosistema Jeff-Aporta / ISA: cards con cada app, URLs de front (GitHub Pages), Swagger (`/ui`), OpenAPI (`/doc`) y base API del Worker.

| Recurso | URL |
|---------|-----|
| **Panel (GH Pages)** | https://jeff-aporta.github.io/main-orchestrator-front/ |
| **API orquestador** | https://main-orchestrator.jeffaporta.workers.dev |
| **Catálogo JSON** | `GET /catalog` |
| **Swagger orquestador** | https://main-orchestrator.jeffaporta.workers.dev/ui |

## Qué muestra

- **Cards** por servicio: front, swagger, OpenAPI, API base y prefijos del orquestador.
- Copiar URL y abrir en nueva pestaña.
- Toggle orquestador local `:8780` / producción.
- Tabla de enrutamiento (opcional, incl. legacy Azure).

Datos desde `GET /catalog` (fuente canónica en `backend/src/catalog.ts`).

## Swagger — auth

En `/ui` de cualquier Worker (plantilla `front-shared/worker-swagger`):

| Modal | Uso |
|-------|-----|
| **Iniciar sesión** | Usuario + contraseña → JWT de prueba (1 h) |
| **Pegar JWT** | Token manual / Bearer |
| **Authorize** (Swagger UI) | Modal nativo Bearer |

## Desarrollo

```bash
npx serve .
# wrangler dev en ../backend (:8780)
```

MIT · [Jeff-Aporta](https://github.com/Jeff-Aporta)
