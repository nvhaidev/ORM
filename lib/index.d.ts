import { Config } from "./models";
declare class ORM {
    private pool;
    constructor(config: Config);
    crateTable: (tableName: string, columns?: {
        [key: string]: any;
    } | undefined) => Promise<{
        create: (value: {
            [key: string]: any;
        }) => Promise<any>;
        findOne: (value: {
            [key: string]: any;
        }) => Promise<any>;
        findById: (id: number, options?: {
            [key: string]: any;
        } | undefined) => Promise<any>;
        findAll: (options?: {
            [key: string]: any;
        } | undefined) => Promise<any[] | undefined>;
    } | undefined>;
    checkTable: (tableName: string) => Promise<boolean>;
    validateValue: (value: {
        [key: string]: any;
    }) => boolean;
}
export default ORM;
