import mysql from 'mysql2/promise';
import {Config} from "./models";

class ORM {
    private pool: mysql.Pool;
    constructor(config: Config) {
        this.pool = mysql.createPool(config);
    }
    public crateTable = async (tableName: string, columns?: { [key: string]: any }) => {
        const table = await this.checkTable(tableName);
        if (table) {
            const $ = this;

            const create = async (value: { [key: string]: any }) => {
                try {
                    if (!this.validateValue(value)) return undefined;
                    const keys = Object.keys(value);
                    const sql = `INSERT INTO ${tableName} (${keys.join(',')})
                                 VALUES (${keys.map(() => '?').join(',')})`;
                    const values = keys.map(key => value[key]);
                    const [row,] = await this.pool.query(sql, values);
                    const id = (row as mysql.ResultSetHeader).insertId;
                    const data = await findById(id);
                    return {
                        ...data,
                        save: async function (): Promise<void> {
                            try {
                                if (!$.validateValue(this)) return undefined;
                                const sql = `UPDATE ${tableName}
                                             SET ${keys.map((key: string) => `${key} = ?`).join(',')}
                                             WHERE id = ?`;
                                const values = keys.map(key => this[key]);
                                values.push(this.id);
                                await $.pool.query(sql, values);
                                return await findById(this.id);
                            } catch (error) {
                                console.error(error);
                            }
                        },
                        destroy: async function (): Promise<void> {
                            try {
                                const sql = `DELETE
                                             FROM ${tableName}
                                             WHERE id = ?`;
                                await $.pool.query(sql, [this.id]);
                                return undefined;
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                    return undefined;
                }
            }
            const findOne = async (value: { [key: string]: any }) => {
                try {
                    if (!this.validateValue(value)) return undefined;
                    const keys = Object.keys(value);
                    const where = Object.keys(value['where']);
                    const exclude = value['exclude'] || [];
                    const sql = `SELECT *
                                 FROM ${tableName}
                                 WHERE ${where.map((key: string) => `${key} = ?`).join(' AND ')}`;
                    const values = where.map((key: string) => value['where'][key]);
                    const [row,] = await this.pool.query(sql, values);

                    const data = (row as any[]).length > 0 ? (row as any[])[0] : undefined;

                    if (data) exclude.forEach((value: string) => delete data[value]);
                    return {
                        ...data,
                        save: async function (): Promise<void> {
                            try {
                                if (!$.validateValue(this)) return undefined;
                                const sql = `UPDATE ${tableName}
                                             SET ${keys.map((key: string) => `${key} = ?`).join(',')}
                                             WHERE id = ?`;
                                const values = keys.map(key => this[key]);
                                values.push(this.id);
                                await $.pool.query(sql, values);
                                return await findById(this.id);
                            } catch (error) {
                                console.error(error);
                            }
                        },
                        destroy: async function (): Promise<void> {
                            try {
                                const sql = `DELETE
                                             FROM ${tableName}
                                             WHERE id = ?`;
                                await $.pool.query(sql, [this.id]);
                                return undefined;
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                    return undefined;
                }
            }
            const findById = async (id: number, options?: { [key: string]: any }) => {
                try {
                    const sql = `SELECT *
                                 FROM ${tableName}
                                 WHERE id = ?`;
                    if (isNaN(Number(id))) {
                        return undefined;
                    }
                    const [row,] = await this.pool.query(sql, [id]);
                    const data = (row as any[]).length > 0 ? (row as any[])[0] : undefined;
                    if (options) {
                        const exclude = options['exclude'] || [];
                        if (data) exclude.forEach((value: string) => delete data[value]);
                    }
                    return {
                        ...data,
                        save: async function (): Promise<void> {
                            try {
                                if (!$.validateValue(this)) return undefined;
                                const keys = Object.keys(this);
                                const sql = `UPDATE ${tableName}
                                             SET ${keys.map((key: string) => `${key} = ?`).join(',')}
                                             WHERE id = ?`;
                                const values = keys.map(key => this[key]);
                                values.push(id);
                                 await $.pool.query(sql, values);
                                return await findById(id);
                            } catch (error) {
                                console.error(error);
                            }
                        },
                        destroy: async function (): Promise<void> {
                            try {
                                const sql = `DELETE
                                             FROM ${tableName}
                                             WHERE id = ?`;
                                 await $.pool.query(sql, [this.id]);
                                return undefined;
                            } catch (error) {
                                console.error(error);
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                    return undefined;
                }
            }
            const findAll = async (options?: { [key: string]: any }) => {
                try {
                    if (options) {
                        const where = options['where'] || {};
                        const exclude = options['exclude'] || [];
                        const limit = options['limit'] as number || 0;
                        const offset = options['offset'] as number|| 0;
                        if (Object.keys(where).length > 0) {
                            if (!this.validateValue(where)) return undefined;
                            const sqlWhere = Object.keys(where).map((key: string) => `${key} = ?`).join(' AND ');
                            const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                            const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                            const sql = `SELECT *
                                         FROM ${tableName}
                                         WHERE ${sqlWhere} ${sqlLimit} ${sqlOffset}`;
                            const values = where.map((key: string) => options['where'][key]);
                            const [row,] = await $.pool.query(sql, values);
                            const data = (row as any[]).length > 0 ? (row as any[]) : undefined;
                            if (data && exclude.length > 0) {
                                data.forEach((values: string, index: number) => {
                                    exclude.forEach((value: string) => delete data[index][value]);
                                });
                            }
                            return data;
                        }
                        const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                        const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                        const sql = `SELECT *
                                     FROM ${tableName} ${sqlLimit} ${sqlOffset}`;
                        const [row,] = await $.pool.query(sql);
                        const data = (row as any[]).length > 0 ? (row as any[]) : undefined;
                        if (data && exclude.length > 0) {
                            data.forEach((values: string, index: number) => {
                                exclude.forEach((value: string) => delete data[index][value]);
                            });
                        }

                        return data;

                    }
                    const sql = `SELECT *
                                 FROM ${tableName} LIMIT 100`;
                    const [row,] = await $.pool.query(sql);
                    return (row as any[]).length > 0 ? (row as any[]) : undefined;

                } catch (error) {
                    console.error(error);
                    return undefined;
                }
            }
            return {
                create,
                findOne,
                findById,
                findAll
            }
        }
        if(columns){
            const colName: { [key: string]: any } = {
                "id": "int NOT NULL AUTO_INCREMENT PRIMARY KEY",
            };
            Object.keys(columns).forEach((key: string) => {
                colName[key] = columns[key];
            });
            colName['created_at'] = "timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP";
            colName['updated_at'] = "timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
            const column = Object.keys(colName).map((key: string) => `${key} ${colName[key]}`).join(', ');

            const sql = `CREATE TABLE IF NOT EXISTS ${tableName}
                     (
                         ${column}
                     )`;
            await this.pool.query(sql);
            return undefined;
        }
        return undefined;
    }
    public checkTable = async (tableName: string): Promise<boolean> => {
        try {
            const sql = `SHOW TABLES LIKE '${tableName}'`;
            const [row,] = await this.pool.query(sql);
            return (row as any[]
            ).length > 0;
        } catch
            (error) {
            console.error(error);
            return false;
        }
    }
    public validateValue = (value: { [key: string]: any }): boolean => {
        try {
            const regExText = "('(''|[^'])*')|(;)|(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b)";
            const keys = Object.keys(value);
            const values = keys.map(key => value[key]);
            for (let i = 0; i < values.length; i++) {
                if (typeof values[i] === 'string') {
                    console.log(values[i]);
                    if (values[i].match(new RegExp(regExText))) {
                        return false;
                    }
                }
            }
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }
}

export default ORM;