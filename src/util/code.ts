export namespace $code {
    export function extractDependencies (code: string) {
        let imports = getRgxMatches(code, /^\s*import.+?from\s+['"](?<path>[^'"]+)['"]/gm);
        let requires = getRgxMatches(code, /\brequire\s*\(\s*['"](?<path>[^'"]+)['"]\s*\)/g);

        let paths = [
            ...imports .map(x => x.groups.path),
            ...requires.map(x => x.groups.path),
        ];
        return paths;
    }

    function getRgxMatches (str: string, rgx: RegExp): RegExpExecArray[] {
        let matches = [] as RegExpExecArray[];
        while (true) {
            let match = rgx.exec(str);
            if (match == null) {
                return matches;
            }

            matches.push(match)
        }
    }
}
