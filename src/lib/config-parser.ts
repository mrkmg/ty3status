import {EBlockConfigType, IBlockConfig, IBlocksConfig} from "../models/config-types";
import {Ty3Error} from "../models/ty3error";
import {readFileSync} from "fs";
import {EOL} from "os";
import xtend = require("xtend");

export default function configParser(filePath: string): IBlocksConfig {
    return (new ConfigParser(filePath)).getConfig();
}

export class ConfigParser {
    private fileContents: string;
    private fileJson: IBlocksConfig;
    private parseErrors: Array<IConfigParseError> = [];

    constructor(private filePath: string) {
        this.readFile();
        this.readJson();
        this.mergeDefaults();
        this.validate();
    }

    public getConfig(): IBlocksConfig {
        return this.fileJson;
    }

    private readFile() {
        try {
            this.fileContents = readFileSync(this.filePath).toString();
        } catch (err) {
            throw new ConfigFileError(this.filePath, err);
        }
    }

    private readJson() {
        try {
            let json: any = JSON.parse(this.fileContents);

            // Convert string to enums
            if ("blocks" in json && Array.isArray(json.blocks)) {
                for (let i = 0; i < json.blocks.length; i++) {
                    if ("type" in json.blocks[i]) {
                        json.blocks[i].type = EBlockConfigType[json.blocks[i].type];
                    }
                }
            }

            this.fileJson = json;
        } catch (err) {
            throw new ConfigFileError(this.filePath, err);
        }
    }

    private mergeDefaults() {
        let reqDefaults: IBlockConfig = {
            ignoreError: true,
            markup: "none",
            maxRetries: 20,
            retryDelay: 1000,
            separator: true,
            type: EBlockConfigType.legacy,
        };

        for (let i =0; i < this.fileJson.blocks.length; i++) {
            this.fileJson.blocks[i] = xtend(reqDefaults, this.fileJson.defaults, this.fileJson.blocks[i]);
        }
    }

    private validate() {
        if (!this.fileJson.blocks) {
            this.parseErrors.push({
                error: "Required",
                param: "blocks",
            });
            return;
        }
        if (!Array.isArray(this.fileJson.blocks)) {
            this.parseErrors.push({
                error: "Must be an array.",
                param: "blocks",
            });
            return;
        }

        if ("defaults" in this.fileJson) {
            this.validateBlock(this.fileJson.defaults, `defaults`);
        }

        for (let i = 0; i < this.fileJson.blocks.length; i++) {
            this.validateBlock(this.fileJson.blocks[i], `blocks.block[${i}]`);
        }

        if (this.parseErrors.length) {
            throw new ValidationError(this.parseErrors);
        }
    }

    private validateBlock(block: IBlockConfig, path: string) {
        for (let prop in block) {
            if (block.hasOwnProperty(prop)) {
                switch (prop) {
                    case "type":
                        if (!(block.type in EBlockConfigType)) {
                            this.parseErrors.push({
                                error: `Invalid type: ${block.type}`,
                                param: `${path}.type`,
                            });
                            continue;
                        }
                        break;
                    case "script":
                        if (typeof block.script !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.script}`,
                                param: `${path}.script`,
                            });
                            continue;
                        }
                        break;
                    case "module":
                        if (typeof block.module !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.module}`,
                                param: `${path}.module`,
                            });
                            continue;
                        }
                        break;
                    case "params":
                        // TODO
                        break;
                    case "interval":
                        if (typeof block.interval !== "number") {
                            this.parseErrors.push({
                                error: `Not a number: ${block.interval}`,
                                param: `${path}.interval`,
                            });
                            continue;
                        }
                        break;
                    case "signal":
                        if (typeof block.signal !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.interval}`,
                                param: `${path}.signal`,
                            });
                            continue;
                        }
                        break;
                    case "color":
                        if (typeof block.color !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.color}`,
                                param: `${path}.color`,
                            });
                            continue;
                        }
                        if (!isValidColor(block.color)) {
                            this.parseErrors.push({
                                error: `Not a color: ${block.color}`,
                                param: `${path}.color`,
                            });
                            continue;
                        }
                        break;
                    case "separator":
                        // TODO
                        break;
                    case "separatorWidth":
                        if (block.separatorWidth <= 0) {
                            this.parseErrors.push({
                                error: `Must be greater than 0: ${block.separatorWidth}`,
                                param: `${path}.separatorWidth`,
                            });
                            continue;
                        }
                        break;
                    case "prefix":
                        if (typeof block.prefix !== "string") {
                            this.parseErrors.push({
                                error: `Must be a string: ${block.separatorWidth}`,
                                param: `${path}.separatorWidth`,
                            });
                            continue;
                        }
                        break;
                    case "postfix":
                        if (typeof block.postfix !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.postfix}`,
                                param: `${path}.postfix`,
                            });
                            continue;
                        }
                        break;
                    case "instance":
                        if (typeof block.instance !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.instance}`,
                                param: `${path}.instance`,
                            });
                            continue;
                        }
                        break;
                    case "ignoreError":
                        if (typeof block.ignoreError !== "boolean") {
                            this.parseErrors.push({
                                error: `Not a boolean: ${block.ignoreError}`,
                                param: `${path}.ignoreError`,
                            });
                            continue;
                        }
                        break;
                    case "markup":
                        if (typeof block.markup !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.markup}`,
                                param: `${path}.markup`,
                            });
                            continue;
                        }
                        break;
                    case "maxRetries":
                        if (typeof block.maxRetries !== "number") {
                            this.parseErrors.push({
                                error: `Not a number: ${block.maxRetries}`,
                                param: `${path}.maxRetries`,
                            });
                            continue;
                        }
                        break;
                    case "retryDelay":
                        if (typeof block.retryDelay !== "number") {
                            this.parseErrors.push({
                                error: `Not a number: ${block.retryDelay}`,
                                param: `${path}.retryDelay`,
                            });
                            continue;
                        }
                        break;
                    default:
                        this.parseErrors.push({
                            error: `Unknown key: ${prop}`,
                            param: `${path}`,
                        });
                }
            }
        }

        if (block.type === EBlockConfigType.legacy) {
            if (!("script" in block)) {
                this.parseErrors.push({
                    error: "script is required for legacy type.",
                    param: path,
                });
            }
            if (!("interval" in block)) {
                this.parseErrors.push({
                    error: "interval is required for legacy type.",
                    param: path,
                });
            }
        } else if (block.type === EBlockConfigType.persistent) {
            if (!("script" in block)) {
                this.parseErrors.push({
                    error: "script is required for persistent type.",
                    param: path,
                });
            }
        } else if (block.type === EBlockConfigType.module) {
            if (!("module" in block)) {
                this.parseErrors.push({
                    error: "module is required for module type.",
                    param: path,
                });
            }
        }
    }
}

export class ConfigFileError extends Ty3Error {
    constructor(private file: string, private originalError: Error) {
        super("File Read Error");
    }

    public display() {
        super.display();

        process.stderr.write(`Failed to read ${this.file}${EOL}`);
        process.stderr.write(this.originalError.message);
    }
}

export class ValidationError extends Ty3Error {
    constructor(private errors: Array<IConfigParseError>) {
        super("Validation Error");
    }

    public display() {
        super.display();

        let error: IConfigParseError;
        let i: number;

        for (i = 0; i < this.errors.length; i++) {
            error = this.errors[i];
            process.stderr.write(error.param);
            process.stderr.write(": ");
            process.stderr.write(error.error);
            process.stderr.write(EOL);
        }
    }
}

export interface IConfigParseError {
    error: string;
    param: string;
}

function isValidColor(color: string): boolean {
    return /#[0-9a-fA-F]{6}/.test(color);
}
