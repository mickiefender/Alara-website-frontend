const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname);
const APP = path.join(ROOT, "app");
const COMPONENTS = path.join(ROOT, "components");
const LIB = path.join(ROOT, "lib");
const HOOKS = path.join(ROOT, "hooks");

const patterns = [
  "BookOpeningLoader",
  "ui/loader-11",
  "@/components/loader",
  "CircularLoader",
  "circular-loader",
  "PageLoader",
  "page-loader",
  "LoadingWrapper",
  "loading-wrapper",
  "Spinner",
  "spinner",
  "animate-pulse",
  "Skeleton",
  "skeleton",
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      walk(full, out);
    } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts")) {
      out.push(full);
    }
  }
  return out;
}

const files = [...walk(APP), ...walk(COMPONENTS), ...walk(LIB), ...walk(HOOKS)];
const report = [];
const usageCount = {};

for (const file of files) {
  const rel = path.relative(ROOT, file);
  const content = fs.readFileSync(file, "utf8");
  const hits = [];
  for (const pattern of patterns) {
    if (content.includes(pattern)) {
      hits.push(pattern);
      usageCount[pattern] = (usageCount[pattern] || 0) + 1;
    }
  }
  if (hits.length) {
    report.push(`${rel} :: ${hits.join(", ")}`);
  }
}

const lines = [
  "=== FILE USAGE SUMMARY ===",
  ...report,
  "",
  "=== PATTERN COUNTS ===",
  ...Object.entries(usageCount)
    .sort((a, b) => b[1] - a[1])
    .map(([p, c]) => `${p}: ${c}`),
];

fs.writeFileSync(path.join(ROOT, ".scan_report.txt"), lines.join("\n"), "utf8");
console.log("Wrote .scan_report.txt with", report.length, "files");
