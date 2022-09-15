import {OkPacket, ResultSetHeader, RowDataPacket} from "mysql2/promise";

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
    create: (value: { [p: string]: any }) => Promise<TypeMethod | undefined>;
    findOne: (value: TypeOptionsFind) => Promise<TypeMethod | undefined>;
    findById: (id: number, options?: (TypeOptions | undefined)) => Promise<TypeMethod | undefined>;
    findAll: (options?: (TypeOptionsFindAll | undefined)) => Promise<string[] | undefined>;
}

export interface Data {
    [key: string]: any;
}

export interface TypeMethod extends Data {
    save: () => Promise<void>;
    destroy: () => Promise<void>;
}

export interface TypeError {
    message: string
}

export type Row = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;

export interface TypeOptions {
    exclude: string[]
}

export interface TypeOptionsFind extends TypeOptions {
    where: {
        [key: string]: any;
    }
}

export interface TypeOptionsFindAll extends TypeOptionsFind {
    limit?: number;
    offset?: number;
}