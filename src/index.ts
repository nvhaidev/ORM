import mysql, {OkPacket, ResultSetHeader, RowDataPacket} from 'mysql2/promise';
import {Config, Data, TypeMethod} from "./models";
import {validateValue} from "./validate";

class ORM {
    private pool: mysql.Pool;
    private tableName: string;
    private data: Data;

    constructor(config: Config) {
        this.pool = mysql.createPool(config);
        this.tableName = ""
        this.data = {}
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
        try {
            const $ = this;
            $.tableName = tableName;
            return {
                create: $.create<T>.bind($),
                findOne: $.findOne<T>.bind($),
                findById: $.findById<T>.bind($),
                findAll: $.findAll<T>.bind($)
            }
        } catch (error) {
            console.error(error);
        }
    }

    public async create<T>(value: { [key: string]: any }): Promise<TypeMethod | undefined> {
        try {
            const $ = this;
            if (!validateValue(value)) return undefined;
            const keys = Object.keys(value);
            const sql = `INSERT INTO ${$.tableName} (${keys.join(',')})
                         VALUES (${keys.map(() => '?').join(',')})`;
            const values = keys.map(key => value[key]);
            const [row,] = await $.pool.query(sql, values);
            const id = (row as mysql.ResultSetHeader).insertId;
            const data = await $.findById(id) as unknown as T;
            return {
                ...data,
                save: function () {
                    console.log(this)
                    return Promise.resolve()
                },
                destroy: function () {
                    return Promise.resolve()
                }
            }
        } catch (error) {
            console.error(error);
            return undefined;
        }

    }

    public async findOne<T>(value: { [key: string]: any }) {
        try {
            const $ = this;
            if (!validateValue(value)) return undefined;

            const where = Object.keys(value['where']);
            const exclude = value['exclude'] || [];
            const sql = `SELECT *
                         FROM ${$.tableName}
                         WHERE ${where.map((key: string) => `${key} = ?`).join(' AND ')}`;
            const values = where.map((key: string) => value['where'][key]);
            const [row,] = await $.pool.query(sql, values);

            const data = $.stringToArray(row)[0];

            if (data) $.excludeObject(row, exclude)
            $.data = data;
            return {
                ...data as unknown as T,
                save: async function () {
                    $.data = this;
                    const json=JSON.parse(JSON.stringify(this))
                    await $.update.bind($)(json)
                },
                destroy: function () {
                    return Promise.resolve()
                }
            }
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    public async findById<T>(id: number, options?: { [key: string]: any }) {
        try {
            const $ = this;
            const sql = `SELECT *
                         FROM ${$.tableName}
                         WHERE id = ?`;
            if (isNaN(Number(id))) {
                return undefined;
            }
            const [row,] = await $.pool.query(sql, [id]);
            const data = $.stringToArray(row)[0]
            if (options) {
                const exclude = options['exclude'] || [];
                if (data) $.excludeObject(row, exclude)
            }
            return {
                ...data as unknown as T,
                save: function () {
                    console.log(this)
                    return Promise.resolve()
                },
                destroy: function () {
                    return Promise.resolve()
                }
            }
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    public async findAll<T>(options?: { [key: string]: any }) {
        try {
            const $ = this;
            if (options) {
                const where = options['where'] || {};
                const exclude = options['exclude'] || [];
                const limit = options['limit'] as number || 0;
                const offset = options['offset'] as number || 0;
                if (Object.keys(where).length > 0) {
                    if (!validateValue(where)) return undefined;
                    const sqlWhere = Object.keys(where).map((key: string) => `${key} = ?`).join(' AND ');
                    const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                    const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                    const sql = `SELECT *
                                 FROM ${$.tableName}
                                 WHERE ${sqlWhere} ${sqlLimit} ${sqlOffset}`;
                    const values = where.map((key: string) => options['where'][key]);
                    const [row,] = await $.pool.query(sql, values);
                    return $.excludeArray($.stringToArray(row), exclude);
                }
                const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                const sql = `SELECT *
                             FROM ${$.tableName} ${sqlLimit} ${sqlOffset}`;
                const [row,] = await $.pool.query(sql);
                return $.excludeArray($.stringToArray(row), exclude);

            }
            const sql = `SELECT *
                         FROM ${$.tableName} LIMIT 100`;
            const [row,] = await $.pool.query(sql);
            return $.stringToArray(row)

        } catch (error) {
            console.error(error);
            return undefined;
        }
    }

    public stringToArray(row: RowDataPacket[][] | RowDataPacket[] | OkPacket | OkPacket[] | ResultSetHeader) {
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

    public excludeObject(data: Data, exclude: string[]) {
        exclude.forEach((value: string) => delete data[value]);
        return data
    }

    public async update(data:Data) {
        const $ = this;
        console.log(data)
        try {
            if (!validateValue(data)) return undefined;
            const keys = Object.keys(data);
            const sql = `UPDATE ${$.tableName}
                         SET ${keys.map((key: string) => `${key} = ?`).join(',')}
                         WHERE id = ?`;
            const values = keys.map(key => data[key]);
            values.push(data.id);
            // console.log(sql)
            // console.log(values)
           await $.pool.query(sql, values);
            return $.data
        } catch (error) {
            console.error(error);
        }

    }

    public delete(id: number): any {

    }
}

export default ORM;