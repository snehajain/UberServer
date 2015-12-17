var mysql = require('./mysql');
var moment = require('moment');

var base = 1;// 1 dollar
var time_constant = 0.15 // for every mints

var distance_constance = 0.95 // per mile
var secondsPerMinute = 60;
var minutesPerHour = 60;

exports.bill_requests = function(msg, callback)
{
	var res = {};
	console.log("In handle bill request:" + msg.apiCall);

	switch (msg.apiCall)
	{

case 'viewBill': {
	
	console.log("In viewBill apiCall");
	mysql.getConnection(function(err, conn){
		
		
		var viewBillQuery = "select * from bill where ride_id ='"+msg.ride_id+"';";
		
		console.log("viewBillQuery: " +viewBillQuery);
		
		conn.query(viewBillQuery, function(err, rows)
		{
			if(err)
			{
				console.log(err);
				res.code = "401";					
				res.errorMessage = "Oops! There was some problem in retrieving viewBillQuery. Please try again.";					
				conn.release();
			}
			else
			{
					console.log("Succesful viewBillQuery");
					res.code = 200;
					res.value = rows;
					console.log(res);
					conn.release();
				}
				callback(null, res);
			});
	});
	}
break;

case 'adminViewBill': {
	console.log("In adminViewBill apiCall");
	mysql.getConnection(function(err, conn){
		//query = "select * from bill where date = '"+msg.date+"' and (user_id = (select id from users where email  ='"+msg.userEmail+"') or driver_id = (select id from drivers where email  ='"+msg.userEmail+"')) ;";
		query = "select * from ride where Date(date) = DATE_FORMAT('"+msg.date+"','%Y/%m/%d') and (user_id = (select id from users where email  ='"+msg.userEmail+"') or driver_id = (select id from drivers where email  ='"+msg.userEmail+"')) ;";
		console.log("query: " +query);
		
		conn.query(query, function(err, bills)
		{
			if(err)
							{
								console.log(err);
								
								res.code = "401";					
								res.errorMessage = "Oops! There was some problem in retrieving bill. Please try again.";					
								conn.release();
							}
							else
							{				
											res.code = "200";
											res.value = bills;
											console.log(res);
				
										}
										callback(null, res);
						});
	});
							
}
break;
		case 'generateBill': {
			console.log("In generateBill apiCall");
			mysql
					.getConnection(function(err, conn)
					{

						var getRideQuery = "select id, driver_id, user_id, start_location, end_location, start_time, end_time, distance_travelled from ride where id ='"
								+ msg.rideid + "';";

						console.log("generateBillQuery: " + getRideQuery);

						conn
								.query(
										getRideQuery,
										function(err, rows)
										{
											if (err)
											{
												console.log(err);
												console.log(err.code);
												res.code = "401";
												res.errorMessage = "Oops! There was some problem in retrieving ride. Please try again.";
												conn.release();
											}
											else
											{
												console.log("Succesfully generated bill");
												res.code = "200";
												res.value = "Succes getRideQuery";

												console.log(rows[0].start_time);
												// retrieve billing data
												var duration = moment.utc(
														moment(rows[0].end_time, "HH:mm:ss").diff(
																moment(rows[0].start_time, "HH:mm:ss")))
														.format("HH:mm:ss")
												time = moment.duration(duration).asMinutes();
												distance = rows[0].distance_travelled;

												if (moment(rows[0].start_time, "HH:mm:ss").isBetween(
														moment("06:00:00", "HH:mm:ss"),
														moment("18:00:00", "HH:mm:ss")))
												{
													time_constant = 0.15;
													console.log("phase 1");

												}
												else if (moment(rows[0].start_time, "HH:mm:ss")
														.isBetween(moment("18:00:01", "HH:mm:ss"),
																moment("23:59:59", "HH:mm:ss")))
												{
													time_constant = 0.3; // 50%
													console.log("phase 2");

												}
												else if (moment(rows[0].start_time, "HH:mm:ss")
														.isBetween(moment("00:00:00", "HH:mm:ss"),
																moment("05:59:59", "HH:mm:ss")))
												{

													time_constant = 0.2; // 25%
													console.log("phase 3");
												}
												console.log(time_constant);
												price = base + (time * time_constant)
														+ (distance * distance_constance);
												// insert price to ride

												var updatePriceQuery = "update ride set price ='"
														+ price + "' where id ='" + msg.rideid + "';";

												console.log("updatePriceQuery: " + updatePriceQuery);

												conn
														.query(
																updatePriceQuery,
																function(err, rowsUp)
																{
																	if (err)
																	{
																		console.log(err);
																		console.log(err.code);
																		res.code = "401";
																		res.errorMessage = "Oops! There was some problem in updating Price. Please try again.";
																		conn.release();
																	}
																	else
																	{
																		res.code = 200;
																		res.price = price;
																		conn.release();
																	}

																	callback(null, res);
																});
											}
										});
					});
		}

			break;

		case 'userBillList': {

			console.log("In userBillList apiCall");
			mysql
					.getConnection(function(err, conn)
					{
						if(msg.type=='user') {
							var getUserRideQuery = "select ride.id, ride.driver_id, ride.user_id, ride.start_location, ride.end_location, ride.start_time, ride.end_time, ride.distance_travelled,ride.date,ride.price,ride.start_location_lat, ride.start_location_lng, ride.start_location_lng,ride.end_location_lng,ride.end_location_lat,ride.status ,drivers.firstname, drivers.lastname, drivers.phone from ride  inner join drivers on ride.driver_id = drivers.id where ride.status != 'CAN' and ride.user_id ='"
								+ msg.user_id + "' order by ride.date desc;";
						} else {
							var getUserRideQuery = "select ride.id, ride.driver_id, ride.user_id, ride.start_location, ride.end_location, ride.start_time, ride.end_time, ride.distance_travelled,ride.date,ride.price,ride.start_location_lat, ride.start_location_lng, ride.start_location_lng,ride.end_location_lng,ride.end_location_lat,ride.status ,users.firstname, users.lastname, users.phone from ride  inner join users on ride.user_id = users.id where ride.status != 'CAN' and ride.driver_id ='"
								+ msg.user_id + "' order by ride.date desc;";
						}
						

						console.log("getUserRideQuery: " + getUserRideQuery);

						conn
								.query(
										getUserRideQuery,
										function(err, rows)
										{
											if (err)
											{
												console.log(err);
												console.log(err.code);
												res.code = "401";
												res.errorMessage = "Oops! There was some problem in retrieving ride. Please try again.";
												conn.release();
											}
											else
											{

												console.log("Succesful getRideQuery");

												var value = [];
												var i = 0;

												for (i = 0; i < rows.length; i++)
												{

													var duration = moment.utc(
															moment(rows[i].end_time, "HH:mm:ss").diff(
																	moment(rows[i].start_time, "HH:mm:ss")))
															.format("HH:mm:ss")
															
															var date = new Date(""+rows[i].date);
															
													console.log(duration);
													console.log(date);
													var viewBillObj = {
														"distance_travelled" : rows[i].distance_travelled,
														"Duration" : duration,
														"speed" : rows[i].distance_travelled
																/ moment.duration(duration).asMinutes(),
														"date" : (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear(),
														"pickUpLocation" : rows[i].start_location,
														"dropOffLocation" : rows[i].end_location,
														"price" : rows[i].price,
														"base" : base,
														"time_constant" : time_constant,
														"distance_constance" : distance_constance,
														"status" : rows[i].status,
														"start_location_lat" : rows[i].start_location_lat,
														"start_location_lng" : rows[i].start_location_lng,
														"end_location_lng" : rows[i].end_location_lng,
														"end_location_lat" : rows[i].end_location_lat,
														"driverfirstname" : rows[i].firstname,
														"driverlastname" : rows[i].lastname,
														"driverphone" : rows[i].phone

													}
													value.push(viewBillObj);
												}
												var jsonstring = JSON.stringify(value);
												res.code = 200;
												res.value = jsonstring;
												console.log(res);
												conn.release();
											}
											callback(null, res);
										});
					});

		}
			break;
	}
}

exports.generateBill = function(rideId)
{
	var generateBillQuery = "select id, driver_id, user_id, start_location, end_location, start_time, end_time, distance_travelled from ride where id ='"
			+ rideId + "';";

	console.log("generateBillQuery: " + generateBillQuery);

	conn.query(generateBillQuery, function(err, rows)
	{
		if (err)
		{
			console.log(err);
			console.log(err.code);
			conn.release();
		}
		else
		{
			console.log("Succesful getRideQuery");

			console.log(rows[0].start_time);
			// retrieve billing data
			var duration = moment.utc(
					moment(rows[0].end_time, "HH:mm:ss").diff(
							moment(rows[0].start_time, "HH:mm:ss"))).format("HH:mm:ss")
			time = moment.duration(duration).asMinutes();
			distance = rows[0].distance_travelled;

			if (moment(rows[0].start_time, "HH:mm:ss").isBetween(
					moment("06:00:00", "HH:mm:ss"), moment("18:00:00", "HH:mm:ss")))
			{
				time_constant = 0.15;
				console.log("phase 1");

			}
			else if (moment(rows[0].start_time, "HH:mm:ss").isBetween(
					moment("18:00:01", "HH:mm:ss"), moment("23:59:59", "HH:mm:ss")))
			{
				time_constant = 0.3; // 50%
				console.log("phase 2");

			}
			else if (moment(rows[0].start_time, "HH:mm:ss").isBetween(
					moment("00:00:00", "HH:mm:ss"), moment("05:59:59", "HH:mm:ss")))
			{

				time_constant = 0.2; // 25%
				console.log("phase 3");
			}
			console.log(time_constant);
			price = base + (time * time_constant) + (distance * distance_constance);
			// insert price to ride

			var updatePriceQuery = "update ride set price ='" + price
					+ "' where id ='" + msg.rideid + "';";

			console.log("updatePriceQuery: " + updatePriceQuery);

			conn.query(updatePriceQuery, function(err, rowsUp)
			{
				if (err)
				{
					console.log(err);
					console.log(err.code);
					return 0;
					conn.release();
				}
				else
				{
					return price;
					conn.release();
				}

			});
		}
	});
}