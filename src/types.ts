export type JsPackageManager = "npm" | "yarn" | "bun";
export type PackageManager = JsPackageManager | "composer";

export interface PinChange {
  packageName: string;
  depType: string;
  oldConstraint: string;
  newVersion: string;
}

export interface SkippedPackage {
  packageName: string;
  reason: string;
}

export interface PinResult {
  changes: PinChange[];
  skipped: SkippedPackage[];
  alreadyPinned: string[];
}

export interface DetectionResult {
  hasPackageJson: boolean;
  jsLockFiles: Array<{ type: JsPackageManager; path: string }>;
  hasComposerJson: boolean;
  hasComposerLock: boolean;
}
