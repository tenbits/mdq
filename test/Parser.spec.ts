import { MdParser } from '../src/parsers/MdParser';

UTest({
    async 'should parse markdown/yaml' () {
        let parser = new MdParser();
        let json = parser.split(`
# h1
\`\`\`shell
mkdir foo
\`\`\`
and other things`);

        eq_(json[0].content, 'h1');
        eq_(json[0].type, 'h1');
        eq_(json[1].content, 'mkdir foo');
        eq_(json[1].type, 'code');

        eq_(json[2].content, 'and other things');
        eq_(json[2].type, 'text');
    }
})
