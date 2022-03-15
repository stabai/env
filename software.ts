import { join } from 'https://deno.land/std@0.128.0/path/mod.ts';
import { homeDir, isGnome, linuxPackageManager, scriptDir } from './environment.ts';
import { expandPath, run, runPiped, shellEval } from './run.ts';
import { hasKey, NonUiSoftware, Software, UiSoftware } from './types.ts';

export const nonUiSoftware: NonUiSoftware[] = [
  {
    name: 'Zsh',
    platforms: ['darwin', 'linux'],
    preferIsolatedInstall: true,
    installationChecker: { commands: ['zsh'] },
    brewPackage: { package: 'zsh', macOnly: true },
    linuxPackages: ['zsh'],
  },
  {
    name: 'Oh My Zsh',
    platforms: ['darwin', 'linux'],
    preferIsolatedInstall: true,
    installationChecker: { files: ['~/.oh-my-zsh'] },
    macManualInstallCommand: 'sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
    linuxManualInstallCommand: 'sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
    postInstall: async () => {
      await Deno.symlink(Deno.env.get('ZSH')!, '.zsh', { type: 'dir' });
      await Deno.symlink(join(homeDir(), '.zshrc'), '.zshrc', { type: 'file' });
      console.log(
        `
ℹ️ Make sure to update your ~/.zshrc file. You probably want:
   - ZSH_THEME="st-magic"
   - ZSH_CUSTOM="${scriptDir}/zsh_custom"
   - plugins=(git bazel deno docker copypath minikube thefuck urltools yarn)
`,
      );
    },
  },
  {
    name: 'Snap',
    platforms: ['linux'],
    preferIsolatedInstall: true,
    installationChecker: { commands: ['snap'] },
    linuxPackages: ['snapd'],
  },
  {
    name: 'Flatpak',
    platforms: ['linux'],
    preferIsolatedInstall: true,
    installationChecker: { commands: ['flatpak'] },
    linuxPackages: ['flatpak'],
    postInstall: async () => {
      await run([
        'flatpak',
        'remote-add',
        '--if-not-exists',
        'flathub',
        'https://flathub.org/repo/flathub.flatpakrepo',
      ]);
      const packageManager = await linuxPackageManager();
      if (await isGnome() && packageManager != null) {
        await run(['sudo', packageManager, 'install', 'gnome-software-plugin-flatpak']);
      }
    },
  },
  {
    name: 'Nix',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['nix-shell'] },
    macManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install)',
    linuxManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install) --daemon',
    wslManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install) --no-daemon',
  },
];

export const uiSoftware: UiSoftware[] = [
  {
    name: 'Google Chrome',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['google-chrome', 'google-chrome-stable'] },
    brewPackage: { cask: 'google-chrome', macOnly: true },
    dpkgThirdParty: 'https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb',
    eopkgThirdParty: {
      specUrl:
        'https://raw.githubusercontent.com/getsolus/3rd-party/master/network/web/browser/google-chrome-stable/pspec.xml',
      packageFilePattern: 'google-chrome-*.eopkg',
    },
  },
  {
    name: 'Visual Studio Code',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['code', 'code-oss'] },
    brewPackage: { cask: 'visual-studio-code', macOnly: true },
    linuxPackages: ['vscode'],
    snapPackage: { package: 'code', classic: true },
  },
  {
    name: 'JetBrains Toolbox',
    platforms: ['darwin', 'linux'],
    installationChecker: {
      files: [
        '~/.local/share/JetBrains/Toolbox/bin/jetbrains-toolbox',
        '~/Library/Application Support/JetBrains/Toolbox/apps',
      ],
    },
    brewPackage: { cask: 'jetbrains-toolbox', macOnly: true },
    tarballPackage: {
      packageUrl: 'https://download.jetbrains.com/toolbox/jetbrains-toolbox-1.22.10970.tar.gz',
      installer: async (extractedDir) => {
        await run([`${extractedDir}/jetbrains-toolbox-1.22.10970/jetbrains-toolbox`]);
      },
    },
  },
  {
    name: 'Zoom',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['zoom', 'zoom-client'] },
    brewPackage: { cask: 'zoom', macOnly: true },
    snapPackage: { package: 'zoom-client' },
  },
  {
    name: 'Slack',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['slack'] },
    linuxPackages: ['slack-desktop'],
    brewPackage: { cask: 'slack', macOnly: true },
    snapPackage: { package: 'slack', classic: true },
  },
  {
    name: 'Discord',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['discord'] },
    linuxPackages: ['discord'],
    brewPackage: { cask: 'discord', macOnly: true },
    snapPackage: { package: 'discord' },
  },
  {
    name: 'Lunatask',
    platforms: ['linux'],
    snapPackage: { package: 'lunatask' },
  },
  {
    name: 'Insomnia',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['insomnia'] },
    linuxPackages: ['insomnia'],
    brewPackage: { cask: 'insomnia', macOnly: true },
    snapPackage: { package: 'insomnia' },
  },
  {
    name: 'GitHub CLI',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['gh'] },
    brewPackage: { package: 'gh', macOnly: false },

  },
  {
    name: 'GitHub Desktop',
    platforms: ['darwin', 'linux'],
    installationChecker: { commands: ['github'] },
    brewPackage: { cask: 'github', macOnly: true },
    flatpakPackage: { remote: 'flathub', package: 'io.github.shiftey.Desktop' },
  },
  {
    name: 'Karabiner-Elements',
    platforms: ['darwin'],
    brewPackage: { cask: 'karabiner-elements', macOnly: true },
    postInstall: () => {
      console.log(
        `
ℹ️ Make sure to symlink your config to the included file:
    rm ~/.config/karabiner; ln ${scriptDir}/configs/karabiner.json ~/.config/karabiner
`,
      );
      return Promise.resolve();
    },
  },
  {
    name: 'Alfred',
    platforms: ['darwin'],
    brewPackage: { cask: 'alfred', macOnly: true },
  },
  {
    name: 'AltTab',
    platforms: ['darwin'],
    brewPackage: { cask: 'alt-tab', macOnly: true },
  },
  {
    name: 'DevToys',
    platforms: ['darwin'],
    brewPackage: { cask: 'devtoys', macOnly: true },
  },
  {
    name: 'iTerm',
    platforms: ['darwin'],
    brewPackage: { cask: 'iterm2', macOnly: true },
    postInstall: () => {
      console.log(
        `
ℹ️ Make sure to import the key map profile config from the included file:
    ${scriptDir}/configs/default_profile.itermkeymap
`,
      );
      return Promise.resolve();
    },
  },
];

export function idify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function allSoftwareIds(): string[] {
  const ids = new Array<string>();
  ids.push(...nonUiSoftware.map((sw) => idify(sw.name)));
  ids.push(...uiSoftware.map((sw) => idify(sw.name)));
  return ids;
}

export async function isInstalled(software: Software | string): Promise<boolean> {
  try {
    const promises = new Array<Promise<unknown>>();
    if (typeof software === 'string') {
      const result = await runPiped(shellEval(`command -v ${software}`));
      return result.status.success;
    }
    if (hasKey(software.installationChecker, 'commands')) {
      for (const command of software.installationChecker.commands) {
        promises.push(runPiped(shellEval(`command -v ${command}`)));
      }
    }
    if (hasKey(software.installationChecker, 'files')) {
      for (const path of software.installationChecker.files) {
        promises.push(Deno.lstat(expandPath(path)));
      }
    }
    if (hasKey(software.brewPackage, 'package')) {
      promises.push(runPiped(['brew', 'ls', '--formula', software.brewPackage.package]));
    }
    if (hasKey(software.brewPackage, 'cask')) {
      promises.push(runPiped(['brew', 'ls', '--cask', software.brewPackage.cask]));
    }
    if (hasKey(software, 'flatpakPackage')) {
      promises.push(runPiped(['flatpak', 'info', software.flatpakPackage.package]));
    }
    if (hasKey(software, 'snapPackage')) {
      promises.push(runPiped(['snap', 'list', software.snapPackage.package]));
    }
    const settled = await Promise.allSettled(promises);
    return settled.filter(p => p.status === 'fulfilled').length > 0;
  } catch (_) {
    return false;
  }
}
