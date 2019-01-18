import {openSync, write} from "fs";
import {EOL} from "os";
import {setImmediate} from "timers";

export class Logger {
    public LOG_LOCATION: string = "";
    private logFile: number;
    private isWriting = false;
    private writeLogs = false;

    constructor() {
        if (process.env.LOG_FILE) {
            this.LOG_LOCATION = process.env.LOG_FILE;
        }

        if (this.LOG_LOCATION === "") {
            return;
        }

        try {
            this.logFile = openSync(this.LOG_LOCATION, "a");
            this.writeLogs = true;
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
        if (!this.writeLogs) {
            return;
        }

        if (this.isWriting) {
            setImmediate(() => this.write(data));
            return;
        }

        this.isWriting = true;

        write(this.logFile, data, () => this.isWriting = false);
    }
}

export default new Logger();
