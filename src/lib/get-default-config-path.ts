import {Ty3Error} from "../models/ty3error";
import {existsSync} from "fs";
import {EOL, homedir} from "os";

let checkPoints = [
    `${homedir()}/.config/ty3bar.json`,
    `${homedir()}/.config/i3/ty3bar.json`,
    "/etc/ty3bar.json",
];

export default function getDefaultConfigPath(): string {
    for (let i in checkPoints) {
        if (existsSync(checkPoints[i])) {
            return checkPoints[i];
        }
    }
    throw new MissingConfigError();
}

export class MissingConfigError extends Ty3Error {
    constructor() {
        super("Missing Config Error");
    }

    public display() {
        super.display();

        process.stderr.write(`Specify a config or place a config in one of the following files: ${EOL}`);
        for (let i = 0; i < checkPoints.length; i++) {
            process.stderr.write(`${checkPoints[i]}${EOL}`);
        }
    }
}
