import { basename, extname, join } from 'https://deno.land/std@0.128.0/path/mod.ts';
import { ensureDir } from 'https://deno.land/std@0.128.0/fs/mod.ts';
import {
  downloadDir,
  isLinux,
  isMac,
  isWsl,
  linuxPackageManager,
  linuxThirdPartyPackageManager,
} from './environment.ts';
import { run, shellEval } from './run.ts';
import { hasKey, isCask, Software } from './types.ts';

export async function install(software: Software): Promise<void> {
  if (isMac()) {
    await installMac(software);
  } else if (isLinux()) {
    await installLinux(software, isWsl());
  } else {
    throw new Error('I don\'t know your operating system.');
  }
  if (software.postInstall != null) {
    software.postInstall();
  }
}

async function installMac(software: Software): Promise<void> {
  if (software.brewPackage != null) {
    if (software.brewPackage.tap != null) {
      await run(['brew', 'tap', software.brewPackage.tap]);
    }
    const cmd = ['brew', 'install'];
    if (isCask(software.brewPackage)) {
      cmd.push('--cask', software.brewPackage.cask);
    } else {
      cmd.push(software.brewPackage.package);
    }
    await run(cmd);
  } else if (hasKey(software, 'macManualInstallCommand')) {
    await run(shellEval(software.macManualInstallCommand));
  } else {
    throw new Error(`No installation method for ${software.name} on macOS.`);
  }
}

async function installLinux(software: Software, isWsl: boolean): Promise<void> {
  if (software.brewPackage != null && !software.brewPackage.macOnly) {
    if (software.brewPackage.tap != null) {
      await run(['brew', 'tap', software.brewPackage.tap]);
    }
    await run(['brew', 'install', software.brewPackage.package]);
  } else if (software.snapPackage != null) {
    const pkgArgs = [software.snapPackage.package];
    if (software.snapPackage.classic === true) {
      pkgArgs.push('--classic');
    }
    await run(['sudo', 'snap', 'install', ...pkgArgs]);
  } else if (software.flatpakPackage != null) {
    const command = ['sudo', 'flatpak', 'install'];
    if (software.flatpakPackage.remote != null) {
      command.push(software.flatpakPackage.remote);
    }
    await run([...command, software.flatpakPackage.package]);
  } else if (await installLinuxThirdPartyPackage(software)) {
    return; // If it succeeded, we're good!
  } else if (await installLinuxOpenPackage(software, isWsl)) {
    return; // If it succeeded, we're good!
  } else {
    throw new Error(`No installation method for ${software.name}.`);
  }
}

async function downloadFile(fileUrl: string): Promise<string> {
  const baseFileName = basename(fileUrl);
  const downloads = downloadDir();
  const localFilePath = join(downloads, baseFileName);
  await ensureDir(downloads);
  await run(['wget', fileUrl, '-o', localFilePath]);
  return localFilePath;
}

async function extractTarball(filePath: string): Promise<string> {
  const extension = extname(filePath);
  const extractDir = filePath.substring(0, filePath.length - extension.length);
  await ensureDir(extractDir);
  await run(['tar', 'zxf', filePath, `--directory=${extractDir}`]);
  return extractDir;
}

async function installLinuxThirdPartyPackage(software: Software): Promise<boolean> {
  const thirdPartyManager = await linuxThirdPartyPackageManager();
  if (thirdPartyManager === 'dpkg' && software.dpkgThirdParty != null) {
    const localFilePath = await downloadFile(software.dpkgThirdParty);
    await run(['sudo', 'dpkg', '-i', localFilePath]);
    return true;
  } else if (thirdPartyManager === 'eopkg' && software.eopkgThirdParty != null) {
    await run(['sudo', 'eopkg', 'bi', '--ignore-safety', software.eopkgThirdParty.specUrl]);
    await run(['sudo', 'eopkg', 'it', software.eopkgThirdParty.packageFilePattern]);
    await run(['sudo', 'rm', software.eopkgThirdParty.packageFilePattern]);
    return true;
  } else {
    return false;
  }
}

async function installLinuxOpenPackage(software: Software, isWsl: boolean): Promise<boolean> {
  const packageManager = await linuxPackageManager();
  if (packageManager != null && hasKey(software, 'linuxPackages')) {
    await run(['sudo', packageManager, 'install', ...software.linuxPackages]);
    return true;
  } else if (software.tarballPackage != null) {
    const localFilePath = await downloadFile(software.tarballPackage.packageUrl);
    const extractDir = await extractTarball(localFilePath);
    await software.tarballPackage.installer(extractDir);
    return true;
  } else if (isWsl && hasKey(software, 'wslManualInstallCommand')) {
    await run(shellEval(software.wslManualInstallCommand));
    return true;
  } else if (hasKey(software, 'linuxManualInstallCommand')) {
    await run(shellEval(software.linuxManualInstallCommand));
    return true;
  } else {
    return false;
  }
}
