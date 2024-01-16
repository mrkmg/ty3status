declare module "striptags" {
    export = strip;
    function strip(html: string, tags?: string | string[]): string;
}
