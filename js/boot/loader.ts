(function () {
  "use strict";

  const FRONT_SHARED_REF = "0692ebf";
  const isLocalDev = /localhost|127\.0\.0\.1|\[::1\]/.test(location.hostname);
  const BOOT_HELPER = isLocalDev
    ? "../../components/front-shared/cdn/boot-helper.mjs"
    : "https://cdn.jsdelivr.net/gh/Jeff-Aporta/front-shared@" + FRONT_SHARED_REF + "/cdn/boot-helper.mjs?v=" + FRONT_SHARED_REF;

  const FILES = [
    "js/core/viz-catalog-data.ts",
    "js/core/viz-state.ts",
    "js/core/isa-setup.ts",
    "js/core/urlState.ts",
    "js/api/client.ts",
    "js/views/CatalogView.jsx",
    "js/views/ComponentesView.jsx",
    "js/views/VizPanel.jsx",
    "js/app/App.jsx",
  ];

  async function boot(): Promise<void> {
    const { bootApp } = await import(BOOT_HELPER);
    await bootApp({ files: FILES, Babel });
  }

  function showErr(err: unknown): void {
    const root = document.getElementById("root");
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    if (root) root.innerHTML = '<pre style="color:#ff8a80;padding:24px;font-family:monospace">Error de arranque:\n' + msg + "</pre>";
    console.error(err);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => boot().catch(showErr));
  else boot().catch(showErr);
})();
