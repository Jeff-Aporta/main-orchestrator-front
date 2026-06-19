/* Vista catálogo — cards con enlaces Front / Swagger. */
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
        <UI.Icon icon={icon} size={14} />
        <span className="catalog-link-chip__label">{label}</span>
      </a>
    );
  }

  function apiLinks(app, orchBase) {
    if (Array.isArray(app.backends) && app.backends.length) {
      return app.backends.filter((b) => b.swaggerUrl);
    }
    const swagger = swaggerHref(app, orchBase);
    return swagger ? [{ label: "Swagger", swaggerUrl: swagger }] : [];
  }

  function AppCard({ app, orchBase }) {
    const apis = apiLinks(app, orchBase);
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
          {(app.frontUrl || apis.length) ? (
            <div className="catalog-card__links">
              <LinkChip label="Front" url={app.frontUrl} icon="mdi:monitor-dashboard" />
              {apis.map((b) => (
                <LinkChip key={b.label} label={b.label} url={b.swaggerUrl} icon="mdi:book-open-page-variant" />
              ))}
            </div>
          ) : null}
        </MUI.CardContent>
      </MUI.Card>
    );
  }

  function CatalogView() {
    const [catalog, setCatalog] = React.useState(null);
    const [err, setErr] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const reload = React.useCallback(async () => {
      setLoading(true);
      setErr("");
      try {
        const cat = await window.MO.Api.catalog();
        setCatalog(cat);
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
    const apps = catalog?.apps || [];

    function categoryOf(app) {
      if (app.category) return app.category;
      if (app.infra) return "infra";
      return "app";
    }

    const sections = [
      { key: "app", title: "Aplicaciones", apps: apps.filter((a) => categoryOf(a) === "app") },
      { key: "component", title: "Componentes ISA", apps: apps.filter((a) => categoryOf(a) === "component") },
      { key: "infra", title: "Infraestructura", apps: apps.filter((a) => categoryOf(a) === "infra") },
    ].filter((s) => s.apps.length);

    return (
      <MUI.Box className="catalog-page">
        {err ? <MUI.Alert severity="error" sx={{ mb: 2 }}>{err}</MUI.Alert> : null}
        {loading && !catalog ? (
          <MUI.Box sx={{ py: 4, textAlign: "center" }}>
            <MUI.CircularProgress size={32} />
          </MUI.Box>
        ) : (
          sections.map((section) => (
            <MUI.Box key={section.key} sx={{ mb: 3 }}>
              <MUI.Typography variant="h6" component="h2" sx={{ mb: 1.5, fontWeight: 700 }}>
                {section.title}
              </MUI.Typography>
              <MUI.Grid container spacing={2} className="catalog-grid">
                {section.apps.map((app) => (
                  <MUI.Grid key={app.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <AppCard app={app} orchBase={orchBase} />
                  </MUI.Grid>
                ))}
              </MUI.Grid>
            </MUI.Box>
          ))
        )}
      </MUI.Box>
    );
  }

  window.MO = window.MO || {};
  window.MO.CatalogView = CatalogView;
})();
