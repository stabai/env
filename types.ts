export type InstallationChecker = { commandName: string, litmusFiles?: never } | { litmusFiles: string[], commandName?: never };

export type Platform = 'linux-gnu' | 'darwin';

export interface CommandSoftware {
  name: string;
  platforms: Platform[];
  installationChecker: InstallationChecker;
  brewPackage?: HomebrewPackage;
  macManualInstallCommand?: string;
  snapPackage?: SnapPackage;
  flatpakPackage?: FlatpakPackage;
  eopkgThirdParty?: EopkgThirdParty;
  dpkgThirdParty?: string;
  tarballPackage?: TarballPackage;
  linuxPackages?: string[];
  linuxManualInstallCommand?: string;
  wslManualInstallCommand?: string;
  postInstall?: () => Promise<void>;
}
export interface UiSoftware {
  name: string;
  platforms: Platform[];
  installationChecker: InstallationChecker;
  brewPackage?: HomebrewPackage;
  snapPackage?: SnapPackage;
  flatpakPackage?: FlatpakPackage;
  eopkgThirdParty?: EopkgThirdParty;
  dpkgThirdParty?: string;
  tarballPackage?: TarballPackage;
  postInstall?: () => Promise<void>;
}
export type NonUiSoftware = CommandSoftware;
export type Software = NonUiSoftware | UiSoftware;
export type AnySoftware = UiSoftware & Partial<Omit<CommandSoftware, keyof UiSoftware>>;

export interface HomebrewShellPackage {
  tap?: string;
  package: string;
  macOnly: boolean;
}
export interface HomebrewCask {
  tap?: string;
  cask: string;
  macOnly: true;
}
export type HomebrewPackage = HomebrewShellPackage | HomebrewCask;

export function isCask(pkg: HomebrewPackage): pkg is HomebrewCask {
  return Object.getOwnPropertyNames(pkg).includes('cask');
}

export interface FlatpakPackage {
  remote: string;
  package: string;
}

export interface EopkgThirdParty {
  specUrl: string;
  packageFilePattern: string;
}

export interface SnapPackage {
  package: string;
  classic?: boolean;
}

export interface TarballPackage {
  packageUrl: string;
  installer: (extractedDir: string) => Promise<void>;
}

export interface PipedProcessResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}
export interface UnpipedProcessResult {
  status: Deno.ProcessStatus;
}
export type ProcessResult = PipedProcessResult | UnpipedProcessResult;

// deno-lint-ignore no-explicit-any
export type CommandYargs = any;
// deno-lint-ignore no-explicit-any
export interface NamedArgs extends Record<string, any> {
  _: string[];
  $0: string;
}
