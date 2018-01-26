var formidable=require('formidable');
/*var path=require('path');
var fs=require('fs');*/
var mysql=require('../model/sql-config.js').mysql;
var md5=require('../model/md5.js');
var svgCaptcha = require('svg-captcha');
const SMSClient = require('@alicloud/sms-sdk')
// ACCESS_KEY_ID/ACCESS_KEY_SECRET 根据实际申请的账号信息进行替换
const accessKeyId = 'LTAINkfU7xNmo0qb'
const secretAccessKey = 'WNce8J1x0TQFkb57jYOnXW2xyM8pD7'

//操作用户数据库
var User_sql=function () {};
User_sql.prototype={
    constructor: User_sql,
    init: function () {
        
    },
    insert: function (username,password) {
        return 'insert into users('+username+','+password+') values(?,?)';
    },
    select: function (condition,column) {
        if (!column) column='*';
        return 'select '+column+' from users where '+condition+'=?';
    },
    update: function (column,condition) {
        return 'update users set '+column+'=? where '+condition+'=?';
    }
}
//操作备忘录数据库
var Note_sql=function () {};
Note_sql.prototype={
    constructor: Note_sql,
    init: function () {
        
    },
    insert: function (user_id,text,time) {
        return 'insert into notes('+user_id+','+text+','+time+') values(?,?,?)';
    },
    select: function (column,condition,additional) {
        if (!additional) additional=''; 
        return 'select '+column+' from notes where '+condition+'=?'+additional;
    },
    //模糊查找
    select_fuzzy: function (text,column) {
        if (!column) column='*';
        return 'select '+column+' from notes where '+text+' like concat("%",?,"%") and user_id=?'  
    },
    update: function (condition) {
        return 'update notes set time=?,text=? where '+condition+'=?';
    },
    delete: function (condition) {
        return 'delete from notes where '+condition+'=?';   
    },
    //删除后显示下一条信息
    delete_select: function () {
        return 'select * from notes where id=(select min(id) from notes where id>? and user_id=?)';
    }
}
var user_sql=new User_sql();
var note_sql=new Note_sql();


//显示首页
exports.index=function (req,res,next) {
    res.render('index',{})
}
//登录
exports.login=function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        //判断是短信登录还是密码登录
        var mode=fields.mode;
        if (mode=='message') {
            var telephone=fields.telephone;
            var message=fields.message;
            mysql(user_sql.select('telephone'),[telephone],function (err,result) {
                if (err) {
                    res.send('-3');//服务器错误
                    return;                   
                }   
                if (result.length==0) {
                    res.send('-1');//手机号未注册
                    return;
                }
                if (message==result[0].message) {
                    req.session.username=result[0].username;
                    req.session.user_id=result[0].id;
                    req.session.login='1';
                    res.send('1');//登录成功，写入session
                } else{
                    res.send('-2');//验证码错误
                    return;
                }
            })            
        } else if(mode=='password'){
            var username=fields.username;
            var password=fields.password;
            var password_md5=md5(md5(password)+'792884274');
            console.log(username);
            mysql(user_sql.select('username'),[username],function (err,result) {
                // console.log('结果是，',result);
                if (err) {
                    console.log(err,result);
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
        }
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
        var captcha=fields.captcha;
        if (captcha.toLowerCase()!==req.session.captcha.toLowerCase()) {
            res.send('-2');//验证码不对
            return;            
        }
        mysql(user_sql.select('username'),[username],function (err,result) {
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
            mysql(user_sql.insert('username','password'),[username,password],function (err,result) {
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
    mysql(note_sql.select('*','user_id'),[user_id],function (err,result) {
        if (err) {
            res.send('-2');
            return;           
        }
        var obj={
            'text': result
        };
        res.json(obj);
    })
}
//搜索备忘录
exports.search=function (req,res,next) {
    var user_id=req.session.user_id;
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var text=fields.text;  
        mysql(note_sql.select_fuzzy('text'),[text,user_id],function (err,result) {
            if (err) {
                res.send('-2');
                return;           
            }
            var obj={
                'text': result
            };
            res.json(obj);
        })
    })
}
//获取用户信息页面
exports.noteUser=function (req,res,next) {
    //没有登录
    if (req.session.login!=='1') {
        return;   
    }
    var username=req.session.username,
        telephone='';
    mysql(user_sql.select('username'),[username],function (err,result) {
        if (err) {
            return;         
        }
        if (result[0].telephone) telephone=telephone_change(result[0].telephone);
        res.render('note-user',{
            'id': result[0].id,
            'username': result[0].username,
            'telephone': telephone
        })
    })
}
//显示修改用户名页面
exports.noteUsername=function (req,res,next) {
    res.render('note-username',{})
}
//修改用户的用户名
exports.noteChangeUsername=function (req,res,next) {
    var user_id=req.session.user_id;
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var username=fields.username;
        if (username==req.session.username) {
            res.send('2');//修改后的用户名和原用户名相同         
        } else{
            mysql(user_sql.select('username'),[username],function (err0,result0) {
                if (err0) return;
                if (result0.length!=0) {
                    res.send('-1');//用户名被占用
                    return;
                }
                mysql(user_sql.update('username','id'),[username,user_id],function (err1,result1) {
                    if (err1) {
                        return;         
                    } else{
                        req.session.username=username;
                        res.send('1');//用户名修改成功
                    }
                })
            })
        }
    })  
}
//显示修改用户手机号页面
exports.noteTelephone=function (req,res,next) {
    var username=req.session.username,
        telephone='';
    mysql(user_sql.select('username'),[username],function (err,result) {
        if (err) {
            return;         
        }
        if (result[0].telephone) telephone=telephone_change(result[0].telephone);
        res.render('note-telephone',{
            'telephone': telephone,
            'hide_telephone': result[0].telephone
        })
    })
}
//用户绑定手机号
exports.bindTelephone=function (req,res,next) {
    var user_id=req.session.user_id;
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var telephone=fields.telephone;
        var message=fields.message;
        var state=fields.state;
        mysql(user_sql.select('telephone'),[telephone],function (err,result) {
            if (err) return;
            if(result.length==0&&state=='bind'||result.length!=0&&user_id==result[0].id&&state==''){
                //已绑定手机号，换绑手机。第一步验证当前手机号，无需再存数据库
                if (state=='') {
                    res.send('1');
                    return;
                }
                mysql(user_sql.select('id'),[user_id],function (err,result) {
                    if (err) return; 
                    if (message==result[0].message) {
                        if (state=='bind') {
                            mysql(user_sql.update('telephone','id'),[telephone,user_id],function (err,result) {
                                if (err) return;  
                                req.session.telephone=telephone;
                                res.send('1');//绑定成功
                            })           
                        } else{
                            res.send('1');//旧手机号验证码正确
                        }
                        return;
                    } 
                    res.send('-2');//验证码错误
                })
                return;
            }
            res.send('-1');//手机号已被注册 
        })        
    })
}   
//显示修改用户密码页面
exports.notePassword=function (req,res,next) {
    res.render('note-password',{})
}
//修改用户的密码
exports.noteChangePassword=function (req,res,next) {
    var user_id=req.session.user_id;
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var old_password=md5(md5(fields.old_password)+'792884274');
        var new_password=md5(md5(fields.new_password)+'792884274');
        mysql(user_sql.select('id'),[user_id],function (err0,result0) {
            if (err0) return;
            if (result0[0].password!=old_password) {
                res.send('-1');//旧密码不正确         
                return;
            }
            mysql(user_sq.update('password','id'),[new_password,user_id],function (err1,result1) {
                if (err1) {
                    return;         
                } else{
                    res.send('1');//密码修改成功
                }
            })
        })

    })  
}
//显示搜索页面
exports.noteSearch=function (req,res,next) {
    res.render('note-search',{
        'active': 'search',
        'login': req.session.login,
        'username': req.session.username
    })
}
    
//显示编辑页面(在无内容和有内容情况下，渲染页面)
exports.noteEdit=function (req,res,next) {
    var id=req.params['id'];
    if (id) {
        mysql(note_sql.select('*','id'),[id],function (err,result) {
            if (result.length!==0) {
                res.render('note-edit',{
                    'active': 'note-edit',
                    'login': req.session.login,
                    'username': req.session.username,
                    'id': result[0].id,
                    'notetime': result[0].time,
                    'text': result[0].text
                })            
            } 
        })      
    } else{
        res.render('note-edit',{
            'active': 'note-edit',
            'login': req.session.login,
            'username': req.session.username,
            'id': '',
            'notetime': getNowFormatDate(new Date()),
            'text': ''
        }) 
    }
}
//发表备忘记录。原来有内容的时候为update数据库，没内容的时候为insert数据库。
exports.record=function (req,res,next) {
    /*
    if (req.session.login!='1') {
        res.end('请登录。');
        return;
    }*/
    var id=req.params['id'];
    var form=new formidable.IncomingForm();
    form.parse(req, function (err,fields,files) {
        //存入user_id、text、time
        var data=fields.data;
        var arr=data.split('&');
        var time=arr[0].split('=')[1];
        var text=arr[1].split('=')[1];
        if (id) {
            time=getNowFormatDate(new Date());
            mysql(note_sql.update('id'),[time,text,id],function (err,result) {
                if (err) {
                    res.send('-3');
                    return;         
                }
                res.send('1');//更改成功
            })       
        } else{
            mysql(note_sql.insert('user_id','text','time'),[req.session.user_id,text,time],function (err,result) {
                if (err) {
                    res.send('-3');
                    return;         
                }
                res.send('1');//发表成功
            })
        }
    }) 
}

//删除单条备忘记录
exports.delete=function (req,res,next) {
    var id=req.params['id'];
    var form=new formidable.IncomingForm();
    var user_id=req.session.user_id;
    form.parse(req,function (err,fields,files) {
        var follow=fields.follow;
        //判断是否有后续操作(是否要显示下一条数据)
        if (follow=='true') {
            mysql(note_sql.delete_select(),[id,user_id],function (err,result0) {
                if (err) {
                    res.send('-3');
                    return;         
                }
                //判断是否有下一行
                if (result0.length!==0) {
                    renderDelete(res,result0[0].id);          
                } else{
                    //没有下一行就显示数据库中第一行
                    mysql(note_sql.select('*','user_id',' limit 1'),[user_id],function (err,result1) {
                        //判断第一行是否是要删除的那行
                        if (result1[0].id==id) {
                            mysql(note_sql.delete('id'),[id],function (err,result) {
                                renderDelete(res,'');  
                            })          
                        } else{
                            renderDelete(res,result1[0].id);
                        }
                    }) 
                }
            })           
        } else if(follow=='false'){
            mysql(note_sql.delete('id'),[id],function (err,result) {
                if (err) {
                    res.send('-3');
                    return;         
                }
                res.send('1');//删除成功 
            })
        }
    })
    //返回查询数据，删除当前行
    function renderDelete(res,new_id) {
        res.send({
            state: '1',
            id: new_id 
        });
        mysql(note_sql.delete('id'),[req.params['id']],function (err,result) {}) 
    }   
}
//获取图片验证码
exports.captcha=function (req,res,next) {
    var captcha = svgCaptcha.create({
        noise: 3,
        color: false,
        background: '#d0f3e3'
    });
    req.session.captcha=captcha.text;
    res.type('html')
    res.status(200).send(captcha.data);
}
//获取手机验证码
exports.teleCode=function (req,res,next) {
    var form=new formidable.IncomingForm();
    form.parse(req,function (err,fields,files) {
        var telephone=fields.telephone;
        var message=createParam();
        //更新数据库
        function update_sql() {
            mysql(user_sql.select('telephone'),[telephone],function (err0,result0) {
                if(err0) return;
                //首页短信登录，为不登录状态。更换手机号时初次验证旧手机号，为登录状态。
                if (result0.length!==0) {
                    mysql(user_sql.update('message','telephone'),[message,telephone],function (err1,result1) {
                        if (err1) return; 
                        res.send('1');//发送成功 
                    })
                } 
                //绑定手机号和更换手机号时第二次验证新手机，两种情况下都为登录状态
                else if(result0.length==0&&req.session.login=='1'){
                    mysql(user_sql.update('message','id'),[message,req.session.user_id],function (err1,result1) {
                        if (err1) return; 
                        res.send('1');//发送成功 
                    })
                } 
                else{
                    res.send('-1')//手机号码未注册
                    return;               
                }                            
            })  
        }
        console.log('短信：',message);
        update_sql();
        //发送短信
        // smsClient(telephone,message,update_sql);
    })
    
}
    


//获取当前时间
function getNowFormatDate(date) {
    var seperator=":";
    var year=date.getFullYear();
    var month=date.getMonth()+1;
    var day=date.getDate();
    var currentdate=year+"年"+month+"月"+day+"日"+date.getHours()+seperator+date.getMinutes();
    return currentdate;
}
//改变电话号码显示效果
function telephone_change(telephone) {
    var new_telephone=telephone.substr(0,3)+'****'+telephone.substr(7);
    return new_telephone;
}
//生成随机短信验证码
function createParam() {
    var param='';
    for (var i=0;i<6;i++) {
        param+=Math.floor(Math.random()*10);
    }  
    return param;
}
//发送短信
function smsClient(telephone,message,calllback) {
    //初始化sms_client
    let smsClient = new SMSClient({accessKeyId, secretAccessKey});
    //发送短信
    smsClient.sendSMS({
        // PhoneNumbers: telephone,
        // SignName: '李超',
        // TemplateCode: 'SMS_121905126',
        // TemplateParam: '{"name":'+telephone+'}'
        PhoneNumbers: telephone,
        SignName: '李超',
        TemplateCode: 'SMS_121165464',
        TemplateParam: '{"code":'+message+'}'
    }).then(function (result) {
        let {Code}=result;
        if (Code === 'OK') {
            //处理返回参数
            console.log(message);
            calllback&&calllback();
        }
    }, function (err) {
        console.log('获取手机验证码错误:'+err);
        return;
    })
}    








    



