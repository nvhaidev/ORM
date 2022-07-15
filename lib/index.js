"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
class ORM {
    constructor(config) {
        this.crateTable = (tableName, columns) => __awaiter(this, void 0, void 0, function* () {
            const table = yield this.checkTable(tableName);
            if (table) {
                const $ = this;
                const create = (value) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (!this.validateValue(value))
                            return undefined;
                        const keys = Object.keys(value);
                        const sql = `INSERT INTO ${tableName} (${keys.join(',')})
                                 VALUES (${keys.map(() => '?').join(',')})`;
                        const values = keys.map(key => value[key]);
                        const [row,] = yield this.pool.query(sql, values);
                        const id = row.insertId;
                        const data = yield findById(id);
                        return Object.assign(Object.assign({}, data), { save: function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    try {
                                        if (!$.validateValue(this))
                                            return undefined;
                                        const sql = `UPDATE ${tableName}
                                             SET ${keys.map((key) => `${key} = ?`).join(',')}
                                             WHERE id = ?`;
                                        const values = keys.map(key => this[key]);
                                        values.push(this.id);
                                        yield $.pool.query(sql, values);
                                        return yield findById(this.id);
                                    }
                                    catch (error) {
                                        console.error(error);
                                    }
                                });
                            }, destroy: function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    try {
                                        const sql = `DELETE
                                             FROM ${tableName}
                                             WHERE id = ?`;
                                        yield $.pool.query(sql, [this.id]);
                                        return undefined;
                                    }
                                    catch (error) {
                                        console.error(error);
                                    }
                                });
                            } });
                    }
                    catch (error) {
                        console.error(error);
                        return undefined;
                    }
                });
                const findOne = (value) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (!this.validateValue(value))
                            return undefined;
                        const keys = Object.keys(value);
                        const where = Object.keys(value['where']);
                        const exclude = value['exclude'] || [];
                        const sql = `SELECT *
                                 FROM ${tableName}
                                 WHERE ${where.map((key) => `${key} = ?`).join(' AND ')}`;
                        const values = where.map((key) => value['where'][key]);
                        const [row,] = yield this.pool.query(sql, values);
                        const data = row.length > 0 ? row[0] : undefined;
                        if (data)
                            exclude.forEach((value) => delete data[value]);
                        return Object.assign(Object.assign({}, data), { save: function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    try {
                                        if (!$.validateValue(this))
                                            return undefined;
                                        const sql = `UPDATE ${tableName}
                                             SET ${keys.map((key) => `${key} = ?`).join(',')}
                                             WHERE id = ?`;
                                        const values = keys.map(key => this[key]);
                                        values.push(this.id);
                                        yield $.pool.query(sql, values);
                                        return yield findById(this.id);
                                    }
                                    catch (error) {
                                        console.error(error);
                                    }
                                });
                            }, destroy: function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    try {
                                        const sql = `DELETE
                                             FROM ${tableName}
                                             WHERE id = ?`;
                                        yield $.pool.query(sql, [this.id]);
                                        return undefined;
                                    }
                                    catch (error) {
                                        console.error(error);
                                    }
                                });
                            } });
                    }
                    catch (error) {
                        console.error(error);
                        return undefined;
                    }
                });
                const findById = (id, options) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const sql = `SELECT *
                                 FROM ${tableName}
                                 WHERE id = ?`;
                        if (isNaN(Number(id))) {
                            return undefined;
                        }
                        const [row,] = yield this.pool.query(sql, [id]);
                        const data = row.length > 0 ? row[0] : undefined;
                        if (options) {
                            const exclude = options['exclude'] || [];
                            if (data)
                                exclude.forEach((value) => delete data[value]);
                        }
                        return Object.assign(Object.assign({}, data), { save: function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    try {
                                        if (!$.validateValue(this))
                                            return undefined;
                                        const keys = Object.keys(this);
                                        const sql = `UPDATE ${tableName}
                                             SET ${keys.map((key) => `${key} = ?`).join(',')}
                                             WHERE id = ?`;
                                        const values = keys.map(key => this[key]);
                                        values.push(id);
                                        yield $.pool.query(sql, values);
                                        return yield findById(id);
                                    }
                                    catch (error) {
                                        console.error(error);
                                    }
                                });
                            }, destroy: function () {
                                return __awaiter(this, void 0, void 0, function* () {
                                    try {
                                        const sql = `DELETE
                                             FROM ${tableName}
                                             WHERE id = ?`;
                                        yield $.pool.query(sql, [this.id]);
                                        return undefined;
                                    }
                                    catch (error) {
                                        console.error(error);
                                    }
                                });
                            } });
                    }
                    catch (error) {
                        console.error(error);
                        return undefined;
                    }
                });
                const findAll = (options) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        if (options) {
                            const where = options['where'] || {};
                            const exclude = options['exclude'] || [];
                            const limit = options['limit'] || 0;
                            const offset = options['offset'] || 0;
                            if (Object.keys(where).length > 0) {
                                if (!this.validateValue(where))
                                    return undefined;
                                const sqlWhere = Object.keys(where).map((key) => `${key} = ?`).join(' AND ');
                                const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                                const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                                const sql = `SELECT *
                                         FROM ${tableName}
                                         WHERE ${sqlWhere} ${sqlLimit} ${sqlOffset}`;
                                const values = where.map((key) => options['where'][key]);
                                const [row,] = yield $.pool.query(sql, values);
                                const data = row.length > 0 ? row : undefined;
                                if (data && exclude.length > 0) {
                                    data.forEach((values, index) => {
                                        exclude.forEach((value) => delete data[index][value]);
                                    });
                                }
                                return data;
                            }
                            const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                            const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                            const sql = `SELECT *
                                     FROM ${tableName} ${sqlLimit} ${sqlOffset}`;
                            const [row,] = yield $.pool.query(sql);
                            const data = row.length > 0 ? row : undefined;
                            if (data && exclude.length > 0) {
                                data.forEach((values, index) => {
                                    exclude.forEach((value) => delete data[index][value]);
                                });
                            }
                            return data;
                        }
                        const sql = `SELECT *
                                 FROM ${tableName} LIMIT 100`;
                        const [row,] = yield $.pool.query(sql);
                        return row.length > 0 ? row : undefined;
                    }
                    catch (error) {
                        console.error(error);
                        return undefined;
                    }
                });
                return {
                    create,
                    findOne,
                    findById,
                    findAll
                };
            }
            if (columns) {
                const colName = {
                    "id": "int NOT NULL AUTO_INCREMENT PRIMARY KEY",
                };
                Object.keys(columns).forEach((key) => {
                    colName[key] = columns[key];
                });
                colName['created_at'] = "timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP";
                colName['updated_at'] = "timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP";
                const column = Object.keys(colName).map((key) => `${key} ${colName[key]}`).join(', ');
                const sql = `CREATE TABLE IF NOT EXISTS ${tableName}
                     (
                         ${column}
                     )`;
                yield this.pool.query(sql);
                return undefined;
            }
            return undefined;
        });
        this.checkTable = (tableName) => __awaiter(this, void 0, void 0, function* () {
            try {
                const sql = `SHOW TABLES LIKE '${tableName}'`;
                const [row,] = yield this.pool.query(sql);
                return row.length > 0;
            }
            catch (error) {
                console.error(error);
                return false;
            }
        });
        this.validateValue = (value) => {
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
            }
            catch (error) {
                console.error(error);
                return false;
            }
        };
        this.pool = promise_1.default.createPool(config);
    }
}
exports.default = ORM;
