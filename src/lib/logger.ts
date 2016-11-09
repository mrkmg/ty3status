import {openSync, write} from "fs";
import {EOL} from "os";
import {setImmediate} from "timers";

export class Logger {
    public LOG_LOCATION: string = "/tmp/ty3bar.err";
    private logFile: number;
    private isWriting = false;

    constructor() {
        if (process.env.LOG_FILE) {
            this.LOG_LOCATION = process.env.LOG_FILE;
        }

        try {
            this.logFile = openSync(this.LOG_LOCATION, "a");
        } catch (err) {
            process.stderr.write(err.message);
            process.stderr.write(EOL);
            process.exit(3);
        }
    }

    public log(data: string): void {
        this.write(`LOG: ${data}${EOL}`);
    }

    public debug(data: string): void {
        this.write(`DEBUG: ${data}${EOL}`);
    }

    public error(data: string): void {
        this.write(`ERROR: ${data}${EOL}`);
    }

    public exception(data: string): void {
        this.write(`EXCEPT: ${data}${EOL}`);
    }

    private write(data: string): void {
        if (this.isWriting) {
            return setImmediate(() => this.write(data));
        }

        this.isWriting = true;

        write(this.logFile, data, () => this.isWriting = false);
    }
}

export default new Logger();
