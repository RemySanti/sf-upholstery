const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const files = fs.readdirSync(root).filter((f) => f.endsWith(".html"));

const replacements = new Map([
  ["Ã¢â‚¬”", "-"],
  ["Ã¢â‚¬“", "-"],
  ["â€”", "-"],
  ["â€“", "-"],
  ["Ã‚·", " - "],
  ["Â·", " - "],
  ["Ã‚©", "(c)"],
  ["Â©", "(c)"],
  ["Ã¢â‚¬Å“", "\""],
  ["Ã¢â‚¬", "\""],
  ["Ã¢â‚¬Ëœ", "'"],
  ["Ã¢â‚¬â„¢", "'"],
  ["â€œ", "\""],
  ["â€", "\""],
  ["â€˜", "'"],
  ["â€™", "'"],
  ["Ã—", "x"],
  ["Ã¢â€ —", "->"],
  ["Ã¢¬¡", "*"],
  ["Ã¢—Ë†", "*"],
  ["Ã¢—â€¡", "*"],
  ["Ã¢¬—", "*"],
  ["Ã¢Å“Â¦", "*"],
  ["Ã°Å¸Â¤â€“", "[AI]"],
  ["ðŸ¤–", "[AI]"],
  ["Ã¢Å¡Â ", "!"],
  ["âš ", "!"],
  ["Ã°Å¸Å½â„¢", "Mic"],
  ["ðŸŽ™", "Mic"],
  ["Ã°Å¸â€œÂ¹", "Cam"],
  ["ðŸ“¹", "Cam"],
  ["Milan''s", "Milan's"],
]);

for (const file of files) {
  const fullPath = path.join(root, file);
  let content = fs.readFileSync(fullPath, "utf8");
  for (const [from, to] of replacements.entries()) {
    content = content.split(from).join(to);
  }
  fs.writeFileSync(fullPath, content, "utf8");
}

console.log(`Mojibake fixed in ${files.length} HTML files.`);
