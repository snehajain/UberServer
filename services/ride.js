var mysql = require('./mysql');
var async = require("async");

exports.user_requests = function(msg, callback){
	var res = {};
	console.log("In handle request ride:"+ msg.apiCall);
	
	switch(msg.apiCall){
	case 'getRideRequestedId': {
		console.log("In getRideRequestedId apiCall");		
		mysql.getConnection(function(err, conn){
			var getRideRequestedIdQuery = "select r.id, r.start_location, r.end_location, r.start_location_lat, r.start_location_lng, r.end_location_lat, r.end_location_lng, r.status, r.driver_id, d.firstname, d.carmodel from ride r, drivers d where d.id=r.driver_id and r.user_id="+msg.userId+" and r.status in ('REQ','STA')";			
			console.log("getRideRequestedIdQuery: " +getRideRequestedIdQuery);
			
			conn.query(getRideRequestedIdQuery, function(err, rows)
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
	
	case 'cancelRide': {
		console.log("In cancelRide apiCall");		
		async.parallel([
				function(callback_2) {
					mysql.getConnection(function(err, conn){
						var cancelRideQuery = "update ride set status='CAN' where id = "+msg.rideId;			
						console.log("cancelRideQuery: " +cancelRideQuery);
						
						conn.query(cancelRideQuery, function(err, rows)
						{
							if(err)
							{
								console.log(err);
								console.log(err.code);
								res.code = "401";					
								res.errorMessage = "Oops! There was some problem in cancelRide. Please try again.";					
								conn.release();
							}
							else
							{
								console.log("Succesful cancelRide");
								res.code = "200";
								res.value = "Success cancelRide";
								conn.release();
							}							
							callback_2();
						});
				    });
				},
				function(callback_2) {
					mysql.getConnection(function(err, conn){
						var updateUserQuery = "update users set status='AVA' where id="+msg.userId;			
						conn.query(updateUserQuery, function(err, rows)
						{
							if(err)
							{
								console.log(err);
								res.code = "401";					
								res.errorMessage = "Oops! There was some problem in Updating user status in cancelRide. Please try again.";					
								conn.release();
							}
							else
							{
								console.log("Succesful Updating user status in cancelRide");
								res.code = "200";
								conn.release();
							}
							
							callback_2();
						});
				    });
				},
				function(callback_2) {
					mysql.getConnection(function(err, conn){
						var updateUserQuery = "update drivers set status='AVA' where id="+msg.driverId;			
						conn.query(updateUserQuery, function(err, rows)
						{
							if(err)
							{
								console.log(err);
								res.code = "401";					
								res.errorMessage = "Oops! There was some problem in Updating driver status in cancelRide. Please try again.";					
								conn.release();
							}
							else
							{
								console.log("Succesful Updating driver status in cancelRide");
								res.code = "200";
								conn.release();
							}
							
							callback_2();
						});
				    });
				}
		                ],function(err){
				if(err) {
					console.log("Error in cancelRide");
					res.code = 401;
					callback(null, res);
				} else {
					res.code = 200;
					console.log("Successful cancelRide");
					callback(null, res);
				}
				
			});
	}
	break;
	
	case 'changeDestination': {
		console.log("In changeDestination apiCall");		
		mysql.getConnection(function(err, conn){
			var changeDestinationQuery = "update ride set end_location = '"+msg.end_location+"', end_location_lat = "+msg.end_location_lat+", end_location_lng = "+msg.end_location_lng+" where id="+msg.rideId;			
			console.log("changeDestination: " +changeDestinationQuery);
			
			conn.query(changeDestinationQuery, function(err, rows)
			{
				if(err)
				{
					console.log(err);
					console.log(err.code);
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in changeDestination. Please try again.";					
					conn.release();
				}
				else
				{	
					console.log("Destination address changed");
					res.code = "200";
					res.value = "Success changeDestination";
					conn.release();
				}
				callback(null, res);
			});
	    });
	}
	break;
	case 'checkRideStatus': {
		console.log("In checkRideStatus apiCall");		
		mysql.getConnection(function(err, conn){
			var checkRideStatusQuery = "select status from ride where id="+msg.rideId;			
			console.log("checkRideStatusQuery: " +checkRideStatusQuery);
			
			conn.query(checkRideStatusQuery, function(err, rows)
			{
				if(err)
				{
					console.log(err);
					console.log(err.code);
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in checkRideStatus. Please try again.";					
					conn.release();
				}
				else
				{	
					console.log("checkRideStatus done!");
					res.code = "200";
					res.status=rows[0].status;
					res.value = "Success checkRideStatus";
					conn.release();
				}
				callback(null, res);
			});
	    });
	}
	break;
	case 'driverChart': {
		console.log("In DriverChart apiCall");
		mysql.getConnection(function(err, conn){
			
			driverQuery  = "select drivers.firstname, drivers.id, drivers.lastname from drivers where email ='"+msg.driverEmail+"';";	
			console.log("driverQuery: " +driverQuery);
			
			conn.query(driverQuery, function(err, driver)
			{
				if(err || driver.length <1)
				{
					console.log(err);
					
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in retrieving driver. Please try again.";					
					conn.release();
				}
				else
				{
					console.log("Succesful driverQuery");
					rideQuery = "select * from ride where ride.driver_id = '"+driver[0].id+"';";
					console.log("rideQuery: " +rideQuery);
					conn.query(rideQuery, function(err, rides)
							{
								if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving rides. Please try again.";					
									conn.release();
								}
								else
								{
									var value = {
											"dFirstName" : driver[0].id,
											"dLastName" : driver[0].firstname,
											"rides" : rides	
											
									}
									var jsonstring = JSON.stringify(value);
									res.code = "200";
									res.value = jsonstring;
									console.log(res);
					
				}
								callback(null, res);
							});
				}
				
			});
		});
			
	}
	
	break;
	case 'getRidesByDate': {
		console.log("In getRidesByDate apiCall");
		mysql.getConnection(function(err, conn){
			
			ridesQuery  = "select start_location_lat, start_location_lng, end_location_lat, end_location_lng from ride where date ='"+msg.date+"';";	
			console.log("ridesQuery: " +ridesQuery);
			
			conn.query(ridesQuery, function(err, rides)
			{
				if(err || rides.length <1)
				{
					console.log(err);
					
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in retrieving rides. Please try again.";					
					conn.release();
				}
				else
				{
					console.log("Succesful ridesQuery");
					
									
									res.code = "200";
									res.value = rides;
									console.log(res);
					
				}
								callback(null, res);
			});
				
				
			});
			
	}
	break;
	case 'userChart': {
		console.log("In userChart apiCall");
		mysql.getConnection(function(err, conn){
			
			var userQuery  = "select users.firstname, users.id, users.lastname from users where email ='"+msg.userEmail+"';";	
			console.log("userQuery: " +userQuery);
			
			conn.query(userQuery, function(err, user)
			{
				if(err || user.length <1)
				{
					console.log(err);
					
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in retrieving user. Please try again.";					
					conn.release();
				}
				else
				{
					console.log("Succesful userQuery");
					rideQuery = "select * from ride where ride.user_id = '"+user[0].id+"';";
					console.log("rideQuery: " +rideQuery);
					conn.query(rideQuery, function(err, rides)
							{
								if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving rides. Please try again.";					
									conn.release();
								}
								else
								{
									var value = {
											"uFirstName" : user[0].id,
											"uLastName" : user[0].firstname,
											"rides" : rides	
											
									}
									var jsonstring = JSON.stringify(value);
									res.code = "200";
									res.value = jsonstring;
									console.log(res);
					
				}
								callback(null, res);
							});
				}
				
			});
		});
			
	}
	break;
	case 'areaChart': {
		console.log("In areaChart apiCall");
		mysql.getConnection(function(err, conn){
			
			var ridesQuery  = "select start_location_lat,start_location_lng,end_location_lng,end_location_lat ,start_location,end_location,distance_travelled from ride ;";	
			console.log("ridesQuery: " +ridesQuery);
			
			conn.query(ridesQuery, function(err, rides)
			{
					if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving rides. Please try again.";					
									conn.release();
								}
								else
								{
									
									var jsonstring = JSON.stringify(rides);
									res.code = "200";
									res.value = jsonstring;
									console.log(res);
					
				}
								callback(null, res);
							});
		});
			
	}
	break;
	case 'getRevenue': {
		console.log("In getRevnue apiCall");
		mysql.getConnection(function(err, conn){
			
			var revenueQuery  = "select sum(price) as price from ride where date ='"+msg.date+"';";	
			console.log("revenueQuery: " +revenueQuery);
			
			conn.query(revenueQuery, function(err, revenue)
			{
				if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving getRevenue. Please try again.";					
									conn.release();
								}
								else
								{
									res.code = "200";
									if(revenue[0].price){
										res.value = revenue[0].price.toFixed(2);
										
									}
									
									console.log(res);
					
				}
								callback(null, res);
							});
				
				
			});
		
	}
	break;
	
	case 'getProfiles': {
		console.log("In getProfiles apiCall");
		mysql.getConnection(function(err, conn){
			
			if (msg.user ==1 ){
				query = "select * from users";
			}else if(msg.user==0){
				query = "select * from drivers";
			}
			query = query+" where email ='"+msg.userEmail+"';";
			
			console.log("query: " +query);
			
			conn.query(query, function(err, user)
			{
				if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving user. Please try again.";					
									conn.release();
								}
								else
								{				
												res.code = "200";
												res.value = user;
												console.log(res);
					
											}
											callback(null, res);
				
				
							});
		});
								
	}
	break;
	
	case 'OtherCase': {
		
	}
	break;
	}
}


exports.ride_requests = function(msg, callback){
	var res = {};
	console.log("In ride_requests :"+ msg.apiCall);
	
	switch(msg.apiCall){
	case 'driverChart': {
		console.log("In DriverChart apiCall");
		mysql.getConnection(function(err, conn){
			
			driverQuery  = "select drivers.firstname, drivers.id, drivers.lastname from drivers where email ='"+msg.driverEmail+"';";	
			console.log("driverQuery: " +driverQuery);
			
			conn.query(driverQuery, function(err, driver)
			{
				if(err || driver.length <1)
				{
					console.log(err);
					
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in retrieving driver. Please try again.";					
					conn.release();
				}
				else
				{
					console.log("Succesful driverQuery");
					rideQuery = "select * from ride where ride.driver_id = '"+driver[0].id+"';";
					console.log("rideQuery: " +rideQuery);
					conn.query(rideQuery, function(err, rides)
							{
								if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving rides. Please try again.";					
									conn.release();
								}
								else
								{
									var value = {
											"dFirstName" : driver[0].id,
											"dLastName" : driver[0].firstname,
											"rides" : rides	
											
									}
									var jsonstring = JSON.stringify(value);
									res.code = "200";
									res.value = jsonstring;
									console.log(res);
					
				}
								callback(null, res);
							});
				}
				
			});
		});
			
	}
	
	break;
	case 'getRidesByDate': {
		console.log("In getRidesByDate apiCall");
		mysql.getConnection(function(err, conn){
			
			ridesQuery  = "select start_location_lat, start_location_lng, end_location_lat, end_location_lng from ride where date ='"+msg.date+"';";	
			console.log("ridesQuery: " +ridesQuery);
			
			conn.query(ridesQuery, function(err, rides)
			{
				if(err || rides.length <1)
				{
					console.log(err);
					
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in retrieving rides. Please try again.";					
					conn.release();
				}
				else
				{
					console.log("Succesful ridesQuery");
					
									
									res.code = "200";
									res.value = rides;
									console.log(res);
					
				}
								callback(null, res);
			});
				
				
			});
			
	}
	break;
	case 'userChart': {
		console.log("In userChart apiCall");
		mysql.getConnection(function(err, conn){
			
			var userQuery  = "select users.firstname, users.id, users.lastname from users where email ='"+msg.userEmail+"';";	
			console.log("userQuery: " +userQuery);
			
			conn.query(userQuery, function(err, user)
			{
				if(err || user.length <1)
				{
					console.log(err);
					
					res.code = "401";					
					res.errorMessage = "Oops! There was some problem in retrieving user. Please try again.";					
					conn.release();
				}
				else
				{
					console.log("Succesful userQuery");
					rideQuery = "select * from ride where ride.user_id = '"+user[0].id+"';";
					console.log("rideQuery: " +rideQuery);
					conn.query(rideQuery, function(err, rides)
							{
								if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving rides. Please try again.";					
									conn.release();
								}
								else
								{
									var value = {
											"uFirstName" : user[0].id,
											"uLastName" : user[0].firstname,
											"rides" : rides	
											
									}
									var jsonstring = JSON.stringify(value);
									res.code = "200";
									res.value = jsonstring;
									console.log(res);
					
				}
								callback(null, res);
							});
				}
				
			});
		});
			
	}
	break;
	case 'areaChart': {
		console.log("In areaChart apiCall");
		mysql.getConnection(function(err, conn){
			
			var ridesQuery  = "select start_location_lat,start_location_lng,end_location_lng,end_location_lat ,start_location,end_location,distance_travelled from ride ;";	
			console.log("ridesQuery: " +ridesQuery);
			
			conn.query(ridesQuery, function(err, rides)
			{
					if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving rides. Please try again.";					
									conn.release();
								}
								else
								{
									
									var jsonstring = JSON.stringify(rides);
									res.code = "200";
									res.value = jsonstring;
									console.log(res);
					
				}
								callback(null, res);
							});
		});
			
	}
	break;
	case 'getRevenue': {
		console.log("In getRevnue apiCall");
		mysql.getConnection(function(err, conn){
			
			var revenueQuery  = "select sum(price) as price from ride where date ='"+msg.date+"';";	
			console.log("revenueQuery: " +revenueQuery);
			
			conn.query(revenueQuery, function(err, revenue)
			{
				if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving getRevenue. Please try again.";					
									conn.release();
								}
								else
								{
									res.code = "200";
									if(revenue[0].price){
										res.value = revenue[0].price.toFixed(2);
										
									}
									
									console.log(res);
					
				}
								callback(null, res);
							});
				
				
			});
		
	}
	break;
	
	case 'getProfiles': {
		console.log("In getProfiles apiCall");
		mysql.getConnection(function(err, conn){
			
			if (msg.user ==1 ){
				query = "select * from users";
			}else if(msg.user==0){
				query = "select * from drivers";
			}
			query = query+" where email ='"+msg.userEmail+"';";
			
			console.log("query: " +query);
			
			conn.query(query, function(err, user)
			{
				if(err)
								{
									console.log(err);
									
									res.code = "401";					
									res.errorMessage = "Oops! There was some problem in retrieving user. Please try again.";					
									conn.release();
								}
								else
								{				
												res.code = "200";
												res.value = user;
												console.log(res);
					
											}
											callback(null, res);
				
				
							});
		});
								
	}
	break;
	
	
	
	
	
	}

}	

