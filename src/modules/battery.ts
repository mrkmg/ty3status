import BaseModule from "../lib/base-module";
import {IBlockConfig, IBlockOutput} from "../models/config-types";
import {IModuleDataFunction} from "../models/module-block";
import {ChildProcess, spawn} from "child_process";
import {clearTimeout, setTimeout} from "timers";
import xtend = require("xtend");

const icons = {
    level_0: "<span font_desc=\"FontAwesome\">\uF244</span>",
    level_100: "<span font_desc=\"FontAwesome\">\uF240</span>",
    level_25: "<span font_desc=\"FontAwesome\">\uF243</span>",
    level_50: "<span font_desc=\"FontAwesome\">\uF242</span>",
    level_75: "<span font_desc=\"FontAwesome\">\uF241</span>",
    plug: "<span font_desc=\"FontAwesome\">\uF1E6</span>",
};

export = (dataCallback: IModuleDataFunction, config: IBlockConfig) => {
    return new BatteryModule(dataCallback, config);
};

class BatteryModule extends BaseModule {
    private upowerDataGetRunning = false;
    private upowerMonitorRunning = false;
    private upowerMonitorProcess: ChildProcess;
    private upowerMonitorTimeout: NodeJS.Timeout;

    constructor(dataCallback: IModuleDataFunction, config: IBlockConfig) {
        super(dataCallback, config);

        this.config.params = xtend({
            battery: "BAT0",
            chargedText: "F",
            chargingText: "C",
            dischargingText: "D",
            fontAwesome: false,
            urgentLevel: 10,
        }, this.config.params);
    }

    public start() {
        super.start();
        this.startUpowerMonitor();
    }

    public stop() {
        super.stop();

        this.upowerMonitorProcess.kill();
    }

    protected onTick(): void {
        this.runUPower();
    }

    private output(data: IUPower): void {
        let fullText: string = `${this.getIcon(data.state, data.percentage)} ${data.percentage}%`;

        if (data.state === "discharging") {
            fullText += ` (${data.timeDischarging})`;
        } else if (data.state === "charging") {
            fullText += ` (${data.timeCharging})`;
        }

        const outputData: IBlockOutput = {
            color: percentageToColor(data.percentage),
            full_text: fullText,
            short_text: data.percentage.toString(),
        };

        if (data.percentage <= this.config.params.urgentLevel) {
            outputData.urgent = true;
        }

        this.dataCallback(outputData);
    }

    private getIcon(state: string, percentage: number): string {
        if (this.config.params.fontAwesome) {
            if (state === "fully-charged" || state === "charging") {
                return icons.plug;
            } else if (percentage > 90) {
                return icons.level_100;
            } else if (percentage > 75) {
                return icons.level_75;
            } else if (percentage > 50) {
                return icons.level_50;
            } else if (percentage > 25) {
                return icons.level_25;
            } else {
                return icons.level_0;
            }
        } else {
            switch (state) {
                case "discharging":
                    return this.config.params.dischargingText;
                case "charging":
                    return this.config.params.chargingText;
                case "fully-charged":
                    return this.config.params.chargedText;
                default:
                    return "";
            }
        }
    }

    private startUpowerMonitor(): void {
        if (this.upowerMonitorRunning) {
            return;
        }

        this.upowerMonitorRunning = true;

        this.upowerMonitorProcess = spawn("upower", [
            "--monitor",
        ]);

        this.upowerMonitorProcess.stdout.on("data", () => {
            clearTimeout(this.upowerMonitorTimeout);
            this.upowerMonitorTimeout = setTimeout(() => this.onTick(), 100);
        });

        this.upowerMonitorProcess.on("error", () => {
            // TODO Need to implement a way for modules to log non fatal errors
        });
    }

    private runUPower(): void {
        if (this.upowerDataGetRunning) {
            return;
        }

        this.upowerDataGetRunning = true;

        let rawOutput: string = "";

        const upowerProcess: ChildProcess = spawn("upower", [
            "-i",
            `/org/freedesktop/UPower/devices/battery_${this.config.params.battery}`,
        ]);

        upowerProcess.stdout.on("data", (data: Buffer) => {
            rawOutput += data.toString();
        });

        upowerProcess.on("exit", (exitCode: number) => {
            if (exitCode === 0) {
                this.output(this.parseUPowerOutput(rawOutput));
                this.upowerDataGetRunning = false;
            }
        });

        upowerProcess.on("error", (error: Error) => {
            this.dataCallback({
                full_text: error.message,
            });
        });
    }

    private parseUPowerOutput(rawOutput: string): IUPower {
        let state: string = "";
        let percentage: number = 0;
        let timeCharging: string = "";
        let timeDischarging: string = "";

        const lines = rawOutput.split(/\n/g);

        const outputLength = lines.length;
        let line: string;
        let matches: string[];
        let option: string;
        let value: string;
        for (let i = 0; i < outputLength; i++) {
            line = lines[i];

            matches = line.match(/^\s+([a-z\- ]+):\s+(.+)$/);

            if (!matches || matches.length !== 3) {
                continue;
            }

            option = matches[1];
            value = matches[2];

            // tslint:disable-next-line:switch-default
            switch (option) {
                case "state":
                    state = value;
                    break;
                case "percentage":
                    percentage = parseInt(value, 10);
                    break;
                case "time to full":
                    timeCharging = value;
                    break;
                case "time to empty":
                    timeDischarging = value;
                    break;
            }
        }

        return {
            state,
            percentage,
            timeCharging,
            timeDischarging,
        };
    }
}

function percentageToColor(percentage: number): string {
    let blue: string;
    let green: string;
    let red: string;

    if (percentage > 50) {
        red = Math.round((100 - percentage) * 2.55 * 2).toString(16);
        red = "00".substring(red.length) + red;
        green = "FF";
        blue = "00";
    } else {
        red = "FF";
        green = Math.round(percentage * 2.55 * 2).toString(16);
        green = "00".substring(green.length) + green;
        blue = "00";
    }
    return "#" + red + green + blue;
}

interface IUPower {
    state: string;
    percentage: number;
    timeCharging: string;
    timeDischarging: string;
}
