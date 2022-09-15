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
const validate_1 = require("./validate");
class ORM {
    constructor(config) {
        this.crateTable = (tableName, columns) => __awaiter(this, void 0, void 0, function* () {
            try {
                const table = yield this.checkTable(tableName);
                if (!table) {
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
                        return true;
                    }
                }
                return false;
            }
            catch (error) {
                console.error(error);
                return false;
            }
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
        this.pool = promise_1.default.createPool(config);
        this.tableName = "";
        this.data = {};
    }
    table(tableName) {
        try {
            const $ = this;
            $.tableName = tableName;
            return {
                create: $.create.bind($),
                findOne: $.findOne.bind($),
                findById: $.findById.bind($),
                findAll: $.findAll.bind($)
            };
        }
        catch (error) {
            console.error(error);
        }
    }
    create(value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const $ = this;
                if (!(0, validate_1.validateValue)(value))
                    return undefined;
                const keys = Object.keys(value);
                const sql = `INSERT INTO ${$.tableName} (${keys.join(',')})
                         VALUES (${keys.map(() => '?').join(',')})`;
                const values = keys.map(key => value[key]);
                const [row,] = yield $.pool.query(sql, values);
                const id = row.insertId;
                const data = yield $.findById(id);
                return Object.assign(Object.assign({}, data), { save: function () {
                        console.log(this);
                        return Promise.resolve();
                    }, destroy: function () {
                        return Promise.resolve();
                    } });
            }
            catch (error) {
                console.error(error);
                return undefined;
            }
        });
    }
    findOne(value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const $ = this;
                if (!(0, validate_1.validateValue)(value))
                    return undefined;
                const where = Object.keys(value['where']);
                const exclude = value['exclude'] || [];
                const sql = `SELECT *
                         FROM ${$.tableName}
                         WHERE ${where.map((key) => `${key} = ?`).join(' AND ')}`;
                const values = where.map((key) => value['where'][key]);
                const [row,] = yield $.pool.query(sql, values);
                const data = $.stringToArray(row)[0];
                if (data)
                    $.excludeObject(row, exclude);
                $.data = data;
                return Object.assign(Object.assign({}, data), { save: function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            $.data = this;
                            const json = JSON.parse(JSON.stringify(this));
                            yield $.update.bind($)(json);
                        });
                    }, destroy: function () {
                        return Promise.resolve();
                    } });
            }
            catch (error) {
                console.error(error);
                return undefined;
            }
        });
    }
    findById(id, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const $ = this;
                const sql = `SELECT *
                         FROM ${$.tableName}
                         WHERE id = ?`;
                if (isNaN(Number(id))) {
                    return undefined;
                }
                const [row,] = yield $.pool.query(sql, [id]);
                const data = $.stringToArray(row)[0];
                if (options) {
                    const exclude = options['exclude'] || [];
                    if (data)
                        $.excludeObject(row, exclude);
                }
                return Object.assign(Object.assign({}, data), { save: function () {
                        console.log(this);
                        return Promise.resolve();
                    }, destroy: function () {
                        return Promise.resolve();
                    } });
            }
            catch (error) {
                console.error(error);
                return undefined;
            }
        });
    }
    findAll(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const $ = this;
                if (options) {
                    const where = options['where'] || {};
                    const exclude = options['exclude'] || [];
                    const limit = options['limit'] || 0;
                    const offset = options['offset'] || 0;
                    if (Object.keys(where).length > 0) {
                        if (!(0, validate_1.validateValue)(where))
                            return undefined;
                        const sqlWhere = Object.keys(where).map((key) => `${key} = ?`).join(' AND ');
                        const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                        const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                        const sql = `SELECT *
                                 FROM ${$.tableName}
                                 WHERE ${sqlWhere} ${sqlLimit} ${sqlOffset}`;
                        const values = where.map((key) => options['where'][key]);
                        const [row,] = yield $.pool.query(sql, values);
                        return $.excludeArray($.stringToArray(row), exclude);
                    }
                    const sqlLimit = limit > 0 ? `LIMIT ${limit}` : '';
                    const sqlOffset = offset > 0 ? `OFFSET ${offset}` : '';
                    const sql = `SELECT *
                             FROM ${$.tableName} ${sqlLimit} ${sqlOffset}`;
                    const [row,] = yield $.pool.query(sql);
                    return $.excludeArray($.stringToArray(row), exclude);
                }
                const sql = `SELECT *
                         FROM ${$.tableName} LIMIT 100`;
                const [row,] = yield $.pool.query(sql);
                return $.stringToArray(row);
            }
            catch (error) {
                console.error(error);
                return undefined;
            }
        });
    }
    stringToArray(row) {
        return row.length > 0 ? row : [];
    }
    excludeArray(data, exclude) {
        if (data && exclude.length > 0) {
            data.forEach((values, index) => {
                exclude.forEach((value) => delete data[index][value]);
            });
        }
        return data;
    }
    excludeObject(data, exclude) {
        exclude.forEach((value) => delete data[value]);
        return data;
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = this;
            console.log(data);
            try {
                if (!(0, validate_1.validateValue)(data))
                    return undefined;
                const keys = Object.keys(data);
                const sql = `UPDATE ${$.tableName}
                         SET ${keys.map((key) => `${key} = ?`).join(',')}
                         WHERE id = ?`;
                const values = keys.map(key => data[key]);
                values.push(data.id);
                // console.log(sql)
                // console.log(values)
                yield $.pool.query(sql, values);
                return $.data;
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    delete(id) {
    }
}
exports.default = ORM;
