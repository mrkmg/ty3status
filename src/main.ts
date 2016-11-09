import Block from "./lib/block";
import {ICommandRunnerData} from "./lib/command-runners/command-runner";
import configParser from "./lib/config-parser";
import getDefaultConfigPath from "./lib/get-default-config-path";
import Logger from "./lib/logger";
import {ITy3CLIArguments, default as parseArgs} from "./lib/parse-args";
import {IBlockConfig, IBlockOutput, IBlocksConfig} from "./models/config-types";
import {Ty3Error} from "./models/ty3error";
import {EOL} from "os";
import defaultValue = require("default-value");
import xtend = require("xtend");
import "source-map-support/register";

let args: ITy3CLIArguments;
let configPath: string;
let config: IBlocksConfig;
let runningBlocks: Array<IRunningBlock> = [];

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
        buildBlock(config.blocks[i], i.toString());
    }
}

function buildBlock(blockConfig: IBlockConfig, name: string) {
    let block = new Block(blockConfig);
    let initialOutput: IBlockOutput = {
        color: blockConfig.color,
        full_text: "",
        markup: blockConfig.markup,
        name,
        separator: defaultValue(blockConfig.separator, false),
        separator_width: defaultValue(blockConfig.separatorWidth, 10),
    };
    let runningBlock = {
        block,
        outputCurrent: xtend(initialOutput),
        outputTemplate: xtend(initialOutput),
    };

    runningBlocks.push(runningBlock);

    block.on("data", (data: ICommandRunnerData) => {
        runningBlock.outputCurrent = xtend(runningBlock.outputCurrent, data);
        writeOutput();
    });
    block.on("error", onError);

    if (blockConfig.signal) {
        process.on(blockConfig.signal, () => {
            block.start();
        });
    }

}

function startBlocks() {
    for (let i = 0; i < runningBlocks.length; i++) {
        let block = runningBlocks[i].block;

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
    process.stdout.write(
        JSON.stringify(
            runningBlocks.filter(showOutput).map((runningBlock) => runningBlock.outputCurrent)
        )
    );
    process.stdout.write(",");
    process.stdout.write(EOL);

}

function writeOutputSimple() {
    for (let i = 0; i < runningBlocks.length; i++) {
        let runningBlock = runningBlocks[i];
        if (!showOutput(runningBlock)) {
            continue;
        }

        process.stdout.write(runningBlock.outputCurrent.full_text);
        if (runningBlock.outputCurrent.separator) {
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
            // Sent Initially, not an actual event, or empty
            if (event === "[" || event === "") {
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

        if (index >= 0 && index < runningBlocks.length) {
            let runningBlock = runningBlocks[index];
            runningBlock.block.click(jsonEvent.button);
        }

        Logger.log(`main:onEvent ${event}`);
    } catch (err) {
        Logger.error(`main:onEvent ${err.message} ${event}`);
    }

}

function onError(error: Error) {
    if (error instanceof Ty3Error) {
        error.display();
        process.exit(1);
    } else {
        process.stderr.write(`An uncaught error has occurred. Please open an issue... ${EOL}${error.message}${EOL}`);
        throw error;
    }
}

function showOutput(outBlock: IRunningBlock) {
    return outBlock.outputCurrent.full_text.trim().length > 0;
}

interface II3Event {
    y: number;
    x: number;
    button: number;
    name: string;
    instance: string;
}

interface IRunningBlock {
    block: Block;
    outputCurrent: IBlockOutput;
    outputTemplate: IBlockOutput;
}
