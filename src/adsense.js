(function initializeAdsenseControl() {
  const ADSENSE_CLIENT_ID = "ca-pub-7086538868392432";
  const ADSENSE_SCRIPT_ID = "seedGardenAdsenseScript";
  const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
  const loaderScript = document.currentScript;
  const mode = loaderScript?.dataset.adsenseMode || "standalone";

  function isEnabled(value) {
    return value !== false && value !== "false";
  }

  function setEnabled(value) {
    const enabled = isEnabled(value);
    document.documentElement.dataset.adsenseEnabled = String(enabled);

    if (!enabled) {
      document.querySelector(`#${ADSENSE_SCRIPT_ID}`)?.remove();
      return;
    }

    if (document.querySelector(`#${ADSENSE_SCRIPT_ID}`)) return;

    const script = document.createElement("script");
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = ADSENSE_SCRIPT_URL;
    script.crossOrigin = "anonymous";
    document.head.append(script);
  }

  async function loadStandaloneSetting() {
    const config = window.SOW_YOUR_SEED_CONFIG || {};

    if (!config.backendEnabled || !config.supabaseUrl || !config.supabaseAnonKey) {
      setEnabled(config.adsenseEnabled);
      return;
    }

    try {
      const baseUrl = String(config.supabaseUrl).replace(/\/$/, "");
      const response = await fetch(`${baseUrl}/functions/v1/public-bootstrap?mode=critical`, {
        method: "GET",
        headers: {
          apikey: config.supabaseAnonKey,
          Authorization: `Bearer ${config.supabaseAnonKey}`,
        },
        cache: "no-store",
      });

      if (!response.ok) throw new Error(`Settings request failed: ${response.status}`);

      const payload = await response.json();
      setEnabled(payload.settings?.adsenseEnabled);
    } catch (error) {
      setEnabled(false);
      console.warn("Google AdSense stayed disabled because site settings could not be loaded.", error);
    }
  }

  window.SeedGardenAdsense = { setEnabled };

  if (mode !== "app") {
    void loadStandaloneSetting();
  }
})();
