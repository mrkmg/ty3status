import {IBlockConfig, IBlockOutput} from "../../models/config-types";
import {IModule, IModuleConstructor} from "../../models/module-block";
import {CommandRunnerDataError, CommandRunnerRunError, ICommandRunner} from "./command-runner";
import {EventEmitter} from "events";

const builtinModules: {[module: string]: IModuleConstructor} = {
    "cpu-usage": require("../../modules/cpu-usage"),
    datetime: require("../../modules/datetime"),
    loadavg: require("../../modules/loadavg"),
    memory: require("../../modules/memory"),
    uptime: require("../../modules/uptime"),
};

export default class ModuleCommandRunner extends EventEmitter implements ICommandRunner {
    private instance: IModule;

    constructor(private module: string, private config: IBlockConfig) {
        super();
        this.buildInstance();
    }

    public start(): void {
        if (this.instance) {
            this.instance.start();
        }
    }

    public stop(): void {
        if (this.instance) {
            this.instance.stop();
        }
    }

    public click(button: number): void {
        if (this.instance) {
            this.instance.clicked(button);
        }
    }

    public kill(): void {
        if (this.instance) {
            this.instance.stop();
        }
    }

    private onData(data: IBlockOutput): void {
        if (!("full_text" in data)) {
            this.emit("error", new CommandRunnerDataError());
        } else {
            this.emit("data", data);
        }
    }

    private buildInstance() {
        try {
            let mod: IModuleConstructor;

            if (this.module in builtinModules) {
                mod = builtinModules[this.module];
            } else {
                // Dirty hack to work around webpack
                // tslint:disable-next-line:no-eval
                mod = eval("require('" + this.module + "')");
            }
            this.instance = mod((data: IBlockOutput) => this.onData(data), this.config);
        } catch (err) {
            this.emit("error", new CommandRunnerRunError(err.message));
        }
    }

}
