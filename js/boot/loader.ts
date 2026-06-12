(function () {

  "use strict";

  const BOOT_HELPER =
    "https://cdn.jsdelivr.net/gh/Jeff-Aporta/front-shared@main/cdn/boot-helper.mjs";

  const FILES = ["js/core/isa-setup.ts", "js/api/client.ts", "js/app/App.jsx"];



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

