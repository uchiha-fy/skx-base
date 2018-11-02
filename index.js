function skx(){
	var _base=_base||{};
	_base.lib={
		isNull:function(val){
			if(val==undefined||typeof (val)=='undefined'||val===undefined){
				return true;
			}
			return false;
		},
		isEmptyString:function(val){
			if(!this.isNull(val)){
				var str=val+'';
				if(str.replace(/(^\s*)|(\s*$)/g,'').length===0){
					return true;
				}
			}else{
				return true;
			}
			return false;
		}
	};
	_base.obj={
		contain:function(obj,key){
			return (key in obj);
		},
		deepContain:function(obj,key){	// 深度查询,若键值为对象则在该对象中继续查找目标属性
			for(var p in obj){
				if(p==key){
					return true;
				}
				if(typeof obj[p]==="object"){
					if(_base.obj.deepContain(obj[p],key)){
						return true;
					}
				}
			}
			return false;
		},
		/**
		 * 获取键值
		 * return undefined或键值
		 */
		get:function(obj,key){
			return this.contain(obj,key)?(_base.lib.isEmptyString(obj[key])?undefined:obj[key]):undefined;
		},
		put:function(obj,key,val){
			obj[key]=val;
		},
		delete:function(obj,key){
			this.contain(obj,key)&&delete obj[key];
		},
		isEmpty:function(obj){
			return (JSON.stringify(obj)==="{}");
		},
		size:function(obj){
			var idx=0;
			if(!obj.isEmpty){
				for(var p in obj){
					idx++;
				}
			}
			return idx;
		}
	};
	_base.base64={
		table:[
			'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
			'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',
			'0','1','2','3','4','5','6','7','8','9','+','/',
		],
		UTF16ToUTF8:function(str){
			var res=[],
				i=0,
				len=str.length;
			for(;i<len;i++){
				var code=str.charCodeAt(i);
				var byte1,byte2;
				if(code>0x0000&&code<=0x007F){
					// 单字节,不考虑0x0000(空字节)
					// U+00000000 - U+0000007F
					res.push(str.charAt(i))
				}else if(code>=0x0080&&code<=0x07FF){
					// 双字节
					// U+00000080 - U+000007FF (110xxxxx,10xxxxxx)
					// 110xxxxx
					byte1=0xc0|((code>>6)&0x1F);
					// 10xxxxxx
					byte2=0x80|(code&0x3F);
					res.push(
						String.fromCharCode(byte1),
						String.fromCharCode(byte2)
					);
				}else if(code>=0x0800&&code<=0xFFFF){
					// 三字节
					// U+00000800 - U+0000FFFF (1110xxxx,10xxxxxx,10xxxxxx)
					byte1=0xE0|((code>>12)&0x0F);
					byte2=0x80|((code>>6)&0x3F);
					var byte3=0x80|(code&0x3F);
					res.push(
						String.fromCharCode(byte1),
						String.fromCharCode(byte2),
						String.fromCharCode(byte3)
					);
				}// 四字节……
			}
			return res.join('');
		},
		UTF8ToUTF16:function(str){
			var res=[],
				i=0,
				len=str.length;
			for(;i<len;i++){
				var code=str.charCodeAt(i);
				var code2,byte1,byte2,utf16;
				if(((code>>7)&0xFF)==0x0){
					// 单字节,0xxxxxxx
					res.push(str.charAt(i));
				}else if(((code>>5)&0xFF)==0x6){
					// 双字节
					code2=str.charCodeAt(++i);
					byte1=(code&0x1F)<<6;
					byte2=code2&0x3F;
					utf16=byte1|byte2;
					res.push(String.fromCharCode(utf16));
				}else if(((code>>4)&0xFF)==0xE){
					// 三字节
					code2=str.charCodeAt(++i);
					var code3=str.charCodeAt(++i);
					byte1=(code<<4)|((code>>2)&0x0F);
					byte2=((code2&0x03<<6)|(code3&0x3F));
					utf16=((byte1&0x00FF)<<8)|byte2;
					res.push(String.fromCharCode(utf16));
				}// 四字节……
			}
			return res.join('');
		},
		// 编码
		encode:function(str){
			if(!str){
				return '';
			}
			var utf8=this.UTF16ToUTF8(str); //转成utf8
			var res=[],
				i=0,
				len=utf8.length;
			while(i<len){
				var c1=utf8.charCodeAt(i++)&0xFF;
				res.push(this.table[c1>>2]);
				// 需要补2个=
				if(i==len){
					res.push(this.table[(c1&0x3)<<4]);
					res.push('==');
					break;
				}
				var c2=utf8.charCodeAt(i++);
				if(i==len){
					res.push(this.table[((c1&0x3)<<4)|((c2>>4)&0x0F)]);
					res.push(this.table[(c2&0x0F)<<2]);
					res.push('=');
					break;
				}
				var c3=utf8.charCodeAt(i++);
				res.push(this.table[((c1&0x3)<<4)|((c2>>4)&0x0F)]);
				res.push(this.table[((c2&0x0F)<<2)|((c3&0xC0)>>6)]);
				res.push(this.table[c3&0x3F]);
			}
			return res.join('');
		},
		// 解码
		decode:function(str){
			if(!str){
				return '';
			}
			var res=[],
				i=0,
				len=str.length;
			while(i<len){
				code1=this.table.indexOf(str.charAt(i++));
				code2=this.table.indexOf(str.charAt(i++));
				code3=this.table.indexOf(str.charAt(i++));
				code4=this.table.indexOf(str.charAt(i++));
				c1=(code1<<2)|(code2>>4);
				c2=((code2&0xF)<<4)|(code3>>2);
				c3=((code3&0x3)<<6)|code4;
				res.push(String.fromCharCode(c1));
				if(code3!=64){
					res.push(String.fromCharCode(c2));
				}
				if(code4!=64){
					res.push(String.fromCharCode(c3));
				}
			}
			return this.UTF8ToUTF16(res.join(''));
		},
		// 字符串编码(加密)
		safeEncodeBase64:function(str){
			str=this.encode(str);
			var s=str.replace(/\+/g,"^").replace(/\//g,"$").replace(/=/g,"*");
			return s;
		},
		// 字符串解码(解密)
		safeDecodeBase64:function(str){
			var s=str.replace(/\^/g,"+").replace(/\$/g,"/").replace(/\*/g,"=");
			return this.decode(s);
		}
	};
	_base.tools={
		toDouble:function(num){
		    var num=+num;
		    return num>=10?''+num:(num>0?'0'+num:'00');
		},
		getStyle:function(){						// 获取样式
			var res;
		    if (window.getComputedStyle) {
		        res = window.getComputedStyle(ele)[pro];
		    } else {
		        res = ele.currentStyle[pro];//ie
		    }
		    return res % 1 == 0 ? parseInt(res) : parseFloat(res);
		},
		escapeHtml:function(str){					// 去掉html标签
			var regExp = /<[^<>]*>/g;
	    	return str.replace(regExp, '');
		},
		loadJs:function(sSrc, callback){
			var script = document.createElement('script');
		    script.type = "text/javascript";
		    script.src = sSrc;
		    document.body.appendChild(script);
		    script.onload = function () {
		        if (callback && (typeof callback == "function")) {
		            callback();
		        }
		    }
		},
		throttle:function(method,delay,duration) {	// 节流函数
			var timer=null;
			var begin=new Date();//与本地时间无关
			delay=delay||200;
			duration=duration||300;
			return function(){
			    var context=this,args=arguments;
			    var current=new Date();
			    clearTimeout(timer);
			    if (current-begin>=duration) {
			        method.apply(context,args);
			        begin=current;
			    }else{
			        timer=setTimeout(function(){
			            method.apply(context,args);
			        },delay);
			    }
			}
		},
		degreeToSecond:function(val){				// 度-->度分秒
			var valueSec = Math.round(Math.abs(val * 3600));
		    var v1 = Math.floor(valueSec / 3600),//度
		        v2 = Math.floor((valueSec - v1 * 3600) / 60),//分
		        v3 = Math.round(valueSec % 60);//秒
		    return {
		        d: v1,
		        f: this.toDouble(v2),
		        m: this.toDouble(v3)
		    };
		},
		secondToDegree:function(val){				// 度分秒-->度
			val = val.replace(/’/g, "'");
		    val = val.replace(/”/g, "\"");
		    val = val.replace(/ /g, "");
		    var patt = new RegExp("([\\d]+)[°]?([\\d]*)[′]?([\\d]*)[″]?", "ig");
		    var result = patt.exec(val);
		    if (!result) return false;
		    var du = 0, fen = 0, miao = 0;
		    du = result[1];
		    if (result.length > 2) fen = result[2];
		    if (result.length > 3) miao = result[3];
		    return Math.abs(du) + (Math.abs(fen) / 60.0 + Math.abs(miao) / 3600.0);
		},
		getStrLength:function(str){
			var res=0,
				charCode=-1;
			for(var i=0,len=str.length;i<len;i++){
				charCode=str.charCodeAt(i);
				if(charCode>=0&&charCode<=128)
					res+=1;
				else
					res+=2;
			}
			return res;
		},
		convert:function(number,from,to){
			var pattern=/^(2|8|10|16){1}$/;
			if(!pattern.test(from)||!pattern.test(to))
				return undefined;
			if(from===10)
				return +parseInt(number).toString(to);
			if(to===10)
				return parseInt(number,from);
			return +parseInt(number,from).toString(to);
		}
	};
	_base.format={
		date:function(time,hasYear,hasDate){
			var date=new Date(time),
				res='';
			hasYear=hasYear===undefined?true:hasYear;
			hasDate=hasDate===undefined?true:hasDate;
			if(hasYear)
				res+=date.getFullYear()+'-'+_base.tools.toDouble(date.getMonth()+1)+'-'+_base.tools.toDouble(date.getDate())+' ';
			if(hasDate)
				res+=_base.tools.toDouble(date.getHours())+':'+_base.tools.toDouble(date.getMinutes())+':'+_base.tools.toDouble(date.getSeconds());
			return res;
		}
	};
	_base.public={
		environmentType:'temperature'
	};
	
	return _base;
}
module.exports=skx;
