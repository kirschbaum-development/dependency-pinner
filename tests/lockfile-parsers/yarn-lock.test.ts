import { describe, it, expect } from "vitest";
import { parseYarnLock } from "../../src/lockfile-parsers/yarn-lock";

describe("parseYarnLock", () => {
  it("parses yarn classic (v1) format", () => {
    const content = `# yarn lockfile v1


lodash@^4.17.0:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
  integrity sha512-abc

"@types/node@^18.0.0":
  version "18.19.8"
  resolved "https://registry.yarnpkg.com/@types/node/-/node-18.19.8.tgz"
  integrity sha512-def
`;

    const result = parseYarnLock(content);
    expect(result.get("lodash")).toBe("4.17.21");
    expect(result.get("@types/node")).toBe("18.19.8");
  });

  it("parses yarn berry (v2+) format", () => {
    const content = `__metadata:
  version: 8
  cacheKey: 10

"lodash@npm:^4.17.0":
  version: 4.17.21
  resolution: "lodash@npm:4.17.21"
  checksum: abc

"@types/node@npm:^18.0.0":
  version: 18.19.8
  resolution: "@types/node@npm:18.19.8"
  checksum: def
`;

    const result = parseYarnLock(content);
    expect(result.get("lodash")).toBe("4.17.21");
    expect(result.get("@types/node")).toBe("18.19.8");
  });

  it("handles multiple constraint entries for same package", () => {
    const content = `lodash@^4.17.0, lodash@^4.17.21:
  version "4.17.21"
  resolved "https://registry.yarnpkg.com/lodash/-/lodash-4.17.21.tgz"
`;

    const result = parseYarnLock(content);
    expect(result.get("lodash")).toBe("4.17.21");
  });

  it("returns empty map for empty content", () => {
    const result = parseYarnLock("# yarn lockfile v1\n");
    expect(result.size).toBe(0);
  });
});
