export interface IBlocksConfig {
    blocks: Array<IBlockConfig>;
    defaults?: IBlockConfig;
}

export interface IBlockConfig {
    ignoreError: boolean;
    markup: string;
    maxRetries: number;
    retryDelay: number;
    type: EBlockConfigType;

    color?: string;
    instance?: string;
    interval?: number;
    module?: string;
    params?: {[index: string]: string};
    postfix?: string;
    prefix?: string;
    script?: string;
    separator?: boolean;
    separatorWidth?: number;
    signal?: string;
}

export enum EBlockConfigType {
    legacy,
    persistent,
    module,
}

export interface IBlockOutput {
    full_text: string;

    color?: string;
    markup?: string;
    name?: string;
    separator?: boolean;
    separator_width?: number;
    short_text?: string;
}
