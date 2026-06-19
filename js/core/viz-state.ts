/** Utilidades puras del panel de visualización (sin persistencia local). */
(function () {
  "use strict";

  const LEGACY_KEYS = [
    "main-orchestrator:viz-cols",
    "main-orchestrator:viz-watch",
    "main-orchestrator:viz-order",
    "main-orchestrator:viz-personal-local",
    "main-orchestrator:viz-desktop-w",
    "viz-panel-cols",
    "viz-panel-watch",
    "viz-panel-order",
  ];

  const DESKTOP_WIDTHS = [1280, 900] as const;

  type Group = "personal" | "insoft" | "componentes";
  type WatchMap = Record<Group, Record<string, boolean>>;
  type OrderMap = Record<Group, string[]>;

  function purgeLegacyStorage(): void {
    try {
      for (const key of LEGACY_KEYS) localStorage.removeItem(key);
    } catch { /* ignore */ }
  }

  purgeLegacyStorage();

  function defaultWatch(): WatchMap {
    return { personal: {}, insoft: {}, componentes: {} };
  }

  function defaultOrder(): OrderMap {
    return { personal: [], insoft: [], componentes: [] };
  }

  function allowsPersonalLocalContext(): boolean {
    return /localhost|127\.0\.0\.1|\[::1\]/.test(location.hostname)
      && /\/apps\//.test(location.pathname);
  }

  function defaultPersonalUseLocal(): boolean {
    return allowsPersonalLocalContext();
  }

  function buildWatchFromOrder(order: OrderMap, personalIds: string[], insoftIds: string[], componentIds: string[] = []): WatchMap {
    const watch = defaultWatch();
    for (const id of personalIds) watch.personal[id] = order.personal.includes(id);
    for (const id of insoftIds) watch.insoft[id] = order.insoft.includes(id);
    for (const id of componentIds) watch.componentes[id] = order.componentes.includes(id);
    return watch;
  }

  function ensureOrderIds(order: OrderMap, personalIds: string[], insoftIds: string[], componentIds: string[] = []): void {
    order.personal = order.personal.filter((id) => personalIds.includes(id));
    order.insoft = order.insoft.filter((id) => insoftIds.includes(id));
    order.componentes = order.componentes.filter((id) => componentIds.includes(id));
  }

  function desktopHeight(width: number): number {
    return Math.round((width * 9) / 16);
  }

  function isWatched(watch: WatchMap, group: Group, id: string): boolean {
    return !!watch[group][id];
  }

  function setWatched(watch: WatchMap, order: OrderMap, group: Group, id: string, on: boolean): void {
    watch[group][id] = on;
    const list = order[group];
    const idx = list.indexOf(id);
    if (on && idx < 0) list.push(id);
    if (!on && idx >= 0) list.splice(idx, 1);
  }

  function reorder(order: OrderMap, group: Group, fromId: string, toId: string): void {
    const list = order[group].slice();
    const from = list.indexOf(fromId);
    const to = list.indexOf(toId);
    if (from < 0 || to < 0) return;
    list.splice(from, 1);
    list.splice(to, 0, fromId);
    order[group] = list;
  }

  function moveOrder(order: OrderMap, group: Group, id: string, delta: number): void {
    const list = order[group].slice();
    const idx = list.indexOf(id);
    if (idx < 0) return;
    const next = idx + delta;
    if (next < 0 || next >= list.length) return;
    list.splice(idx, 1);
    list.splice(next, 0, id);
    order[group] = list;
  }

  window.MO = window.MO || {};
  window.MO.VizState = {
    DESKTOP_WIDTHS,
    desktopHeight,
    defaultOrder,
    defaultPersonalUseLocal,
    allowsPersonalLocalContext,
    buildWatchFromOrder,
    ensureOrderIds,
    isWatched,
    setWatched,
    reorder,
    moveOrder,
    purgeLegacyStorage,
  };
})();

