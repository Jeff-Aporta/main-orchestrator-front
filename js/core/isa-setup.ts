/* Registro ISAFront — panel admin del orquestador (API URL en front-shared/constants.js). */
(function () {
  "use strict";
  window.ISAFront.registerApp({
    ns: "MO",
    theme: { lsKey: "main-orchestrator:theme" },
    widgets: { targetStyle: "chip" },
    loginGate: {
      mode: "redirect",
      redirectMessage: "Inicie sesión para administrar el orquestador de APIs.",
    },
  });
})();
