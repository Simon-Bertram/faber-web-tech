#!/usr/bin/env node
/**
 * Debug instrumentation: diagnose alchemy / effect module resolution failure.
 * Writes NDJSON to the debug session log.
 */
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const LOG_PATH = "/workspaces/faber-web/.cursor/debug-95e587.log";
const ENDPOINT =
  "http://localhost:7393/ingest/1b902a98-671c-4fc6-a51c-28097ca467f3";
const SESSION = "95e587";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function log(hypothesisId, location, message, data) {
  const payload = {
    data,
    hypothesisId,
    location,
    message,
    runId: process.env.DEBUG_RUN_ID || "pre-fix",
    sessionId: SESSION,
    timestamp: Date.now(),
  };
  fs.appendFileSync(LOG_PATH, `${JSON.stringify(payload)}\n`);
  fetch(ENDPOINT, {
    body: JSON.stringify(payload),
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION,
    },
    method: "POST",
  }).catch(() => {});
  console.log(`[${hypothesisId}] ${message}`, JSON.stringify(data, null, 0));
}

const brokenBase =
  "node_modules/.pnpm/@effect+platform-node-shared@4.0.3_effect@4.0.0-rc.112/node_modules";
const rcBase =
  "node_modules/.pnpm/@effect+platform-node-shared@4.0.0-rc.112_effect@4.0.0-rc.112/node_modules";

// #region agent log
// H-A: lockfile resolved platform-node-shared to 4.0.3 for rc.112 platform packages
const lock = fs.readFileSync(path.join(ROOT, "pnpm-lock.yaml"), "utf8");
const lockPins403 =
  lock.includes(
    "'@effect/platform-node@4.0.0-rc.112(effect@4.0.0-rc.112)(redis@6.2.1)':"
  ) &&
  /('@effect\/platform-node@4\.0\.0-rc\.112\(effect@4\.0\.0-rc\.112\)\(redis@6\.2\.1\)':\n(?: {4}.*\n)*? {6}'@effect\/platform-node-shared': 4\.0\.3)/.test(
    lock
  );
const lockHasRcShared = lock.includes(
  "'@effect/platform-node-shared@4.0.0-rc.112"
);
log(
  "A",
  "debug-effect-resolve.mjs:H-A",
  "lockfile resolution of platform-node-shared",
  {
    bothVersionsOnDisk: {
      v403: fs.existsSync(
        path.join(ROOT, brokenBase, "@effect/platform-node-shared")
      ),
      vRc112: fs.existsSync(
        path.join(ROOT, rcBase, "@effect/platform-node-shared")
      ),
    },
    lockHasRcSharedEntry: lockHasRcShared,
    platformNodePins403: lockPins403,
  }
);
// #endregion

// #region agent log
// H-B: effect@rc.112 missing stable process/ChildProcess path that 4.0.3 imports
const effectCandidates = [
  path.join(ROOT, "packages/infra/node_modules/effect/package.json"),
  path.join(ROOT, rcBase, "effect/package.json"),
  path.join(ROOT, brokenBase, "effect/package.json"),
];
const effectPkgPath = effectCandidates.find((p) => fs.existsSync(p));
const effectPkg = effectPkgPath
  ? JSON.parse(fs.readFileSync(effectPkgPath, "utf8"))
  : null;
const effectRoot = effectPkgPath ? path.dirname(effectPkgPath) : null;
const effectExports = Object.keys(effectPkg?.exports || {});
log("B", "debug-effect-resolve.mjs:H-B", "effect process export paths", {
  effectPkgPath,
  effectVersion: effectPkg?.version ?? null,
  hasStableProcessExport: effectExports.some((k) => k.startsWith("./process")),
  hasUnstableProcessExport: effectExports.some((k) =>
    k.startsWith("./unstable/process")
  ),
  stableChildProcessExists: effectRoot
    ? fs.existsSync(path.join(effectRoot, "dist/process/ChildProcess.js"))
    : false,
  unstableChildProcessExists: effectRoot
    ? fs.existsSync(
        path.join(effectRoot, "dist/unstable/process/ChildProcess.js")
      )
    : false,
});
// #endregion

// #region agent log
// H-C: compare import paths (4.0.3 vs rc.112) when both present
const shared403 = path.join(ROOT, brokenBase, "@effect/platform-node-shared");
const sharedRc = path.join(ROOT, rcBase, "@effect/platform-node-shared");
const readChildImport = (pkgRoot) => {
  const spawner = path.join(pkgRoot, "dist/NodeChildProcessSpawner.js");
  if (!fs.existsSync(spawner)) {
    return null;
  }
  return fs
    .readFileSync(spawner, "utf8")
    .split("\n")
    .find((l) => l.includes("ChildProcess"));
};
log(
  "C",
  "debug-effect-resolve.mjs:H-C",
  "shared package import paths vs install integrity",
  {
    rc112Import: readChildImport(sharedRc),
    shared403DistExists: fs.existsSync(
      path.join(shared403, "dist/NodeChildProcessSpawner.js")
    ),
    shared403Import: readChildImport(shared403),
    shared403PeerEffect: fs.existsSync(path.join(shared403, "package.json"))
      ? JSON.parse(
          fs.readFileSync(path.join(shared403, "package.json"), "utf8")
        ).peerDependencies?.effect
      : null,
    shared403Version: fs.existsSync(path.join(shared403, "package.json"))
      ? JSON.parse(
          fs.readFileSync(path.join(shared403, "package.json"), "utf8")
        ).version
      : null,
  }
);
// #endregion

// #region agent log
// H-D: alchemy directly resolves to broken 4.0.3 shared package
let alchemyResolvedShared = null;
let alchemyImportError = null;
try {
  const alchemyPkg = path.join(
    ROOT,
    "packages/infra/node_modules/alchemy/package.json"
  );
  const req = createRequire(alchemyPkg);
  alchemyResolvedShared = req.resolve(
    "@effect/platform-node-shared/package.json"
  );
  const resolvedPkg = JSON.parse(
    fs.readFileSync(alchemyResolvedShared, "utf8")
  );
  log(
    "D",
    "debug-effect-resolve.mjs:H-D",
    "alchemy-resolved platform-node-shared",
    {
      alchemyPeerOrDep: JSON.parse(fs.readFileSync(alchemyPkg, "utf8"))
        .dependencies?.["@effect/platform-node-shared"],
      is403: resolvedPkg.version === "4.0.3",
      resolvedPath: alchemyResolvedShared,
      resolvedVersion: resolvedPkg.version,
    }
  );
} catch (err) {
  alchemyImportError = String(err);
  log("D", "debug-effect-resolve.mjs:H-D", "alchemy resolve failed", {
    error: alchemyImportError,
  });
}
// #endregion

// #region agent log
// H-E: import rc.112 spawner (should work) and optional leftover 4.0.3
async function tryImport(filePath) {
  try {
    await import(filePath);
    return { err: null, ok: true };
  } catch (err) {
    return {
      err: { code: err.code, message: err.message, url: err.url },
      ok: false,
    };
  }
}
const rcResult = await tryImport(
  path.join(sharedRc, "dist/NodeChildProcessSpawner.js")
);
const brokenResult = fs.existsSync(
  path.join(shared403, "dist/NodeChildProcessSpawner.js")
)
  ? await tryImport(path.join(shared403, "dist/NodeChildProcessSpawner.js"))
  : { err: null, ok: null };
log("E", "debug-effect-resolve.mjs:H-E", "imports of NodeChildProcessSpawner", {
  brokenImportErr: brokenResult.err,
  brokenImportOk: brokenResult.ok,
  brokenStillOnDisk: fs.existsSync(shared403),
  resolvedImportErr: rcResult.err,
  resolvedImportOk: rcResult.ok,
});
// #endregion

// #region agent log
// Also try importing alchemy CLI entry to mirror `alchemy dev`
let alchemyOk = false;
let alchemyErr = null;
try {
  const alchemyBin = path.join(
    ROOT,
    "packages/infra/node_modules/alchemy/bin/alchemy.js"
  );
  const alt = path.join(
    ROOT,
    "packages/infra/node_modules/alchemy/dist/cli.js"
  );
  const entry = fs.existsSync(alchemyBin)
    ? alchemyBin
    : fs.existsSync(alt)
      ? alt
      : null;
  if (entry) {
    await import(entry);
  } else {
    // resolve via package bin
    const pkg = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, "packages/infra/node_modules/alchemy/package.json"),
        "utf8"
      )
    );
    const binRel = typeof pkg.bin === "string" ? pkg.bin : pkg.bin?.alchemy;
    const binPath = path.join(
      ROOT,
      "packages/infra/node_modules/alchemy",
      binRel
    );
    await import(binPath);
  }
  alchemyOk = true;
} catch (err) {
  alchemyErr = { code: err.code, message: err.message, url: err.url };
}
log("E", "debug-effect-resolve.mjs:H-E2", "alchemy entry import result", {
  alchemyErr,
  alchemyOk,
});
// #endregion

console.log("\nDiagnostic complete. Logs written to", LOG_PATH);
