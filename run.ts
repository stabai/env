import { PipedProcessResult, ProcessResult, UnpipedProcessResult } from "./types.ts";

export function runEval(command: string): Promise<PipedProcessResult> {
  return runPiped(['sh', '-c', command]);
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
  const [stdout, stderr] = await Promise.all([
    proc.output(),
    proc.stderrOutput(),
  ]);
  proc.close();

  const decoder = new TextDecoder();
  const result: PipedProcessResult = { ...unpipedResult, stdout: decoder.decode(stdout), stderr: decoder.decode(stderr) };
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
    super(`Process exited with return code of: ${result.status.code}`);
  }
}

