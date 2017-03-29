##手势密码

###思路
* 采用原型继承的方法实现，其中的手势密码盘采用canvas绘制，通过对用户触摸的点的坐标和canvas中圆盘的距离来判断位置。
* 通过两个单选框来切换设置密码和验证密码
* 当用户手势结束将触发对状态的处理函数storePass()。
* 设置和验证过程的状态用step变量来标记，分为三种状态：初始状态step为空，即为初次输入设置密码；当密码长度符合要求，则step变为1，即准备再次输入，并判断两次输入是否一致，如果一致则设置成功，否则重新设置；当单选框切换到验证密码时，则step变为2，即判断用户当前输入和localStorage中保存的密码是否一致。
* 样式：在body中设置font-size的值，其他样式值均采用rem作为单位。

###遇到的问题和解决办法

1.闭包中绑定this作用域：定义一个新的变量保存外部函数调用的实例作用域，在内部函数中访问该变量即可，截取部分代码如下：

```javascript
    PatternLock.prototype.init = function() {
                  ...
	    var that=this;
	    document.getElementById("shezhi").onclick=function(){
	               ...
		that.updatePassword();
		delete that.pswObj.step;
	    }
    }
```
2.初次设计移动端页面，为了适配移动端设备，对html头部加入以下标签：

```html
    <!--设置初始缩放比例为1.0，使用设备宽度,不允许用户缩放 -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0, user-scalable=no">
    <meta name="MobileOptimized" content="320">
    <!--在ios下开启全屏模式 -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <!--隐藏safari状态栏-->
    <meta name="apple-mobile-web-app-status-bar-style" content="blank">
```