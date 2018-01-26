### 前言
网上见一些NodeJS+Express+MongoDB项目，这个备忘录项目使用数据库是MySQL，利用MySQL数据库增删改查功能实现备忘录页面的增删改查功能。项目中除了备忘录功能外，增加了用户注册、登录和账号绑定等功能。项目本地实现后，再通过Nginx反向代理部署nodejs，实现线上访问。
项目还会陆续添加一些功能，比如批量删除备忘录，微信登录，上传头像等功能。
### 技术栈
node + express + mysql + ejs + knockoutJs + less
### 项目运行
```
git clone https://github.com/792884274/node-note.git

cd node-note

npm install

node app.js
```

### 项目完成功能
用户注册
验证码输入验证
短信登录
密码登录
用户名修改
手机号绑定
密码修改
备忘录显示
备忘录搜索
删除单条备忘录
备忘录编辑
发布备忘录

### 项目优化
1. nginx 设置
nginx配置expires,设置静态资源的过期时间，控制台返回304 Not Modified。浏览器和服务器多确认了一次缓存有效性，再用的缓存，所用时间为n*ms。
```
http {
    ＃缓存目录 目录级别 缓存池 有效时间 最大空间
    proxy_cache_path  /usr/local/nginx/cache  levels=1:2    keys_zone=STATIC:10m
    inactive=24h  max_size=1g;

    server
  {
    listen       80;
    server_name 792884274.com www.792884274.com;

    location / {
        #nginx反向代理部署nodejs
        proxy_set_header    X-Real-IP           $remote_addr;
        proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
        proxy_set_header    Host                $http_host;
        proxy_set_header    X-NginX-Proxy       true;
        proxy_set_header    Connection          "";
        proxy_pass http://39.104.65.227:3389;＃代理地址
    }

    location  ~ \.(gif|jpg|png|js|css|less)$ {
         proxy_set_header    X-Real-IP           $remote_addr;
         proxy_set_header    X-Forwarded-For     $proxy_add_x_forwarded_for;
         proxy_set_header    Host                $http_host;
         proxy_set_header    X-NginX-Proxy       true;
         proxy_set_header    Connection          "";
         proxy_http_version  1.1;
         proxy_connect_timeout 1;
         proxy_send_timeout 30;
         proxy_read_timeout 60;
         proxy_cache_methods GET HEAD POST;# 缓存方法
         proxy_ignore_headers Cache-Control Set-Cookie;＃设置客户端缓存
         proxy_cache            STATIC;＃缓存池
         proxy_cache_valid      200 20m;＃请求为200 缓存20分钟
         proxy_cache_use_stale  error timeout invalid_header updating
                                   http_500 http_502 http_503 http_504;
         proxy_pass http://39.104.65.227:3389;
         expires 30d;#设置Response Headers请求头的Last-Modified过期时间为30天
    }
}
```
2. node express设置
express.static可以托管静态文件，express.static(root, [options])在options中设置静态文件的maxage时间。控制台为200 OK (from cache)  是浏览器没有跟服务器确认，直接用了浏览器缓存，所用时间为0ms。
```
app.use(express.static("./public",{
   maxage: '30d'
}));
```

### 项目布局
```
.
├── model                                         // 数据模型(相当于MVC中的M)
│   ├── md5.js                                    // 用户密码加密
│   └── sq-config.js                              // 数据库mysql配置文件
├── node_modules                                  // 项目的依赖库
├── public                                        // 项目依赖的静态文件
│   ├── css                                       // 样式表
│   │   ├── bootstrap.min.css                     // boootstrap样式表
│   │   ├── main.less                             // 主要样式文件
│   │   └── reset.less                            // 清楚默认样式文件
│   ├── font-awesome                              // 图标字体库和CSS框架
│   ├── images                                    // 图片
│   └── js                                        // 项目js依赖
│       ├── jquery-1.11.3.min.js                  // jquery
│       ├── knockout-3.4.0.js                     // knockout
│       ├── less.js                               // less
│       ├── zepto.js                              // zepto
│       └── zepto.min.js                          // zepto
├── router                                        // 路由配置文件
│   └── router.js                                 // 路由控制器
├── views                                         // 视图目录(相当于MVC中的V)
│   ├── index.ejs                                 // 首页登录页面
│   ├── note-edit.ejs                             // 备忘录编辑页面
│   ├── note-pages.ejs                            // 个人备忘录展示页面
│   ├── note-password.ejs                         // 密码修改页面
│   ├── note-register.ejs                         // 注册页面
│   ├── note-search.ejs                           // 备忘录查询页面
│   ├── note-telephone.ejs                        // 绑定、换绑手机页面
│   ├── note-user.ejs                             // 用户账户信息页面
│   └── note-username.ejs                         // 用户名修改页面
├── .gitignore                                    // 忽略特殊文件
├── app.js                                        // 项目入口及程序启动文件
├── package.json                                  // 包描述文件及开发者信息
├── README.md                                     // 项目说明文件
.

```



