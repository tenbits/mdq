import { TCodeType } from '../../interfaces/TCodeType';
import { str_interpolate } from '../../util/string';
import { IRunner, IRunnerCtx, TRunData } from '../IRunner';

export abstract class ScriptRunner implements IRunner {
    abstract type: TCodeType;
    abstract extensions: string[];

    async preRun(data: TRunData): Promise<string> {
        let str = data.content;

        data.content = str_interpolate(str, data.env, data.config);
        return str;
    }
    abstract run(data: TRunData): Promise<any>

    async postRun(result: any, logs: any, data: TRunData): Promise<any> {
        return null;
    }

}

