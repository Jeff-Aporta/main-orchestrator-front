/* Registro ISAFront — panel admin del orquestador (API URL en front-shared/constants.js). */
(function () {
  "use strict";
  window.ISAFront.registerApp({
    ns: "MO",
    api: {
      local: "http://localhost:8780",
      online: "https://main-orchestrator.jeffaporta.workers.dev",
    },
    theme: { lsKey: "main-orchestrator:theme" },
    widgets: { targetStyle: "chip" },
  });
})();
