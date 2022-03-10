import { homeDir } from "./environment.ts";
import { hasKey, PipedProcessResult, ProcessResult, UnpipedProcessResult } from './types.ts';

export function shellEval(command: string): string[] {
  return [Deno.env.get('SHELL') ?? 'sh', '-c', command];
}

export function run(command: string[]): Promise<UnpipedProcessResult> {
  const proc = Deno.run({ cmd: command });
  return finishUnpipedProcess(proc);
}

export function runPiped(command: string[]): Promise<PipedProcessResult> {
  const proc = Deno.run({ cmd: command, stdout: 'piped', stderr: 'piped' });
  return finishPipedProcess(proc);
}

async function finishPipedProcess(proc: Deno.Process): Promise<PipedProcessResult> {
  const unpipedResult = await finishProcessStatus(proc);
  const stdout = await proc.output();
  const stderr = await proc.stderrOutput();

  const decoder = new TextDecoder();
  const result: PipedProcessResult = {
    ...unpipedResult,
    stdout: decoder.decode(stdout),
    stderr: decoder.decode(stderr),
  };
  proc.close();

  if (result.status.success) {
    return result;
  } else {
    throw new ProcessError(result);
  }
}

async function finishUnpipedProcess(proc: Deno.Process): Promise<UnpipedProcessResult> {
  const result = await finishProcessStatus(proc);
  proc.close();

  if (result.status.success) {
    return result;
  } else {
    throw new ProcessError(result);
  }
}

async function finishProcessStatus(proc: Deno.Process): Promise<UnpipedProcessResult> {
  const status = await proc.status();
  return { status };
}

export class ProcessError extends Error {
  constructor(readonly result: ProcessResult) {
    super(`Process exited with return code of: ${result.status.code}` + ProcessError.summarize(result));
  }
  private static summarize(result: ProcessResult): string {
    if (!hasKey(result, 'stdout')) {
      return '';
    }
    let message = '';
    if (result.stderr.length > 0) {
      message += '\n' + result.stderr;
    }
    if (result.stdout.length > 0) {
      message += '\n' + result.stdout;
    }
    return message;
  }
}

export function expandPath(path: string) {
  if (path.startsWith('~/')) {
    return homeDir() + path.substring(1);
  } else {
    return path;
  }
}