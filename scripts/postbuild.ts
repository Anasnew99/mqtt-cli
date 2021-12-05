import fs from "fs";
import path from "path";
const sourceFile = path.join(__dirname, "..", "dist", "index.js");
const file = fs.readFileSync(sourceFile, {
  encoding: "utf8",
});
fs.writeFileSync(
  sourceFile,
  file.toString().replace("#!/usr/bin/env ts-node", "#!/usr/bin/env node"),
  { encoding: "utf8" }
);
