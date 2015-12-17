 var mysql = require('mysql');

 var pool = mysql.createPool({
     connectionLimit : 10000, //important
     host     : 'localhost',
     user     : 'root',
     password : '',
     database : 'uber',
     debug    :  false,
	port	  : 3306,
     waitForConnections : true,
     queueLimit : 500
 });
 
exports.getConnection = function(callback) {
	    pool.getConnection(function(err, connection) {
	        callback(err, connection);
	});
};