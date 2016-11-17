export interface IBlocksConfig {
    outputSpeedLimit: number;
    blocks: Array<IBlockConfig>;
    defaults?: IBlockConfig;
}

export interface IBlockConfig {
    ignoreError: boolean;
    markup: string;
    maxRetries: number;
    retryDelay: number;
    type: EBlockConfigType;

    background?: string;
    border?: string;
    border_bottom?: number;
    border_left?: number;
    border_right?: number;
    border_top?: number;
    color?: string;
    instance?: string;
    interval?: number;
    module?: string;
    params?: any;
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

    background?: string;
    border?: string;
    border_bottom?: number;
    border_left?: number;
    border_right?: number;
    border_top?: number;
    color?: string;
    markup?: string;
    name?: string;
    separator?: boolean;
    separator_width?: number;
    short_text?: string;
}
