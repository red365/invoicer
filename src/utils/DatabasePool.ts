
const mysql = require('mysql');
import { PoolConfig, Pool } from 'mysql';

class DatabasePool {
    pool: Pool;
    constructor(config: PoolConfig) {
        console.log("The database is: ", config.database)
        this.pool = mysql.createPool(config);
    }
    query(sql: string, args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    end(): Promise<undefined> {
        return new Promise((resolve, reject) => {
            this.pool.end(err => {
                if (err)
                    return reject(err);
                resolve(undefined);
            });
        });
    }
}

export default DatabasePool;