export function parsePackageLock(content: string): Map<string, string> {
  const lockfile = JSON.parse(content);
  const versions = new Map<string, string>();

  if (lockfile.packages) {
    for (const [key, value] of Object.entries(lockfile.packages)) {
      const match = key.match(/^node_modules\/((?:@[^/]+\/)?[^/]+)$/);
      if (match && (value as Record<string, string>).version) {
        versions.set(match[1], (value as Record<string, string>).version);
      }
    }
  }

  if (versions.size === 0 && lockfile.dependencies) {
    for (const [name, value] of Object.entries(lockfile.dependencies)) {
      if ((value as Record<string, string>).version) {
        versions.set(name, (value as Record<string, string>).version);
      }
    }
  }

  return versions;
}
