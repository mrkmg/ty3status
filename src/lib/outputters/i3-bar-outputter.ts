import {IBlockOutput} from "../../models/config-types";
import {IOutputter} from "../../models/outputter";
import ActionLimiter from "../action-limiter";
import {EOL} from "os";

export default class I3BarOutputter implements IOutputter {
    private blocks: Array<IBlockOutput> = [];
    private didOutputHeader = false;
    private outputLimiter: ActionLimiter;
    private running = false;

    public constructor(speedLimit: number) {
        this.outputLimiter = new ActionLimiter(() => this.writeOutput(), speedLimit);
    }

    public setBlocks(blocks: Array<IBlockOutput>): void {
        this.blocks = blocks;
        this.outputLimiter.run();
    }

    public start(): void {
        if (!this.didOutputHeader) {
            this.writeHeader();
        }
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

        process.stdout.write(
            JSON.stringify(
                this.blocks.filter(showOutput)
            )
        );
        process.stdout.write(",");
        process.stdout.write(EOL);
    }

    private writeHeader() {
        process.stdout.write(JSON.stringify({
            click_events: true,
            version: 1,
        }));
        process.stdout.write(EOL);
        process.stdout.write("[");
        process.stdout.write(EOL);
        this.didOutputHeader = true;
    }

}

function showOutput(outBlock: IBlockOutput) {
    return outBlock.full_text.trim().length > 0;
}
