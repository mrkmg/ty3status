import {EBlockConfigType, IBlockConfig} from "../models/config-types";
import {
    CommandRunnerDataError,
    CommandRunnerRunError,
    ICommandRunner,
    ICommandRunnerData,
    ICommandRunnerDataListener,
    ICommandRunnerErrorListener,
} from "./command-runners/command-runner";
import LegacyShellCommandRunner from "./command-runners/legacy-command-runner";
import ModuleCommandRunner from "./command-runners/module-command-runner";
import PersistentCommandRunner from "./command-runners/persistent-command-runner";
import {EventEmitter} from "events";
import {clearTimeout, setTimeout} from "timers";

export default class Block extends EventEmitter implements IBlockEvents {
    private commandRunner: ICommandRunner;
    private retryCount: number = 0;
    private retryTimer: NodeJS.Timeout;

    constructor(public config: IBlockConfig) {
        super();
        this.setupCommandRunner();
    }

    public start() {
        this.commandRunner.start();
    }

    public stop() {
        this.commandRunner.stop();
    }

    public click(button: number) {
        this.commandRunner.click(button);
    }

    private setupCommandRunner() {
        switch (this.config.type) {
            case EBlockConfigType.legacy:
                this.commandRunner =
                    new LegacyShellCommandRunner(this.config.script, this.config.interval * 1000, this.config.instance);
                break;
            case EBlockConfigType.persistent:
                this.commandRunner = new PersistentCommandRunner(this.config.script);
                break;
            case EBlockConfigType.module:
                this.commandRunner = new ModuleCommandRunner(this.config.module, this.config);
                break;
            default:
                throw new Error("Unknown Type"); // Should never get here. Check in config parser
        }

        this.commandRunner.on("data", (data) => this.onData(data));
        this.commandRunner.on("error", (err: Error) => this.onError(err));
    }

    private onData(data: ICommandRunnerData) {
        this.retryCount = 0;

        if (this.config.prefix) {
            data.full_text = `${this.config.prefix}${data.full_text}`;
        }
        if (this.config.postfix) {
            data.full_text = `${this.config.postfix}${data.full_text}`;
        }

        this.emit("data", data);
    }

    private onError(err: Error) {
        if (!this.config.ignoreError) {
            if (err instanceof CommandRunnerRunError) {
                this.onData({
                    color: "#FF0000",
                    full_text: `Err:Run:${err.message}`,
                });
            } else if (err instanceof CommandRunnerDataError) {
                this.onData({
                    color: "#FF0000",
                    full_text: `Err:Data:${err.message}`,
                });
            } else {
                this.emit("error", err);
            }
        }

        if (this.config.maxRetries > this.retryCount) {
            this.retryCount++;

            if (this.retryTimer) {
                clearTimeout(this.retryTimer);
            }

            this.retryTimer = setTimeout(() => this.start(), this.config.retryDelay);
        }
    }
}

export interface IBlockEvents extends EventEmitter {
    addListener(event: "data", listener: ICommandRunnerDataListener): this;
    addListener(event: "error", listener: ICommandRunnerErrorListener): this;

    emit(event: "data" | "error", data: ICommandRunnerData): boolean;

    on(event: "data", listener: ICommandRunnerDataListener): this;
    on(event: "error", listener: ICommandRunnerErrorListener): this;

    once(event: "data", listener: ICommandRunnerDataListener): this;
    once(event: "error", listener: ICommandRunnerErrorListener): this;

    removeListener(event: "data", listener: ICommandRunnerDataListener): this;
    removeListener(event: "error", listener: ICommandRunnerErrorListener): this;
}
