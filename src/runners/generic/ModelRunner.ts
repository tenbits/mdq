import { TCodeType } from '../../interfaces/TCodeType';
import { obj_deepExtend, obj_interpolate } from '../../util/object';
import { IRunner, IRunnerCtx, TRunData } from '../IRunner';

export abstract class ModelRunner implements IRunner {
    abstract type: TCodeType;
    abstract extensions: string[];

    async preRun(data: TRunData): Promise<string> {
        return data.content;
    }
    abstract run(data: TRunData): Promise<{ result: any, logs: any[] }>

    async postRun(result: any, logs: any, data: TRunData): Promise<any> {
        let json = obj_interpolate(result, data.env, data.config);

        obj_deepExtend(data.env, json);
        return json;
    }

}

