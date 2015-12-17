var mysql = require('./mysql');
var async = require("async");
var mongo = require("./mongodb");
var mongoURL = "mongodb://localhost:27017/uber";

exports.user_requests = function(msg, callback){
	var res = {};
	console.log("In handle request user:"+ msg.apiCall);
	
	switch(msg.apiCall){
	case 'selectDriverCreateRide': {
		console.log("In selectDriverCreateRide apiCall");
		async.parallel([
					function(callback_2) {
						mysql.getConnection(function(err, conn){
							msg.sourceAddress = msg.sourceAddress.replace("'","\\'");
							msg.destinationAddress = msg.destinationAddress.replace("'","\\'");
							var todayDate = new Date();
							var rideDate = todayDate.getFullYear()+'/'+(todayDate.getMonth()+1)+'/'+todayDate.getDate();
							var createRideQuery = "insert into ride (driver_id, user_id, start_location, start_location_lat, start_location_lng, end_location, end_location_lat, end_location_lng, status, date) "+
								"values ("+msg.driverId+","+msg.userId+",'"+msg.sourceAddress+"',"+msg.sourceCoordinates.lat+","+msg.sourceCoordinates.lng+",'"+msg.destinationAddress+"',"+msg.destinationCoordinates.lat+","+msg.destinationCoordinates.lng+",'REQ', DATE_FORMAT('"+(rideDate)+"','%Y/%m/%d'))";			
							console.log("createRideQuery: " +createRideQuery);
							
							conn.query(createRideQuery, function(err, rows)
							{
								if(err)
								{
									console.log(err);
									console.log(err.code);
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in creating ride. Please try again.";					
									conn.release();
								}
								else
								{
									console.log("Succesful selectDriverCreateRide");
									res.code = "200";
									res.value = "Success selectDriverCreateRide";
									res.rideId=rows.insertId;
									conn.release();
								}
								
								callback_2();
							});
					    });
					},
					function(callback_2) {
						mysql.getConnection(function(err, conn){
							var updateUserQuery = "update users set status='REQ' where id="+msg.userId;			
							conn.query(updateUserQuery, function(err, rows)
							{
								if(err)
								{
									console.log(err);
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in Updating user status in createRide. Please try again.";					
									conn.release();
								}
								else
								{
									console.log("Succesful Updating user status in createRide");
									res.code = "200";
									conn.release();
								}
								
								callback_2();
							});
					    });
					},
					function(callback_2) {
						mysql.getConnection(function(err, conn){
							var updateUserQuery = "update drivers set status='REQ' where id="+msg.driverId;			
							conn.query(updateUserQuery, function(err, rows)
							{
								if(err)
								{
									console.log(err);
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in Updating driver status in createRide. Please try again.";					
									conn.release();
								}
								else
								{
									console.log("Succesful Updating driver status in createRide");
									res.code = "200";
									conn.release();
								}
								
								callback_2();
							});
					    });
					}
			                ],function(err){
					if(err) {
						console.log("Error in createRide");
						res.code = 401;
						callback(null, res);
					} else {
						res.code = 200;
						console.log("Successful createRide");
						callback(null, res);
					}
					
				});

	}
	break;
	
	case 'checkUserStatus': {
		console.log("In checkUserStatus apiCall");		
		mysql.getConnection(function(err, conn){
			var checkUserStatusQuery = "select r.id, r.start_location, r.end_location, r.start_location_lat, r.start_location_lng, r.end_location_lat, r.end_location_lng, r.status, r.driver_id, d.firstname, d.carmodel from ride r, drivers d where d.id=r.driver_id and r.user_id="+msg.userId+" and r.status in ('REQ','STA')";			
			console.log("checkUserStatusQuery: " +checkUserStatusQuery);
			
			conn.query(checkUserStatusQuery, function(err, rows)
			{
				if(err)
				{
					console.log(err);
					console.log(err.code);
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in creating ride. Please try again.";					
					conn.release();
				}
				else
				{	
					if(!rows[0]) {
						console.log("No rides found");
						res.code = "200";
						res.value = "Success selectDriverCreateRide";
						conn.release();
					} else {
						console.log("pending Ride found");
						res.code = "200";
						res.value = "Success selectDriverCreateRide";
						res.rideData=rows[0];
						conn.release();
					}					
				}
				callback(null, res);
			});
	    });
	}
	break;

	case 'getUserProfile': {
		console.log("In getUserProfile apiCall");		
		mysql.getConnection(function(err, conn){
			var getUserProfileQuery = "select * from users where status != 'DEL' and id="+msg.userId;			
			console.log("getUserProfileQuery: " +getUserProfileQuery);
			
			conn.query(getUserProfileQuery, function(err, rows)
			{
				if(err)
				{
					console.log(err);
					console.log(err.code);
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in getUserProfile. Please try again.";					
					conn.release();
				}
				else
				{	
					if(!rows[0]) {
						console.log("No user found");
						res.code = "401";
						res.value = "No user found";
						conn.release();
					} else {
						console.log("Get user profile success");
						res.code = "200";
						res.value = "Success getUserProfile";
						res.userData=rows[0];
						conn.release();
					}					
				}
				callback(null, res);
			});
		});
	}
	break;

	case "deleteUser": {
		console.log("In deleteUser apiCall");		
		mysql.getConnection(function(err, conn){
			var getUserProfileQuery = "update users set status='DEL' where id="+msg.userId;			
			console.log("getUserProfileQuery: " +getUserProfileQuery);
			
			conn.query(getUserProfileQuery, function(err, rows)
			{
				if(err)
				{
					console.log(err);
					console.log(err.code);
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in getUserProfile. Please try again.";					
					conn.release();
				}
				else
				{	
					if(!rows[0]) {
						console.log("No user found");
						res.code = "401";
						res.value = "No user found";
						conn.release();
					} else {
						console.log("Success in user account delete");
						res.code = "200";
						res.value = "Success in user account delete";
						conn.release();
					}					
				}
				callback(null, res);
			});
		});
	}
	break;

	case 'rateDriver': {
		console.log("In rateDriver apiCall");		
		var coll =  mongo.collection('driver_rating');
		var insertQuery = {"ride_id":msg.rideId, "user_id":msg.userId, "driver_id":parseInt(msg.driverId), "rating":parseInt(msg.rating)};
		mongo.connect(mongoURL, function(){
			coll.insert(insertQuery, function(err, rating){
				if (!err) {
					res.code = 200;
					console.log("Success in driver rating");
					callback(null, res);
				} else {
					res.code = 401;
					console.log("Failure in driver rating");
					callback(null, res);
				}
			});
		});
	}
	break;

	}
}