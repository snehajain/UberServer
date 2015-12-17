//var mongoJS = require('./mongoJS');

var mysql = require('./mysql');

exports.userUpdateProfile = function(msg, callback){
	
	var res = {};
	
	console.log(msg);
		
	mysql.getConnection(function(err, conn){
		
		var sqlQuery = "update users set firstname='"+msg.firstname+"',lastname='"+msg.lastname+"',address='"+msg.address+"',city='"+msg.city+"',state='"+msg.state+"',zipcode='"+msg.zipcode+"',phone='"+msg.phone+"',cardnumber='"+msg.cardnumber+"',cardcvv='"+msg.cardcvv+"',cardexpirationdate='"+msg.cardexpirationdate+"' where email ='"+msg.email+"'";
		
		console.log(sqlQuery);
		
		conn.query(sqlQuery, function(err, rows)
		{
			if(err)
			{
				console.log(err);
				console.log(err.code);

				res.code = "401";
				
				if(err.code == "ER_DUP_ENTRY")
				{
					res.errorMessage = "This email has already been used";
				}
				else
				{
					res.errorMessage = "Oops! There was some problem. Please try again.";
				}
				
				conn.release();
			}
			else
			{
				console.log("Succesful update");
				res.code = "200";
				res.value = "Succes Registration";
				
				conn.release();
			}
			
			callback(null, res);
		});
    });
};

exports.getUserProfile = function(msg, callback){
	
	var res = {};
	
	console.log(msg);
		
	mysql.getConnection(function(err, conn){
		
		var sqlQuery = "select firstname,lastname,address,city,state,zipcode,phone,cardnumber,cardcvv,cardexpirationdate from users where id = '"+msg.userId+"';";
		
		console.log(sqlQuery);
		
		conn.query(sqlQuery, function(err, rows)
		{
			if(err)
			{
				console.log(err);
				console.log(err.code);

				res.code = "401";
				
				if(err.code == "ER_DUP_ENTRY")
				{
					res.errorMessage = "This email has already been used";
				}
				else
				{
					res.errorMessage = "Oops! There was some problem. Please try again.";
				}
				
				conn.release();
			}
			else
			{
				if (rows.length != 0)
				{
					console.log(rows);

					res.code = "200";
					res.about = {"firstname" : rows[0].firstname,
							              "lastname" : rows[0].lastname,
							              "address" : rows[0].address,
							              "city" : rows[0].city,
							              "state" : rows[0].state,
							              "zipcode" : rows[0].zipcode,
							              "phone" : rows[0].phone,
							              "cardnumber" : rows[0].cardnumber,
							              "cardcvv" : rows[0].cardcvv,
							              "cardexpirationdate" : rows[0].cardexpirationdate};
				}
				
				conn.release();
			}
			
			callback(null, res);
		});
    });
};

exports.getDriverProfile = function(msg, callback){
	
	var res = {};
	
	console.log(msg);
		
	mysql.getConnection(function(err, conn){
		
		var sqlQuery = "select firstname,lastname,address,city,state,zipcode,phone,carnumber,carmodel,ssnnumber,video from drivers where email = '"+msg.email+"';";
		
		console.log(sqlQuery);
		
		conn.query(sqlQuery, function(err, rows)
		{
			if(err)
			{
				console.log(err);
				console.log(err.code);

				res.code = "401";
				
				if(err.code == "ER_DUP_ENTRY")
				{
					res.errorMessage = "This email has already been used";
				}
				else
				{
					res.errorMessage = "Oops! There was some problem. Please try again.";
				}
				
				conn.release();
			}
			else
			{
				if (rows.length != 0)
				{
					console.log(rows);

					res.code = "200";
					res.about = {"firstname" : rows[0].firstname,
							              "lastname" : rows[0].lastname,
							              "address" : rows[0].address,
							              "city" : rows[0].city,
							              "state" : rows[0].state,
							              "zipcode" : rows[0].zipcode,
							              "phone" : rows[0].phone,
							              "carnumber" : rows[0].carnumber,
							              "carmodel" : rows[0].carmodel,
							              "video" : rows[0].video,
							              "ssnnumber" : rows[0].ssnnumber};
				}
				
				conn.release();
			}
			
			callback(null, res);
		});
    });
};

exports.driverUpdateProfile = function(msg, callback){
	
	var res = {};
	
	console.log(msg);
		
	mysql.getConnection(function(err, conn){
		
		var sqlQuery = "update drivers set firstname='"+msg.firstname+"',lastname='"+msg.lastname+"',address='"+msg.address+"',city='"+msg.city+"',state='"+msg.state+"',zipcode='"+msg.zipcode+"',phone='"+msg.phone+"',carnumber='"+msg.carNumber+"',carmodel='"+msg.carModel+"',ssnnumber='"+msg.ssnNumber+"', lat="+msg.lat+", lng="+msg.lng+", video='"+msg.video+"' where email ='"+msg.email+"'";
		
		console.log(sqlQuery);
		
		conn.query(sqlQuery, function(err, rows)
		{
			if(err)
			{
				console.log(err);
				console.log(err.code);

				res.code = "401";
				
				res.errorMessage = "Oops! There was some problem with driver Profile update. Please try again.";				
				conn.release();
			}
			else
			{
				console.log("Succesful update");
				res.code = "200";
				res.value = "Success in Driver profile update";
				
				conn.release();
			}
			
			callback(null, res);
		});
    });
};
