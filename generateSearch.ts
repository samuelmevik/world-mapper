import { Glob } from "bun";
import path from "path";

const SOURCE_DIR = "./content";
const OUTPUT_FILE = "./src/assets/data.json";

const glob = new Glob("**/*.txt");
const filesArray = [];

console.log(`🔍 Scanning ${SOURCE_DIR} for text files...`);
let i = 0;
for await (const filePath of glob.scan(SOURCE_DIR)) {
  const file = Bun.file(SOURCE_DIR + "/" + filePath);
  console.log(`📄 Processing file: ${filePath}`);
  const content = await file.text();

  const fileName = path.basename(filePath, ".txt");
  const title = fileName.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  filesArray.push({
    id: i++,
    title: title,
    content: content
  });
}

await Bun.write(OUTPUT_FILE, JSON.stringify(filesArray, null, 2));

console.log(`✅ Success! Wrote ${filesArray.length} items to ${OUTPUT_FILE}`);