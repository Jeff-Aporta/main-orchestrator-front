/* Diccionario central — cards con front, swagger y API de cada app del ecosistema. */
(function () {
  "use strict";
  const MUI = MaterialUI;
  const UI = window.MO.UI;

  function swaggerHref(app, orchBase) {
    if (app.id === "main-orchestrator") return orchBase.replace(/\/$/, "") + "/ui";
    return (app.swaggerUrl || "").trim();
  }

  function LinkChip({ label, url, icon }) {
    if (!url) return null;
    return (
      <a className="catalog-link-chip" href={url} target="_blank" rel="noopener noreferrer">
        <UI.Icon icon={icon} size={13} />
        {label}
      </a>
    );
  }

  function AppCard({ app, orchBase }) {
    const swagger = swaggerHref(app, orchBase);
    return (
      <MUI.Card variant="outlined" className="catalog-card" elevation={0}>
        <MUI.CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", pb: "12px !important" }}>
          <MUI.Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ mb: 1 }}>
            <span className="catalog-card__icon">
              <UI.Icon icon={app.icon || "mdi:application-outline"} size={26} />
            </span>
            <MUI.Box sx={{ flex: 1, minWidth: 0 }}>
              <MUI.Typography variant="h6" component="h2" sx={{ fontSize: "1rem", lineHeight: 1.3, fontWeight: 700 }}>
                {app.name}
              </MUI.Typography>
              {app.infra ? (
                <MUI.Chip size="small" label="infra" variant="outlined" sx={{ mt: 0.5, height: 22, fontSize: "0.68rem" }} />
              ) : null}
            </MUI.Box>
          </MUI.Stack>
          <MUI.Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.55 }}>
            {app.description}
          </MUI.Typography>
          {(app.frontUrl || swagger) ? (
            <div className="catalog-card__links">
              <LinkChip label="Front" url={app.frontUrl} icon="mdi:monitor-dashboard" />
              <LinkChip label="Swagger" url={swagger} icon="mdi:api" />
            </div>
          ) : null}
        </MUI.CardContent>
      </MUI.Card>
    );
  }

  function RoutesTable({ routes }) {
    return (
      <MUI.Paper className="catalog-routes-panel" sx={{ p: 2, overflow: "auto" }}>
        <MUI.Typography variant="subtitle1" gutterBottom>Tabla de enrutamiento</MUI.Typography>
        <MUI.Table size="small">
          <MUI.TableHead>
            <MUI.TableRow>
              {["Servicio", "Base", "Prefijos"].map((h) => <MUI.TableCell key={h}>{h}</MUI.TableCell>)}
            </MUI.TableRow>
          </MUI.TableHead>
          <MUI.TableBody>
            {routes.map((row) => (
              <MUI.TableRow key={row.service + row.base}>
                <MUI.TableCell>{row.service}</MUI.TableCell>
                <MUI.TableCell>{row.base ? "Configurado" : "—"}</MUI.TableCell>
                <MUI.TableCell>{(row.prefixes || []).join(", ")}</MUI.TableCell>
              </MUI.TableRow>
            ))}
          </MUI.TableBody>
        </MUI.Table>
      </MUI.Paper>
    );
  }

  function App() {
    const Shell = window.ISAFront.Layout.AppShell;
    const [catalog, setCatalog] = React.useState(null);
    const [routes, setRoutes] = React.useState([]);
    const [err, setErr] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [showRoutes, setShowRoutes] = React.useState(false);

    const reload = React.useCallback(async () => {
      setLoading(true);
      setErr("");
      try {
        const [cat, r] = await Promise.all([window.MO.Api.catalog(), window.MO.Api.routes()]);
        setCatalog(cat);
        setRoutes(r.routes || []);
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }, []);

    React.useEffect(() => { reload(); }, [reload]);
    React.useEffect(() => {
      const onTarget = () => reload();
      window.addEventListener(window.MO.Config.EVENT, onTarget);
      return () => window.removeEventListener(window.MO.Config.EVENT, onTarget);
    }, [reload]);

    const orchBase = catalog?.orchestratorBase || window.MO.Config.base();
    const apps = (catalog?.apps || []).filter((a) => a.id !== "langlab-azure" || showRoutes);
    const envLabel = window.MO.Config.isLocal() ? "Local" : "Producción";

    const content = (
      <MUI.Box className="catalog-page">
        <MUI.Paper className="catalog-hero" elevation={0}>
          <MUI.Typography variant="h5" className="catalog-hero__title" gutterBottom>
            Ecosistema Jeff-Aporta
          </MUI.Typography>
          <MUI.Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
            {catalog?.note || "Enlaces por app: pantallas web y documentación de API."}
          </MUI.Typography>
          <MUI.Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" useFlexGap>
            <MUI.Chip size="small" label={"Entorno · " + envLabel} variant="outlined" />
            <MUI.Button size="small" variant="contained" disabled={loading} onClick={reload}>Recargar</MUI.Button>
            <MUI.Button size="small" variant="outlined" href={orchBase + "/ui"} target="_blank" rel="noopener noreferrer">
              Documentación API
            </MUI.Button>
            <MUI.Button size="small" variant="text" onClick={() => setShowRoutes((v) => !v)}>
              {showRoutes ? "Ocultar legacy" : "Mostrar legacy"}
            </MUI.Button>
          </MUI.Stack>
        </MUI.Paper>
        {err ? <MUI.Alert severity="error" sx={{ mb: 2 }}>{err}</MUI.Alert> : null}
        {loading && !catalog ? (
          <MUI.Box sx={{ py: 4, textAlign: "center" }}>
            <MUI.CircularProgress size={32} />
          </MUI.Box>
        ) : (
          <MUI.Grid container spacing={2} className="catalog-grid">
            {apps.map((app) => (
              <MUI.Grid key={app.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <AppCard app={app} orchBase={orchBase} />
              </MUI.Grid>
            ))}
          </MUI.Grid>
        )}
        {showRoutes ? <RoutesTable routes={routes} /> : null}
      </MUI.Box>
    );

    return (
      <Shell ns="MO" title="Catálogo del ecosistema" icon="mdi:transit-connection-variant" loginGate={false} bodyScroll>
        {content}
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
