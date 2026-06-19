/* Tab Componentes — demos GH Pages de @isa-components. */
(function () {
  "use strict";
  const MUI = MaterialUI;
  const UI = window.MO.UI;
  const Data = window.MO.VizCatalogData;

  function LinkChip({ label, url, icon }) {
    if (!url) return null;
    return (
      <a className="catalog-link-chip" href={url} target="_blank" rel="noopener noreferrer">
        <UI.Icon icon={icon} size={14} />
        <span className="catalog-link-chip__label">{label}</span>
      </a>
    );
  }

  function ComponentCard({ app, prodUrl }) {
    const demoUrl = prodUrl || app.frontUrl || "";
    return (
      <MUI.Card variant="outlined" className="catalog-card" elevation={0}>
        <MUI.CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", pb: "12px !important" }}>
          <MUI.Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ mb: 1 }}>
            <span className="catalog-card__icon">
              <UI.Icon icon={app.icon || "mdi:puzzle-outline"} size={26} />
            </span>
            <MUI.Box sx={{ flex: 1, minWidth: 0 }}>
              <MUI.Typography variant="h6" component="h2" sx={{ fontSize: "1rem", lineHeight: 1.3, fontWeight: 700 }}>
                {app.name}
              </MUI.Typography>
              <MUI.Chip size="small" label="componente" variant="outlined" sx={{ mt: 0.5, height: 22, fontSize: "0.68rem" }} />
            </MUI.Box>
          </MUI.Stack>
          <MUI.Typography variant="body2" color="text.secondary" sx={{ flex: 1, lineHeight: 1.55 }}>
            {app.description}
          </MUI.Typography>
          <div className="catalog-card__links">
            <LinkChip label="Demo GH Pages" url={demoUrl} icon="mdi:monitor-dashboard" />
            {app.docUrl ? <LinkChip label="Repo / docs" url={app.docUrl} icon="mdi:github" /> : null}
            {app.apiBase ? <LinkChip label="CDN" url={app.apiBase} icon="mdi:cloud-outline" /> : null}
          </div>
        </MUI.CardContent>
      </MUI.Card>
    );
  }

  function prodMapFromViz() {
    const map = {};
    (Data.VIZ_COMPONENT_APPS || []).forEach(function (a) {
      if (a.prodUrl) map[a.id] = a.prodUrl;
    });
    return map;
  }

  function ComponentesView() {
    const [catalog, setCatalog] = React.useState(null);
    const [err, setErr] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const vizProd = React.useMemo(prodMapFromViz, []);

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

    const apps = (catalog?.apps || []).filter(function (a) {
      return a.category === "component";
    });

    return (
      <MUI.Box className="catalog-page componentes-page">
        <MUI.Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
          Demos publicados en GitHub Pages para probar cada librería @isa-components de forma aislada.
        </MUI.Typography>
        {err ? <MUI.Alert severity="error" sx={{ mb: 2 }}>{err}</MUI.Alert> : null}
        {loading && !catalog ? (
          <MUI.Box sx={{ py: 4, textAlign: "center" }}>
            <MUI.CircularProgress size={32} />
          </MUI.Box>
        ) : (
          <MUI.Grid container spacing={2} className="catalog-grid">
            {apps.map(function (app) {
              return (
                <MUI.Grid key={app.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ComponentCard app={app} prodUrl={vizProd[app.id]} />
                </MUI.Grid>
              );
            })}
          </MUI.Grid>
        )}
      </MUI.Box>
    );
  }

  window.MO = window.MO || {};
  window.MO.ComponentesView = ComponentesView;
})();
