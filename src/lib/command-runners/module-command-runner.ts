import {IBlockConfig, IBlockOutput} from "../../models/config-types";
import {IModule, IModuleFunctionConstructor, IModuleRequiredConstructor} from "../../models/module-block";
import {CommandRunnerDataError, CommandRunnerRunError, ICommandRunner} from "./command-runner";
import {EventEmitter} from "events";

const builtinModules: {[module: string]: IModuleFunctionConstructor} = {
    "cpu-temp": require("../../modules/cpu-temp"),
    "cpu-usage": require("../../modules/cpu-usage"),
    battery: require("../../modules/battery"),
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
        if (this.checkData(data)) {
            this.emit("data", data);
        }
    }

    private buildInstance() {
        try {
            if (this.module in builtinModules) {
                this.instance = builtinModules[this.module](this.onData.bind(this), this.config);
            } else {
                // Dirty hack to work around webpack
                const mod: any = eval("require")(this.module);

                this.instance = Object.hasOwn(mod, "default")
                    ? (mod as IModuleRequiredConstructor).default(this.onData.bind(this), this.config)
                    : (mod as IModuleFunctionConstructor)(this.onData.bind(this), this.config);
            }

        } catch (err) {
            this.emit("error", new CommandRunnerRunError(`${this.module} ${err.message}`, err.stack));
        }
    }

    private checkData(data: IBlockOutput): boolean {
        if (!("full_text" in data)) {
            this.emit("error", new CommandRunnerDataError());
            return false;
        }

        if (typeof data.full_text !== "string") {
            this.emit("error", new CommandRunnerDataError("full_text"));
            return false;
        }

        if ("background" in data && typeof data.background !== "string") {
            this.emit("error", new CommandRunnerDataError("background"));
            return false;
        }

        if ("border" in data && typeof data.border !== "string") {
            this.emit("error", new CommandRunnerDataError("border"));
            return false;
        }

        if ("border_bottom" in data && typeof data.border_bottom !== "number") {
            this.emit("error", new CommandRunnerDataError("border_bottom"));
            return false;
        }

        if ("border_left" in data && typeof data.border_left !== "number") {
            this.emit("error", new CommandRunnerDataError("border_left"));
            return false;
        }

        if ("border_right" in data && typeof data.border_right !== "number") {
            this.emit("error", new CommandRunnerDataError("border_right"));
            return false;
        }

        if ("border_top" in data && typeof data.border_top !== "number") {
            this.emit("error", new CommandRunnerDataError("border_top"));
            return false;
        }

        if ("color" in data && typeof data.color !== "string") {
            this.emit("error", new CommandRunnerDataError("color"));
            return false;
        }

        if ("markup" in data && typeof data.markup !== "string") {
            this.emit("error", new CommandRunnerDataError("markup"));
            return false;
        }

        if ("name" in data && typeof data.name !== "string") {
            this.emit("error", new CommandRunnerDataError("name"));
            return false;
        }

        if ("separator" in data && typeof data.separator !== "boolean") {
            this.emit("error", new CommandRunnerDataError("separator"));
            return false;
        }

        if ("separator_block_width" in data && typeof data.separator_block_width !== "number") {
            this.emit("error", new CommandRunnerDataError("separator_block_width"));
            return false;
        }

        if ("short_text" in data && typeof data.short_text !== "string") {
            this.emit("error", new CommandRunnerDataError("short_text"));
            return false;
        }

        if (
            "align" in data &&
            typeof data.align !== "string" &&
            !((data.align as string) in ["left", "center", "right"])
        ) {
            this.emit("error", new CommandRunnerDataError("align"));
            return false;
        }

        if ("urgent" in data && typeof data.urgent !== "boolean") {
            this.emit("error", new CommandRunnerDataError("urgent"));
            return false;
        }

        return true;
    }

}
