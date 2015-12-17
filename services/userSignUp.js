
var bcrypt = require('bcrypt-nodejs');
//var mongoJS = require('./mongoJS');

var mysql = require('./mysql');


exports.userSignUp = function(msg, callback){
	
	var res = {};
	console.log("In register handle request:"+ msg.email);
		
	mysql.getConnection(function(err, conn){
		
		var hash = bcrypt.hashSync(msg.password);
		
		var sqlQuery = "insert into users(firstname,lastname,address,city,state,zipcode,phone,email,password,gender,cardnumber,cardcvv,cardexpirationdate, status) values ('"+msg.firstname+"','"+msg.lastname+"','"+msg.address+"','"+msg.city+"','"+msg.state+"','"+msg.zipcode+"','"+msg.phone+"','"+msg.email+"','"+hash+"','"+msg.gender+"','"+msg.cardnumber+"','"+msg.cardcvv+"','"+msg.cardExpirationDate+"','AVA');";
		
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
				console.log("Succesful insert");
				res.code = "200";
				res.value = "Succes Registration";
				
				conn.release();
			}
			
			callback(null, res);
		});
    });
};


exports.userLogin = function(msg, callback){
	
	var res = {};
	console.log("In register handle request:"+ msg.email);
	
	// if(msg.email=='joey@gmail.com'&&msg.password=='JoeyGladstone') {
	// 	res.code = "200";
	// 	res.success = 1;
	// 	res.username='joey@gmail.com';
	// 	res.userId=3;
	// 	res.lastname='Gladstone';
	// 	res.status='AVA';
	// 	res.email='joey@gmail.com';
						
	// 	callback(null, res);
	// } else {
	// 	res.code = "200";
	// 	res.success = -1;			
	// 	callback(null, res);
	// }
		
	mysql.getConnection(function(err, conn){
		
		var sqlQuery = "select password, id, firstname, lastname, status, email from users where status!='DEL' and email ='"+msg.email+"'";
		console.log("Query: "+ sqlQuery);

		conn.query(sqlQuery, function(err, rows)
		{
			if(err)
			{
				console.log(err);
				console.log(err.code);

				res.code = "401";
				res.errorMessage = "Oops! There was some problem. Please try again.";
				
				conn.release();
				callback(null, res);
			}
			else
			{
				if (rows.length == 0)
				{
					console.log("Invalid username");
					conn.release();
					
					res.code = "200";
					res.success = -1;
					
					callback(null, res);
				}
				else
				{	
					var correctPassword = rows[0].password;
					console.log("PWD: "+bcrypt.hashSync(msg.password));
					var doesPasswordMatch = bcrypt.compareSync(msg.password, correctPassword);
					
					if (doesPasswordMatch)
					{
						console.log("successful login");
						conn.release();
						
						res.code = "200";
						res.success = 1;
						res.username=rows[0].firstname;
						res.userId=rows[0].id;
						res.lastname=rows[0].lastname;
						res.status=rows[0].status;
						res.email=rows[0].email;
						
						callback(null, res);
					}
					else
					{
						console.log("wrong password");
						conn.release();
						
						res.code = "200";
						res.success = 0;
						
						callback(null, res);
					}
				}
			}
		});
    });
};