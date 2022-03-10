#!/usr/bin/env -S deno run --allow-all --allow-run --allow-env --unstable

import { basename } from 'https://deno.land/std@0.128.0/path/mod.ts';
import yargs from 'https://deno.land/x/yargs@v17.3.1-deno/deno.ts';
// @deno-types="https://deno.land/x/chalk_deno@v4.1.1-deno/index.d.ts"
import chalk from 'https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js';
import { allSoftwareIds, idify, isInstalled, nonUiSoftware, uiSoftware } from './software.ts';
import { CommandYargs, NamedArgs, Software } from './types.ts';
import { platform } from './environment.ts';
import { install } from './installers.ts';

if (!(await isInstalled('curl'))) {
  throw new Error('curl is not installed.');
}

yargs(Deno.args)
  .scriptName('./' + basename(import.meta.url))
  .command('$0 [software...]', 'Installs software for use in this dev environment.', (yargs: CommandYargs) => {
    return yargs
      .positional('software', {
        describe: 'software packages to install',
        array: true,
        options: allSoftwareIds(),
      })
      .option('dryrun', {
        alias: 'check',
        type: 'boolean',
        description: 'show work that would have been done, but don\'t make changes',
        default: false,
      })
      .option('force', {
        alias: 'f',
        type: 'boolean',
        description: 'reinstall software if already installed',
        default: false,
      });
  }, function (argv: NamedArgs) {
    doInstall({
      dryRun: argv.dryrun,
      softwareIds: argv.software,
      force: argv.force,
    });
  })
  .command('list [software...]', 'Lists software that can be installed by this script.', (yargs: CommandYargs) => {
    return yargs
      .positional('software', {
        describe: 'packages to include in filtered list',
        array: true,
        options: allSoftwareIds(),
      }).option('uninstallable', {
        alias: 'u',
        type: 'boolean',
        description: 'show packages that are uninstallable on platform',
        default: false,
      });
  }, function (argv: NamedArgs) {
    doList({
      softwareIds: argv.software,
      uninstallable: argv.uninstallable,
    });
  })
  .default('software', undefined, 'all')
  .help()
  .parse();

function findSoftwareToInstall(softwareIds: string[], uninstallable = false): Software[] {
  const matchingPlatform = uninstallable ? () => true : (sw: Software) => sw.platforms.includes(platform());
  const matchingFilter = softwareIds.length === 0 ? () => true : (sw: Software) => softwareIds.includes(idify(sw.name));
  const shouldBeInstalled = (sw: Software) => matchingPlatform(sw) && matchingFilter(sw);
  return [...nonUiSoftware.filter(shouldBeInstalled), ...uiSoftware.filter(shouldBeInstalled)];
}

async function doList(options: { softwareIds: string[]; uninstallable: boolean }) {
  const softwareToInstall = findSoftwareToInstall(options.softwareIds ?? [], options.uninstallable ?? false);
  const titles = await Promise.all(softwareToInstall.map(async (sw) => {
    const installed = await isInstalled(sw);
    const icon = installed ? '✅' : '❌';
    return `${icon}  ${idify(sw.name)}`;
  }));
  console.log(titles.join('\n'));
}

async function doInstall(options: { dryRun: boolean; softwareIds: string[]; force: boolean }): Promise<void> {
  const softwareToInstall = findSoftwareToInstall(options.softwareIds ?? []);

  for (const software of softwareToInstall) {
    const installed = await isInstalled(software);
    if (installed && !options.force) {
      console.log(`✔️  ${software.name} is already installed.`);
      console.log();
    } else {
      console.log(chalk.bgCyan.whiteBright.bold(`Installing ${software.name}...`));
      if (options.dryRun) {
        console.log('Installation skipped for dry run. Pretending it succeeded.');
      } else {
        await install(software);
      }
      console.log(`✅ ${software.name} was successfully installed!`);
      console.log();
    }
  }
  console.log('✅ Done!');
}
