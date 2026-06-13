/** Tema neon / tech — catálogo orquestador (sin ESM; eval vía boot-helper). */
(function () {
  "use strict";

  const LS_KEY = "main-orchestrator:theme";

  function applyThemeModeToDocument(mode: string) {
    document.documentElement.setAttribute("data-mui-color-scheme", mode);
    document.documentElement.style.colorScheme = mode;
  }

  function initialMode() {
    try {
      const v = localStorage.getItem(LS_KEY);
      if (v === "light" || v === "dark") return v;
    } catch { /* ignore */ }
    return "dark";
  }

  const componentOverrides = {
    MuiCssBaseline: {
      styleOverrides: {
        body: ({ theme }: { theme: { palette: { mode: string } } }) =>
          theme.palette.mode === "dark"
            ? {
                background: "linear-gradient(180deg, #060d18 0%, #0a1628 45%, #0f172a 100%)",
                backgroundAttachment: "fixed",
              }
            : {
                background: "linear-gradient(180deg, #eef4ff 0%, #f5f9ff 50%, #f8fafc 100%)",
                backgroundAttachment: "fixed",
              },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none" as const, borderRadius: 10 },
        containedPrimary: {
          boxShadow: "0 0 20px rgba(30,144,255,0.35)",
          "&:hover": { boxShadow: "0 0 28px rgba(30,144,255,0.55)" },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          transition: "color 0.2s, text-shadow 0.2s",
          "&.Mui-selected": { textShadow: "0 0 14px rgba(30,144,255,0.55)" },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 2,
          background: "linear-gradient(90deg, #1e90ff, #6366f1)",
          boxShadow: "0 0 14px rgba(30,144,255,0.75)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        outlined: {
          borderColor: "rgba(30,144,255,0.35)",
          backdropFilter: "blur(6px)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }: { theme: { palette: { mode: string; text: { primary: string } } } }) =>
          theme.palette.mode === "dark"
            ? {
                background: "linear-gradient(90deg, rgba(6,13,24,0.97) 0%, rgba(15,35,70,0.94) 48%, rgba(35,18,65,0.97) 100%)",
                backdropFilter: "blur(14px)",
                borderBottom: "1px solid rgba(30,144,255,0.28)",
                boxShadow: "0 4px 32px rgba(30,144,255,0.12), inset 0 -1px 0 rgba(0,229,255,0.06)",
                color: theme.palette.text.primary,
              }
            : {
                background: "linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(240,247,255,0.96) 50%, rgba(248,250,255,0.98) 100%)",
                backdropFilter: "blur(12px)",
                borderBottom: "1px solid rgba(30,144,255,0.18)",
                boxShadow: "0 4px 24px rgba(30,144,255,0.08)",
                color: theme.palette.text.primary,
              },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }: { theme: { palette: { mode: string } } }) => ({
          backgroundImage: "none",
          ...(theme.palette.mode === "dark" ? { backdropFilter: "blur(10px)" } : {}),
        }),
        outlined: ({ theme }: { theme: { palette: { mode: string } } }) =>
          theme.palette.mode === "dark"
            ? {
                background: "linear-gradient(145deg, rgba(15,34,54,0.78), rgba(11,18,32,0.9))",
                borderColor: "rgba(30,144,255,0.22)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
              }
            : {
                background: "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(240,247,255,0.88))",
                borderColor: "rgba(30,144,255,0.16)",
                boxShadow: "0 8px 28px rgba(15,23,42,0.06)",
              },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: "box-shadow 0.2s, background-color 0.2s",
          "&:hover": { boxShadow: "0 0 12px rgba(30,144,255,0.25)" },
        },
      },
    },
  };

  function makeNeonTheme(mode: string) {
    const MUI = globalThis.MaterialUI;
    if (!MUI?.createTheme) throw new Error("MaterialUI no cargado");
    const dark = mode === "dark";
    return MUI.createTheme({
      palette: {
        mode,
        primary: { main: "#1e90ff", light: "#63b3ff", dark: "#1565c0" },
        secondary: { main: "#6366f1", light: "#818cf8", dark: "#4f46e5" },
        info: { main: "#00e5ff" },
        background: dark
          ? { default: "#060d18", paper: "#0f2236" }
          : { default: "#eef4ff", paper: "#ffffff" },
        text: dark
          ? { primary: "#e8f4ff", secondary: "#9ec5eb" }
          : { primary: "#0a2540", secondary: "#4a6278" },
        divider: dark ? "rgba(30,144,255,0.18)" : "rgba(10,37,64,0.1)",
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: '"IBM Plex Sans", "Space Grotesk", system-ui, sans-serif',
        h4: { fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif', fontWeight: 700, letterSpacing: -0.5 },
        h5: { fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif', fontWeight: 700 },
        h6: { fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif', fontWeight: 600 },
      },
      components: componentOverrides,
    });
  }

  function useThemeMode() {
    const React = globalThis.React;
    if (!React?.useState) throw new Error("React no cargado");
    const { useState, useCallback, useMemo, useEffect } = React;
    const [mode, setMode] = useState(initialMode);

    useEffect(() => {
      applyThemeModeToDocument(mode);
    }, [mode]);

    const toggle = useCallback(() => {
      setMode((m: string) => {
        const n = m === "dark" ? "light" : "dark";
        try { localStorage.setItem(LS_KEY, n); } catch { /* ignore */ }
        applyThemeModeToDocument(n);
        return n;
      });
    }, []);

    const theme = useMemo(() => makeNeonTheme(mode), [mode]);
    return { mode, toggle, theme };
  }

  (globalThis as unknown as { MONeonTheme?: { useThemeMode: typeof useThemeMode; makeNeonTheme: typeof makeNeonTheme } }).MONeonTheme = {
    useThemeMode,
    makeNeonTheme,
  };
})();
