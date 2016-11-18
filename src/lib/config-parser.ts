import {EBlockConfigType, IBlockConfig, IBlocksConfig} from "../models/config-types";
import {Ty3Error} from "../models/ty3error";
import {readFileSync} from "fs";
import {safeLoad as yaml} from "js-yaml";
import {EOL} from "os";
import xtend = require("xtend");

export default function configParser(filePath: string): IBlocksConfig {
    return (new ConfigParser(filePath)).getConfig();
}

export class ConfigParser {
    private fileContents: string;
    private parsedConfig: IBlocksConfig;
    private parseErrors: Array<IConfigParseError> = [];

    constructor(private filePath: string) {
        this.readFile();
        this.parseFile();
        this.mergeDefaults();
        this.validate();
    }

    public getConfig(): IBlocksConfig {
        return this.parsedConfig;
    }

    private readFile() {
        try {
            this.fileContents = readFileSync(this.filePath).toString();
        } catch (err) {
            throw new ConfigFileError(this.filePath, err);
        }
    }

    private parseFile() {
        try {
            let parsedFile = yaml(this.fileContents);
            // Convert string to enums
            if ("blocks" in parsedFile && Array.isArray(parsedFile.blocks)) {
                for (let i = 0; i < parsedFile.blocks.length; i++) {
                    if ("type" in parsedFile.blocks[i]) {
                        parsedFile.blocks[i].type = EBlockConfigType[parsedFile.blocks[i].type];
                    }
                }
            }

            this.parsedConfig = parsedFile;
        } catch (err) {
            throw new ConfigFileError(this.filePath, err);
        }
    }

    private mergeDefaults() {
        let reqDefaults: IBlockConfig = {
            ignoreError: true,
            interval: 30,
            markup: "none",
            maxRetries: 20,
            params: {},
            retryDelay: 1000,
            separator: true,
            type: EBlockConfigType.legacy,
        };

        for (let i = 0; i < this.parsedConfig.blocks.length; i++) {
            this.parsedConfig.blocks[i] = xtend(reqDefaults, this.parsedConfig.defaults, this.parsedConfig.blocks[i]);
        }

        if (!this.parsedConfig.outputSpeedLimit) {
            this.parsedConfig.outputSpeedLimit = 500;
        }
    }

    private validate() {
        if (typeof this.parsedConfig.outputSpeedLimit !== "number") {
            this.parseErrors.push({
                error: "Must be a number",
                param: "outputSpeedLimit",
            });
            return;
        }

        if (this.parsedConfig.outputSpeedLimit <= 0) {
            this.parseErrors.push({
                error: "Must be greater than 0",
                param: "outputSpeedLimit",
            });
            return;
        }

        if (!this.parsedConfig.blocks) {
            this.parseErrors.push({
                error: "Required",
                param: "blocks",
            });
            return;
        }
        if (!Array.isArray(this.parsedConfig.blocks)) {
            this.parseErrors.push({
                error: "Must be an array.",
                param: "blocks",
            });
            return;
        }

        if ("defaults" in this.parsedConfig) {
            this.validateBlock(this.parsedConfig.defaults, `defaults`);
        }

        for (let i = 0; i < this.parsedConfig.blocks.length; i++) {
            this.validateBlock(this.parsedConfig.blocks[i], `blocks.block[${i}]`);
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
                    case "background":
                        if (typeof block.background !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.background}`,
                                param: `${path}.background`,
                            });
                            continue;
                        }
                        if (!isValidColor(block.background)) {
                            this.parseErrors.push({
                                error: `Not a valid color: ${block.background}`,
                                param: `${path}.background`,
                            });
                        }
                        break;
                    case "border":
                        if (typeof block.border !== "string") {
                            this.parseErrors.push({
                                error: `Not a string: ${block.border}`,
                                param: `${path}.border`,
                            });
                            continue;
                        }
                        if (!isValidColor(block.border)) {
                            this.parseErrors.push({
                                error: `Not a valid color: ${block.border}`,
                                param: `${path}.border`,
                            });
                        }
                        break;
                    case "borderBottom":
                        if (typeof block.borderBottom !== "number") {
                            this.parseErrors.push({
                                error: `Not a number: ${block.borderBottom}`,
                                param: `${path}.borderBottom`,
                            });
                            continue;
                        }
                        if (block.borderBottom < 0) {
                            this.parseErrors.push({
                                error: `Must be greater or equal to 0`,
                                param: `${path}.borderBottom`,
                            });
                            continue;

                        }
                        break;
                    case "borderLeft":
                        if (typeof block.borderLeft !== "number") {
                            this.parseErrors.push({
                                error: `Not a number: ${block.borderLeft}`,
                                param: `${path}.borderLeft`,
                            });
                            continue;
                        }
                        if (block.borderLeft < 0) {
                            this.parseErrors.push({
                                error: `Must be greater or equal to 0`,
                                param: `${path}.borderLeft`,
                            });
                            continue;

                        }
                        break;
                    case "borderRight":
                        if (typeof block.borderRight !== "number") {
                            this.parseErrors.push({
                                error: `Not a number: ${block.borderRight}`,
                                param: `${path}.borderRight`,
                            });
                            continue;
                        }
                        if (block.borderRight < 0) {
                            this.parseErrors.push({
                                error: `Must be greater or equal to 0`,
                                param: `${path}.borderRight`,
                            });
                            continue;

                        }
                        break;
                    case "borderTop":
                        if (typeof block.borderTop !== "number") {
                            this.parseErrors.push({
                                error: `Not a number: ${block.borderTop}`,
                                param: `${path}.borderTop`,
                            });
                            continue;
                        }
                        if (block.borderTop < 0) {
                            this.parseErrors.push({
                                error: `Must be greater or equal to 0`,
                                param: `${path}.borderTop`,
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
