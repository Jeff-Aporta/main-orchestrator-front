/* Panel admin — salud, tabla de rutas y enlaces Swagger del ecosistema. */
(function () {
  "use strict";
  const MUI = MaterialUI;
  const UI = window.MO.UI;

  const WORKER_SWAGGER: { id: string; label: string; url: string }[] = [
    { id: "main-orchestrator", label: "Main Orchestrator", url: "https://main-orchestrator.jeffaporta.workers.dev/ui" },
    { id: "system-login", label: "system-login", url: "https://system-login.jeffaporta.workers.dev/ui" },
    { id: "conversations", label: "conversations", url: "https://conversations.jeffaporta.workers.dev/ui" },
    { id: "flsjeff", label: "flsjeff", url: "https://flsjeff.jeffaporta.workers.dev/ui" },
    { id: "iatools", label: "iatools", url: "https://iatools.jeffaporta.workers.dev/ui" },
    { id: "jagudeloe", label: "jagudeloe", url: "https://jagudeloe.jeffaporta.workers.dev/ui" },
  ];

  function App() {
    const Shell = window.ISAFront.Layout.AppShell;
    const [health, setHealth] = React.useState<Record<string, unknown> | null>(null);
    const [routes, setRoutes] = React.useState<MoRouteRow[]>([]);
    const [err, setErr] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const reload = React.useCallback(async () => {
      setLoading(true);
      setErr("");
      try {
        const [h, r] = await Promise.all([window.MO.Api.health(), window.MO.Api.routes()]);
        setHealth(h as Record<string, unknown>);
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

    const apiBase = window.MO.Config.base();

    const content = React.createElement(MUI.Container, { maxWidth: "lg", sx: { py: 2 } },
      err ? React.createElement(MUI.Alert, { severity: "error", sx: { mb: 2 } }, err) : null,
      React.createElement(MUI.Stack, { direction: "row", spacing: 1, sx: { mb: 2, flexWrap: "wrap", alignItems: "center" } },
        React.createElement(MUI.Button, { variant: "contained", disabled: loading, onClick: reload }, "Recargar"),
        React.createElement(MUI.Button, {
          variant: "outlined",
          href: apiBase + "/ui",
          target: "_blank",
          rel: "noopener noreferrer",
        }, "Swagger orquestador"),
        React.createElement(MUI.Button, {
          variant: "outlined",
          href: apiBase + "/doc",
          target: "_blank",
          rel: "noopener noreferrer",
        }, "OpenAPI JSON"),
      ),
      React.createElement(MUI.Paper, { sx: { p: 2, mb: 2 } },
        React.createElement(MUI.Typography, { variant: "subtitle1", gutterBottom: true }, "Salud"),
        health
          ? React.createElement(MUI.Stack, { spacing: 0.5 },
            React.createElement(MUI.Typography, { variant: "body2" },
              String(health.service), " · ", String(health.role)),
            React.createElement(MUI.Typography, { variant: "caption", color: "text.secondary", className: "meta-mono" },
              apiBase))
          : React.createElement(MUI.Typography, { variant: "body2", color: "text.secondary" }, loading ? "Consultando…" : "—"),
      ),
      React.createElement(MUI.Paper, { sx: { p: 2, mb: 2, overflow: "auto" } },
        React.createElement(MUI.Typography, { variant: "subtitle1", gutterBottom: true }, "Tabla de enrutamiento"),
        React.createElement(MUI.Table, { size: "small", stickyHeader: true },
          React.createElement(MUI.TableHead, null,
            React.createElement(MUI.TableRow, null,
              ["Servicio", "Base destino", "Prefijos", "strip /api"].map((h) =>
                React.createElement(MUI.TableCell, { key: h }, h)))),
          React.createElement(MUI.TableBody, null,
            routes.map((row) =>
              React.createElement(MUI.TableRow, { key: row.service + row.base },
                React.createElement(MUI.TableCell, null,
                  React.createElement(MUI.Chip, { size: "small", label: row.service })),
                React.createElement(MUI.TableCell, null,
                  React.createElement("span", { className: "meta-mono" }, row.base)),
                React.createElement(MUI.TableCell, null,
                  (row.prefixes || []).join(", ")),
                React.createElement(MUI.TableCell, null, row.stripApi ? "sí" : "—"),
              )))),
      ),
      React.createElement(MUI.Paper, { sx: { p: 2 } },
        React.createElement(MUI.Typography, { variant: "subtitle1", gutterBottom: true }, "Swagger por servicio"),
        React.createElement(MUI.List, { dense: true },
          WORKER_SWAGGER.map((w) =>
            React.createElement(MUI.ListItem, { key: w.id, disablePadding: true },
              React.createElement(MUI.ListItemButton, {
                component: "a",
                href: w.url,
                target: "_blank",
                rel: "noopener noreferrer",
              },
                React.createElement(MUI.ListItemText, {
                  primary: w.label,
                  secondary: w.url,
                }),
                React.createElement(UI.Icon, { icon: "mdi:open-in-new", size: 18 }),
              )))),
      ),
    );

    return React.createElement(Shell, {
      ns: "MO",
      title: "Main Orchestrator",
      icon: "mdi:transit-connection-variant",
      loginGate: true,
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
