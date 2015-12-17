var mongoURL = "mongodb://localhost:27017/uber";

var MongoClient = require('mongodb').MongoClient;

var database = null;
module.exports.userCollection;

MongoClient.connect("mongodb://localhost:27017/uber?", {
	db : {},
	server : {
		poolSize : 10000
	},
	replSet : {},
	mongos : {}
}, function(err, db)
{

	console.log('connection created');
	database = db;
	userCollection = db.collection('users');
});
