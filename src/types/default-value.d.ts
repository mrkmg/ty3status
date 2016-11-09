declare module "default-value" {
    export = defaultValue;
    function defaultValue<T>(val: T | undefined, def: T): T;
}
