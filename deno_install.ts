#!/usr/bin/env -S deno run --allow-all --allow-run --allow-env

import { basename } from "https://deno.land/std@0.128.0/path/mod.ts";
import yargs from "https://deno.land/x/yargs@v17.3.1-deno/deno.ts";
import { platform } from "./environment.ts";
import { allSoftwareIds, idify, isInstalled, nonUiSoftware, uiSoftware } from "./software.ts";
import { Software, NamedArgs, CommandYargs } from "./types.ts";
import { install } from "./installers.ts";

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
      });
  }, function (argv: NamedArgs) {
    doInstall({
      dryRun: argv.dryrun,
      softwareIds: argv.software,
      force: argv.force
    });
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
  })
  .default('software', undefined, 'all')
  .help()
  .parse();

async function doInstall(options: { dryRun: boolean; softwareIds: string[]; force: boolean; }): Promise<void> {
  const softwareIds = options.softwareIds ?? [];
  const matchingPlatform = (software: Software) => software.platforms.includes(platform);
  const shouldBeInstalled =
    softwareIds.length === 0
      ? matchingPlatform
      : (software: Software) => matchingPlatform(software) && options.softwareIds.includes(idify(software.name));

  const softwareToInstall = [...nonUiSoftware, ...uiSoftware].filter(shouldBeInstalled);

  for (const software of softwareToInstall) {
    console.log(software.name);
    const installed = await isInstalled(software);
    if (installed && !options.force) {
      console.log(`✔️  ${software.name} is already installed.`);
      console.log();
    } else {
      console.log(`Installing ${software.name}...`);
      if (options.dryRun) {
        console.log('Installation skipped for dry run. Pretending it succeeded.')
      } else {
        await install(software);
      }
      console.log(`✅ ${software.name} was successfully installed.`);
      console.log();
    }
  }
  console.log('✅ Done!');
}
