import Block from "./lib/block";
import {ICommandRunnerData} from "./lib/command-runners/command-runner";
import configParser from "./lib/config-parser";
import getDefaultConfigPath from "./lib/get-default-config-path";
import Logger from "./lib/logger";
import {ITy3CLIArguments, default as parseArgs} from "./lib/parse-args";
import {IBlockOutput, IBlocksConfig} from "./models/config-types";
import {Ty3Error} from "./models/ty3error";
import {EOL} from "os";
import defaultValue = require("default-value");
import xtend = require("xtend");
import "source-map-support/register";

let args: ITy3CLIArguments;
let configPath: string;
let config: IBlocksConfig;
let blocks: Array<Block> = [];
let originalOutputs: Array<IBlockOutput> = [];
let output: Array<IBlockOutput> = [];

try {
    main();
} catch (error) {
    onError(error);
}

function main() {
    args = parseArgs();
    makeConfig();
    buildBlocks();
    if (!args.simple) {
        writeHeader();
    }
    startBlocks();
    bindStdin();
}

function bindStdin() {
    process.stdin.on("data", onInput);
}

function makeConfig() {
    if (args.config) {
        configPath = args.config;
    } else {
        configPath = getDefaultConfigPath();
    }

    config = configParser(configPath);
}

function buildBlocks() {
    for (let i = 0; i < config.blocks.length; i++) {
        let block = new Block(config.blocks[i]);
        blocks.push(block);

        block.on("data", (data: ICommandRunnerData) => {
            output[i] = xtend(originalOutputs[i], data);
            writeOutput();
        });

        block.on("error", onError);

        let initialOutput: IBlockOutput = {
            color: config.blocks[i].color,
            full_text: "",
            markup: config.blocks[i].markup,
            name: i.toString(),
            separator: defaultValue(config.blocks[i].separator, false),
            separator_width: defaultValue(config.blocks[i].separatorWidth, 10),
        };

        output.push(initialOutput);
        originalOutputs.push(initialOutput);
    }
}

function startBlocks() {
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];

        block.start();
    }
}

function writeHeader() {
    process.stdout.write(JSON.stringify({
        click_events: true,
        version: 1,
    }));
    process.stdout.write(EOL);
    process.stdout.write("[");
    process.stdout.write(EOL);
}

function writeOutput() {
    if (args.simple) {
        writeOutputSimple();
    } else {
        writeOutputJson();
    }
}

function writeOutputJson() {
    process.stdout.write(JSON.stringify(output.filter(showOutput)));
    process.stdout.write(",");
    process.stdout.write(EOL);

}

function writeOutputSimple() {
    for (let i = 0; i < output.length; i++) {
        let out = output[i];
        if (!showOutput(out)) {
            continue;
        }

        process.stdout.write(out.full_text);
        if (out.separator) {
            process.stdout.write(" | ");
        } else {
            process.stdout.write(" ");
        }
    }
    process.stdout.write(EOL);
}

let inputCache: Array<string> = [];

function onInput(input: Buffer) {
    inputCache.push(input.toString());

    if (input.indexOf(EOL) !== -1) {
        let events = inputCache.join("").trim().replace(/},{/, `}${EOL}{`).split(EOL);
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            // Sent Initially, not an actual event
            if (event === "[") {
                continue;
            }

            // Remove comma at start of string
            if (event.substr(0, 1) === ",") {
                event = event.substr(1);
            }

            onEvent(event);
        }
        inputCache = [];
    }
}

function onEvent(event: string) {
    try {
        event = event.replace(/'/g, "\"");
        let jsonEvent = <II3Event> JSON.parse(event.replace(/'/, "\""));
        let index = parseInt(jsonEvent.name, 10);

        if (index >= 0 && index < blocks.length) {
            let block = blocks[index];
            block.click(jsonEvent.button);
        }

        Logger.log(`LOG: Event: ${event}`);
    } catch (err) {
        Logger.debug(`Err main:onEvent ${err.message} ${event}`);
    }

}

function onError(error: Error) {
    if (error instanceof Ty3Error) {
        error.display();
        process.exit(1);
    } else {
        process.stderr.write(`An uncaught error has occurred. Please open an issue... ${EOL}`);
        throw error;
    }
}

function showOutput(outBlock: IBlockOutput) {
    return outBlock.full_text.trim().length > 0;
}

interface II3Event {
    y: number;
    x: number;
    button: number;
    name: string;
    instance: string;
}
