//设置body的宽高
function bodySet(){
    if ($('body')[0].getBoundingClientRect().height) {
        //获取屏幕宽高
        var winWid=window.innerWidth;
        document.body.style.width=winWid+'px';
        var winHei=window.innerHeight;
        document.body.style.height=winHei+'px';
//在窗口或框架被调整大小时重新赋值body宽高
        window.onresize=function () {
            winWid=window.innerWidth;
            document.body.style.width=winWid+'px';
            winHei=window.innerHeight;
            document.body.style.height=winHei+'px';
        }
    }
}
bodySet();