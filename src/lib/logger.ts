import {openSync, write} from "fs";
import {EOL} from "os";

const LOG_LOCATION = "/tmp/ty3bar.err";

export class Logger {
    private logFile: number;

    constructor() {
        this.logFile = openSync(LOG_LOCATION, "a");
    }

    public log(data: string) {
        write(this.logFile, `LOG: ${data}${EOL}`);
    }

    public debug(data: string) {
        write(this.logFile, `DEBUG: ${data}${EOL}`);
    }
}

export default new Logger();
