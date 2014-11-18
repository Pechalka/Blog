var mysql      = require('mysql');
var mysqlUtilities = require('mysql-utilities');


var config = require('../config.json'); 
var read = mysql.createConnection(config);


read.connect();


var write = mysql.createConnection(config);


write.connect();

// Mix-in for Data Access Methods and SQL Autogenerating Methods
mysqlUtilities.upgrade(read);

// Mix-in for Introspection Methods
mysqlUtilities.introspection(read);


read.on('error', function(e) {
    console.log(e);
    connection.end();
});

module.exports = {
    read : read,
    write : write
};