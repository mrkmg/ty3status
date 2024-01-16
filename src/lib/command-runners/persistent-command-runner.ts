import {CommandRunnerRunError, ICommandRunner} from "./command-runner";
import {ChildProcess, exec} from "child_process";
import {EventEmitter} from "events";
import {EOL} from "os";
import {clearTimeout, setTimeout} from "timers";
import xtend = require("xtend");
import ProcessEnv = NodeJS.ProcessEnv;

export default class PersistentCommandRunner extends EventEmitter implements ICommandRunner {
    private process: ChildProcess;
    private running: boolean = false;
    private currentData: string[] = [];

    constructor(private command: string) {
        super();
    }

    public start(): void {
        if (this.running) {
            this.stop();
        }
        this.runProcess({});
    }

    public stop(): void {
        if (this.running) {
            const timer = setTimeout(() => this.kill(), 2000);
            this.on("stopped", () => clearTimeout(timer));
            this.process.kill("SIGINT");
        }
    }

    public kill(): void {
        if (this.running) {
            this.process.kill("SIGKILL");
        }
    }

    public click(button: number): void {
        this.process.stdin.write(button.toString());
    }
    private runProcess(vars: any): void {
        if (this.running) {
            return;
        }

        this.currentData = [];

        this.process = exec(this.command, {env: getEnvironment(vars)});
        this.process.stdout.on("data", (data) => this.onData(data.toString()));
        this.process.on("error", (err: Error) => this.onError(err));
        this.process.on("exit", (code: number) => this.onProcessStopped(code));
        this.onProcessStarted();
    }

    private onProcessStarted() {
        this.running = true;
        this.emit("started");
    }

    private onProcessStopped(code: number) {
        if (this.running) {
            this.running = false;
            this.emit("stopped");

            if (code !== 0) {
                this.emit("error", new CommandRunnerRunError());
            }
        }
    }

    private onData(data: string) {
        this.currentData.push(data);

        if (data.indexOf(EOL) !== -1) {
            const [dataLine, ...remaining] = this.currentData.join("").trim().split(EOL);
            this.currentData = remaining;
            this.emit("data", {
                full_text: dataLine,
            });
        }
    }

    private onError(err: Error) {
        this.emit("error", new CommandRunnerRunError(err.message));
        this.onProcessStopped(1);
    }
}

function getEnvironment(vars: any): ProcessEnv {
    return xtend(process.env, vars);
}
