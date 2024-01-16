import BaseModule from "../lib/base-module";
import {IBlockConfig} from "../models/config-types";
import {IModuleDataFunction} from "../models/module-block";
import xtend = require("xtend");
import {loadavg} from "os";

export = (dataCallback: IModuleDataFunction, config: IBlockConfig) => {
    return new LoadAvgModule(dataCallback, config);
};

class LoadAvgModule extends BaseModule {
    constructor(dataCallback: IModuleDataFunction, config: IBlockConfig) {
        super(dataCallback, config);

        this.config.params = xtend({
            o1: true,
            o15: true,
            o5: true,
            precision: 2,
        }, this.config.params);
    }

    protected onTick(): void {
        const [o1, o5, o15] = loadavg();
        let str = "";

        if (this.config.params.o1) {
            str += o1.toFixed(this.config.params.precision) + " ";
        }
        if (this.config.params.o5) {
            str += o5.toFixed(this.config.params.precision) + " ";
        }
        if (this.config.params.o15) {
            str += o15.toFixed(this.config.params.precision) + " ";
        }

        this.dataCallback({
            full_text: str.trim(),
        });
    }
}
