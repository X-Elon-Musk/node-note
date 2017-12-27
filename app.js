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



//显示首页
app.get('/',router.showIndex);
//显示注册页面
app.get('/register',router.showRegister);
//注册
app.post('/doRegister',router.doRegister);
//发表记录
app.post('/record',router.record); 
//查找所有消息
// app.get('/getAll',router.getAll);

app.listen(3100);
