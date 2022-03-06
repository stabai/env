import { dirname, fromFileUrl } from "https://deno.land/std@0.128.0/path/win32.ts";
import { runEval } from "./run.ts";
import { isInstalled } from "./software.ts";

export async function isGnome(): Promise<boolean> {
  try {
    const result = await runEval('pgrep gnome-shell');
    return result.status.success;
  } catch (_) {
    return false;
  }
}

async function getLinuxPackageManager(): Promise<string | undefined> {
  if (!osType.startsWith('linux-gnu')) {
    return undefined;
  } else if (await isInstalled('apt')) {
    return 'apt';
  } else if (await isInstalled('eopkg')) {
    return 'eopkg';
  } else {
    return undefined;
  }
}

async function getLinuxThirdPartyPackageManager(): Promise<string | undefined> {
  if (!osType.startsWith('linux-gnu')) {
    return undefined;
  } else if (await isInstalled('dpkg')) {
    return 'dpkg';
  } else if (await isInstalled('eopkg')) {
    return 'eopkg';
  } else {
    return undefined;
  }
}

export const scriptDir = dirname(fromFileUrl(import.meta.url));
export const homeDir = Deno.env.get('HOME') ?? '';
export const osType = Deno.env.get('OSTYPE') ?? '';
export const isMac = osType.startsWith('darwin');
export const isLinux = osType.startsWith('linux-gnu');
export const isWsl = Deno.env.get('IS_WSL') !== '';
export const linuxThirdPartyPackageManager = isLinux ? await getLinuxThirdPartyPackageManager() : undefined;
export const linuxPackageManager = isLinux ? await getLinuxPackageManager() : undefined;
