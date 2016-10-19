import {IBlockOutput} from "../../models/config-types";
import {IModule, IModuleConstructor} from "../../models/module-block";
import {CommandRunnerDataError, CommandRunnerRunError, ICommandRunner} from "./command-runner";
import {EventEmitter} from "events";

const builtinModules: {[module: string]: IModuleConstructor} = {
    uptime: require("../../modules/uptime"),
};

export default class ModuleCommandRunner extends EventEmitter implements ICommandRunner {
    private instance: IModule;

    constructor(private module: string, private params: any) {
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
            let module: IModuleConstructor;

            if (this.module in builtinModules) {
                module = builtinModules[this.module];
            } else {
                module = require(this.module);
            }
            this.instance = module((data: IBlockOutput) => this.onData(data), this.params);
        } catch (err) {
            this.emit("error", new CommandRunnerRunError());
        }
    }

}
