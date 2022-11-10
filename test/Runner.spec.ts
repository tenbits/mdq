import { MdParser } from '../src/parsers/MdParser';
import { Runner } from '../src/Runner';

UTest({
    async 'should run the markdown' () {
        let parser = new MdParser();
        let blocks = parser.split(`
# hello
\`\`\`yml
name: Lorem
\`\`\`

\`\`\`shell
echo $name
\`\`\`

`);

        let runner = new Runner();
        let logs = await runner.executeBlocks(blocks, {
            onLog: (log) => {
                console.log(`OnLog:`, log);
            }
        });

        eq_('Lorem', logs[1].logs[0].stdout.map(x => x.trim()));
    },

    async 'should execute file the markdown' () {

        let runner = new Runner();
        let logs = await runner.executeFile('./test/fixtures/shell.md');

        deepEq_(['Foo'], logs[1].logs[0].stdout.map(x => x.trim()));
    },

    async 'javascript executor' () {

        process.env.FOO = 'qFOO';

        let runner = new Runner();
        let blocks = await runner.executeFile('./test/fixtures/js.md');

        deepEq_(blocks[2].logs, [ 'Lorem value IPSUM' ]);
        eq_(blocks[2].result, 1);
    }
})
