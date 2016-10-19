import minimist = require("minimist");
import {EOL} from "os";
import ParsedArgs = minimist.ParsedArgs;

export default function parseArgs(): ITy3CLIArguments {
    let passedArgs = <IParsedArgumentsTy3> minimist(process.argv.slice(2), {
        boolean: ["simple"],
        string: ["config"],
        unknown: (opt: string): boolean => {
            process.stderr.write(`Unknown option: ${opt}`);
            process.stderr.write(EOL);
            process.exit(1);
            return false;
        },
    });

    return {
        config: passedArgs.config,
        simple: passedArgs.simple,
    };
}

export interface IParsedArgumentsTy3 extends ParsedArgs {
    config: string;
    simple: boolean;
}

export interface ITy3CLIArguments {
    config: string | null;
    simple: boolean;
}
