import AppConfig from 'appcfg';
import { obj_getProperty } from 'atma-utils';
import { log_warn } from './log';

export function str_interpolate(str: string, env: Record<string, any>, root?: AppConfig, isOptional?: boolean) {

    if (str.includes('$') === false) {
        return str;
    }
    let i = -1;
    let out = '';
    let start = 0;
    do {
        i = str.indexOf('$', i);
        if (i === -1) {
            break;
        }
        if (str[i - 1] === '\\') {
            out += str.substring(start, i - 1);
            start = i;
            i += 1;
            continue;
        }


        out += str.substring(start, i);


        let $exp = '';
        let $default = '';

        if (str[i + 1] === '{') {
            let end = str.indexOf('}', i);
            $exp = str.substring(i + 2, end).trim();
            if ($exp.includes(':')) {
                let i = $exp.indexOf(':');
                $exp = $exp.substring(0, i).trim();
                $default = $exp.substring(i + 1).trim()
            }

            start = i = end;
        } else {
            let rgx = /[^\w_]/g;
            rgx.lastIndex = i + 1;
            let end = rgx.exec(str)?.index ?? str.length;
            $exp = str.substring(i + 1, end);
            start = i = end;
        }

        if ($exp) {
            let val = obj_getProperty(env, $exp) ?? obj_getProperty(root, $exp);
            if (val != null) {
                out += val;
            } else {
                log_warn('<config: obj_interpolate: property not exists in root', $exp);
            }
        }
    } while (true);

    out += str.substring(start);
    return out;
};
