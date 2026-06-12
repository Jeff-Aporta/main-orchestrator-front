/* Registro ISAFront — panel admin del orquestador (API URL en front-shared/constants.js). */
(function () {
  "use strict";
  window.ISAFront.registerApp({
    ns: "MO",
    auth: false,
    api: {
      local: "http://localhost:8780",
      online: "https://main-orchestrator.jeffaporta.workers.dev",
      lsKey: "jeff:gateway-local",
      event: "jeff:gateway-target",
    },
    theme: { lsKey: "main-orchestrator:theme" },
    widgets: { targetStyle: "chip" },
  });
})();
