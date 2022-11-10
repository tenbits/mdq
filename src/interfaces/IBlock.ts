import { TBlockType } from './TBlockType';

export interface IBlock {
    type: TBlockType;
    content: string;
}

export interface ICodeBlock extends IBlock {
    type: 'code'
    lang: string
}
