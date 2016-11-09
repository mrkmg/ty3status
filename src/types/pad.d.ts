declare module "pad" {
    export = pad;

    function pad(str: string, cnt: number, opt: IPadOpts): string;
    function pad(cnt: number, str: string, opt: IPadOpts): string;

    interface IPadOpts {
        char?: string;
        colors?: boolean;
        strip?: boolean;
    }
}
