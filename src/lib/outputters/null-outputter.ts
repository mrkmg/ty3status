import {IBlockOutput} from "../../models/config-types";
import {IOutputter} from "../../models/outputter";

export default class NullOutputter implements IOutputter {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public setBlocks(blocks: IBlockOutput[]): void {
    }

    public start(): void {
    }

    public stop(): void {
    }
}
