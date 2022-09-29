import mysql from 'mysql2/promise';
import {Config, Data, Row, TypeObject, TypeOptions, TypeOptionsFind, TypeOptionsFindAll} from "./models";
import {validateValue} from "./validate";
import json from "@ptndev/json"

class ORM {
    private pool: mysql.Pool;

    constructor(config: Config) {
        this.pool = mysql.createPool(config);
    }

    public crateTable = async (tableName: string, columns?: { [key: string]: any }): Promise<boolean> => {
        try {
            const table = await this.checkTable(tableName);
            if (!table) {
                if (columns) {
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

                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
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

    public table<T>(tableName: string) {
        const $ = this;

        return {
            create: async function (value: Data<T>) {
                return await $._create<T>(tableName, value)
            },
            findOne: async function (options: TypeOptionsFind<T>) {
                return await $._findOne<T>(tableName, options)
            },
            findById: async function (id: number,options?:TypeOptions) {
                return await $._findById<T>(tableName, id,options)
            },
            findAll: async function (options?: TypeOptionsFindAll<T>) {
                return await $._findAll<T>(tableName, options)
            },
        }
    }

    public async _create<T>(tableName: string, value: Data<T>) {
        try {
            const $ = this;
            if (!validateValue(value)) return undefined;
            const keys = Object.keys(value);
            const sql = `INSERT INTO ${tableName} (${keys.join(',')})
                         VALUES (${keys.map(() => '?').join(',')})`;
            const values = keys.map(key => $.getValue(value, key));
            const [row,] = await $.pool.query(sql, values);
            const id = (row as mysql.ResultSetHeader).insertId;
            const data = await $._findById<T>(tableName, id);

            return {
                ...data as unknown as T,
                save: async function () {
                    const jsonData = json.parse(json.stringify(this))
                    return await $.update(tableName, jsonData)
                },
                destroy: async function () {
                    const id = (this as TypeObject).id
                    return await $.delete(tableName, id)
                }
            }
        } catch (error) {
            console.error(error);
            return undefined;
        }

    }

    public async _findOne<T>(tableName: string, value: TypeOptionsFind<T>) {
        try {
            const $ = this;
            if (!validateValue(value)) return undefined;

            const keyWhere = Object.keys(value['where']);

            const valueWhere = value['where'];
            const exclude = value['exclude'] || [];
            const sql = `SELECT *
                         FROM ${tableName}
                         WHERE ${keyWhere.map((key: string) => `${key} = ?`).join(' AND ')}`;
            const values = keyWhere.map((key: string) => $.getValue(valueWhere, key));


            const [row,] = await $.pool.query(sql, values);

            let data = $.stringToArray(row)[0];

            if (data) data = $.excludeObject(data, exclude)

            return {
                ...data as unknown as T,
                save: async function () {
                    const jsonData = json.parse(json.stringify(this))
                    return await $.update(tableName, jsonData)
                },
                destroy: async function () {
                    const id = (this as TypeObject).id
                    return await $.delete(tableName, id)
                }
            }
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    public async _findById<T>(tableName: string, id: number, options?: TypeOptions) {
        try {
            const $ = this;
            const sql = `SELECT *
                         FROM ${tableName}
                         WHERE id = ?`;
            if (isNaN(Number(id))) {
                return undefined;
            }
            const [row,] = await $.pool.query(sql, [id]);
            let data = $.stringToArray(row)[0]
            if (options) {
                const exclude = options['exclude'] || [];
                if (data) data = $.excludeObject(data, exclude)
            }
            return {
                ...data as unknown as T,
                save: async function () {
                    const jsonData = json.parse(json.stringify(this))
                    return await $.update(tableName, jsonData)
                },
                destroy: async function () {
                    const id = (this as TypeObject).id
                    return await $.delete(tableName, id)
                }
            }
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    public async _findAll<T>(tableName: string, options?: TypeOptionsFindAll<T>) {
        try {
            const $ = this;
            if (options) {
                const where = options['where'];
                const keys = Object.keys(where);
                const exclude = options['exclude'] || [];
                const limit = options['limit'] as number || 0;
                const offset = options['offset'] as number || 0;
                if (keys.length > 0) {
                    if (!validateValue(where)) return undefined;
                    const sqlWhere = Object.keys(where).map((key: string) => `${key} = ?`).join(' AND ');
                    const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                    const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                    const sql = `SELECT *
                                 FROM ${tableName}
                                 WHERE ${sqlWhere} ${sqlLimit} ${sqlOffset}`;

                    const values = keys.map(key => $.getValue(where, key));
                    const [row,] = await $.pool.query(sql, values);
                    return $.excludeArray($.stringToArray(row), exclude);
                }
                const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                const sql = `SELECT *
                             FROM ${tableName} ${sqlLimit} ${sqlOffset}`;
                const [row,] = await $.pool.query(sql);
                return $.excludeArray($.stringToArray(row), exclude);

            }
            const sql = `SELECT *
                         FROM ${tableName} LIMIT 100`;
            const [row,] = await $.pool.query(sql);
            return $.stringToArray(row)

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    public stringToArray(row: Row) {
        return (row as any[]).length > 0 ? (row as any[]) : []
    }

    public excludeArray(data: any[], exclude: string[]) {
        if (data && exclude.length > 0) {
            data.forEach((values: string, index: number) => {
                exclude.forEach((value: string) => delete data[index][value]);
            });
        }
        return data
    }

    public excludeObject(data: { [key: string]: any }, exclude: string[]) {
        exclude.forEach((value: string) => delete data[value]);
        return data
    }

    public async update(tableName: string, data: { [key: string]: any }) {
        try {
            const $ = this;
            if (!validateValue(data)) return undefined;
            this.excludeObject(data, ["created_at", "updated_at"])
            const keys = Object.keys(data);
            const sql = `UPDATE ${tableName}
                         SET ${keys.map((key: string) => `${key} = ?`).join(',')}
                         WHERE id = ?`;
            const values = keys.map(key => data[key]);
            values.push(data.id);
            await $.pool.query(sql, values);
            return data
        } catch (error) {
            console.error(error);
        }

    }

    public async delete(tableName: string, id: number) {
        try {
            const $ = this;
            const sql = `DELETE
                         FROM ${tableName}
                         WHERE id = ?`;
            await $.pool.query(sql, [id]);
            return true;
        } catch (error) {
            console.error(error);
            return false
        }
    }

    public async query(sql: string, values: string[]) {
        const [row,] = await this.pool.query(sql, values);

        return this.stringToArray(row)
    }

    public getValue(obj: { [key: string]: any }, key: string) {
        return json.stringify(obj[key])
    }


}

export default ORM;