import {IBlockOutput} from "./config-types";

export interface IModule {
    start(): void;
    stop(): void;
    clicked(button: number): void;
    tick(): void;
}

export interface IModuleConstructor { (dataCallback: IModuleDataFunction, params: any): IModule; }
export interface IModuleDataFunction  { (data: IBlockOutput):void; }
