class Exception extends Error {
    constructor(message?: string) {
        super(message);
        this.message = message;
        this.name = "Exception";
        this.stack = (<any> new Error()).stack;
    }
}

export default Exception;
