import { IBlock, ICodeBlock } from './interfaces/IBlock';
import AppCfg from 'appcfg'
import { File } from 'atma-io';
import { JsonRunner } from './runners/JsonRunner';
import { YmlRunner } from './runners/YmlRunner';
import { IRunner, IRunnerCtx } from './runners/IRunner';
import { ShellRunner } from './runners/ShellRunner';
import { JsRunner } from './runners/JsRunner';
import { MdParser } from './parsers/MdParser';


export class Runner {

    ctx: IRunnerCtx = {}

    async config () {
        return await AppCfg.fetch([
            {
                dotenv: true
            }
        ]);
    }

    async runFromCli () {
        let config = await this.config();
        let [ path ] = config.$cli.args;
        if (path == null || path === '') {
            throw new Error(`Markdown file not provided. Example: "mdrun foo.md"`);
        }
        let sections = [] as string[];
        let run = config.$cli.params.run;
        if (run) {
            sections = run.split(/[;,]/g).map(x => x.trim());
        }

        await this.executeFile(path, {
            sections,
            onLog: (log) => {
                console.log(log);
            }
        });
    }

    async executeFile(path: string, opts?: { onLog, sections?: string[] }) {
        let file = new File(path);
        if (await file.existsAsync() === false) {
            throw new Error(`File "${file.uri.toLocalFile()}" not found`);
        }
        let md = await file.readAsync<string>();

        let parser = new MdParser();
        let blocks = parser.split(md);

        if (opts?.sections && opts?.sections.length > 0) {
            let labels = opts.sections;
            for (let i = 0; i < blocks.length; i++) {
                let block = blocks[i];
                if (block.type !== 'h1') {
                    continue;
                }

                let name = block.content.trim();
                let allowed = labels.includes(name);
                if (allowed === false) {

                    let nextH1 = blocks.findIndex(x => x.type === 'h1', i + 1);

                    blocks.splice(i, nextH1 - i);
                    i -= 1;
                }
            }
        }

        this.ctx.filename = file.uri.toLocalFile();
        return await this.executeBlocks(blocks, opts);
    }

    async executeBlocks(blocks: IBlock[], opts?: { onLog }) {
        let config = await this.config();
        let env = config.toJSON();


        let executables = blocks.filter(x => x.type === 'code') as ICodeBlock[];
        let logEntries = [];
        for (let i = 0; i < executables.length; i++) {
            let block = executables[i];
            let { lang, content } = block;

            let runner = CodeRunner.get(lang);
            let data = {
                content,
                env,
                config,
                ctx: this.ctx
            };
            let startedAt = Date.now();

            await runner.preRun(data);
            let { result, logs } = await runner.run(data, opts);
            await runner.postRun(result, logs, data);

            logEntries.push({
                teaser: `Block (${lang}) #${i + 1}/${executables.length}; Time: ${ Date.now() - startedAt }ms.`,
                start: startedAt,
                end: Date.now(),

                block: i,
                result: result,
                logs: logs ?? [],
            });
        }

        return logEntries;
    }
}


namespace CodeRunner {

    const runners = [
        new JsonRunner(),
        new YmlRunner(),
        new JsRunner(),
        new ShellRunner(),
    ] as IRunner[];
    export function get (lang: string) {
        let runner = runners.find(runner => runner.extensions.includes(lang));
        return runner;
    }
}
