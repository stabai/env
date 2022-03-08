import { basename, extname, join } from "https://deno.land/std@0.128.0/path/mod.ts";
import { ensureDir } from "https://deno.land/std@0.128.0/fs/mod.ts";
import { isMac, isLinux, isWsl, linuxThirdPartyPackageManager, homeDir, linuxPackageManager } from "./environment.ts";
import { run, runEval } from "./run.ts";
import { AnySoftware, Software, isCask } from "./types.ts";

export async function install(software: Software): Promise<void> {
  if (isMac) {
    await installMac(software);
  } else if (isLinux) {
    await installLinux(software, isWsl);
  } else {
    throw new Error('I don\'t know your operating system.')
  }
  if (software.postInstall != null) {
    software.postInstall();
  }
}

async function installMac(software: AnySoftware): Promise<void> {
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
  } else if (software.macManualInstallCommand != null) {
    await runEval(software.macManualInstallCommand);
  } else {
    throw new Error(`No installation method for ${software.name} on macOS.`);
  }
}

async function installLinux(software: AnySoftware, isWsl: boolean): Promise<void> {
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
  } else if (linuxThirdPartyPackageManager === 'dpkg' && software.dpkgThirdParty != null) {
    const localFilePath = await downloadFile(software.dpkgThirdParty);
    await run(['sudo', 'dpkg', '-i', localFilePath]);
  } else if (linuxThirdPartyPackageManager === 'eopkg' && software.eopkgThirdParty != null) {
    await run(['sudo', 'eopkg', 'bi', '--ignore-safety', software.eopkgThirdParty.specUrl]);
    await run(['sudo', 'eopkg', 'it', software.eopkgThirdParty.packageFilePattern]);
    await run(['sudo', 'rm', software.eopkgThirdParty.packageFilePattern]);
  } else if (linuxPackageManager != null && software.linuxPackages != null) {
    await run(['sudo', linuxPackageManager, 'install', ...software.linuxPackages]);
  } else if (software.tarballPackage != null) {
    const localFilePath = await downloadFile(software.tarballPackage.packageUrl);
    const extractDir = await extractTarball(localFilePath);
    await software.tarballPackage.installer(extractDir);
  } else if (isWsl && software.wslManualInstallCommand != null) {
    await run(['eval', software.wslManualInstallCommand]);
  } else if (software.linuxManualInstallCommand != null) {
    await run(['eval', software.linuxManualInstallCommand]);
  } else {
    throw new Error(`No installation method for ${software.name}.`);
  }
}

async function downloadFile(fileUrl: string): Promise<string> {
  const baseFileName = basename(fileUrl);
  const downloadDir = join(homeDir, 'Downloads');
  const localFilePath = join(downloadDir, baseFileName);
  await ensureDir(downloadDir);
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