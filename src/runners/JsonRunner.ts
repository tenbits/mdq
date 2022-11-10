import { TCodeType } from '../interfaces/TCodeType';
import { ModelRunner } from './generic/ModelRunner';
import { IRunner, TRunData } from './IRunner';

export class JsonRunner extends ModelRunner {

    type = 'json' as TCodeType;
    extensions = [ 'json' ]

    run(data: TRunData): Promise<any> {
        return JSON.parse(data.content);
    }

}

