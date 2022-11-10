import { Shell } from 'shellbee'

UTest({
    async 'execute the CLI' () {

        let { stdout } = await Shell.run({
            command: 'node ./index.js ./test/fixtures/shell.md',
            silent: true,
        });

        eq_(stdout[stdout.length - 1].trim(), 'Foo');
    }
})
