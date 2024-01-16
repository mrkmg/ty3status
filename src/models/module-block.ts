import {IBlockConfig, IBlockOutput} from "./config-types";

export interface IModule {
    start(): void;
    stop(): void;
    clicked(button: number): void;
    tick(): void;
}

export type IModuleFunctionConstructor = (dataCallback: IModuleDataFunction, params: IBlockConfig) => IModule;
export interface IModuleRequiredConstructor {
    default: IModuleFunctionConstructor;
}
export type IModuleDataFunction = (data: IBlockOutput) => void;
