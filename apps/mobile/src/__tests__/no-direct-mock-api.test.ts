import * as fs from "fs";
import * as path from "path";

function getAllFiles(dir: string, extensions: string[]): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...getAllFiles(fullPath, extensions));
    } else if (extensions.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

describe("import guard: no direct mock-api imports", () => {
  const root = path.resolve(__dirname, "../..");
  const dirsToScan = [
    path.join(root, "app"),
    path.join(root, "src/hooks"),
    path.join(root, "src/components"),
    path.join(root, "src/context"),
  ];

  const offendingFiles: string[] = [];

  beforeAll(() => {
    for (const dir of dirsToScan) {
      const files = getAllFiles(dir, [".ts", ".tsx"]);
      for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("mock-api")) {
          offendingFiles.push(path.relative(root, file));
        }
      }
    }
  });

  it("screens, hooks, and components should not import from mock-api directly", () => {
    expect(offendingFiles).toEqual([]);
  });
});
