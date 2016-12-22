declare module "striptags" {
    export = strip;

    function strip(html: string, tags?: string | Array<string>): string;
}
