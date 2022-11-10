import { TCodeType } from '../interfaces/TCodeType';
import { ScriptRunner } from './generic/ScriptRunner';
import { TRunData } from './IRunner';
import * as vm from 'vm'

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

        let $ctx = vm.createContext(this.global);
        let result = script.runInContext($ctx);
        if (result && typeof result.then === 'function') {
            result = await result;
        }

        return {
            result: result,
            logs: $console.logs
        };
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
