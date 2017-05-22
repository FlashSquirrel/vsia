/**
 * Created by Administrator on 2016/11/23 0023.
 */
var path = require('path');

var settings = {
        
    mysql: {
        host: "localhost",
        port: 3306,
        database: "vsia",
        username: "root",
        password: "123456",
        pool: {
            connectionLimit:50 ,
            waitForConnections: false,
            acquireTimeout:5000,
            debug: false
        }
    }
}

module.exports = settings;
