import Block from "./lib/block";
import {ICommandRunnerData} from "./lib/command-runners/command-runner";
import configParser from "./lib/config-parser";
import getDefaultConfigPath from "./lib/get-default-config-path";
import Logger from "./lib/logger";
import I3BarOutputter from "./lib/outputters/i3-bar-outputter";
import SimpleOutputter from "./lib/outputters/simple-outputter";
import {ITy3CLIArguments, default as parseArgs} from "./lib/parse-args";
import {IBlockConfig, IBlockOutput, IBlocksConfig} from "./models/config-types";
import {IOutputter} from "./models/outputter";
import {Ty3Error} from "./models/ty3error";
import {EOL} from "os";
import defaultValue = require("default-value");
import xtend = require("xtend");
import "source-map-support";
import Signals = NodeJS.Signals;
import NullOutputter from "./lib/outputters/null-outputter";

let args: ITy3CLIArguments;
let configPath: string;
let config: IBlocksConfig;
const runningBlocks: IRunningBlock[] = [];
let outputter: IOutputter;

try {
    main();
} catch (error) {
    onError(error);
}

function main() {
    args = parseArgs();
    makeConfig();
    buildBlocks();
    if (args.null) {
        outputter = new NullOutputter();
    } else if (args.simple) {
        outputter = new SimpleOutputter(config.outputSpeedLimit);
    } else {
        outputter = new I3BarOutputter(config.outputSpeedLimit)
    }
    outputter.start();
    startBlocks();
    bindStdin();
}

function bindStdin() {
    process.stdin.on("data", onInput);
}

function makeConfig() {
    configPath = args.config ? args.config : getDefaultConfigPath();
    config = configParser(configPath);
}

function buildBlocks() {
    for (let i = 0; i < config.blocks.length; i++) {
        buildBlock(config.blocks[i], i.toString());
    }
}

function buildBlock(blockConfig: IBlockConfig, name: string) {
    const block = new Block(blockConfig);
    const initialOutput: IBlockOutput = {
        color: blockConfig.color,
        full_text: "",
        markup: blockConfig.markup,
        name,
        separator: defaultValue(blockConfig.separator, false),
        separator_block_width: defaultValue(blockConfig.separatorWidth, 10),
    };

    if (blockConfig.border) {
        initialOutput.border = blockConfig.border;
        initialOutput.border_bottom = defaultValue(blockConfig.borderBottom, 0);
        initialOutput.border_left = defaultValue(blockConfig.borderLeft, 0);
        initialOutput.border_right = defaultValue(blockConfig.borderRight, 0);
        initialOutput.border_top = defaultValue(blockConfig.borderTop, 0);
    }

    if (blockConfig.background) {
        initialOutput.background = blockConfig.background;
    }

    if (blockConfig.align) {
        initialOutput.align = blockConfig.align;
    }

    if (blockConfig.minWidth) {
        initialOutput.min_width = blockConfig.minWidth;
    }

    const runningBlock = {
        block,
        outputCurrent: xtend(initialOutput),
        outputTemplate: xtend(initialOutput),
    };

    runningBlocks.push(runningBlock);

    block.on("data", (data: ICommandRunnerData) => {
        runningBlock.outputCurrent = xtend(runningBlock.outputTemplate, data);
        runOutput();
    });
    block.on("error", onError);

    if (blockConfig.signal) {
        process.on(blockConfig.signal as Signals, () => {
            block.start();
        });
    }

}

function runOutput() {
    outputter.setBlocks(runningBlocks.map((i) => i.outputCurrent));
}

function startBlocks() {
    for (let i = 0; i < runningBlocks.length; i++) {
        const block = runningBlocks[i].block;

        block.start();
    }
}

let inputCache: string[] = [];

function onInput(input: Buffer) {
    inputCache.push(input.toString());

    if (input.indexOf(EOL) !== -1) {
        const events = inputCache.join("").trim().replace(/},{/, `}${EOL}{`).split(EOL);
        for (let i = 0; i < events.length; i++) {
            let event = events[i];
            // Initializer or empty
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
        const jsonEvent = JSON.parse(event.replace(/'/, "\"")) as II3Event;
        const index = parseInt(jsonEvent.name, 10);

        if (index >= 0 && index < runningBlocks.length) {
            const runningBlock = runningBlocks[index];
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
