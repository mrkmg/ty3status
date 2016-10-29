import {IModule, IModuleDataFunction} from "../models/module-block";
import {uptime} from "os";
import pad = require("pad");
import xtend = require("xtend");
import {clearInterval, setInterval} from "timers";

export = (dataCallback: IModuleDataFunction, params: any) => {
    return new UptimeModule(dataCallback, params);
};

class UptimeModule implements IModule {
    private timer: NodeJS.Timer;
    private running: boolean = false;

    constructor(private dataCallback: IModuleDataFunction, private params: any) {
        this.params = xtend({
            showSeconds: false,
        }, params);
    }

    public start(): void {
        let timeout = this.params.showSeconds ? 1000 : 60000;

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

    private onTick(): void {
        this.dataCallback({
            full_text: this.makeTime(uptime()),
        });
    }

    private makeTime(time: number): string {
        let hours = Math.floor(time / 3600);
        time -= hours * 3600;
        let min = Math.floor(time / 60);
        time -= min * 60;

        if (this.params.showSeconds) {
            return `${padTime(hours)}:${padTime(min)}:${padTime(time)}`;
        } else {
            return `${padTime(hours)}:${padTime(min)}`;
        }
    }
}

function padTime(num: number): string {
    return pad(2, num.toString(), {char: "0"});
}
