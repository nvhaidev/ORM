import { OkPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";
export interface Config {
    host: string;
    port?: number;
    user: string;
    password: string;
    database: string;
    waitForConnections?: boolean;
    connectionLimit?: number;
    queueLimit?: number;
}
export interface TypeOrmMethod {
    create: <T>(value: {
        [p: string]: any;
    }) => Promise<TypeMethod>;
    findOne: <T>(value: TypeOptionsFind) => Promise<TypeMethod>;
    findById: <T>(id: number, options?: (TypeOptions | undefined)) => Promise<TypeMethod>;
    findAll: (options?: (TypeOptionsFindAll | undefined)) => Promise<string[] | undefined>;
}
export interface Data {
    [key: string]: any;
}
export interface TypeMethod extends Data {
    [key: string]: any;
    save: () => Promise<void>;
    destroy: () => Promise<void>;
}
export declare type Row = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;
export interface TypeOptions {
    exclude?: string[];
}
export interface TypeOptionsFind extends TypeOptions {
    where: {
        [key: string]: any;
    };
}
export interface TypeOptionsFindAll extends TypeOptionsFind {
    limit?: number;
    offset?: number;
}
