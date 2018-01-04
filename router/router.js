var formidable=require('formidable');
var path=require('path');
var fs=require('fs');
var mysql=require('../model/sql-config.js');
var md5=require('../model/md5.js');

var user_sql={
    insert: 'insert into users(login_name,password) values(?,?)',
    queryAll: 'select * from users',
    getInfo: 'select * from users where login_name=?',
    getId: 'select id from users where login_name=?',
    getPassword: 'select password from users where login_name=?'
}
var note_sql={
    insert: 'insert into notes(user_id,text,time) values(?,?,?)',
    queryAll: 'select * from notes',
    getNotes: 'select * from notes where user_id=?',
    delete: 'delete from notes where id=?'
}

//显示首页
exports.index=function (req,res,next) {
    res.render('index',{})
}
//登录
exports.login=function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var username=fields.username;
        var password=fields.password;
        var password_md5=md5(md5(password)+'792884274');
        mysql.find(user_sql.getInfo,[username],function (err,result) {
            if (err) {
                res.send('-3');//服务器错误
                return;                   
            }   
            if (result.length==0) {
                res.send('-1');//用户不存在
                return;
            }
            if (password_md5==result[0].password) {
                req.session.username=username;
                req.session.user_id=result[0].id;
                req.session.login='1';
                res.send('1');//登录成功，写入session
            } else{
                res.send('-2');//密码错误
                return;
            }
        })  
    })
}
//显示注册页面
exports.noteRegister=function (req,res,next) {
    res.render('note-register',{})
}
//注册
exports.register=function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var username=fields.username;
        var password=fields.password;
        mysql.find(user_sql.getId,[username],function (err,result) {
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
//显示备忘录
exports.notePages=function (req,res,next) {
    res.render('note-pages',{
        'active': 'pages',
        'login': req.session.login,
        'username': req.session.username
    })
}
//获取个人所有备忘录文本
exports.noteNotes=function (req,res,next) {
    var user_id=req.session.user_id;
    mysql.find(note_sql.getNotes,[user_id],function (err,result) {
        if (err||result.length==0) {
            res.json('');
            return;         
        }
        var obj={
            'text': result
        };
        res.json(obj);
    })
}
//显示编辑页面
exports.noteEdit=function (req,res,next) {
    res.render('note-edit',{
        'active': 'note-edit',
        'login': req.session.login,
        'username': req.session.username,
        'notetime': getNowFormatDate(new Date())
    })
    function getNowFormatDate(date) {
        var seperator=":";
        var year=date.getFullYear();
        var month=date.getMonth()+1;
        var day=date.getDate();
        var currentdate=year+"年"+month+"月"+day+"日"+date.getHours()+seperator+date.getMinutes();
        return currentdate;
    }
}
//发表备忘记录
exports.record=function (req,res,next) {
    /*var user_id='';
    if (req.session.login!='1') {
        res.end('请登录。');
        return;
    }*/
    
    var form=new formidable.IncomingForm();
    form.parse(req, function (err,fields,files) {
        //存入user_id、text、time
        var data=fields.data;
        var arr=data.split('&');
        var time=arr[0].split('=')[1];
        var text=arr[1].split('=')[1];
        // console.log(data.split('&'));
        mysql.insertOne(note_sql.insert,[req.session.user_id,text,time],function (err,result) {
            if (err) {
                res.send('-3');
                return;         
            }
            res.send('1');//发表成功
        })
    }) 
}

//删除单条备忘记录
exports.delete=function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var id=fields.id;
        mysql.delete(note_sql.delete,[id],function (err,result) {
            if (err) {
                res.send('-3');
                return;         
            }
            res.send('1');//删除成功 
        })
    })
}
    










    



