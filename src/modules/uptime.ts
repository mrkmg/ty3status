import BaseModule from "../lib/base-module";
import {IBlockConfig} from "../models/config-types";
import {IModuleDataFunction} from "../models/module-block";
import {uptime} from "os";
import pad = require("pad");
import xtend = require("xtend");

export = (dataCallback: IModuleDataFunction, config: IBlockConfig) => {
    return new UptimeModule(dataCallback, config);
};

class UptimeModule extends BaseModule {
    constructor(dataCallback: IModuleDataFunction, config: IBlockConfig) {
        super(dataCallback, config);

        this.config.params = xtend({
            showSeconds: false,
        }, this.config.params);
    }

    protected onTick(): void {
        this.dataCallback({
            full_text: this.makeTime(uptime()),
        });
    }

    private makeTime(time: number): string {
        let hours = Math.floor(time / 3600);
        time -= hours * 3600;
        let min = Math.floor(time / 60);
        time -= min * 60;

        if (this.config.params.showSeconds) {
            return `${padTime(hours)}:${padTime(min)}:${padTime(time)}`;
        } else {
            return `${padTime(hours)}:${padTime(min)}`;
        }
    }
}

function padTime(num: number): string {
    return pad(2, num.toString(), {char: "0"});
}
