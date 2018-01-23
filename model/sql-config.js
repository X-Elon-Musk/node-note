var mysql=require('mysql');
var connection=mysql.createConnection({
	host: '39.104.65.227',
	user: 'root',
	password: 'Beijing@0983',
	database: 'notes'
})

connection.connect();
//操作数据库
exports.mysql=function (sql,params,callback) {
	connection.query(sql,params,function (err,result) {
		if (err) {
			callback(err,null);
			return;
		} else{
			callback(null,result);
		}		
	})
	// connection.end();
}