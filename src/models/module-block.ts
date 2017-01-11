import {IBlockConfig, IBlockOutput} from "./config-types";

export interface IModule {
    start(): void;
    stop(): void;
    clicked(button: number): void;
    tick(): void;
}

export interface IModuleFunctionConstructor { (dataCallback: IModuleDataFunction, params: IBlockConfig): IModule; }
export interface IModuleRequiredConstructor {
    default: IModuleFunctionConstructor;
}
export interface IModuleDataFunction  { (data: IBlockOutput):void; }
