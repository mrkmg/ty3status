import {IBlockConfig} from "../models/config-types";
import {IModule, IModuleDataFunction} from "../models/module-block";
import {clearInterval, setInterval} from "timers";

export default class BaseModule implements IModule {
    protected timer: NodeJS.Timer;
    protected running: boolean = false;

    constructor(protected dataCallback: IModuleDataFunction, protected config: IBlockConfig) {
    }

    public start(): void {
        if (this.config.interval <= 0) {
            this.onTick();
            return;
        }

        let timeout = this.config.interval * 1000;

        if (!this.running) {
            this.onTick();
            this.timer = setInterval(() => this.onTick(), timeout);
            this.running = true;
        }
    }

    public stop(): void {
        if (this.running) {
            clearInterval(this.timer);
            this.running = false;
        }
    }

    public clicked(button: number): void {
        this.onTick();
    }

    public tick(): void {
        this.onTick();
    }

    protected onTick(): void {
        throw new Error("This should not be used alone");
    }
}
