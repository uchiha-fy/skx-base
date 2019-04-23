function Tools(){
    this.random=function(a,b){  // [a,b)
        a=a||0;b=b||0;
        var max=Math.max(a,b),
            min=Math.min(a,b);
        if(max===min)
            return max;
        return min+~~(Math.random()*(max-min));
    };
    this.extend=function(object){   // 深复制
        var res=Array.isArray(object)?[]:{};
        if(typeof object!=='object')
            return;
        for(var p in object)
            res=typeof object[p]==='object'?this.extend(object[p]):object[p];
        return res;
    };
	this.fullScreen=function(el){
		var requestMethod=element.requestFullScreen||element.webkitRequestFullScreen||element.mozRequestFullScreen||element.msRequestFullScreen;
       	if(requestMethod){
            requestMethod.call(element);
        }else if(typeof window.ActiveXObject!=="undefined"){
            var wscript=new ActiveXObject("WScript.Shell");
            if(wscript!==null) {
                wscript.SendKeys("{F11}");
            }
        }
	};
    this.count={
        // 两个数的最大公约数
        gcd:function(a,b){
            if(b===0)
                return a;
            return this.gcd(b,a%b);
        },
        // 两个数的最小公倍数
        scm:function(a,b){
            return (a*b)/this.gcd(a,b);
        },
        // 一组数的最大公约数
        gcds:function(aGcds){
            var res=0;
            if(Array.isArray(aGcds)){
                var len=aGcds.length;
                while(len--)
                    res=res===0?aGcds[len]:this.gcd(res,aGcds[len]);
            }
            return res;
        },
        // 一组数的最小公倍数
        scms:function(aScm){
            var res=0;
            if(Array.isArray(aScm)){
                var len=aScm.length;
                while(len--)
                    res=res===0?aScm[len]:this.scm(res,aScm[len]);
            }
            return res;
        }
    };
	this.format={
		
	};
}