import {IBlockOutput} from "../../models/config-types";
import {IOutputter} from "../../models/outputter";
import ActionLimiter from "../action-limiter";
import {EOL} from "os";
import strip = require("striptags");

export default class SimpleOutputter implements IOutputter {
    private blocks: IBlockOutput[] = [];
    private outputLimiter: ActionLimiter;
    private running = false;

    public constructor(speedLimit: number) {
        this.outputLimiter = new ActionLimiter(() => this.writeOutput(), speedLimit);
    }

    public setBlocks(blocks: IBlockOutput[]): void {
        this.blocks = blocks;
        this.outputLimiter.run();
    }

    public start(): void {
        this.running = true;
        this.writeOutput();
    }

    public stop(): void {
        this.running = false;
    }

    private writeOutput() {
        if (!this.running) {
            return;
        }

        for (let i = 0; i < this.blocks.length; i++) {
            const runningBlock = this.blocks[i];
            if (!showOutput(runningBlock)) {
                continue;
            }

            process.stdout.write(removeHtmlEntites(runningBlock.full_text));
            if (runningBlock.separator) {
                process.stdout.write(" | ");
            } else {
                process.stdout.write(" ");
            }
        }
        process.stdout.write(EOL);
    }

}

function showOutput(outBlock: IBlockOutput) {
    return outBlock.full_text.trim().length > 0;
}

function removeHtmlEntites(output: string): string {
    return strip(output);
}
