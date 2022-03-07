export interface CommandSoftware {
  name: string;
  commandName: string;
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
export interface PassiveSoftware {
  name: string;
  litmusFile: string;
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
  commandName: string;
  brewPackage?: HomebrewPackage;
  snapPackage?: SnapPackage;
  flatpakPackage?: FlatpakPackage;
  eopkgThirdParty?: EopkgThirdParty;
  dpkgThirdParty?: string;
  tarballPackage?: TarballPackage;
  postInstall?: () => Promise<void>;
}
export type NonUiSoftware = CommandSoftware | PassiveSoftware;
export type Software = NonUiSoftware | UiSoftware;
export type AnySoftware = Partial<CommandSoftware> & Partial<PassiveSoftware>;

export interface HomebrewShellPackage {
  taps?: string[];
  package: string;
  macOnly: boolean;
}
export interface HomebrewCask {
  taps?: string[];
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

export interface ProcessResult {
  status: Deno.ProcessStatus;
  stdout: string;
  stderr: string;
}
