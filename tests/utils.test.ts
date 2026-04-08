import { describe, it, expect } from "vitest";
import { isExactVersion, isSkippableConstraint } from "../src/utils";

describe("isExactVersion", () => {
  it("returns true for exact semver versions", () => {
    expect(isExactVersion("4.17.21")).toBe(true);
    expect(isExactVersion("1.0.0")).toBe(true);
    expect(isExactVersion("0.1.0")).toBe(true);
    expect(isExactVersion("1.2.3-beta.1")).toBe(true);
    expect(isExactVersion("2.0.0-rc.1")).toBe(true);
  });

  it("returns false for range constraints", () => {
    expect(isExactVersion("^4.17.0")).toBe(false);
    expect(isExactVersion("~4.17.0")).toBe(false);
    expect(isExactVersion(">=1.0.0")).toBe(false);
    expect(isExactVersion(">1.0.0")).toBe(false);
    expect(isExactVersion("<2.0.0")).toBe(false);
    expect(isExactVersion("<=2.0.0")).toBe(false);
    expect(isExactVersion("*")).toBe(false);
    expect(isExactVersion("1.x")).toBe(false);
    expect(isExactVersion("1.2.x")).toBe(false);
    expect(isExactVersion("1.0.0 || 2.0.0")).toBe(false);
    expect(isExactVersion(">=1.0.0 <2.0.0")).toBe(false);
    expect(isExactVersion("latest")).toBe(false);
  });

  it("returns false for empty or invalid strings", () => {
    expect(isExactVersion("")).toBe(false);
  });

  it("handles composer-style versions", () => {
    expect(isExactVersion("11.44.2")).toBe(true);
    expect(isExactVersion("^11.0")).toBe(false);
    expect(isExactVersion("~11.0")).toBe(false);
    expect(isExactVersion("11.0.*")).toBe(false);
  });
});

describe("isSkippableConstraint", () => {
  it("returns true for git/URL references", () => {
    expect(isSkippableConstraint("github:user/repo")).toBe(true);
    expect(isSkippableConstraint("git+https://github.com/user/repo.git")).toBe(true);
    expect(isSkippableConstraint("git://github.com/user/repo.git")).toBe(true);
    expect(isSkippableConstraint("https://github.com/user/repo.git")).toBe(true);
    expect(isSkippableConstraint("http://example.com/pkg.tgz")).toBe(true);
    expect(isSkippableConstraint("file:../local-pkg")).toBe(true);
  });

  it("returns true for npm aliases and protocols", () => {
    expect(isSkippableConstraint("npm:other-package@^1.0.0")).toBe(true);
    expect(isSkippableConstraint("link:../other")).toBe(true);
    expect(isSkippableConstraint("workspace:*")).toBe(true);
  });

  it("returns true for composer branch aliases", () => {
    expect(isSkippableConstraint("dev-main")).toBe(true);
    expect(isSkippableConstraint("dev-master")).toBe(true);
    expect(isSkippableConstraint("dev-feature/my-branch")).toBe(true);
  });

  it("returns false for normal version constraints", () => {
    expect(isSkippableConstraint("^4.17.0")).toBe(false);
    expect(isSkippableConstraint("~1.0.0")).toBe(false);
    expect(isSkippableConstraint("1.0.0")).toBe(false);
    expect(isSkippableConstraint("*")).toBe(false);
    expect(isSkippableConstraint("latest")).toBe(false);
  });
});
