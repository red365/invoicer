
const mysql = require('mysql');
import { ConnectionConfig, Connection } from 'mysql';

class DatabaseConnector {
    connection: Connection;
    constructor(config: ConnectionConfig) {
        console.log("The database is: ", config.database);
        this.connection = mysql.createConnection(config);
    }
    query(sql: string, args: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close(): Promise<undefined> {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve(undefined);
            });
        });
    }
}

export default DatabaseConnector;