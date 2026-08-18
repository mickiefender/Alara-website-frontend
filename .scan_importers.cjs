const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname);
const roots = [
  path.join(ROOT, "app"),
  path.join(ROOT, "components"),
  path.join(ROOT, "lib"),
  path.join(ROOT, "hooks"),
];

const patterns = [
  "ui/spinner",
  "ui/loader-11",
  "BookOpeningLoader",
  "@/components/loader",
  "components/loader",
];

const hits = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      const content = fs.readFileSync(full, "utf8");
      for (const pattern of patterns) {
        if (content.includes(pattern)) {
          hits.push(`${path.relative(ROOT, full)} :: ${pattern}`);
          break;
        }
      }
    }
  }
}

roots.forEach(walk);
fs.writeFileSync(path.join(ROOT, ".loader_importers.txt"), hits.sort().join("\n") || "NO IMPORTERS", "utf8");
console.log("written", hits.length);
