/* Diccionario central — cards con front, swagger y API de cada app del ecosistema. */
(function () {
  "use strict";
  const MUI = MaterialUI;
  const UI = window.MO.UI;

  function CopyLink({ label, url }) {
    const [done, setDone] = React.useState(false);
    if (!url) return null;
    return (
      <MUI.Stack direction="row" spacing={0.5} alignItems="center" sx={{ py: 0.25 }}>
        <MUI.Typography variant="caption" color="text.secondary" sx={{ minWidth: 72 }}>{label}</MUI.Typography>
        <MUI.Typography variant="caption" className="meta-mono" sx={{ flex: 1, wordBreak: "break-all" }}>{url}</MUI.Typography>
        <MUI.IconButton
          size="small"
          onClick={() => { navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 1200); }}
        >
          <UI.Icon icon={done ? "mdi:check" : "mdi:content-copy"} size={14} />
        </MUI.IconButton>
        <MUI.IconButton size="small" component="a" href={url} target="_blank" rel="noopener noreferrer">
          <UI.Icon icon="mdi:open-in-new" size={14} />
        </MUI.IconButton>
      </MUI.Stack>
    );
  }

  function swaggerHref(app, orchBase) {
    if (app.id === "main-orchestrator") return orchBase.replace(/\/$/, "") + "/ui";
    return (app.swaggerUrl || "").trim();
  }

  function AppCard({ app, orchBase }) {
    const swagger = swaggerHref(app, orchBase);
    return (
      <MUI.Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <MUI.CardContent sx={{ flex: 1 }}>
          <MUI.Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
            <UI.Icon icon={app.icon || "mdi:application-outline"} size={28} />
            <MUI.Box sx={{ flex: 1, minWidth: 0 }}>
              <MUI.Typography variant="h6" component="h2" sx={{ fontSize: "1rem", lineHeight: 1.3 }}>{app.name}</MUI.Typography>
              {app.infra ? <MUI.Chip size="small" label="infra" sx={{ mt: 0.5 }} /> : null}
            </MUI.Box>
          </MUI.Stack>
          <MUI.Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{app.description}</MUI.Typography>
          {app.frontUrl ? <CopyLink label="Front" url={app.frontUrl} /> : null}
          {swagger ? <CopyLink label="Swagger" url={swagger} /> : null}
          {app.orchestratorPrefixes && app.orchestratorPrefixes.length ? (
            <MUI.Box sx={{ mt: 1 }}>
              <MUI.Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Prefijos orquestador
              </MUI.Typography>
              <MUI.Stack direction="row" flexWrap="wrap" gap={0.5}>
                {app.orchestratorPrefixes.slice(0, 6).map((p) => (
                  <MUI.Chip key={p} size="small" label={p} variant="outlined" />
                ))}
                {app.orchestratorPrefixes.length > 6
                  ? <MUI.Chip size="small" label={"+" + (app.orchestratorPrefixes.length - 6)} />
                  : null}
              </MUI.Stack>
            </MUI.Box>
          ) : null}
        </MUI.CardContent>
        {swagger || app.frontUrl ? (
          <MUI.CardActions sx={{ pt: 0 }}>
            {swagger ? (
              <MUI.Button size="small" href={swagger} target="_blank" rel="noopener noreferrer">Abrir Swagger</MUI.Button>
            ) : null}
            {app.frontUrl ? (
              <MUI.Button size="small" href={app.frontUrl} target="_blank" rel="noopener noreferrer">Abrir front</MUI.Button>
            ) : null}
          </MUI.CardActions>
        ) : null}
      </MUI.Card>
    );
  }

  function RoutesTable({ routes }) {
    return (
      <MUI.Paper sx={{ p: 2, overflow: "auto" }}>
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
                <MUI.TableCell><span className="meta-mono">{row.base}</span></MUI.TableCell>
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

    const content = (
      <MUI.Container maxWidth="lg" sx={{ py: 2 }}>
        <MUI.Paper sx={{ p: 2, mb: 2 }}>
          <MUI.Typography variant="h5" gutterBottom>Ecosistema Jeff-Aporta</MUI.Typography>
          <MUI.Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {catalog?.note || "Enlaces por app: GitHub Pages (front) y Swagger (/ui). La URL de API figura dentro de Swagger."}
          </MUI.Typography>
          <MUI.Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
            <MUI.Chip size="small" label="Orquestador" className="meta-mono" variant="outlined" />
            <MUI.Typography variant="caption" className="meta-mono">{orchBase}</MUI.Typography>
            <MUI.Button size="small" variant="contained" disabled={loading} onClick={reload}>Recargar</MUI.Button>
            <MUI.Button size="small" variant="outlined" href={orchBase + "/ui"} target="_blank" rel="noopener noreferrer">
              Swagger orquestador
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
          <MUI.Grid container spacing={2} sx={{ mb: 2 }}>
            {apps.map((app) => (
              <MUI.Grid key={app.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <AppCard app={app} orchBase={orchBase} />
              </MUI.Grid>
            ))}
          </MUI.Grid>
        )}
        {showRoutes ? <RoutesTable routes={routes} /> : null}
      </MUI.Container>
    );

    return (
      <Shell ns="MO" title="Main Orchestrator" icon="mdi:transit-connection-variant" loginGate={false}>
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
