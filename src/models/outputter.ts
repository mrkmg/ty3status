import {IBlockOutput} from "./config-types";

export interface IOutputter {
    setBlocks(blocks: IBlockOutput[]): void;
    start(): void;
    stop(): void;
}
