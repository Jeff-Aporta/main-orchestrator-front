(function () {
  "use strict";

  const cfg = () => window.MO.Config;

  async function getJson<T>(path: string): Promise<T> {
    const res = await fetch(cfg().apiUrl(path), {
      headers: { Accept: "application/json", ...window.MO.Auth.authHeader() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || res.statusText);
    return data as T;
  }

  window.MO = window.MO || ({} as MoNs);
  window.MO.Api = {
    health: () => getJson<{ ok: boolean; service: string; role: string }>("/"),
    routes: () => getJson<{ ok: boolean; routes: MoRouteRow[] }>("/routes"),
    catalog: () => getJson<MoCatalogResponse>("/catalog"),
  };
})();
