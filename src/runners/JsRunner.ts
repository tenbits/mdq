import { TCodeType } from '../interfaces/TCodeType';
import { ScriptRunner } from './generic/ScriptRunner';
import { TRunData } from './IRunner';
import * as vm from 'vm'
import { $code } from '../util/code';
import alot from 'alot';
import { run } from 'shellbee';

export class JsRunner extends ScriptRunner {
    type = 'script' as TCodeType;

    extensions = [ 'js', 'javascript' ]


    global = Object.create(global)



    async run(data: TRunData): Promise<any> {

        let code = `
            ${data.content}
        `;

        let script = new vm.Script(code, { filename: data.ctx.filename });

        Object.assign(this.global, data.env);

        const $console = new Console();
        this.global.console = $console;

        await this.ensureDependencies($console, code);

        let $ctx = vm.createContext(this.global);
        $ctx.env = process.env;

        let result = script.runInContext($ctx);
        if (result && typeof result.then === 'function') {
            result = await result;
        }

        return {
            result: result,
            logs: $console.logs
        };
    }

    private async ensureDependencies ($console: Console, code: string) {
        let modules = $code.extractDependencies(code);
        let notResolved = await alot(modules)
            .filterAsync(async name => {

                try {
                    require(name);
                    // exists
                    return false;
                } catch (error) { }

                try {
                    await import(name);
                    // exists
                    return false;
                } catch (error) { }

                return true;
            })
            .toArrayAsync({ threads: 1});

        if (notResolved.length === 0) {
            return;
        }

        let modulesToInstall = notResolved.join(' ');

        $console.log(`Installing ${modulesToInstall}`);
        await run(`npm i ${modulesToInstall}`);
    }
}


class Console {
    logs = [] as string[]

    log (...args) {
        this.logs.push(args.join(' '));
    }
    warn (...args) {
        this.logs.push(args.join(' '));
    }
    error (...args) {
        this.logs.push(args.join(' '));
    }
}
