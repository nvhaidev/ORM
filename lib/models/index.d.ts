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
    create: (value: {
        [p: string]: any;
    }) => Promise<TypeMethod>;
    findOne: (value: {
        [p: string]: any;
    }) => Promise<TypeMethod>;
    findById: (id: number, options?: ({
        [p: string]: any;
    } | undefined)) => Promise<TypeMethod>;
    findAll: (options?: ({
        [p: string]: any;
    } | undefined)) => Promise<string[] | undefined>;
}
export interface Data {
    [key: string]: any;
}
export interface TypeMethod extends Data {
    save: () => Promise<void>;
    destroy: () => Promise<void>;
}
export declare type Row = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;
