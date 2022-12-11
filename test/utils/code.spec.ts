import { $code } from '../../src/util/code';


UTest({
    'should extract deps' () {

        let code = `
            import a from 'a';
            import { b } from "b";
            import * as c from 'c';

            const foo = require('foo');
            let bar = require("bar");
        `;
        let deps = $code.extractDependencies(code);
        deepEq_(deps, [ 'a', 'b', 'c', 'foo', 'bar' ]);
    }
})
