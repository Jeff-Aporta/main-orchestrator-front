/* Diccionario central — catálogo y panel de visualización del ecosistema. */
(function () {
  "use strict";

  const BRAND_HOME = "isa:brand-home";
  const UrlState = window.MO.UrlState;

  function App() {
    const Shell = window.ISAFront.Layout.AppShell;
    const CatalogView = window.MO.CatalogView;
    const VizPanel = window.MO.VizPanel;
    const ComponentesView = window.MO.ComponentesView;
    const [view, setView] = React.useState(UrlState.bootState.view || "catalog");

    React.useEffect(() => {
      return UrlState.subscribe((snap) => {
        setView(snap.view === "viz" ? "viz" : snap.view === "componentes" ? "componentes" : "catalog");
      });
    }, []);

    React.useEffect(() => {
      function onBrandHome() {
        const snap = UrlState.reset();
        setView(snap.view || "catalog");
      }
      window.addEventListener(BRAND_HOME, onBrandHome);
      return () => window.removeEventListener(BRAND_HOME, onBrandHome);
    }, []);

    function selectView(id) {
      const next = id === "viz" ? "viz" : id === "componentes" ? "componentes" : "catalog";
      setView(next);
      UrlState.mergePartial({ view: next });
    }

    function renderBody() {
      if (view === "viz") return <VizPanel />;
      if (view === "componentes") return <ComponentesView />;
      return <CatalogView />;
    }

    return (
      <Shell
        ns="MO"
        loginGate={false}
        bodyScroll={view === "catalog" || view === "componentes"}
        navRows={[
          {
            id: "main",
            tier: "primary",
            value: view,
            onChange: selectView,
            tabs: [
              { id: "catalog", label: "Catálogo", icon: "mdi:view-grid-outline" },
              { id: "componentes", label: "Componentes", icon: "mdi:puzzle-outline" },
              { id: "viz", label: "Visualización", icon: "mdi:monitor-dashboard" },
            ],
          },
        ]}
      >
        {renderBody()}
      </Shell>
    );
  }

  window.MO = window.MO || {};
  window.MO.mount = () => {
    const root = document.getElementById("root");
    if (!root) throw new Error("No se encontró #root");
    ReactDOM.createRoot(root).render(<App />);
  };
  window.MO.mount();
})();
