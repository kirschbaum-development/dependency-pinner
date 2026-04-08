import { describe, it, expect } from "vitest";
import { parseBunLock } from "../../src/lockfile-parsers/bun-lock";

describe("parseBunLock", () => {
  it("parses bun.lock JSON format", () => {
    const content = JSON.stringify({
      lockfileVersion: 1,
      workspaces: {
        "": {
          name: "my-project",
          dependencies: { lodash: "^4.17.21" },
        },
      },
      packages: {
        lodash: ["lodash@4.17.21", "", {}, "sha512-abc"],
        "@types/node": ["@types/node@20.11.0", "", {}, "sha512-def"],
        express: ["express@4.18.2", "", { dependencies: { debug: "2.6.9" } }, "sha512-ghi"],
      },
    });

    const result = parseBunLock(content);
    expect(result.get("lodash")).toBe("4.17.21");
    expect(result.get("@types/node")).toBe("20.11.0");
    expect(result.get("express")).toBe("4.18.2");
  });

  it("returns empty map for empty packages", () => {
    const content = JSON.stringify({ lockfileVersion: 1, packages: {} });
    const result = parseBunLock(content);
    expect(result.size).toBe(0);
  });
});
