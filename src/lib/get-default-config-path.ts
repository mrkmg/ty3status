import {Ty3Error} from "../models/ty3error";
import {existsSync} from "fs";
import {EOL, homedir} from "os";

const checkPoints = [
    `${homedir()}/.config/ty3status.yaml`,
    `${homedir()}/.config/i3/ty3status.yaml`,
    "/etc/ty3status.yaml",
];

export default function getDefaultConfigPath(): string {
    for (const i in checkPoints) {
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
        for (const item of checkPoints) {
            process.stderr.write(`${item}${EOL}`);
        }
    }
}
