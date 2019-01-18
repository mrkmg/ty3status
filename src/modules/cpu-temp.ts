import BaseModule from "../lib/base-module";
import {IBlockConfig} from "../models/config-types";
import {IModuleDataFunction} from "../models/module-block";
import {readFileSync, readdirSync} from "fs";
import xtend = require("xtend");
import {clearInterval, setInterval} from "timers";

export = (dataCallback: IModuleDataFunction, config: IBlockConfig) => {
    return new CpuTempModule(dataCallback, config);
};

class CpuTempModule extends BaseModule {
    private thermalZones: string[];
    private temps: number[] = [];
    private pollInterval: NodeJS.Timer = null;

    constructor(dataCallback: IModuleDataFunction, config: IBlockConfig) {
        super(dataCallback, config);

        this.config.params = xtend({
            averageLength: 200,
            dangerColor: "#FF0000",
            dangerTemp: 80,
            pollFrequency: 200,
            safeColor: "#00FF00",
            warningColor: "#FFFF00",
            warningTemp: 70,
        }, this.config.params);

        this.getThermalZones();
    }

    public start() {
        super.start();
        this.setupPolling();
    }

    public stop() {
        super.stop();
        this.stopPolling();
    }

    protected onTick(): void {
        const currentTemp = Math.round(10 * (this.temps.reduce((p, c) => p + c, 0) / this.temps.length)) / 10;

        if (isNaN(currentTemp)) {
            return;
        }

        let color: string = this.config.params.safeColor;

        if (currentTemp >= this.config.params.dangerTemp) {
            color = this.config.params.dangerColor;
        } else if (currentTemp >= this.config.params.warningTemp) {
            color = this.config.params.warningColor;
        }

        this.dataCallback({
            full_text: `${currentTemp}°C`,
            color,
        });
    }

    private getTemp() {
        let temps: number[] = [];
        for (const zone of this.thermalZones) {
            temps.push(this.getTempOfZone(zone));
        }

        if (temps.length === 0) {
            return 0;
        }
        return temps.reduce((p, c) => p + c, 0) / temps.length;
    }

    private getTempOfZone(zone: string) {
        return +(readFileSync(`/sys/class/thermal/${zone}/temp`).toString()) / 1000;
    }

    private getThermalZones() {
        const result = readdirSync("/sys/class/thermal/");

        let thermalZones: string[] = [];

        for (const obj of result) {
            if (/^thermal_zone\d/.test(obj)) {
                thermalZones.push(obj);
            }
        }

        this.thermalZones = thermalZones;
    }

    private onPoll() {
        this.temps.push(this.getTemp());
        while (this.temps.length > this.config.params.averageLength) {
            this.temps.shift();
        }
    }

    private setupPolling() {
        this.stopPolling();
        this.pollInterval = setInterval(() => this.onPoll(), this.config.params.pollFrequency);
    }

    private stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }
}
