import { IBlock, ICodeBlock } from '../interfaces/IBlock';
import { TBlockType } from '../interfaces/TBlockType';


export class MdParser {

    // split content into h1, and script blocks
    split (content: string) {

        content = content.replace(/\r/g, '');

        let lines = content.split('\n');
        let blocks = [] as IBlock[];
        let text = [];
        for (let i = 0; i < lines.length; i++) {

            let line = lines[i];
            let type = Lines.type(line);
            if (type === 'text') {
                text.push(line);
                continue;
            }

            Blocks.addText(blocks, text);
            text = [];

            if (type === 'h1') {
                let block = Lines.getSingleLineBlock('h1', lines, i);
                blocks.push(block);
                continue;
            }
            if (type === 'code') {
                let { index, block } = Lines.getCode(lines, i);
                i = index;
                blocks.push(block);
                continue;
            }
        }

        Blocks.addText(blocks, text);
        return blocks;
    }
}

namespace Blocks {
    export function addText(blocks: any[], lines: string[]) {
        if (lines == null || lines.length === 0) {
            return;
        }
        let str = lines.join('\n');
        if (str.trim() === '') {
            return;
        }
        blocks.push({
            type: 'text',
            content: str
        });
    }
}

namespace Lines {
    let h1 = /^\s*#{1}\s*(?<text>[^#].+)$/;
    let code = /^\s*(?<block>`{3,})(?<lang>\w+)\s*$/;
    let rgxes = { 'h1': h1 } as Record<TBlockType, RegExp>;

    export function type (line: string): TBlockType {
        if (h1.test(line)) {
            return 'h1';
        }
        if (code.test(line)) {
            return 'code';
        }
        return 'text'
    }

    export function getSingleLineBlock (type: TBlockType, lines: string[], idx: number) {
        let rgx = rgxes[type];
        if (rgx == null) {
            throw new Error(`Invalid single line type: ${type}`);
        }
        let line = lines[idx];
        let text = rgx.exec(line).groups.text;
        return {
            type: type,
            content: text
        };
    }
    export function getCode (lines: string[], idx: number): { block: ICodeBlock, index: number } {

        let match = code.exec(lines[idx]);
        let count = match.groups.block.length;
        let rgx = new RegExp(`^\s*(${ ''.padStart(count, '`') })($|[^\`])`);
        let i = idx + 1;
        for (; i < lines.length; i++) {
            let isEnd = rgx.test(lines[i]);
            if (isEnd) {
                break;
            }
        }

        return {
            index: i,
            block: {
                type: 'code',
                lang: match.groups.lang,
                content: lines.slice(idx + 1, i).join('\n'),
            }
        };
    }
}



