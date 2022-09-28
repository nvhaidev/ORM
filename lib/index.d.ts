import { Config, Data, Row, TypeOptions, TypeOptionsFind, TypeOptionsFindAll } from "./models";
declare class ORM {
    private pool;
    constructor(config: Config);
    crateTable: (tableName: string, columns?: {
        [key: string]: any;
    } | undefined) => Promise<boolean>;
    checkTable: (tableName: string) => Promise<boolean>;
    table<T>(tableName: string): {
        create: (value: Data<T>) => Promise<(T & {
            save: () => Promise<{
                [key: string]: any;
            } | undefined>;
            destroy: () => Promise<boolean>;
        }) | undefined>;
        findOne: (options: TypeOptionsFind<T>) => Promise<(T & {
            save: () => Promise<{
                [key: string]: any;
            } | undefined>;
            destroy: () => Promise<boolean>;
        }) | undefined>;
        findById: (id: number) => Promise<(T & {
            save: () => Promise<{
                [key: string]: any;
            } | undefined>;
            destroy: () => Promise<boolean>;
        }) | undefined>;
        findAll: (options?: TypeOptionsFindAll<T>) => Promise<any[] | undefined>;
    };
    _create<T>(tableName: string, value: Data<T>): Promise<(T & {
        save: () => Promise<{
            [key: string]: any;
        } | undefined>;
        destroy: () => Promise<boolean>;
    }) | undefined>;
    _findOne<T>(tableName: string, value: TypeOptionsFind<T>): Promise<(T & {
        save: () => Promise<{
            [key: string]: any;
        } | undefined>;
        destroy: () => Promise<boolean>;
    }) | undefined>;
    _findById<T>(tableName: string, id: number, options?: TypeOptions): Promise<(T & {
        save: () => Promise<{
            [key: string]: any;
        } | undefined>;
        destroy: () => Promise<boolean>;
    }) | undefined>;
    _findAll<T>(tableName: string, options?: TypeOptionsFindAll<T>): Promise<any[] | undefined>;
    stringToArray(row: Row): any[];
    excludeArray(data: any[], exclude: string[]): any[];
    excludeObject(data: {
        [key: string]: any;
    }, exclude: string[]): {
        [key: string]: any;
    };
    update(tableName: string, data: {
        [key: string]: any;
    }): Promise<{
        [key: string]: any;
    } | undefined>;
    delete(tableName: string, id: number): Promise<boolean>;
    query(sql: string, values: string[]): Promise<any[]>;
    getValue(obj: {
        [key: string]: any;
    }, key: string): any;
}
export default ORM;
