
const mysql = require('mysql');

class DatabasePool {
    constructor( config ) {
        console.log("The database is: ", config.database)
        this.pool = mysql.createPool( config );
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.pool.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    end() {
        return new Promise( ( resolve, reject ) => {
            this.pool.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
}

export default DatabasePool;