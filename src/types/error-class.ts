class Exception extends Error {
    constructor(message?: string, stack?: string) {
        super(message);
        this.message = message;
        this.name = "Exception";
        this.stack = stack ? stack : (new Error()).stack;
    }
}

export default Exception;
