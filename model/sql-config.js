var mysql=require('mysql');
var connection=mysql.createConnection({
	host: '39.104.65.227',
	user: 'root',
	password: 'Beijing@0983',
	database: 'notes'
})

connection.connect();

/*var user_sql={
    insert: 'insert into users(login_name,password) values(?,?)',
    queryAll: 'select * from users',
    getByName: 'select id from users where login_name=?'
}
var note_sql={
    insert: 'insert into notes(id,text) values(?,?)',
    queryAll: 'select * from notes',
    getById: 'select * from notes where id=?'
}*/


//插入数据
exports.insertOne=function (sql,params,callback) {
	connection.query(sql,params,function (err,result) {
		callback(err,result);
	})
	// connection.end();
}
//得到总信息
exports.find=function (sql,params,callback) {
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
