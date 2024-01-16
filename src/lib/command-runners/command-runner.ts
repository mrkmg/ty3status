import Exception from "../../types/error-class";
import {EventEmitter} from "events";

export interface ICommandRunner extends EventEmitter {
    addListener(event: "data", listener: ICommandRunnerDataListener): this;
    addListener(event: "error", listener: ICommandRunnerErrorListener): this;
    addListener(event: "started" | "stopped", listener: () => void): this;

    emit(event: "data" | "error", data: ICommandRunnerData): boolean;
    emit(event: "started" | "stopped"): boolean;

    on(event: "data", listener: ICommandRunnerDataListener): this;
    on(event: "error", listener: ICommandRunnerErrorListener): this;
    on(event: "started" | "stopped", listener: () => void): this;

    once(event: "data", listener: ICommandRunnerDataListener): this;
    once(event: "error", listener: ICommandRunnerErrorListener): this;
    once(event: "started" | "stopped", listener: () => void): this;

    removeListener(event: "data", listener: ICommandRunnerDataListener): this;
    removeListener(event: "error", listener: ICommandRunnerErrorListener): this;
    removeListener(event: "started" | "stopped", listener: () => void): this;

    start(): void;
    stop(): void;
    click(button: number): void;
    kill(): void;
}

export type ICommandRunnerDataListener = (data: ICommandRunnerData) => void;
export type ICommandRunnerErrorListener = (error: CommandRunnerError) => void;

export interface ICommandRunnerData {
    full_text: string;
    short_text?: string;
    color?: string;
}

export class CommandRunnerError extends Exception {
    constructor(message?: string, stack?: string) {
        super(message, stack);
        this.name = "CommandRunnerError";
    }
}

export class CommandRunnerStopError extends CommandRunnerError {
    constructor(message?: string, stack?: string) {
        super(message, stack);
        this.name = "CommandRunnerStopError";
    }
}

export class CommandRunnerRunError extends CommandRunnerError {
    constructor(message?: string, stack?: string) {
        super(message, stack);
        this.name = "CommandRunnerRunError";
    }
}

export class CommandRunnerDataError extends CommandRunnerError {
    constructor(message?: string, stack?: string) {
        super(message, stack);
        this.name = "CommandRunnerDataError";
    }
}
