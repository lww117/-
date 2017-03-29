(function(){
        window.PatternLock = function(obj){
            this.height = obj.height;
            this.width = obj.width;
            this.chooseType = Number(window.localStorage.getItem('chooseType')) || obj.chooseType;
        };
        PatternLock.prototype.drawCle = function(x, y) { // 初始化解锁密码面板
            this.ctx.strokeStyle = '#aeaeae';
            this.ctx.fillStyle = 'white';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.r, 0, Math.PI * 2, true);
            this.ctx.closePath();
            this.ctx.stroke();
            this.ctx.fill();
        }
        PatternLock.prototype.drawPoint = function() { // 初始化圆心
            for (var i = 0 ; i < this.lastPoint.length ; i++) {
                this.ctx.fillStyle = '#ff961d';
                this.ctx.strokeStyle ='#f97700';
                this.ctx.beginPath();
                this.ctx.arc(this.lastPoint[i].x, this.lastPoint[i].y, this.r , 0, Math.PI * 2, true);
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.fill();
            }
        }
        PatternLock.prototype.drawLine = function(po, lastPoint) {// 解锁轨迹
            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle="red";
            this.ctx.moveTo(this.lastPoint[0].x, this.lastPoint[0].y);
            console.log(this.lastPoint.length);
            for (var i = 1 ; i < this.lastPoint.length ; i++) {
                this.ctx.lineTo(this.lastPoint[i].x, this.lastPoint[i].y);
            }
            this.ctx.lineTo(po.x, po.y);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        PatternLock.prototype.createCircle = function() {// 创建解锁点的坐标，根据canvas的大小来平均分配半径
 
            var n = this.chooseType;
            var count = 0;
            this.r = this.ctx.canvas.width / (2 + 4 * n);// 公式计算
            this.lastPoint = [];
            this.arr = [];
            this.restPoint = [];
            var r = this.r;
            for (var i = 0 ; i < n ; i++) {
                for (var j = 0 ; j < n ; j++) {
                    count++;
                    var obj = {
                        x: j * 4 * r + 3 * r,
                        y: i * 4 * r + 3 * r,
                        index: count
                    };
                    this.arr.push(obj);
                    this.restPoint.push(obj);
                }
            }
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            for (var i = 0 ; i < this.arr.length ; i++) {
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }
        }
        PatternLock.prototype.getPosition = function(e) {  // 获取touch点相对于canvas的坐标
            var rect = e.currentTarget.getBoundingClientRect();
            var po = {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top
              };
            return po;
        }
        PatternLock.prototype.update = function(po) {// 核心变换方法在touchmove时候调用
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
 
            for (var i = 0 ; i < this.arr.length ; i++) { // 每帧先把面板画出来
                this.drawCle(this.arr[i].x, this.arr[i].y);
            }
            this.drawPoint(this.lastPoint);// 每帧画圆心
            this.drawLine(po , this.lastPoint);// 每帧画轨迹
            for (var i = 0 ; i < this.restPoint.length ; i++) {
                if (Math.abs(po.x - this.restPoint[i].x) < this.r && Math.abs(po.y - this.restPoint[i].y) < this.r) {
                    this.drawPoint(this.restPoint[i].x, this.restPoint[i].y);
                    this.lastPoint.push(this.restPoint[i]);
                    this.restPoint.splice(i, 1);
                    break;
                }
            }
 
        }
        PatternLock.prototype.checkPass = function(psw1, psw2) {// 检测密码
            var p1 = '',
            p2 = '';
            for (var i = 0 ; i < psw1.length ; i++) {
                p1 += psw1[i].index + psw1[i].index;
            }
            for (var i = 0 ; i < psw2.length ; i++) {
                p2 += psw2[i].index + psw2[i].index;
            }
            return p1 === p2;
        }
        PatternLock.prototype.storePass = function(psw) {// touchend结束之后对密码和状态的处理
            if (this.pswObj.step == 1) {
                if (this.checkPass(this.pswObj.fpassword, psw)) {
                    this.pswObj.spassword = psw;
                    document.getElementById('title').innerHTML = '密码设置成功';
                    window.localStorage.setItem('passwordxx', JSON.stringify(this.pswObj.spassword));
                    window.localStorage.setItem('chooseType', this.chooseType);
                } else {
                    document.getElementById('title').innerHTML = '两次输入的不一致，请重新设置';
                    delete this.pswObj.step;
                    this.updatePassword();
                }
            } else if (this.pswObj.step == 2) {
                if (this.checkPass(this.pswObj.spassword, psw)) {
                    document.getElementById('title').innerHTML = '密码正确！';
                } else {
                    document.getElementById('title').innerHTML = '输入的密码不正确，请重新输入';
                }
            } else {
                if(this.lastPoint.length>=5){
                    this.pswObj.step = 1;
                    this.pswObj.fpassword = psw;
                    document.getElementById('title').innerHTML = '请再次输入手势密码';
                }
                else{
                    document.getElementById('title').innerHTML = '密码太短，至少需要5个点，重新输入！';
                    this.updatePassword();
                }
            }
        }
        PatternLock.prototype.updatePassword = function(){
            window.localStorage.removeItem('passwordxx');
            window.localStorage.removeItem('chooseType');
            this.pswObj = {};
            this.createCircle();
        }
        PatternLock.prototype.initDom = function(){
            var wrap = document.createElement('div');
            var str ='<canvas id="canvas" width="250" height="250" style="background-color: #ececec;display: inline-block;margin-top: 5rem;"></canvas>'+
                      '<p id="title">请输入手势密码</p>'+
                      '<input type="radio" id="shezhi" name="option" value="set" checked="checked" >'+'设置密码'+'<br/>'+'<br/>'+
                      '<input type="radio" id="yanzheng" name="option" value="check">'+'验证密码';
            wrap.setAttribute('style','position: absolute;top:0;left:0;right:0;bottom:0;');
            wrap.innerHTML = str;
            document.body.appendChild(wrap);
        }

        PatternLock.prototype.init = function() {
            this.initDom();
            this.lastPoint = [];
            this.touchFlag = false;
            this.canvas = document.getElementById('canvas');
            this.ctx = this.canvas.getContext('2d');
            this.createCircle();
            this.pswObj={};
            var that=this;
            document.getElementById("shezhi").click();
            document.getElementById("yanzheng").onclick=function(){
                document.getElementById("yanzheng").checked=true;
                document.getElementById("shezhi").checked=false;
                if(window.localStorage.getItem('passwordxx')){
                    document.getElementById('title').innerHTML = '请输入您设置的密码';
                    that.pswObj={
                        step: 2,
                        spassword: JSON.parse(window.localStorage.getItem('passwordxx'))
                    }
                }
                else{
                    document.getElementById('title').innerHTML = '请先设置密码！';
                }
            }
            document.getElementById("shezhi").onclick=function(){
                document.getElementById("shezhi").checked=true;
                document.getElementById("yanzheng").checked=false;
                document.getElementById('title').innerHTML = '请输入手势密码';
                that.updatePassword();
                delete that.pswObj.step;
            }
            this.bindEvent();
        }

        PatternLock.prototype.bindEvent = function() {
            var self = this;
            this.canvas.addEventListener("touchstart", function (e) {
                e.preventDefault(); // 某些android 的 touchmove不宜触发 所以增加此行代码
                 var po = self.getPosition(e);
                 console.log(po);
                 for (var i = 0 ; i < self.arr.length ; i++) {
                    if (Math.abs(po.x - self.arr[i].x) < self.r && Math.abs(po.y - self.arr[i].y) < self.r) {
 
                        self.touchFlag = true;
                        self.drawPoint(self.arr[i].x,self.arr[i].y);
                        self.lastPoint.push(self.arr[i]);
                        self.restPoint.splice(i,1);
                        break;
                    }
                 }
             }, false);
             this.canvas.addEventListener("touchmove", function (e) {
                if (self.touchFlag) {
                    self.update(self.getPosition(e));
                }
             }, false);
             this.canvas.addEventListener("touchend", function (e) {
                 if (self.touchFlag) {
                     self.touchFlag = false;
                     self.storePass(self.lastPoint);
                     setTimeout(function(){
                        self.createCircle();
                    }, 400);
                 }
             }, false);
             document.addEventListener('touchmove', function(e){
                e.preventDefault();
             },false);
        }
})();