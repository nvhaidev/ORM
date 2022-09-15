import { Config, Data, Row, TypeMethod } from "./models";
declare class ORM {
    private pool;
    private tableName;
    constructor(config: Config);
    crateTable: (tableName: string, columns?: {
        [key: string]: any;
    } | undefined) => Promise<boolean>;
    checkTable: (tableName: string) => Promise<boolean>;
    table<T>(tableName: string): {
        create: (value: {
            [key: string]: any;
        }) => Promise<TypeMethod | undefined>;
        findOne: (value: {
            [key: string]: any;
        }) => Promise<(T & {
            save: () => Promise<void>;
            destroy: () => Promise<void>;
        }) | undefined>;
        findById: (id: number, options?: {
            [key: string]: any;
        } | undefined) => Promise<(T & {
            save: () => Promise<void>;
            destroy: () => Promise<void>;
        }) | undefined>;
        findAll: (options?: {
            [key: string]: any;
        } | undefined) => Promise<any[] | undefined>;
    } | undefined;
    create<T>(value: {
        [key: string]: any;
    }): Promise<TypeMethod | undefined>;
    findOne<T>(value: {
        [key: string]: any;
    }): Promise<(T & {
        save: () => Promise<void>;
        destroy: () => Promise<void>;
    }) | undefined>;
    findById<T>(id: number, options?: {
        [key: string]: any;
    }): Promise<(T & {
        save: () => Promise<void>;
        destroy: () => Promise<void>;
    }) | undefined>;
    findAll(options?: {
        [key: string]: any;
    }): Promise<any[] | undefined>;
    stringToArray(row: Row): any[];
    excludeArray(data: any[], exclude: string[]): any[];
    excludeObject(data: Data, exclude: string[]): Data;
    update(data: Data): Promise<Data | undefined>;
    delete(id: number): Promise<boolean>;
    query(sql: string, values: string[]): Promise<any[]>;
}
export default ORM;
