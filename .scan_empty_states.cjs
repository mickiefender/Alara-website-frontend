const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIRS = [
  path.join(ROOT, "app", "dashboard"),
  path.join(ROOT, "components"),
];
const patterns = [
  "No data",
  "No Data",
  "no data found",
  "No records",
  "No students",
  "No teachers",
  "No results",
  "No announcements",
  "No payments",
  "No fees",
  "Nothing here",
  "EmptyState",
  "Empty state",
  "isEmpty",
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

const hits = [];
for (const dir of DIRS) {
  const files = walk(dir);
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    const matched = patterns.filter((p) => content.includes(p));
    if (matched.length) {
      hits.push(`${path.relative(ROOT, file)} :: ${matched.join(", ")}`);
    }
  }
}

fs.writeFileSync(
  path.join(ROOT, ".empty_states_report.txt"),
  hits.join("\n") || "NONE",
  "utf8"
);
console.log("written", hits.length);
