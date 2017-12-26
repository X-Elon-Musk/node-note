var formidable=require('formidable');
var path=require('path');
var fs=require('fs');

//显示首页
exports.showIndex= function (req,res,next) {
    res.render('index',{
    })
}
//发表记录
exports.record= function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req, function (err,fields,files) {
        var content=fields.content;
        /*db.insertOne('posts',{
            'username':username,
            'content':content,
            'datetime':getNowFormatDate(new Date()),
            'id':(Math.random()*2).toString().substr(2),
            'avatar':req.session.avatar
        }, function (err,result) {
            if (err) {
                res.send('-3');
                return;
            }
            res.send('1');//发表成功
        })*/
    })
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

/*//首页
exports.showIndex= function (req,res,next) {
    var username=req.session.login?req.session.username:'';
    db.find('users',{'username':username}, function (err,result) {
        if (result.length==0) {
            var avatar='moren.jpg';
        } else{
            var avatar=result[0].avatar;
        }
        res.render('index',{
            'login':req.session.login?true:false,
            'username':username,
            'active':'首页',
            'avatar':avatar
        })
    })
}
//注册页面
exports.showRegister= function (req,res,next) {
    res.render('register',{
        'login':req.session.login?true:false,
        'username':req.session.login?req.session.username:'',
        'active':'注册'
    })
}

//注册业务
exports.doRegister= function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req, function (err,fields,files) {
        var username=fields.username;
        var password=fields.password;
        db.find('users',{
            'username':username
        }, function (err,result) {
            if (err) {
                res.send('-3');//服务器错误
                return;
            }
            if (result.length!=0) {
                res.send('-1');//名字被占用
                return;
            }
            //设置md5加密
            password=md5(md5(password)+'coding');
            //名字没有被占用
            db.insertOne('users',{
                'username':username,
                'password':password,
                'avatar':'moren.jpg'
            }, function (err,result) {
                if (err) {
                    res.send('-3');
                    return;
                }
                username.length>4?username=username[0]+'**'+username[username.length-1]:username=username;
                req.session.username=username;
                req.session.login='1';
                res.send('1');//注册成功，写入session
            })
        })
    })
}

//登录页面
exports.showLogin= function (req,res,next) {
    res.render('login',{
        'login':req.session.login?true:false,
        'username':req.session.login?req.session.username:'',
        'active':'登录'
    })
}

//登录业务
exports.doLogin= function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req, function (err,fields,files) {
        var username=fields.username;
        var password=fields.password;
        var password_encryption=md5(md5(password)+'coding');
        db.find('users',{
            'username':username
        }, function (err,result) {
            if (err) {
                res.send('-3');//服务器错误
                return;
            }
            if (result.length==0) {
                res.send('-1');//用户不存在
                return;
            }
            if (password_encryption==result[0].password) {
                console.log(result[0]);
                username.length>4?username=username[0]+'**'+username[username.length-1]:username=username;
                req.session.username=username;
                req.session.avatar=result[0].avatar;
                req.session.login='1';
                res.send('1');//登录成功，写入session
            } else{
                res.send('-2');//密码错误
                return;
            }
        })
    })
}

//设置头像页面，必须保证此时是登录状态
exports.showSetavatar= function (req, res, next) {
    //必须保证登录
    if (req.session.login!='1') {
        res.end('非法闯入，这个页面要求登录!');
        return;
    }
    res.render('setAvatar',{
        'login':true,
        'username':req.session.username||'hello world!',
        'active':'修改头像'
    })
}

//设置头像
exports.dosetavatar= function (req,res,next) {
    //必须保证登录
    if (req.session.login!='1') {
        res.end('非法闯入，这个页面要求登录！');
        return;
    }
    var form=new formidable.IncomingForm();
    form.uploadDir=path.normalize(__dirname+'/../avatar');
    form.parse(req, function (err,fields,files) {
        //console.log(files.touxiang);
        var oldPath=files.touxiang.path;
        var newPath=path.normalize(__dirname+'/../avatar')+'/'+req.session.username+'.jpg';
        fs.rename(oldPath,newPath, function (err) {
            if (err) {
                res.send('失败');
                return;
            }
            req.session.avatar=req.session.username+'.jpg';
            res.redirect('/cut');
        })
    })
}

//显示切图页面
exports.showcut= function (req,res,next) {
    if (req.session.login!='1') {
        res.send('非法闯入，这个页面要求登录！');
        return;
    }
    res.render('cut',{
        'login':true,
        'username':req.session.username,
        'active':'剪裁头像',
        'avatar':req.session.avatar
    })
}

//执行切图
exports.docut= function (req,res,next) {
    if (req.session.login!='1') {
        res.end('非法闯入，这个页面要求登录！');
        return;
    }
    //这个页面接收几个GET请求参数
    var filename=req.session.avatar;
    var w=req.query.w;
    var h=req.query.h;
    var x=req.query.x;
    var y=req.query.y;
    gm("./avatar/"+filename)
        .crop(w,h,x,y)
        .resize(100,100,"!")
        .write("./avatar/"+filename, function (err) {
            if (err) {
                res.send('-1');
                return;
            }
            db.updateMany('users',{'username':req.session.username},{
                $set:{'avatar':req.session.avatar}
            }, function (err,results) {
                res.send('1');
            })
        })
}

//发表留言
exports.doPost= function (req,res,next) {
    if (req.session.login!='1') {
        res.end('请先登录。');
        return;
    }
    var username=req.session.username;
    var form=new formidable.IncomingForm();
    form.parse(req, function (err,fields,files) {
        var content=fields.content;
        db.insertOne('posts',{
            'username':username,
            'content':content,
            'datetime':getNowFormatDate(new Date()),
            'id':(Math.random()*2).toString().substr(2),
            'avatar':req.session.avatar
        }, function (err,result) {
            if (err) {
                res.send('-3');
                return;
            }
            res.send('1');//发表成功
        })
    })
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

//列出所有留言
exports.getAllMessage= function (req,res,next) {
    //这个页面接收一个参数，页面
    var page=req.query.page;
    db.find('posts',{},{'pageamount':20,'page':page,'sort':{'datetime':-1}}, function (err,result) {
        res.json(result);
    })
}

//列出某个用户所有留言
exports.getUserInfo= function (req,res,next) {
    var username=req.query.username;
    db.find('posts',{'username':username}, function (err,result) {
        db.find('users',{'username':username}, function (err2,result2) {
            if (err||err2||result2.length==0) {
                res.json('');
                return;
            }
            var obj={
                'username':result2[0].username,
                'avatar':result2[0].avatar,
                '_id':result[0].id
            };
            res.json(obj);
        })
    })
}

//获取所有留言的数量
exports.getMessageAmount= function (req,res,next) {
    db.getAllCount('posts', function (count) {
        res.send(count.toString());
    })
}

//显示某个用户的个人主页
exports.showUser= function (req,res,next) {
    var user=req.params['user'];
    db.find('posts',{'username':user}, function (err,result) {
        db.find('users',{'username':user}, function (err,result2) {
            res.render('user',{
                'login':req.session.login=='1'?true:false,
                'username':req.session.login=='1'?req.session.username:'',
                'user':user,
                'active':'我的留言',
                'allMessage':result,
                'avatar':result2[0].avatar
            })
        })
    })
}

//显示所有注册用户
exports.showUserList= function (req,res,next) {
    db.find('users',{}, function (err,result) {
        res.render('userList',{
            'login':req.session.login=='1'?true:false,
            'username':req.session.login=='1'?req.session.username:'',
            'active':'成员列表',
            'allUsers':result
        })
    })
}

//显示某个用户的个人主页
exports.showMessageDetail= function (req,res,next) {
    var user=req.params['user'];
    var id=req.params['id'];
    db.find('posts',{'username':user,'id':id}, function (err,result) {
        db.find('users',{'username':user}, function (err,result2) {
            res.render('messageDetail',{
                'login':req.session.login=='1'?true:false,
                'username':req.session.login=='1'?req.session.username:'',
                'user':user,
                'active':'某人说说',
                'messageDetail':result[0],
                'avatar':result2[0].avatar
            })
        })
    })
}*/























