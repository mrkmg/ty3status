import BaseModule from "../lib/base-module";
import {IBlockConfig} from "../models/config-types";
import {IModuleDataFunction} from "../models/module-block";
import {readFile} from "fs";
import {freemem, platform, totalmem} from "os";

export = (dataCallback: IModuleDataFunction, config: IBlockConfig) => {
    return new MemoryModule(dataCallback, config);
};

class MemoryModule extends BaseModule {
    protected onTick(): void {
        if (platform() === "linux") {
            this.onTickLinux();
        } else {
            this.onTickOther();
        }
    }

    private outputMemData(data: IMemUsage) {
        let percentage = Math.round(((data.total - data.free) / data.total) * 100);

        this.dataCallback({
            full_text: `${(data.total - data.free).toFixed(1)}/${data.total.toFixed(1)} (${percentage}%)`,
        });
    }

    private onTickOther(): void {
        this.outputMemData({
            free: Math.round((freemem() / 1024 / 1024 / 1024) * 10) / 10,
            total: Math.round((totalmem() / 1024 / 1024 / 1024) * 10) / 10,
        });
    }

    private onTickLinux(): void {
        readFile("/proc/meminfo", (err, data) => {
            if (!err) {
                this.outputMemData(this.parseMemInfoLinux(data.toString()));
            }
        });
    }

    private parseMemInfoLinux(data: string): IMemUsage {
        let memTotal = 0;
        let memFree = 0;
        let buffers = 0;
        let cached = 0;

        let lines = data.split(/\n/g);
        let totalLines = lines.length;

        for (let i = 0; i < totalLines; i++) {
            let line = lines[i].split(/\s+/);

            // tslint:disable-next-line
            switch (line[0]) {
                case "MemTotal:": memTotal = parseInt(line[1], 10); break;
                case "MemFree:": memFree = parseInt(line[1], 10); break;
                case "Buffers:": buffers = parseInt(line[1], 10); break;
                case "Cached:": cached = parseInt(line[1], 10); break;
            }
        }

        return {
            free: Math.round(((memFree + buffers + cached) / 1024 / 1024) * 10) / 10,
            total: Math.round((memTotal / 1024 / 1024) * 10) / 10,
        };
    }
}

interface IMemUsage {
    free: number;
    total: number;
}
