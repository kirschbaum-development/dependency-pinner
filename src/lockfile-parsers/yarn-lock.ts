export function parseYarnLock(content: string): Map<string, string> {
  const versions = new Map<string, string>();

  const blocks = content.split(/\n(?=\S)/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    const header = lines[0];

    if (header.startsWith("#") || header.startsWith("__metadata")) continue;

    const nameMatch = header.match(/^"?((?:@[^@"]+\/)?[^@"]+)@/);
    if (!nameMatch) continue;

    const name = nameMatch[1];

    const versionLine = lines.find((l) => l.trim().startsWith("version"));
    if (!versionLine) continue;

    const versionMatch = versionLine.match(/version[:\s]+"?([^"\s]+)"?/);
    if (!versionMatch) continue;

    versions.set(name, versionMatch[1]);
  }

  return versions;
}
