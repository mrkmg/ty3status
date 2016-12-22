import {IBlockOutput} from "./config-types";

export interface IOutputter {
    setBlocks(blocks: Array<IBlockOutput>): void;
    start(): void;
    stop(): void;
}
