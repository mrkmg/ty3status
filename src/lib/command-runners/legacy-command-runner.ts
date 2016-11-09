import {
    CommandRunnerDataError, CommandRunnerError, CommandRunnerRunError, ICommandRunner, ICommandRunnerData,
} from "./command-runner";
import {ChildProcess, exec} from "child_process";
import {EventEmitter} from "events";
import {EOL} from "os";
import {clearInterval, clearTimeout, setInterval, setTimeout} from "timers";
import xtend = require("xtend");

export default class LegacyShellCommandRunner extends EventEmitter implements ICommandRunner {
    private process: ChildProcess;
    private running: boolean = false;
    private currentData: string[];
    private timer: NodeJS.Timer = null;

    constructor(private command: string, private interval: number = 30000, private instance?: string) {
        super();
    }

    public start(): void {
        this.runProcess({});

        if (!this.timer) {
            if (this.interval > 0) {
                setInterval(() => this.runProcess({}), this.interval);
            } else {
                this.runProcess({});
            }
        }
    }

    public stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        if (this.running) {
            let timer = setTimeout(() => this.kill(), 2000);
            this.on("stopped", () => clearTimeout(timer));
            this.process.kill("SIGINT");
        }
    }

    public kill(): void {
        if (!this.running) {
            return;
        }
        this.process.kill("SIGKILL");
    }

    public click(button: number): void {
        let env = {
            BLOCK_BUTTON: button,
        };

        if (this.running) {
            this.once("stopped", () => this.runProcess(env));
        } else {
            this.runProcess(env);
        }
    }

    private runProcess(env: Object = {}): void {
        if (this.running) {
            return;
        }
        this.currentData = [];

        this.process = exec(this.command, {env: this.getEnv(env)});
        this.process.stdout.on("data", (data) => this.onData(data));
        this.process.on("error", (err: Error) => this.onError(err));
        this.process.on("exit", (code: number) => this.onExit(code));
        this.onProcessStarted();
    }

    private onProcessStarted() {
        this.running = true;
        this.emit("started");
    }

    private onExit(code: number) {
        if (this.running) {
            this.running = false;
            this.emit("stopped");

            if (code !== 0) {
                this.emitError(new CommandRunnerRunError(`exit:${code}`));
            } else {
                this.onProcessCompleted();
            }
        }
    }

    private onError(err: Error) {
        this.emitError(new CommandRunnerRunError(err.message));
    }

    private onData(data: Buffer | string) {
        this.currentData.push(data.toString());
    }

    private onProcessCompleted() {
        let lines: Array<string>;

        if (this.currentData.length) {
            lines = this.currentData.join("").trim().split(EOL);
        } else {
            this.emitError(new CommandRunnerDataError("No Response"));
            return;
        }

        let length = lines.length;

        switch (length) {
            case 1:
                this.emitData({
                    full_text: lines[0],
                });
                break;
            case 2:
                this.emitData({
                    full_text: lines[0],
                    short_text: lines[1],
                });
                break;
            case 3:
                this.emitData({
                    color: lines[2],
                    full_text: lines[0],
                    short_text: lines[1],
                });
                break;
            default:
                this.emitError(new CommandRunnerDataError("Overflow"));
        }
    }

    private emitData(data: ICommandRunnerData) {
        this.emit("data", data);
    }

    private emitError(err: CommandRunnerError) {
        this.emit("error", err);
    }

    private getEnv(env: any) {
        if (this.instance) {
            env.BLOCK_INSTANCE = this.instance;
        }

        return xtend(process.env, env);
    }
}
