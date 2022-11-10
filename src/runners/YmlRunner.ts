import * as yml from 'yamljs'
import { TCodeType } from '../interfaces/TCodeType';
import { ModelRunner } from './generic/ModelRunner';
import { IRunner, TRunData } from './IRunner';

export class YmlRunner extends ModelRunner {

    type = 'json' as TCodeType;
    extensions = [ 'yml', 'yaml' ];

    async run(data: TRunData): Promise<any> {
        data.content = data.content.replace(/\t/g, '  ');

        let json = yml.parse(data.content);
        return { result: json, logs: [] };
    }

}

