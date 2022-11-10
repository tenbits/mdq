import { TCodeType } from '../interfaces/TCodeType'
import { ScriptRunner } from './generic/ScriptRunner'
import { TRunData } from './IRunner'
import { Shell, run } from 'shellbee'
import { Ssh } from 'sshly'
import alot from 'alot'

export class ShellRunner extends ScriptRunner {
    type = 'shell' as TCodeType
    extensions = ['sh', 'bash', 'shell' ]

    async run (data: TRunData, opts?: { onLog }) {
        const { content, env, config } = data;
        const commands = Script.splitCommands(Script.splitLines(content));

        if (env.ssh) {
            return Runner.ssh(commands, {
                ssh: env.ssh,
                ...(opts ?? {}),
            });
        }

        return Runner.local(commands, opts);
    }
}

namespace Runner {
    export async function local (commands: string[], opts: { onLog }) {
        let results = await alot(commands).mapAsync(async command => {
            let start = Date.now();
            let shell = new Shell({
                command,
                silent: true,
            });

            opts?.onLog?.(`Execute shell-command: ${/[^\n]+/.exec(command)[0]}`);
            shell
                .on('process_stdout', data => opts?.onLog?.(data.buffer.toString()))
                .on('process_stderr', data => opts?.onLog?.(data.buffer.toString()))
                ;

            let { std, stdout, stderr } = await shell.run();

            return {
                time: Date.now() - start,
                command,
                stdout,
                stderr,
            };
        }).toArrayAsync({ threads: 1 });
        return { logs: results };
    }
    export async function ssh (commands: string[], opts: { ssh, onLog? }) {

        const client = new Ssh({
            ...opts.ssh
        });

        for (let command of commands) {
            opts?.onLog?.(`Execute shell-command: ${/[^\n]+/.exec(command)[0]}`);
            await client.exec(command);
        }
    }
}

namespace Script {
    export function splitLines (script: string): string[] {
        let lines = script.replace(/\r/g, '').split('\n').filter(x => x.length > 0);
        let count = /\s+/.exec(lines[0])[0].length;
        let rgx = new RegExp(`^\\s{0,${count}}`, 'i');

        lines = lines.map(line => line.replace(rgx, ''));
        return lines;
    }
    export function splitCommands (lines: string[]): string[] {
        let commands = [];

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.trim() === '') {
                continue;
            }
            if (line.endsWith('\\')) {
                let j = i + 1;
                for (; j < lines.length; j++) {
                    let line = lines[j];
                    if (line.endsWith('\\')) {
                        continue;
                    }
                    break;
                }
                commands.push(
                    lines.slice(i, j).join('\n')
                );
                i = j - 1;
                continue;
            }
            if (/<<EOT/.test(line)) {
                let j = i + 1;
                for (; j < lines.length; j++) {
                    let line = lines[j];
                    if (/EOT/.test(line) === false) {
                        continue;
                    }
                    break;
                }
                commands.push(
                    lines.slice(i, j + 1).join('\n')
                );
                i = j;
                continue;
            }
            commands.push(line)
        }
        return commands;
    }
}
