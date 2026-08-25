import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readRepositoryFile(relativePath) {
  return readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

test("every Edge Function is deployed and has explicit JWT configuration", () => {
  const functionsRoot = path.join(repositoryRoot, "supabase/functions");
  const functionNames = readdirSync(functionsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_") && existsSync(path.join(functionsRoot, entry.name, "index.ts")))
    .map((entry) => entry.name);
  const packageJson = JSON.parse(readRepositoryFile("package.json"));
  const deployCommand = packageJson.scripts?.["supabase:deploy"] || "";
  const deployPrefix = "supabase functions deploy ";

  assert.ok(deployCommand.startsWith(deployPrefix), "supabase:deploy must use `supabase functions deploy`");

  const deployedFunctions = deployCommand.slice(deployPrefix.length).trim().split(/\s+/).filter(Boolean);
  const configuredFunctions = [...readRepositoryFile("supabase/config.toml").matchAll(/^\[functions\.([^\]]+)\]$/gm)]
    .map((match) => match[1]);

  assert.deepEqual(sorted(deployedFunctions), sorted(functionNames), "supabase:deploy must include every function directory exactly once");
  assert.deepEqual(sorted(configuredFunctions), sorted(functionNames), "supabase/config.toml must configure every function explicitly");
  assert.equal(new Set(deployedFunctions).size, deployedFunctions.length, "supabase:deploy must not contain duplicates");
  assert.equal(new Set(configuredFunctions).size, configuredFunctions.length, "Supabase function config must not contain duplicates");
});

test("HTML files have unique IDs and valid local file references", () => {
  const htmlFiles = readdirSync(repositoryRoot).filter((name) => name.endsWith(".html"));

  for (const htmlFile of htmlFiles) {
    const html = readRepositoryFile(htmlFile);
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

    assert.deepEqual([...new Set(duplicateIds)], [], `${htmlFile} contains duplicate IDs`);

    for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      const reference = match[1];
      if (/^(?:#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(reference)) continue;

      const cleanReference = decodeURIComponent(reference.split(/[?#]/, 1)[0]);
      if (!cleanReference) continue;

      assert.ok(
        existsSync(path.resolve(repositoryRoot, path.dirname(htmlFile), cleanReference)),
        `${htmlFile} references missing local file ${cleanReference}`,
      );
    }

    const idSet = new Set(ids);
    for (const match of html.matchAll(/\b(?:aria-controls|aria-describedby|aria-labelledby)="([^"]+)"/g)) {
      for (const referencedId of match[1].trim().split(/\s+/)) {
        assert.ok(idSet.has(referencedId), `${htmlFile} references missing ARIA target #${referencedId}`);
      }
    }
  }
});

test("frontend ID selectors and static asset paths resolve", () => {
  const html = readRepositoryFile("index.html");
  const app = readRepositoryFile("src/app.js");
  const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const selectedIds = [...app.matchAll(/querySelector\("#([A-Za-z0-9_-]+)"\)/g)].map((match) => match[1]);

  for (const selectedId of selectedIds) {
    assert.ok(htmlIds.has(selectedId), `src/app.js selects missing element #${selectedId}`);
  }

  const frontendSource = `${html}\n${app}`;
  const assetPaths = [...frontendSource.matchAll(/["'](assets\/[A-Za-z0-9._/-]+)(?:\?[^"']*)?["']/g)]
    .map((match) => match[1]);

  for (const assetPath of assetPaths) {
    assert.ok(existsSync(path.join(repositoryRoot, assetPath)), `frontend references missing asset ${assetPath}`);
  }
});

test("public startup loads checkout settings before deferred community content", () => {
  const app = readRepositoryFile("src/app.js");
  const bootstrap = readRepositoryFile("supabase/functions/public-bootstrap/index.ts");

  assert.match(app, /loadBackendData\(\{ mode: "critical" \}\)/);
  assert.doesNotMatch(app, /preloadPayPalSdk|paypalWarmup/);
  assert.match(app, /loadBackendData\(\{ mode: "content" \}\)/);
  assert.doesNotMatch(app, /waitForInitialAssets/);
  assert.match(bootstrap, /requestedMode === "critical" \|\| requestedMode === "content"/);
  assert.match(bootstrap, /Promise\.all\(\[\s*supabase[\s\S]*\.from\("donations"\)[\s\S]*\.from\("seed_comments"\)[\s\S]*\.from\("posts"\)/);
});

test("Google AdSense is controlled by the persisted admin setting on every content page", () => {
  const app = readRepositoryFile("src/app.js");
  const adsense = readRepositoryFile("src/adsense.js");
  const adminSettings = readRepositoryFile("supabase/functions/admin-settings/index.ts");
  const migration = readRepositoryFile("supabase/migrations/202608250001_add_adsense_toggle.sql");
  const adsText = readRepositoryFile("ads.txt").trim();
  const contentPages = [
    "index.html",
    "about-us.html",
    "terms-and-conditions.html",
    "privacy-policy.html",
    "delivery-fulfillment-policy.html",
  ];

  assert.match(adsense, /ca-pub-7086538868392432/);
  assert.match(adsense, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js\?client=/);
  assert.match(adsense, /script\.async = true/);
  assert.match(adsense, /script\.crossOrigin = "anonymous"/);
  assert.match(adsense, /payload\.settings\?\.adsenseEnabled/);
  assert.match(adsense, /catch \(error\) \{\s*setEnabled\(false\)/);

  for (const page of contentPages) {
    const html = readRepositoryFile(page);
    assert.match(
      html,
      /<meta name="google-adsense-account" content="ca-pub-7086538868392432" \/>/,
      `${page} must expose the static AdSense verification meta tag`,
    );
    assert.match(html, /src="src\/config\.js\?v=3"/, `${page} must load public configuration`);
    assert.match(html, /src="src\/adsense\.js\?v=1"/, `${page} must load the conditional AdSense controller`);
  }

  assert.match(readRepositoryFile("index.html"), /id="adminAdsenseEnabled"/);
  assert.match(app, /adsenseEnabled: true/);
  assert.match(app, /adminAdsenseEnabled: document\.querySelector\("#adminAdsenseEnabled"\)/);
  assert.match(app, /SeedGardenAdsense\?\.setEnabled\(settings\.adsenseEnabled\)/);
  assert.match(adminSettings, /"adsenseEnabled"/);
  assert.match(adminSettings, /next\.adsenseEnabled = isEnabled\(submitted\.adsenseEnabled\)/);
  assert.match(migration, /'\{adsenseEnabled\}'[\s\S]*'true'::jsonb/);
  assert.equal(adsText, "google.com, pub-7086538868392432, DIRECT, f08c47fec0942fa0");
});

test("optimized page images stay within the initial transfer budget", () => {
  const html = readRepositoryFile("index.html");
  const imageBudgets = {
    "assets/jesus-profile.jpg": 80 * 1024,
    "assets/sow-cover.jpg": 260 * 1024,
  };

  for (const [assetPath, byteBudget] of Object.entries(imageBudgets)) {
    assert.match(html, new RegExp(assetPath.replace(".", "\\.")));
    assert.ok(statSync(path.join(repositoryRoot, assetPath)).size <= byteBudget, `${assetPath} exceeds its byte budget`);
  }

  assert.doesNotMatch(html, /assets\/(?:jesus-profile|sow-cover)\.png/);
});

test("PayPal stays behind the seed loader and card checkout redirects externally", () => {
  const html = readRepositoryFile("index.html");
  const app = readRepositoryFile("src/app.js");
  const styles = readRepositoryFile("src/styles.css");

  assert.match(html, /id="paypalCheckoutLoader"[\s\S]*paypal-checkout-loader-seed[\s\S]*🌱[\s\S]*Preparing your seed…/);
  assert.doesNotMatch(html, /id="paypalCheckoutRetry"/);
  assert.match(app, /async function renderFreshPayPalButtons\(\)[\s\S]*const route = getCheckoutRoute\(\)/);
  assert.match(app, /await loadBackendData\(\{ mode: "critical", throwOnError: true \}\)/);
  assert.match(app, /resetAllPayPalSdks\(\)[\s\S]*const paypal = await loadPayPalSdk\(route\)/);
  assert.match(app, /const paypal = await loadPayPalSdk\(route\)/);
  assert.match(app, /await paypalButtons\.render\(elements\.paypalButtonContainer\)/);
  assert.match(app, /waitForRenderedPayPalButton/);
  assert.match(app, /querySelector\("iframe"\)/);
  assert.doesNotMatch(app, /paypal\.FUNDING\.CARD/);
  assert.doesNotMatch(app, /cardButtonContainer/);
  assert.match(
    html,
    /id="alternateCardCheckoutLink"[\s\S]*href="https:\/\/sowseed-receiver-seed-alternate-server\.vercel\.app\/"[\s\S]*target="_blank"[\s\S]*rel="noopener noreferrer"/,
  );
  assert.match(app, /setPaymentStatus\("Choose PayPal or debit\/credit card to continue"\)/);
  assert.match(styles, /\.alternate-card-link\s*\{/);
  assert.match(styles, /\.inline-paypal-checkout\.is-loading \.payment-choice\s*\{[\s\S]*opacity: 0/);
  assert.match(styles, /\.paypal-checkout-loader[\s\S]*background: linear-gradient/);
  assert.match(styles, /\.paypal-checkout-loader-seed[\s\S]*animation: app-loader-spin/);
});

test("1080-wide tutorial opens in a modal and returns to checkout when playback ends", () => {
  const html = readRepositoryFile("index.html");
  const app = readRepositoryFile("src/app.js");
  const videoPath = path.join(repositoryRoot, "assets/how-to-sow-your-seed-1080p.mp4");

  assert.ok(existsSync(videoPath), "tutorial video asset is missing");
  assert.ok(statSync(videoPath).size > 0, "tutorial video asset is empty");
  assert.match(html, /id="howToSow"[\s\S]*How To Sow Your Seed/);
  assert.match(html, /id="tutorialVideo"[\s\S]*width="1080"[\s\S]*height="1844"[\s\S]*how-to-sow-your-seed-1080p\.mp4/);
  assert.match(app, /tutorialVideo\?\.addEventListener\("ended", \(\) => closeTutorial\(true\)\)/);
  assert.match(app, /elements\.supportCard\.scrollIntoView/);
});
