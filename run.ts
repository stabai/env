import { ProcessResult } from "./types.ts";

export function runEval(command: string): Promise<ProcessResult> {
  return run(['eval', command]);
}

export function run(command: string[]): Promise<ProcessResult> {
  const proc = Deno.run({ cmd: command });
  return finishProcess(proc);
}

export async function finishProcess(proc: Deno.Process): Promise<ProcessResult> {
  const [status, stdout, stderr] = await Promise.all([
    proc.status(),
    proc.output(),
    proc.stderrOutput()
  ]);
  proc.close();
  const decoder = new TextDecoder();
  const result: ProcessResult = { status, stdout: decoder.decode(stdout), stderr: decoder.decode(stderr) };
  if (status.success) {
    return result;
  } else {
    throw new ProcessError(result);
  }
}

class ProcessError extends Error {
  constructor(readonly result: ProcessResult) {
    super('Process exited unsuccessfully.');
  }
}

