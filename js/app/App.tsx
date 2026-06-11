/* Diccionario central — cards con front, swagger y API de cada app del ecosistema. */
(function () {
  "use strict";
  const MUI = MaterialUI;
  const UI = window.MO.UI;

  function CopyLink(props: { label: string; url: string }) {
    const [done, setDone] = React.useState(false);
    if (!props.url) return null;
    return React.createElement(MUI.Stack, { direction: "row", spacing: 0.5, alignItems: "center", sx: { py: 0.25 } },
      React.createElement(MUI.Typography, { variant: "caption", color: "text.secondary", sx: { minWidth: 72 } }, props.label),
      React.createElement(MUI.Typography, { variant: "caption", className: "meta-mono", sx: { flex: 1, wordBreak: "break-all" } }, props.url),
      React.createElement(MUI.IconButton, {
        size: "small",
        onClick: () => { navigator.clipboard.writeText(props.url); setDone(true); setTimeout(() => setDone(false), 1200); },
      }, React.createElement(UI.Icon, { icon: done ? "mdi:check" : "mdi:content-copy", size: 14 })),
      React.createElement(MUI.IconButton, {
        size: "small", component: "a", href: props.url, target: "_blank", rel: "noopener noreferrer",
      }, React.createElement(UI.Icon, { icon: "mdi:open-in-new", size: 14 })));
  }

  function swaggerHref(app: MoCatalogEntry, orchBase: string): string {
    if (app.id === "main-orchestrator") return orchBase.replace(/\/$/, "") + "/ui";
    return (app.swaggerUrl || "").trim();
  }

  function AppCard(props: { app: MoCatalogEntry; orchBase: string }) {
    const a = props.app;
    const swagger = swaggerHref(a, props.orchBase);
    return React.createElement(MUI.Card, { variant: "outlined", sx: { height: "100%", display: "flex", flexDirection: "column" } },
      React.createElement(MUI.CardContent, { sx: { flex: 1 } },
        React.createElement(MUI.Stack, { direction: "row", spacing: 1, alignItems: "flex-start", sx: { mb: 1 } },
          React.createElement(UI.Icon, { icon: a.icon || "mdi:application-outline", size: 28 }),
          React.createElement(MUI.Box, { sx: { flex: 1, minWidth: 0 } },
            React.createElement(MUI.Typography, { variant: "h6", component: "h2", sx: { fontSize: "1rem", lineHeight: 1.3 } }, a.name),
            a.infra ? React.createElement(MUI.Chip, { size: "small", label: "infra", sx: { mt: 0.5 } }) : null)),
        React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1.5 } }, a.description),
        a.frontUrl ? React.createElement(CopyLink, { label: "Front", url: a.frontUrl }) : null,
        swagger ? React.createElement(CopyLink, { label: "Swagger", url: swagger }) : null,
        a.orchestratorPrefixes && a.orchestratorPrefixes.length
          ? React.createElement(MUI.Box, { sx: { mt: 1 } },
            React.createElement(MUI.Typography, { variant: "caption", color: "text.secondary", display: "block", gutterBottom: true },
              "Prefijos orquestador"),
            React.createElement(MUI.Stack, { direction: "row", flexWrap: "wrap", gap: 0.5 },
              a.orchestratorPrefixes.slice(0, 6).map((p) =>
                React.createElement(MUI.Chip, { key: p, size: "small", label: p, variant: "outlined" })),
              a.orchestratorPrefixes.length > 6
                ? React.createElement(MUI.Chip, { size: "small", label: "+" + (a.orchestratorPrefixes.length - 6) })
                : null))
          : null),
      swagger || a.frontUrl
        ? React.createElement(MUI.CardActions, { sx: { pt: 0 } },
          swagger
            ? React.createElement(MUI.Button, {
              size: "small", href: swagger, target: "_blank", rel: "noopener noreferrer",
            }, "Abrir Swagger")
            : null,
          a.frontUrl
            ? React.createElement(MUI.Button, {
              size: "small", href: a.frontUrl, target: "_blank", rel: "noopener noreferrer",
            }, "Abrir front")
            : null)
        : null);
  }

  function RoutesTable(props: { routes: MoRouteRow[] }) {
    const head = ["Servicio", "Base", "Prefijos"].map((h) =>
      React.createElement(MUI.TableCell, { key: h }, h));
    const body = props.routes.map((row) =>
      React.createElement(MUI.TableRow, { key: row.service + row.base },
        React.createElement(MUI.TableCell, null, row.service),
        React.createElement(MUI.TableCell, null,
          React.createElement("span", { className: "meta-mono" }, row.base)),
        React.createElement(MUI.TableCell, null, (row.prefixes || []).join(", "))));
    return React.createElement(MUI.Paper, { sx: { p: 2, overflow: "auto" } },
      React.createElement(MUI.Typography, { variant: "subtitle1", gutterBottom: true }, "Tabla de enrutamiento"),
      React.createElement(MUI.Table, { size: "small" },
        React.createElement(MUI.TableHead, null, React.createElement(MUI.TableRow, null, head)),
        React.createElement(MUI.TableBody, null, body)));
  }

  function App() {
    const Shell = window.ISAFront.Layout.AppShell;
    const [catalog, setCatalog] = React.useState<MoCatalogResponse | null>(null);
    const [routes, setRoutes] = React.useState<MoRouteRow[]>([]);
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

    const content = React.createElement(MUI.Container, { maxWidth: "lg", sx: { py: 2 } },
      React.createElement(MUI.Paper, { sx: { p: 2, mb: 2 } },
        React.createElement(MUI.Typography, { variant: "h5", gutterBottom: true }, "Ecosistema Jeff-Aporta"),
        React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 } },
          catalog?.note || "Enlaces por app: GitHub Pages (front) y Swagger (/ui). La URL de API figura dentro de Swagger."),
        React.createElement(MUI.Stack, { direction: "row", spacing: 1, flexWrap: "wrap", alignItems: "center" },
          React.createElement(MUI.Chip, { size: "small", label: "Orquestador", className: "meta-mono", variant: "outlined" }),
          React.createElement(MUI.Typography, { variant: "caption", className: "meta-mono" }, orchBase),
          React.createElement(MUI.Button, { size: "small", variant: "contained", disabled: loading, onClick: reload }, "Recargar"),
          React.createElement(MUI.Button, {
            size: "small", variant: "outlined",
            href: orchBase + "/ui", target: "_blank", rel: "noopener noreferrer",
          }, "Swagger orquestador"),
          React.createElement(MUI.Button, {
            size: "small", variant: "text", onClick: () => setShowRoutes((v) => !v),
          }, showRoutes ? "Ocultar legacy" : "Mostrar legacy")),
      ),
      err ? React.createElement(MUI.Alert, { severity: "error", sx: { mb: 2 } }, err) : null,
      loading && !catalog
        ? React.createElement(MUI.Box, { sx: { py: 4, textAlign: "center" } },
          React.createElement(MUI.CircularProgress, { size: 32 }))
        : React.createElement(MUI.Grid, { container: true, spacing: 2, sx: { mb: 2 } },
          apps.map((app) =>
            React.createElement(MUI.Grid, { key: app.id, size: { xs: 12, sm: 6, md: 4 } },
              React.createElement(AppCard, { app, orchBase })))),
      showRoutes ? React.createElement(RoutesTable, { routes }) : null,
    );

    return React.createElement(Shell, {
      ns: "MO",
      title: "Main Orchestrator",
      icon: "mdi:transit-connection-variant",
      loginGate: false,
    }, content);
  }

  window.MO = window.MO || ({} as MoNs);
  window.MO.mount = () => {
    const root = document.getElementById("root");
    if (!root) throw new Error("No se encontró #root");
    ReactDOM.createRoot(root).render(React.createElement(App));
  };
  window.MO.mount();
})();
