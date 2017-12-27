var formidable=require('formidable');
var path=require('path');
var fs=require('fs');
var mysql=require('../model/sql-config.js');
var md5=require('../model/md5.js');

var user_sql={
    insert: 'insert into users(login_name,password) values(?,?)',
    queryAll: 'select * from users',
    getByName: 'select id from users where login_name=?'
}
var note_sql={
    insert: 'insert into notes(user_id,text) values(?,?)',
    queryAll: 'select * from notes',
    getById: 'select * from notes where id=?'
}

//显示首页
exports.showIndex= function (req,res,next) {
    var username=req.session.username?req.session.username:'';
    // mysql.find(function (err,result) {
        // console.log(result);
        res.render('index',{
            'login': req.session.login,
            'username': username
        })
    // })
}
//显示注册页面
exports.showRegister=function (req,res,next) {
    res.render('register',{

    })
}
//注册
exports.doRegister=function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var username=fields.username;
        var password=fields.password;
        mysql.find(user_sql.getByName,[username],function (err,result) {
            console.log(111,result);
            if (err) {
                res.send('-3');//服务器错误
                return;         
            }
            if (result.length!=0) {
                res.send('-1');//名字被占用
                return;
            }
            //设置md5加密
            password=md5(md5(password)+'792884274');
            //名字没有被占用
            mysql.insertOne(user_sql.insert,[username,password],function (err,result) {
                if (err) {
                    res.send('-3');
                    return;                   
                } 
                req.session.username=username;
                req.session.login='1';
                res.send('1');//注册成功  
            })
        }) 
    })
}



//发表记录
exports.record= function (req,res,next) {
    var user_id='';
    if (req.session.login!='1') {
        res.end('请登录。');
        return;
    }
    
    var form=new formidable.IncomingForm();
    form.parse(req, function (err,fields,files) {
        var content=fields.content;
        console.log(content);
        mysql.find(user_sql.getByName,[req.session.username],function (err,result) {
           
            if (err) {
                return;         
            }
            user_id=result[0].id;
            mysql.insertOne(note_sql.insert,[user_id,content],function (err,result) {
                console.log(err,333);
            })
        })
        
    })
    /*mysql.insertOne([3,'aaaaaaaa'],function () {
        console.log(11);
    });*/
    function getNowFormatDate(date) {
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate=month + seperator1 + strDate
            + " " + date.getHours() + seperator2 + date.getMinutes();
        return currentdate;
    }
}

