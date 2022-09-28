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

export interface TypeObject {
    [key: string]: any
}

export type Data<T> = {
    [key in keyof T]?: T[key];
}


export type Row = RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader;

export interface TypeOptions {
    exclude?: string[]
}

export interface TypeOptionsFind<T> extends TypeOptions {
    where: Data<T>
}

export interface TypeOptionsFindAll<T> extends TypeOptionsFind<T> {
    limit?: number;
    offset?: number;
}