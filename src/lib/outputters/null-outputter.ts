import {IBlockOutput} from "../../models/config-types";
import {IOutputter} from "../../models/outputter";

export default class NullOutputter implements IOutputter {
    public setBlocks(blocks: Array<IBlockOutput>): void {
    }

    public start(): void {
    }

    public stop(): void {
    }
}
