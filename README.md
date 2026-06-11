# main-orchestrator-front

Panel de administración del **orquestador central** Jeff-Aporta / ISA. Repo **privado** en GitHub Pages (solo miembros del repo).

| Recurso | URL |
|---------|-----|
| **Pages (privado)** | https://jeff-aporta.github.io/main-orchestrator-front/ |
| **API Worker** | https://main-orchestrator.jeffaporta.workers.dev |
| **Swagger orquestador** | https://main-orchestrator.jeffaporta.workers.dev/ui |

## Qué hace

- Estado de salud del orquestador (`GET /`).
- Tabla de enrutamiento (`GET /routes`).
- Enlaces a Swagger UI de cada Worker del ecosistema.
- Toggle **orquestador local :8780 / producción** (misma clave que el resto de fronts ISA).
- Login vía **system-login** (gate redirect).

La URL de la API **no** se define aquí: viene de `front-shared` → `MAIN_ORCHESTRATOR_URL_*`.

## Desarrollo local

```bash
npx serve .
# wrangler dev en ../backend (:8780) si usas modo local
```

## CI

Push a `main` → workflow `.github/workflows/pages.yml` → GitHub Pages (build type: workflow).

Tras crear el repo privado, habilitar Pages con origen **GitHub Actions** (lo hace `push-all.ps1 -InitMainOrchestratorFront`).

## Repos relacionados

| Repo | Rol |
|------|-----|
| [main-orchestrator-back](https://github.com/Jeff-Aporta/main-orchestrator-back) | Worker Cloudflare (privado) |
| [main-orchestrator-front](https://github.com/Jeff-Aporta/main-orchestrator-front) | Este panel (privado, GH Pages) |
| [front-shared](https://github.com/Jeff-Aporta/front-shared) | URL central del orquestador |

MIT · [Jeff-Aporta](https://github.com/Jeff-Aporta)
