/* Registro ISAFront — panel admin del orquestador (API URL en front-shared/constants.js). */
(function () {
  "use strict";
  window.ISAFront.registerApp({
    ns: "MO",
    api: {},
    theme: { lsKey: "main-orchestrator:theme" },
    widgets: { targetStyle: "chip" },
  });
})();
