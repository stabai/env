import { dirname, fromFileUrl, join } from 'https://deno.land/std@0.128.0/path/mod.ts';
import os from 'https://deno.land/x/dos@v0.11.0/mod.ts';
import { runPiped, shellEval } from './run.ts';
import { isInstalled } from './software.ts';

export const scriptDir = memoize(() => dirname(fromFileUrl(import.meta.url)));
export const homeDir = memoize(() => os.homeDir() ?? '');
export const downloadDir = memoize(() => join(homeDir(), 'Downloads'));
export const platform = memoize(() => os.platform());
export const isMac = memoize(() => platform() === 'darwin');
export const isLinux = memoize(() => platform() === 'linux');
export const isWsl = memoize(() => Deno.env.get('IS_WSL') !== '');

export const linuxThirdPartyPackageManager = memoize(async () => {
  if (!isLinux()) {
    return undefined;
  } else if (await isInstalled('dpkg')) {
    return 'dpkg';
  } else if (await isInstalled('eopkg')) {
    return 'eopkg';
  } else {
    return undefined;
  }
});

export const linuxPackageManager = memoize(async () => {
  if (!isLinux()) {
    return undefined;
  } else if (await isInstalled('apt')) {
    return 'apt';
  } else if (await isInstalled('eopkg')) {
    return 'eopkg';
  } else {
    return undefined;
  }
});

export const isGnome = memoize(async () => {
  if (!isLinux) {
    return false;
  }
  try {
    const result = await runPiped(shellEval('pgrep gnome-shell'));
    return result.status.success;
  } catch (_) {
    return false;
  }
});

type Memoizer<T> = { memoizedValue?: T } & (() => T);

function memoize<T>(loader: () => T): Memoizer<T> {
  const fn: Memoizer<T> = () => {
    if (fn.memoizedValue != null) {
      return fn.memoizedValue;
    }
    const value = loader();
    fn.memoizedValue = value;
    return value;
  };
  return fn;
}
