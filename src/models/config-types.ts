export interface IBlocksConfig {
    blocks: Array<IBlockConfig>;
    defaults?: IBlockConfig;
}

export interface IBlockConfig {
    type: EBlockConfigType;
    script?: string;
    module?: string;
    params?: {[index: string]: string},
    interval?: number;
    color?: string;
    separator?: boolean;
    separatorWidth?: number;
    prefix?: string;
    postfix?: string;
    instance?: string;
    markup: string;
    ignoreError: boolean;
}

export enum EBlockConfigType {
    legacy,
    persistent,
    module,
}

export interface IBlockOutput {
    full_text: string;
    short_text?: string;
    markup?: string;
    name?: string;
    color?: string;
    separator?: boolean;
    separator_width?: number;
}
