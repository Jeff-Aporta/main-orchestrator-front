/** Estado de navegación del catálogo en ?s= (JSON → base64url). */
(function () {
  "use strict";

  const STATE_VERSION = 1;
  const PARAM = "s";

  type ViewId = "catalog" | "viz";
  type VizUrlSlice = { p?: string[]; i?: string[]; c?: string[]; l?: boolean };

  function hasVizSlice(vz: VizUrlSlice): boolean {
    return !!(vz.p?.length || vz.i?.length || vz.c?.length || vz.l === true || vz.l === false);
  }
  type AppState = { v: number; view: ViewId; vz?: VizUrlSlice };

  function initial(): AppState {
    return { v: STATE_VERSION, view: "catalog" };
  }

  function normalizeVizSlice(raw: unknown): VizUrlSlice | undefined {
    if (!raw || typeof raw !== "object") return undefined;
    const o = raw as Record<string, unknown>;
    const vz: VizUrlSlice = {};
    if (Array.isArray(o.p)) {
      vz.p = o.p.filter((id): id is string => typeof id === "string" && !!id);
    }
    if (Array.isArray(o.i)) {
      vz.i = o.i.filter((id): id is string => typeof id === "string" && !!id);
    }
    if (Array.isArray(o.c)) {
      vz.c = o.c.filter((id): id is string => typeof id === "string" && !!id);
    }
    if (o.l === true) vz.l = true;
    if (o.l === false) vz.l = false;
    if (!hasVizSlice(vz)) return undefined;
    return vz;
  }

  function normalize(raw: unknown): AppState {
    if (!raw || typeof raw !== "object") return initial();
    const o = raw as Record<string, unknown>;
    const view: ViewId = o.view === "viz" ? "viz" : "catalog";
    const vz = normalizeVizSlice(o.vz);
    const out: AppState = { v: typeof o.v === "number" ? o.v : STATE_VERSION, view };
    if (vz) out.vz = vz;
    return out;
  }

  function slimViz(vz: VizUrlSlice | undefined): VizUrlSlice | undefined {
    if (!vz) return undefined;
    const out: VizUrlSlice = {};
    if (vz.p?.length) out.p = vz.p.slice(0, 24);
    if (vz.i?.length) out.i = vz.i.slice(0, 8);
    if (vz.c?.length) out.c = vz.c.slice(0, 12);
    if (vz.l === true) out.l = true;
    if (vz.l === false) out.l = false;
    if (!hasVizSlice(out)) return undefined;
    return out;
  }

  function slimForUrl(state: AppState): AppState {
    const slim: AppState = { v: state.v, view: state.view };
    const vz = slimViz(state.vz);
    if (vz) slim.vz = vz;
    return slim;
  }

  function merge(state: AppState, partial: Partial<AppState>): AppState {
    const next: AppState = {
      v: state.v,
      view: partial.view === "viz" ? "viz" : partial.view === "catalog" ? "catalog" : state.view,
    };
    if (state.vz) next.vz = { ...state.vz };
    if ("vz" in partial) {
      if (partial.vz == null) {
        delete next.vz;
      } else {
        const vz = slimViz(partial.vz);
        if (vz) next.vz = vz;
        else delete next.vz;
      }
    }
    return next;
  }

  function migrateLegacyView(): ViewId | null {
    try {
      const url = new URL(location.href);
      if (url.searchParams.get("view") === "viz") return "viz";
      if (url.hash === "#viz") return "viz";
    } catch { /* ignore */ }
    return null;
  }

  function stripLegacyViewParam() {
    try {
      const url = new URL(location.href);
      let dirty = false;
      if (url.searchParams.has("view")) {
        url.searchParams.delete("view");
        dirty = true;
      }
      if (url.hash === "#viz") {
        url.hash = "";
        dirty = true;
      }
      if (dirty) history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch { /* ignore */ }
  }

  function parseVizSlice(vz: VizUrlSlice | undefined) {
    const Viz = window.MO.VizState;
    const order = Viz.defaultOrder();
    if (vz?.p?.length) order.personal = vz.p.slice();
    if (vz?.i?.length) order.insoft = vz.i.slice();
    if (vz?.c?.length) order.componentes = vz.c.slice();
    const allowsLocal = Viz.allowsPersonalLocalContext();
    let personalUseLocal = false;
    if (allowsLocal) {
      personalUseLocal = vz?.l === true
        ? true
        : vz?.l === false
          ? false
          : Viz.defaultPersonalUseLocal();
    }
    return { order, personalUseLocal };
  }

  function orderEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  function vizEqual(a: VizUrlSlice | undefined, b: VizUrlSlice | undefined) {
    const pa = a?.p || [];
    const pb = b?.p || [];
    const ia = a?.i || [];
    const ib = b?.i || [];
    const ca = a?.c || [];
    const cb = b?.c || [];
    const la = a?.l;
    const lb = b?.l;
    const sameLoc = la === lb || (la === undefined && lb === undefined);
    return orderEqual(pa, pb) && orderEqual(ia, ib) && orderEqual(ca, cb) && sameLoc;
  }

  function serializeViz(order: { personal: string[]; insoft: string[]; componentes: string[] }, personalUseLocal: boolean): VizUrlSlice | undefined {
    const vz: VizUrlSlice = { l: !!personalUseLocal };
    if (order.personal.length) vz.p = order.personal.slice();
    if (order.insoft.length) vz.i = order.insoft.slice();
    if (order.componentes.length) vz.c = order.componentes.slice();
    return slimViz(vz);
  }

  const urlState = window.ISAFront.createUrlState({
    param: PARAM,
    debounceMs: 200,
    historyKey: "moAppState",
    initial,
    normalize,
    slimForUrl,
    merge,
    onInit(_state, api) {
      window.MO.VizState?.purgeLegacyStorage?.();
      const legacy = migrateLegacyView();
      if (legacy) {
        api.mergePartial({ view: legacy });
        stripLegacyViewParam();
      }
    },
    brandHomeReset(api) {
      return api.reset();
    },
  });

  window.MO = window.MO || {};
  window.MO.UrlState = {
    PARAM,
    bootState: urlState.boot as AppState,
    getSnapshot: urlState.getSnapshot as () => AppState,
    mergePartial: urlState.mergePartial as (p: Partial<AppState>) => AppState,
    subscribe: urlState.subscribe as (fn: (s: AppState) => void) => () => void,
    reset: urlState.reset as () => AppState,
    parseVizSlice,
    serializeViz,
    vizEqual,
  };
})();
