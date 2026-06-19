/* Panel de visualización — escritorio 16:9 configurable + móvil 400×711 por fila. */
(function () {
  "use strict";
  const MUI = MaterialUI;
  const UI = window.MO.UI;
  const Viz = window.MO.VizState;
  const UrlState = window.MO.UrlState;
  const Data = window.MO.VizCatalogData;

  const DESKTOP_WIDTHS = Viz.DESKTOP_WIDTHS || [1280, 900];
  const DEFAULT_DESKTOP_W = Data.VIZ_FRAME_W || DESKTOP_WIDTHS[0];
  const MOBILE_W = Data.VIZ_MOBILE_FRAME_W || 400;
  const MOBILE_H = Data.VIZ_MOBILE_FRAME_H || 711;
  const POLL_MS = 350;
  const MAX_WAIT_MS = 45000;
  const INSOFT_VIZ_IDS = ["clientesis", "contapyme-soporte"];

  function isMonorepoDev() {
    return Viz.allowsPersonalLocalContext();
  }

  function insoftAppUrl(app) {
    const raw = String(app?.url || app?.frontUrl || "").trim();
    if (!raw) return "";
    return toAbsoluteUrl(raw);
  }

  function buildInsoftApps(catalogApps) {
    const fallback = Data.VIZ_INSOFT_APPS || [];
    return INSOFT_VIZ_IDS.map(function (id, index) {
      const entry = (catalogApps || []).find(function (a) { return a.id === id; });
      const fbApp = fallback.find(function (a) { return a.id === id; });
      const url = insoftAppUrl({ url: entry?.frontUrl || fbApp?.url });
      return {
        id: id,
        name: entry?.name || fbApp?.name || id,
        icon: entry?.icon || fbApp?.icon || "mdi:application-outline",
        url: url,
        index: index,
      };
    }).filter(function (a) { return !!a.url; });
  }

  function resolveOpenUrl(app, group, prodMap, useLocal) {
    if (group === "insoft") return insoftAppUrl(app);
    if (group === "personal" || group === "componentes") {
      if (useLocal) return new URL(app.localUrl, location.href).href;
      const prod = prodMap[app.id] || app.prodUrl;
      if (prod) return prod;
      return new URL(app.localUrl, location.href).href;
    }
    if (useLocal) return new URL(app.localUrl, location.href).href;
    const prod = prodMap[app.id] || app.prodUrl;
    if (prod) return prod;
    return new URL(app.localUrl, location.href).href;
  }

  function iframeSrcFor(app, group, prodMap, useLocal) {
    if (group === "insoft") return insoftAppUrl(app);
    if (group === "personal" || group === "componentes") {
      if (useLocal) return app.localUrl;
      return prodMap[app.id] || app.prodUrl || app.localUrl;
    }
    if (useLocal) return app.localUrl;
    return prodMap[app.id] || app.prodUrl || app.localUrl;
  }

  function canToggleContext(app, group) {
    return (group === "personal" || group === "componentes") && !!app.localUrl && isMonorepoDev();
  }

  function toAbsoluteUrl(url) {
    if (!url) return "";
    try {
      return new URL(url, location.href).href;
    } catch {
      return url;
    }
  }

  function shortUrl(url) {
    if (!url) return "";
    try {
      const u = new URL(url);
      const full = u.host + u.pathname + u.search;
      return full.length > 100 ? full.slice(0, 97) + "…" : full;
    } catch {
      return url.length > 100 ? url.slice(0, 97) + "…" : url;
    }
  }

  function VizIframeUrlBar({ iframeSrc, openUrl }) {
    const absIframe = toAbsoluteUrl(iframeSrc);
    const absOpen = openUrl ? toAbsoluteUrl(openUrl) : "";
    const sameUrl = !absOpen || absOpen === absIframe;
    const primaryUrl = sameUrl ? (absOpen || absIframe) : absIframe;
    const [copied, setCopied] = React.useState(false);

    function copyUrl() {
      const text = primaryUrl;
      if (!text) return;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }).catch(() => {});
        return;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } catch { /* ignore */ }
      document.body.removeChild(ta);
    }

    if (!primaryUrl) return null;

    return (
      <div className="viz-card-urlbar" role="status" aria-label={"URL: " + primaryUrl}>
        <MUI.Tooltip title={copied ? "Copiado" : "Copiar URL"} arrow placement="top">
          <MUI.IconButton
            size="small"
            className="viz-urlbar-icon-btn"
            aria-label={copied ? "URL copiada" : "Copiar URL"}
            onClick={copyUrl}
          >
            <UI.Icon icon={copied ? "mdi:check" : "mdi:link-variant"} size={14} />
          </MUI.IconButton>
        </MUI.Tooltip>
        <MUI.Tooltip title={primaryUrl} arrow placement="top">
          <a
            className="viz-card-urlbar-link"
            href={primaryUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {shortUrl(primaryUrl)}
          </a>
        </MUI.Tooltip>
        {!sameUrl && absOpen ? (
          <>
            <span className="viz-card-urlbar-sep" aria-hidden="true">·</span>
            <MUI.Tooltip title={absOpen} arrow placement="top">
              <a
                className="viz-card-urlbar-link viz-card-urlbar-link--target"
                href={absOpen}
                target="_blank"
                rel="noopener noreferrer"
              >
                {shortUrl(absOpen)}
              </a>
            </MUI.Tooltip>
          </>
        ) : null}
      </div>
    );
  }

  function isExternalSrc(src) {
    try {
      return new URL(src, location.href).origin !== location.origin;
    } catch {
      return false;
    }
  }

  function iframeEmbedBlocked(iframe) {
    const src = iframe?.src;
    if (!src || src === "about:blank") return false;
    if (!isExternalSrc(src)) return false;
    try {
      return iframe.contentWindow.location.href === "about:blank";
    } catch {
      return false;
    }
  }

  function iframeAppReady(iframe, group) {
    if (iframeEmbedBlocked(iframe)) return "blocked";
    if (group === "insoft") {
      try {
        const href = iframe.contentWindow.location.href;
        if (href === "about:blank") return false;
      } catch {
        return true;
      }
      return true;
    }
    try {
      const doc = iframe.contentDocument;
      if (!doc || doc.readyState !== "complete") return false;
      if (doc.querySelector(".isa-app-boot")) return false;
      const root = doc.getElementById("root");
      if (!root) return false;
      const text = (root.innerText || "").trim();
      if (/Error de arranque|Bootstrap error/i.test(text)) return true;
      if (root.querySelector(".MuiAppBar, .isa-login-card, [role=tab], .panel, .MuiContainer-root, .screenshot-viewer, .viewer-root, .isa-layout-root")) return true;
      return text.length > 28;
    } catch {
      return true;
    }
  }

  function ScaledIframe({ src, title, group, frameW, frameH, openUrl, onStatus, trackReady, reloadKey }) {
    const slotRef = React.useRef(null);
    const stageRef = React.useRef(null);
    const iframeRef = React.useRef(null);
    const pollRef = React.useRef(null);
    const onStatusRef = React.useRef(onStatus);
    const [embedBlocked, setEmbedBlocked] = React.useState(false);

    onStatusRef.current = onStatus;

    const layout = React.useCallback(() => {
      const slot = slotRef.current;
      const stage = stageRef.current;
      if (!slot || !stage) return;
      const sw = slot.clientWidth;
      const sh = slot.clientHeight;
      if (sw < 1 || sh < 1) return;
      const s = Math.max(sw / frameW, sh / frameH);
      stage.style.transform = "translate(-50%, -50%) scale(" + s + ")";
    }, [frameW, frameH]);

    React.useEffect(() => {
      const slot = slotRef.current;
      if (!slot) return;
      layout();
      const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(layout) : null;
      if (ro) ro.observe(slot);
      window.addEventListener("resize", layout);
      return () => {
        if (ro) ro.disconnect();
        window.removeEventListener("resize", layout);
      };
    }, [layout]);

    React.useEffect(() => {
      setEmbedBlocked(false);
    }, [src]);

    React.useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe || !src) return;

      function checkBlocked() {
        const blocked = iframeEmbedBlocked(iframe);
        setEmbedBlocked(blocked);
        return blocked;
      }

      function finish(ok) {
        if (trackReady && onStatusRef.current) {
          onStatusRef.current(
            ok === false ? "Error" : ok === "blocked" ? "Sin embed" : "Listo",
            ok === "blocked" ? "blocked" : ok,
          );
        }
        if (pollRef.current) clearTimeout(pollRef.current);
        pollRef.current = null;
      }

      function tick() {
        const state = iframeAppReady(iframe, group);
        if (state === "blocked") {
          setEmbedBlocked(true);
          return finish("blocked");
        }
        if (state === true) return finish(true);
        if (Date.now() - t0 > MAX_WAIT_MS) return finish(true);
        pollRef.current = setTimeout(tick, POLL_MS);
      }

      if (trackReady && onStatusRef.current) {
        onStatusRef.current("Cargando…", null);
      }
      const t0 = Date.now();

      const onLoad = () => {
        layout();
        requestAnimationFrame(() => {
          layout();
          if (checkBlocked() && trackReady) return finish("blocked");
        });
        if (!trackReady) return;
        if (pollRef.current) clearTimeout(pollRef.current);
        pollRef.current = setTimeout(tick, POLL_MS);
      };

      iframe.addEventListener("load", onLoad);
      if (iframe.contentDocument?.readyState === "complete") onLoad();
      else if (trackReady) pollRef.current = setTimeout(tick, POLL_MS);

      return () => {
        iframe.removeEventListener("load", onLoad);
        if (pollRef.current) clearTimeout(pollRef.current);
        pollRef.current = null;
      };
    }, [src, group, trackReady, layout, reloadKey]);

    if (!src) return null;

    const slotStyle = {
      "--viz-frame-w": frameW + "px",
      "--viz-frame-h": frameH + "px",
    };

    return (
      <div
        className={"viz-viewport-slot" + (embedBlocked ? " is-embed-blocked" : "")}
        ref={slotRef}
        style={slotStyle}
      >
        <div className="viz-frame-stage" ref={stageRef}>
          <iframe
            ref={iframeRef}
            className="viz-front-frame"
            title={title}
            width={frameW}
            height={frameH}
            src={src}
          />
        </div>
        {embedBlocked ? (
          <div className="viz-embed-fallback" role="status">
            <UI.Icon icon="mdi:lock-outline" size={28} />
            <p className="viz-embed-fallback-title">Vista previa no disponible</p>
            <p className="viz-embed-fallback-text">
              Este sitio no permite mostrarse dentro de un iframe. Ábrelo en una pestaña nueva.
            </p>
            <MUI.Button
              size="small"
              variant="outlined"
              component="a"
              href={openUrl || src}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<UI.Icon icon="mdi:open-in-new" size={16} />}
            >
              Abrir app
            </MUI.Button>
          </div>
        ) : null}
      </div>
    );
  }

  function VizContextToggle({ useLocal, onToggle, compact }) {
    const icon = useLocal ? "mdi:desktop-classic" : "mdi:earth";
    const title = useLocal
      ? "Contexto local — clic para vista web"
      : "Contexto web — clic para vista local";
    if (compact) {
      return (
        <MUI.Tooltip title={title} arrow>
          <MUI.Button
            size="small"
            variant="outlined"
            className={"viz-btn-context-all" + (useLocal ? " is-local" : " is-web")}
            aria-label={title}
            aria-pressed={useLocal}
            onClick={onToggle}
            startIcon={<UI.Icon icon={icon} size={16} />}
          >
            Todos · {useLocal ? "local" : "web"}
          </MUI.Button>
        </MUI.Tooltip>
      );
    }
    return (
      <MUI.Tooltip title={title} arrow>
        <MUI.IconButton
          size="small"
          className={"viz-btn-context" + (useLocal ? " is-local" : " is-web")}
          aria-label={title}
          aria-pressed={useLocal}
          onClick={onToggle}
        >
          <UI.Icon icon={icon} size={17} />
        </MUI.IconButton>
      </MUI.Tooltip>
    );
  }

  function VizCardDesktopSize({ desktopW, onChange }) {
    return (
      <MUI.Stack direction="row" alignItems="center" spacing={0.75} className="viz-preview-size">
        <span className="viz-preview-size-label">16:9</span>
        <MUI.ButtonGroup size="small" variant="outlined" aria-label="Ancho de vista escritorio">
          {DESKTOP_WIDTHS.map((w) => {
            const h = Viz.desktopHeight(w);
            return (
              <MUI.Button
                key={w}
                variant={desktopW === w ? "contained" : "outlined"}
                onClick={() => onChange(w)}
                aria-pressed={desktopW === w}
                aria-label={w + " por " + h}
              >
                {w}×{h}
              </MUI.Button>
            );
          })}
        </MUI.ButtonGroup>
      </MUI.Stack>
    );
  }

  function VizCard({
    app,
    group,
    watched,
    prodMap,
    onToggleWatch,
    canMoveUp,
    canMoveDown,
    onMoveUp,
    onMoveDown,
    contextUseLocal,
    onContextUseLocalChange,
    scrollIntoView,
    onScrollIntoViewDone,
  }) {
    const [status, setStatus] = React.useState(watched ? "Cargando…" : "");
    const [ready, setReady] = React.useState(null);
    const [deskReload, setDeskReload] = React.useState(0);
    const [mobReload, setMobReload] = React.useState(0);
    const [desktopW, setDesktopW] = React.useState(DEFAULT_DESKTOP_W);
    const desktopH = Viz.desktopHeight(desktopW);
    const contextControlled = contextUseLocal != null && typeof onContextUseLocalChange === "function";
    const allowsLocal = isMonorepoDev();
    const useLocal = allowsLocal && (contextControlled ? contextUseLocal : true);
    const contextToggle = canToggleContext(app, group);
    const prevLocalRef = React.useRef(useLocal);
    const cardRef = React.useRef(null);
    const openUrl = resolveOpenUrl(app, group, prodMap, contextToggle ? useLocal : false);
    const src = watched ? iframeSrcFor(app, group, prodMap, contextToggle ? useLocal : false) : "";

    const onStatus = React.useCallback(function (text, ok) {
      setStatus(text);
      setReady(ok === "blocked" ? "blocked" : ok);
    }, []);

    function reloadDesktop() {
      setStatus("Cargando…");
      setReady(null);
      setDeskReload((n) => n + 1);
    }

    function reloadMobile() {
      setMobReload((n) => n + 1);
    }

    function reloadAll() {
      reloadDesktop();
      reloadMobile();
    }

    function reloadForContextChange() {
      setStatus("Cargando…");
      setReady(null);
      setDeskReload((n) => n + 1);
      setMobReload((n) => n + 1);
    }

    function toggleContext() {
      const next = !useLocal;
      if (contextControlled) onContextUseLocalChange(next);
      else reloadForContextChange();
    }

    React.useEffect(function () {
      if (!contextControlled || !watched || !contextToggle) return;
      if (prevLocalRef.current === useLocal) return;
      prevLocalRef.current = useLocal;
      reloadForContextChange();
    }, [useLocal, contextControlled, watched, contextToggle]);

    React.useEffect(function () {
      if (!scrollIntoView || !cardRef.current) return;
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      if (onScrollIntoViewDone) onScrollIntoViewDone();
    }, [scrollIntoView]);

    return (
      <section
        ref={cardRef}
        className={
          "viz-card" +
          (watched ? "" : " is-unwatch") +
          (ready === true ? " is-ready" : "") +
          (ready === false ? " is-error" : "") +
          (ready === "blocked" ? " is-embed-blocked" : "")
        }
        data-id={app.id}
      >
        <header className="viz-card-head">
          {watched ? (
            <div className="viz-card-move">
              <MUI.IconButton
                size="small"
                className="viz-btn-move"
                title="Mover arriba"
                aria-label="Mover arriba"
                disabled={!canMoveUp}
                onClick={onMoveUp}
              >
                <UI.Icon icon="mdi:chevron-up" size={18} />
              </MUI.IconButton>
              <MUI.IconButton
                size="small"
                className="viz-btn-move"
                title="Mover abajo"
                aria-label="Mover abajo"
                disabled={!canMoveDown}
                onClick={onMoveDown}
              >
                <UI.Icon icon="mdi:chevron-down" size={18} />
              </MUI.IconButton>
            </div>
          ) : null}
          <UI.Icon icon={app.icon} size={17} />
          <h2 className="viz-card-title">{app.name}</h2>
          <MUI.Chip label={app.id} size="small" variant="outlined" className="viz-card-slug" />
          <div className="viz-card-actions">
            {contextToggle ? (
              <VizContextToggle useLocal={useLocal} onToggle={toggleContext} />
            ) : null}
            {watched ? (
              <MUI.Tooltip title="Recargar vistas" arrow>
                <MUI.IconButton
                  size="small"
                  className="viz-btn-reload"
                  aria-label="Recargar escritorio y móvil"
                  onClick={reloadAll}
                >
                  <UI.Icon icon="mdi:reload" size={17} />
                </MUI.IconButton>
              </MUI.Tooltip>
            ) : null}
            <MUI.IconButton
              size="small"
              className={"viz-btn-watch" + (watched ? " is-active" : "")}
              title={watched ? "Desactivar vista previa" : "Activar vista previa"}
              aria-label={watched ? "Desactivar vista previa" : "Activar vista previa"}
              onClick={() => onToggleWatch(app.id, !watched)}
            >
              <UI.Icon icon={watched ? "mdi:eye" : "mdi:eye-off"} size={18} />
            </MUI.IconButton>
            <MUI.IconButton
              size="small"
              component="a"
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en pestaña nueva"
              aria-label="Abrir en pestaña nueva"
            >
              <UI.Icon icon="mdi:open-in-new" size={17} />
            </MUI.IconButton>
          </div>
          {watched ? (
            <span className="viz-card-status" aria-live="polite">{status}</span>
          ) : null}
        </header>
        {watched ? (
          <>
            <VizIframeUrlBar
              iframeSrc={src}
              openUrl={openUrl}
            />
            <div className="viz-card-previews">
              <div className="viz-preview viz-preview--desktop">
              <div className="viz-preview-head">
                <p className="viz-preview-label">
                  <UI.Icon icon="mdi:monitor" size={14} />
                  Escritorio
                </p>
                <VizCardDesktopSize
                  desktopW={desktopW}
                  onChange={(w) => {
                    if (w === desktopW) return;
                    setDesktopW(w);
                    setStatus("Cargando…");
                    setReady(null);
                    setDeskReload((n) => n + 1);
                  }}
                />
              </div>
              <ScaledIframe
                key={"desk-" + deskReload}
                src={src}
                title={app.name + " (escritorio)"}
                group={group}
                frameW={desktopW}
                frameH={desktopH}
                openUrl={openUrl}
                onStatus={onStatus}
                trackReady
                reloadKey={deskReload}
              />
            </div>
            <div className="viz-preview viz-preview--mobile">
              <p className="viz-preview-label">
                <UI.Icon icon="mdi:cellphone" size={14} />
                Móvil {MOBILE_W}×{MOBILE_H}
              </p>
              <ScaledIframe
                key={"mob-" + mobReload}
                src={src}
                title={app.name + " (móvil)"}
                group={group}
                frameW={MOBILE_W}
                frameH={MOBILE_H}
                openUrl={openUrl}
                trackReady={false}
                reloadKey={mobReload}
              />
            </div>
          </div>
          </>
        ) : null}
      </section>
    );
  }

  function VizSection({
    title,
    subtitle,
    group,
    apps,
    watch,
    order,
    prodMap,
    onToggleWatch,
    onMoveOrder,
    contextUseLocal,
    onToggleAllContext,
    onContextUseLocalChange,
    scrollToAppId,
    onScrollToCardDone,
  }) {
    function sortWatched() {
      return apps
        .filter((a) => Viz.isWatched(watch, group, a.id))
        .sort((a, b) => {
          const ia = order[group].indexOf(a.id);
          const ib = order[group].indexOf(b.id);
          if (ia < 0 && ib < 0) return a.index - b.index;
          if (ia < 0) return 1;
          if (ib < 0) return -1;
          return ia - ib;
        });
    }

    function sortUnwatched() {
      return apps
        .filter((a) => !Viz.isWatched(watch, group, a.id))
        .sort((a, b) => a.index - b.index);
    }

    const watched = sortWatched();
    const unwatched = sortUnwatched();

    return (
      <section className="viz-section">
        <MUI.Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.25}
          className="viz-section-head"
          sx={{ mb: 1.75, width: "100%" }}
        >
          <MUI.Stack direction="row" alignItems="baseline" spacing={1.25} sx={{ minWidth: 0 }}>
            <MUI.Typography variant="h5" component="h2" className="viz-section-title">
              {title}
            </MUI.Typography>
            {subtitle ? (
              <MUI.Typography variant="body2" color="text.secondary" className="viz-section-subtitle">
                {subtitle}
              </MUI.Typography>
            ) : null}
          </MUI.Stack>
          {onToggleAllContext != null && contextUseLocal != null ? (
            <VizContextToggle
              compact
              useLocal={contextUseLocal}
              onToggle={onToggleAllContext}
            />
          ) : null}
        </MUI.Stack>
        <div className="viz-grid-watch">
          {watched.length ? watched.map((app, idx) => (
            <VizCard
              key={app.id}
              app={app}
              group={group}
              watched
              prodMap={prodMap}
              onToggleWatch={onToggleWatch}
              canMoveUp={idx > 0}
              canMoveDown={idx < watched.length - 1}
              onMoveUp={() => onMoveOrder(group, app.id, -1)}
              onMoveDown={() => onMoveOrder(group, app.id, 1)}
              contextUseLocal={contextUseLocal}
              onContextUseLocalChange={onContextUseLocalChange}
              scrollIntoView={scrollToAppId === app.id}
              onScrollIntoViewDone={onScrollToCardDone}
            />
          )) : (
            <p className="viz-grid-empty">Sin celdas activas.</p>
          )}
        </div>
        {unwatched.length ? (
          <div className="viz-unwatch-block">
            <p className="viz-unwatch-label">Inactivas</p>
            <div className="viz-grid-unwatch">
              {unwatched.map((app) => (
                <VizCard
                  key={app.id}
                  app={app}
                  group={group}
                  watched={false}
                  prodMap={prodMap}
                  onToggleWatch={onToggleWatch}
                  contextUseLocal={contextUseLocal}
                  onContextUseLocalChange={onContextUseLocalChange}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  function VizPanel() {
    const personalApps = Data.VIZ_PERSONAL_APPS;
    const componentApps = Data.VIZ_COMPONENT_APPS || [];
    const [insoftApps, setInsoftApps] = React.useState(function () {
      return buildInsoftApps(null);
    });

    const bootViz = UrlState.parseVizSlice(UrlState.bootState.vz);
    const [watch, setWatch] = React.useState(function () {
      return Viz.buildWatchFromOrder(
        bootViz.order,
        personalApps.map(function (a) { return a.id; }),
        [],
        componentApps.map(function (a) { return a.id; }),
      );
    });
    const [order, setOrder] = React.useState(function () {
      return {
        personal: [...bootViz.order.personal],
        insoft: [...bootViz.order.insoft],
        componentes: [...bootViz.order.componentes],
      };
    });
    const [prodMap, setProdMap] = React.useState({});
    const [personalUseLocal, setPersonalUseLocal] = React.useState(function () {
      return isMonorepoDev() ? bootViz.personalUseLocal : false;
    });
    const [scrollToAppId, setScrollToAppId] = React.useState(null);

    function persistViz(nextOrder, nextPersonalUseLocal) {
      const useLocal = isMonorepoDev() ? nextPersonalUseLocal : false;
      const vz = UrlState.serializeViz(nextOrder, useLocal);
      const snap = UrlState.getSnapshot();
      if (UrlState.vizEqual(snap.vz, vz)) return;
      UrlState.mergePartial({ vz: vz || null });
    }

    function setAllPersonalContext(next) {
      if (!isMonorepoDev()) return;
      const useLocal = typeof next === "boolean" ? next : !personalUseLocal;
      setPersonalUseLocal(useLocal);
      persistViz(order, useLocal);
    }

    function toggleAllPersonalContext() {
      setAllPersonalContext(!personalUseLocal);
    }

    React.useEffect(function () {
      if (isMonorepoDev()) return;
      if (!personalUseLocal) return;
      setPersonalUseLocal(false);
      persistViz(order, false);
    }, []);

    React.useEffect(function () {
      const personalIds = personalApps.map(function (a) { return a.id; });
      const insoftIds = insoftApps.map(function (a) { return a.id; });
      const componentIds = componentApps.map(function (a) { return a.id; });
      const o = { personal: [...order.personal], insoft: [...order.insoft], componentes: [...order.componentes] };
      const before = UrlState.serializeViz(o, isMonorepoDev() ? personalUseLocal : false);
      Viz.ensureOrderIds(o, personalIds, insoftIds, componentIds);
      setWatch(Viz.buildWatchFromOrder(o, personalIds, insoftIds, componentIds));
      setOrder(o);
      if (!UrlState.vizEqual(before, UrlState.serializeViz(o, isMonorepoDev() ? personalUseLocal : false))) {
        persistViz(o, personalUseLocal);
      }
    }, [insoftApps, componentApps]);

    React.useEffect(function () {
      return UrlState.subscribe(function (snap) {
        const personalIds = personalApps.map(function (a) { return a.id; });
        const insoftIds = insoftApps.map(function (a) { return a.id; });
        const componentIds = componentApps.map(function (a) { return a.id; });
        const parsed = UrlState.parseVizSlice(snap.vz);
        const o = { personal: [...parsed.order.personal], insoft: [...parsed.order.insoft], componentes: [...parsed.order.componentes] };
        Viz.ensureOrderIds(o, personalIds, insoftIds, componentIds);
        setWatch(Viz.buildWatchFromOrder(o, personalIds, insoftIds, componentIds));
        setOrder(o);
        setPersonalUseLocal(parsed.personalUseLocal);
      });
    }, [insoftApps, personalApps, componentApps]);

    React.useEffect(function () {
      window.MO.Api.catalog()
        .then(function (cat) {
          const map = {};
          (cat.apps || []).forEach(function (a) {
            if (a.frontUrl) map[a.id] = a.frontUrl;
          });
          setProdMap(map);
          const nextInsoft = buildInsoftApps(cat.apps);
          if (nextInsoft.length) setInsoftApps(nextInsoft);
        })
        .catch(function () {});
    }, []);

    function onToggleWatch(group, id, on) {
      const w = { personal: { ...watch.personal }, insoft: { ...watch.insoft }, componentes: { ...watch.componentes } };
      const o = { personal: [...order.personal], insoft: [...order.insoft], componentes: [...order.componentes] };
      Viz.setWatched(w, o, group, id, on);
      setWatch(w);
      setOrder(o);
      persistViz(o, personalUseLocal);
    }

    function onMoveOrder(group, id, delta) {
      const o = { personal: [...order.personal], insoft: [...order.insoft], componentes: [...order.componentes] };
      Viz.moveOrder(o, group, id, delta);
      setOrder(o);
      setWatch(Viz.buildWatchFromOrder(
        o,
        personalApps.map(function (a) { return a.id; }),
        insoftApps.map(function (a) { return a.id; }),
        componentApps.map(function (a) { return a.id; }),
      ));
      setScrollToAppId(id);
      persistViz(o, personalUseLocal);
    }

    function clearScrollToCard() {
      setScrollToAppId(null);
    }

    return (
      <MUI.Box className="viz-page">
        <VizSection
          title="Apps personales"
          subtitle="Jeff-Aporta"
          group="personal"
          apps={personalApps}
          watch={watch}
          order={order}
          prodMap={prodMap}
          onToggleWatch={(id, on) => onToggleWatch("personal", id, on)}
          onMoveOrder={onMoveOrder}
          contextUseLocal={isMonorepoDev() ? personalUseLocal : false}
          onToggleAllContext={isMonorepoDev() ? toggleAllPersonalContext : null}
          onContextUseLocalChange={isMonorepoDev() ? setAllPersonalContext : null}
          scrollToAppId={scrollToAppId}
          onScrollToCardDone={clearScrollToCard}
        />

        <VizSection
          title="InSoft"
          subtitle="producción / staging"
          group="insoft"
          apps={insoftApps}
          watch={watch}
          order={order}
          prodMap={prodMap}
          onToggleWatch={(id, on) => onToggleWatch("insoft", id, on)}
          onMoveOrder={onMoveOrder}
          scrollToAppId={scrollToAppId}
          onScrollToCardDone={clearScrollToCard}
        />

        <VizSection
          title="Componentes ISA"
          subtitle="@jeff-aporta"
          group="componentes"
          apps={componentApps}
          watch={watch}
          order={order}
          prodMap={prodMap}
          onToggleWatch={(id, on) => onToggleWatch("componentes", id, on)}
          onMoveOrder={onMoveOrder}
          contextUseLocal={isMonorepoDev() ? personalUseLocal : false}
          onContextUseLocalChange={isMonorepoDev() ? setAllPersonalContext : null}
          scrollToAppId={scrollToAppId}
          onScrollToCardDone={clearScrollToCard}
        />
      </MUI.Box>
    );
  }

  window.MO = window.MO || {};
  window.MO.VizPanel = VizPanel;
})();
