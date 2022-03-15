interface CommandChecker {
  commands: string[];
}
interface LitmusFileChecker {
  files: string[];
}
export type InstallationChecker = CommandChecker | LitmusFileChecker;

export type Platform = 'darwin' | 'linux' | 'windows';

export interface Software<T extends HomebrewPackage = HomebrewPackage> {
  name: string;
  platforms: Platform[];
  preferIsolatedInstall?: boolean;
  installationChecker?: InstallationChecker;
  brewPackage?: T;
  snapPackage?: SnapPackage;
  flatpakPackage?: FlatpakPackage;
  eopkgThirdParty?: EopkgThirdParty;
  dpkgThirdParty?: string;
  tarballPackage?: TarballPackage;
  linuxPackages?: string[];
  linuxManualInstallCommand?: string;
  macManualInstallCommand?: string;
  wslManualInstallCommand?: string;
  postInstall?: () => Promise<void>;
}
export type NonUiSoftware = Software<HomebrewBottle>;
export type UiSoftware = Software<HomebrewPackage>;

export interface HomebrewBottle {
  tap?: string;
  package: string;
  macOnly: boolean;
}
export interface HomebrewCask {
  tap?: string;
  cask: string;
  macOnly: true;
}
export type HomebrewPackage = HomebrewBottle | HomebrewCask;

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

export function hasKey<T>(obj: unknown, discriminant: keyof T): obj is T {
  if (obj == null) {
    return false;
  }
  return discriminant in (obj as Record<string, unknown>);
}
