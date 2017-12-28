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
app.get('/',router.showIndex);
//登录
app.post('/doLogin',router.doLogin);
//显示备忘录
app.get('/showPages',router.showPages);
//获取个人所有备忘录文本
app.get('/getNotes',router.getNotes);
//显示编辑页面
app.get('/showEdit',router.showEdit);
//发表备忘记录
app.post('/record',router.record);

/*//显示注册页面
app.get('/register',router.showRegister);
//注册
app.post('/doRegister',router.doRegister);

//发表记录
app.post('/record',router.record); 
*/

app.listen(3100);
