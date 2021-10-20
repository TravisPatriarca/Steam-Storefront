const util = require('util');
var mysql = require('mysql');

function makeDb( config ) {
    const connection = mysql.createConnection( config );
    console.log("\x1b[32m%s\x1b[0m", "Successfully connected to database\n");
    return {
        query( sql, args ) {
            return util.promisify( connection.query )
            .call( connection, sql, args );
        },
        close() {
            return util.promisify( connection.end ).call( connection );
        },
        beginTransaction() {
            return util.promisify( connection.beginTransaction )
            .call( connection );
        },
        commit() {
            return util.promisify( connection.commit )
            .call( connection );
        },
        rollback() {
            return util.promisify( connection.rollback )
            .call( connection );
        }
    };
}

exports.makeDb = makeDb;