import { basename, join } from "https://deno.land/std@0.128.0/path/mod.ts";
import { isMac, isLinux, isWsl, linuxThirdPartyPackageManager, homeDir, linuxPackageManager } from "./environment.ts";
import { finishProcess, run } from "./run.ts";
import { isInstalled, nonUiSoftware, uiSoftware } from "./software.ts";
import { AnySoftware, Software, isCask } from "./types.ts";

await main();

async function main(): Promise<void> {
  const hasCurl = await isInstalled('curl');
  if (!hasCurl) {
    throw new Error('curl is not installed.');
  }

  for (const software of nonUiSoftware) {
    const installed = await isInstalled(software);
    if (installed) {
      console.log(`✅ ${software.name} is installed.`);
      console.log();
    } else {
      console.log(`Installing ${software.name}...`);
      await install(software);
      console.log(`✅ ${software.name} was successfully installed.`);
      console.log();
    }
  }

  for (const software of uiSoftware) {
    const installed = await isInstalled(software);
    if (installed) {
      console.log(`✅ ${software.name} is installed.`);
      console.log();
    } else {
      console.log(`Installing ${software.name}...`);
      await install(software);
      console.log(`✅ ${software.name} was successfully installed.`);
      console.log();
    }
  }
  console.log('✅ Done!');
}

async function install(software: Software): Promise<void> {
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
    for (const tap of software.brewPackage.taps ?? []) {
      const proc = Deno.run({ cmd: ['brew', 'tap', tap] });
      await finishProcess(proc);
    }
    const cmd = ['brew', 'install'];
    if (isCask(software.brewPackage)) {
      cmd.push('--cask', software.brewPackage.cask);
    } else {
      cmd.push(software.brewPackage.package);
    }
    const proc = Deno.run({ cmd });
    await finishProcess(proc);
  } else if (software.macManualInstallCommand != null) {
    const proc = Deno.run({ cmd: ['eval', software.macManualInstallCommand] });
    await finishProcess(proc);
  } else {
    throw new Error(`No installation method for ${software.name} on macOS.`);
  }
}

async function installLinux(software: AnySoftware, isWsl: boolean): Promise<void> {
  if (software.brewPackage != null && !software.brewPackage.macOnly) {
    for (const tap of software.brewPackage.taps ?? []) {
      await run(['brew', 'tap', tap]);
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
    const baseFileName = basename(software.dpkgThirdParty);
    const downloadDir = join(homeDir, 'Downloads');
    const localFilePath = join(downloadDir, baseFileName);
    await run(['mkdir', '-p', downloadDir]);
    await run(['wget', software.dpkgThirdParty, '-o', localFilePath]);
    await run(['sudo', 'dpkg', '-i', localFilePath]);
  } else if (linuxThirdPartyPackageManager === 'eopkg' && software.eopkgThirdParty != null) {
    await run(['sudo', 'eopkg', 'bi', '--ignore-safety', software.eopkgThirdParty.specUrl]);
    await run(['sudo', 'eopkg', 'it', software.eopkgThirdParty.packageFilePattern]);
    await run(['sudo', 'rm', software.eopkgThirdParty.packageFilePattern]);
  } else if (linuxPackageManager != null && software.linuxPackages != null) {
    await run(['sudo', linuxPackageManager, 'install', ...software.linuxPackages]);
  } else if (isWsl && software.wslManualInstallCommand != null) {
    await run(['eval', software.wslManualInstallCommand]);
  } else if (software.linuxManualInstallCommand != null) {
    await run(['eval', software.linuxManualInstallCommand]);
  } else {
    throw new Error(`No installation method for ${software.name}.`);
  }
}
