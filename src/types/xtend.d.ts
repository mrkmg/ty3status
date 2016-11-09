declare module "xtend" {
    export = extend;
    function extend<T>(...objs: T[]): T;
}
