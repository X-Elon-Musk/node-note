var express = require("express");
var app = express();
var router=require('./router/router.js');
var session =require('express-session');

//使用session
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

//设置模板引擎
app.set("view engine", "ejs");

//静态
app.use(express.static("./public"));



//显示首页(登录页面)
app.get('/',router.index);
//登录
app.post('/login',router.login);
//显示注册页面
app.get('/noteRegister',router.noteRegister);
//注册
app.post('/register',router.register);
//显示备忘录
app.get('/notePages',router.notePages);
//获取个人所有备忘录文本
app.get('/noteNotes',router.noteNotes);
//显示编辑页面
app.get('/noteEdit/:id?',router.noteEdit);
//发表备忘记录
app.post('/record/:id?',router.record);
//删除单条备忘记录
app.post('/delete',router.delete);


app.listen(3100);
