import { TCodeType } from '../interfaces/TCodeType';

export type TRunData = {
    content: string
    env: Record<string, any>
    ctx: IRunnerCtx
    config: any
};

export interface IRunner {
    type: TCodeType
    extensions: string[]


    preRun (data: TRunData): Promise<string>
    run (data: TRunData, opts?: { onLog }): Promise<any>
    postRun(result: any, logs, data: TRunData): Promise<any>
}


export interface IRunnerCtx {
    filename?: string
}
