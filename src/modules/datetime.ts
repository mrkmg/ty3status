import BaseModule from "../lib/base-module";
import {IBlockConfig} from "../models/config-types";
import {IModuleDataFunction} from "../models/module-block";
import dateformat = require("dateformat");
import xtend = require("xtend");

export = (dataCallback: IModuleDataFunction, config: IBlockConfig) => {
    return new DateTimeModule(dataCallback, config);
};

class DateTimeModule extends BaseModule {
    constructor(dataCallback: IModuleDataFunction, config: IBlockConfig) {
        super(dataCallback, config);

        this.config.params = xtend({
            format: "ddd mmm dd yyyy h:MM:ss TT",
        }, this.config.params);

        this.config.interval = 1;
    }

    protected onTick(): void {
        this.dataCallback({
            full_text: dateformat(this.config.params.format),
        });
    }
}
