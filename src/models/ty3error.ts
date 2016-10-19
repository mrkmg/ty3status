import {EOL} from "os";

export class Ty3Error extends Error {
    constructor(message: string) {
        super(message);
    }

    public display(): void {
        process.stderr.write(this.message);
        process.stderr.write(EOL);
    };
}
