import { isGnome, linuxPackageManager, scriptDir } from "./environment.ts";
import { runEval, finishProcess, run } from "./run.ts";
import { NonUiSoftware, UiSoftware, AnySoftware } from "./types.ts";

export const nonUiSoftware: NonUiSoftware[] = [
  {
    name: 'Zsh',
    commandName: 'zsh',
    brewPackage: { package: 'zsh', macOnly: true },
    linuxPackages: ['zsh'],
  },
  {
    name: 'Oh My Zsh',
    litmusFile: '~/.oh-my-zsh',
    macManualInstallCommand: 'sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
    linuxManualInstallCommand: 'sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"',
    postInstall: async () => {
      await Deno.symlink('$ZSH', '.zsh', { type: 'dir' });
      await Deno.symlink('~/.zshrc', '.zshrc', { type: 'file' });
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
    commandName: 'snap',
    linuxPackages: ['snapd'],
  },
  {
    name: 'Flatpak',
    commandName: 'flatpak',
    linuxPackages: ['flatpak'],
    postInstall: async () => {
      await runEval('flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo');
      if (await isGnome() && linuxPackageManager != null) {
        await run(['sudo', linuxPackageManager, 'install', 'gnome-software-plugin-flatpak']);
      }
    },
  },
  {
    name: 'Nix',
    commandName: 'nix-shell',
    macManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install)',
    linuxManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install) --daemon',
    wslManualInstallCommand: 'sh <(curl -L https://nixos.org/nix/install) --no-daemon',
  },
];

export const uiSoftware: UiSoftware[] = [
  {
    name: 'Chrome',
    commandName: 'google-chrome',
    brewPackage: { cask: 'google-chrome', macOnly: true },
    dpkgThirdParty: 'https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb',
    eopkgThirdParty: {
      specUrl: 'https://raw.githubusercontent.com/getsolus/3rd-party/master/network/web/browser/google-chrome-stable/pspec.xml',
      packageFilePattern: 'google-chrome-*.eopkg',
    },
  },
  {
    name: 'Visual Studio Code',
    commandName: 'code',
    brewPackage: { cask: 'visual-studio-code', macOnly: true },
    snapPackage: { package: 'code', classic: true },
  },
  {
    name: 'Zoom',
    commandName: 'zoom',
    brewPackage: { cask: 'zoom', macOnly: true },
    snapPackage: { package: 'zoom-client' },
  },
  {
    name: 'Slack',
    commandName: 'slack',
    brewPackage: { cask: 'slack', macOnly: true },
    snapPackage: { package: 'slack', classic: true },
  },
  {
    name: 'Discord',
    commandName: 'discord',
    brewPackage: { cask: 'discord', macOnly: true },
    snapPackage: { package: 'discord' },
  },
  {
    name: 'Insomnia',
    commandName: 'insomnia',
    brewPackage: { cask: 'insomnia', macOnly: true },
    snapPackage: { package: 'insomnia' },
  },
  {
    name: 'GitHub Desktop',
    commandName: 'insomnia',
    brewPackage: { cask: 'github', macOnly: true },
    flatpakPackage: { remote: 'flathub', package: 'io.github.shiftey.Desktop' },
  },
];

export async function isInstalled(software: AnySoftware | string): Promise<boolean> {
  const ware = typeof software === 'string' ? { name: software, commandName: software } : software;
  if (ware.commandName != null) {
    const proc = Deno.run({ cmd: ['command', '-v', ware.commandName] });
    const result = await finishProcess(proc);
    return result.status.success;
  } else if (ware.litmusFile != null) {
    try {
      await Deno.lstat(ware.litmusFile);
      return true;
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        return false;
      }
      throw err;
    }
  } else {
    throw new Error(`Not sure how to check if ${ware.name} is installed.`);
  }
}
