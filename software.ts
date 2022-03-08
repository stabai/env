import { join } from "https://deno.land/std@0.128.0/path/mod.ts";
import { homeDir, isGnome, linuxPackageManager, scriptDir } from "./environment.ts";
import { runEval, run } from "./run.ts";
import { NonUiSoftware, UiSoftware, AnySoftware, ProcessResult } from "./types.ts";

export const nonUiSoftware: NonUiSoftware[] = [
  {
    name: 'Zsh',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'zsh' },
    brewPackage: { package: 'zsh', macOnly: true },
    linuxPackages: ['zsh'],
  },
  {
    name: 'Oh My Zsh',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { litmusFiles: ['~/.oh-my-zsh'] },
    macManualInstallCommand: 'sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
    linuxManualInstallCommand: 'sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
    postInstall: async () => {
      await Deno.symlink(Deno.env.get('ZSH')!, '.zsh', { type: 'dir' });
      await Deno.symlink(join(homeDir, '.zshrc'), '.zshrc', { type: 'file' });
      console.log(
        `
ℹ️ Make sure to update your ~/.zshrc file. You probably want:
   - ZSH_THEME="st-magic"
   - ZSH_CUSTOM="${scriptDir}/zsh_custom"
   - plugins=(git bazel deno docker copydir minikube thefuck urltools yarn)
`
      );
    },
  },
  {
    name: 'Snap',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'snap' },
    linuxPackages: ['snapd'],
  },
  {
    name: 'Flatpak',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'flatpak' },
    linuxPackages: ['flatpak'],
    postInstall: async () => {
      await run(['flatpak', 'remote-add', '--if-not-exists', 'flathub', 'https://flathub.org/repo/flathub.flatpakrepo']);
      if (await isGnome() && linuxPackageManager != null) {
        await run(['sudo', linuxPackageManager, 'install', 'gnome-software-plugin-flatpak']);
      }
    },
  },
  {
    name: 'Nix',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'nix-shell' },
    macManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install)',
    linuxManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install) --daemon',
    wslManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install) --no-daemon',
  },
];

export const uiSoftware: UiSoftware[] = [
  {
    name: 'Google Chrome',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'google-chrome' },
    brewPackage: { cask: 'google-chrome', macOnly: true },
    dpkgThirdParty: 'https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb',
    eopkgThirdParty: {
      specUrl: 'https://raw.githubusercontent.com/getsolus/3rd-party/master/network/web/browser/google-chrome-stable/pspec.xml',
      packageFilePattern: 'google-chrome-*.eopkg',
    },
  },
  {
    name: 'Visual Studio Code',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'code' },
    brewPackage: { cask: 'visual-studio-code', macOnly: true },
    snapPackage: { package: 'code', classic: true },
  },
  {
    name: 'JetBrains Toolbox',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: {
      litmusFiles: [
        '~/.local/share/JetBrains/Toolbox/bin/jetbrains-toolbox',
        '~/Library/Application Support/JetBrains/Toolbox/apps',
      ]
    },
    brewPackage: { cask: 'jetbrains-toolbox', macOnly: true },
    tarballPackage: {
      packageUrl: 'https://download.jetbrains.com/toolbox/jetbrains-toolbox-1.22.10970.tar.gz',
      installer: async extractedDir => {
        await run([`${extractedDir}/jetbrains-toolbox`]);
      },
    },
  },
  {
    name: 'Zoom',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'zoom' },
    brewPackage: { cask: 'zoom', macOnly: true },
    snapPackage: { package: 'zoom-client' },
  },
  {
    name: 'Slack',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'slack' },
    brewPackage: { cask: 'slack', macOnly: true },
    snapPackage: { package: 'slack', classic: true },
  },
  {
    name: 'Discord',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'discord' },
    brewPackage: { cask: 'discord', macOnly: true },
    snapPackage: { package: 'discord' },
  },
  {
    name: 'Insomnia',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'insomnia' },
    brewPackage: { cask: 'insomnia', macOnly: true },
    snapPackage: { package: 'insomnia' },
  },
  {
    name: 'GitHub Desktop',
    platforms: ['darwin', 'linux-gnu'],
    installationChecker: { commandName: 'insomnia' },
    brewPackage: { cask: 'github', macOnly: true },
    flatpakPackage: { remote: 'flathub', package: 'io.github.shiftey.Desktop' },
  },
  {
    name: 'Karabiner-Elements',
    platforms: ['darwin'],
    installationChecker: { commandName: 'Karabiner-Elements' },
    brewPackage: { cask: 'karabiner-elements', macOnly: true },
  },
];

export function idify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function allSoftwareIds(): string[] {
  const ids = new Array<string>();
  ids.push(...nonUiSoftware.map(sw => idify(sw.name)));
  ids.push(...uiSoftware.map(sw => idify(sw.name)));
  return ids;
}

export async function isInstalled(software: AnySoftware | string): Promise<boolean> {
  try {
    if (typeof software === 'string') {
      const result = await runEval(`command -v ${software}`);
      return result.status.success;
    } else if (software.installationChecker.commandName != null) {
      const result = await runEval(`command -v ${software.installationChecker.commandName}`);
      return result.status.success;
    } else if (software.installationChecker.litmusFiles != null) {
      const promises = new Array<Promise<ProcessResult>>();
      for (const path of software.installationChecker.litmusFiles) {
        promises.push(runEval(`test -d ${path} -o -f ${path}`));
      }
      await Promise.any(promises);
      return true;
    }
  } catch (err) {
    console.log(err);
    if (err instanceof Deno.errors.NotFound) {
      return false;
    }
    throw err;
  }
  throw new Error(`Not sure how to check if ${software.name} is installed.`);
}
