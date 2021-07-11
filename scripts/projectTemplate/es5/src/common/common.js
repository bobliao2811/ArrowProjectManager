//公共函数类
"<!--ArrowCommand:CatchDepsHere-->"
define(['/common/common.css'],function(){
	var m = function(_config){
		var self = this;
		var config = {parent:null};
		this.config = $.extend(true,config,_config);

		this.console = null;
		this.window = null;
		this.tips = null;
		self.eventController = null;
		this.parent = this.config.parent;

		//初始化
		this.init = function(_callBack){
			
			//加载common拖挂的模块
			this.initModul(function(){
				_callBack();
			});
		}

		//初始化控制台插件
		this.initModul = function(_callBack){
			//合并控制台组件和窗口组件到common组件里
			//<!--ArrowCommand:CatchUsingHere-->
			using(['/common/console/index.js','/common/window/index.js'],function(_console,_window){
				self.console = new _console({
					parent:self
				});
				//<!--debug
				//self.console.write('控制台组件载入完成！');
				//-->
				self.window = _window;
				//<!--debug
				//self.console.write('窗口组件载入完成！');
				//var a = new self.window({
				//	//标题
				//	title:'系统公告',
				//	//内容
				//	content:'<div>没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容</div>',
				//	//放置的容器
				//	container:'body',
				//	//位置
				//	position:{
				//		x:'center',
				//		y:'center'
				//	},
				//	buttons:{
				//		mode:'yesno',
				//		yesCall:function(){
				//			self.console.write('你点击了确定！');
				//		},
				//		noCall:function(){
				//			self.console.write('你点击了取消！');
				//		}
				//	},
				//	//关闭回调
				//	closeCall:function(){}
				//});
				//a.open();
				//var b = new self.window({
				//	//标题
				//	title:'公告',
				//	//内容
				//	content:'<div>没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容没有内容</div>',
				//	//放置的容器
				//	container:'body',
				//	size:{
				//		width:200
				//	},
				//	//位置
				//	position:{x:'tips'},
				//	//关闭回调
				//	closeCall:function(){
				//		self.console.write('你关闭了小公告');
				//	}
				//});
				//b.open();
				//-->
				_callBack();
			});
		}


		//任务管理器
		var _eventController = function(){
			var self = this;

			this.qurrer = [];

			this.timer = null;

			this.isStoped = false;

			this.init = function(){
				this.setTimer(9);
			}

			this.stopTimer = function(){
				window.clearTimeout(this.timer);
				this.timer = null;
				this.isStoped = true;
			}

			this.contiune = function(){
				this.isStoped = false;
				this.setTimer(9);
			}

			this.setTimer = function(_sec){
				if(this.isStoped === true){
					return;
				}
				this.timer = window.setTimeout(function(){
					if(self.qurrer.length !== 0 && _sec === 9){
						self.setTimer(self.qurrer[0].time);
						return;
					}
					//每执行一个事件任务就删掉一个事件任务
					var newArr = [];
					for(var i=0;i<self.qurrer.length;i++){
						var item = self.qurrer[i].call;
						if(i === 0){
							try{
								item();
							}catch(_e){
								throw _e;
							}
						}else{
							newArr.push(self.qurrer[i]);
						}
					}
					self.qurrer = newArr;
					if(self.qurrer.length === 0){
						self.setTimer(9);
					}else{
						self.setTimer(self.qurrer[0].time);
					}
				},_sec);
			}
		}

		this.eec = new _eventController();
		eec.init();

		//窗体变更大小
		this.resize = function(){
			if(self.console){
				self.console.position();
			}
		}

		//运行主进程中的函数
		this.runMainFunc = function(_type,_event,_args,_callBack){
			self.eventController.execute(_type,_event,_args,_callBack);
		}

		//自定义本系统的log
		window.console.write = function(_txt){
			self.console.write(_txt);
		}

		//自定义本系统的询问窗口
		window.ask = this.ask = function(){
			var arg = arguments;
			var title = '系统确认';
			var message = '系统提示-消息';
			var yesCall = function(){};			
			var noCall = function(){};	
			//<--debug
			if(arg.length < 2){
				alt('开发人员注意，ask函数最少包含两个参数，第一个为消息，第二个为成功后的回调！');
				return;
			}
			//-->

			//两个参数的时候用户传入了消息和成功回调
			if(arg.length === 2){
				message = arg[0];
				yesCall = arg[1];
			}
			//三个参数的时候用户传入了消息，成功回调，失败回调
			if(arg.length === 3){
				message = arg[0];
				yesCall = arg[1];
				noCall = arg[2];
			}	

			//四个参数的时候用户传入了，标题，消息，成功回调，失败回调
			if(arg.length === 4){
				title = arg[0];
				message = arg[1];
				yesCall = arg[2];
				noCall = arg[3];
			}		

			var w = new self.window({
				//标题
				title:title,
				//内容
				content:'<div>'+message+'</div>',
				//放置的容器
				container:'body',
				//位置
				position:{
					x:'center',
					y:'center'
				},
				buttons:{
					mode:'yesno',
					yesCall:function(){
						yesCall();
					},
					noCall:function(){
						noCall();
					}
				},
				//关闭回调
				closeCall:function(){}
			});

			w.open();

			return w;
		}

		//自定义本系统的弹出窗口函数
		window.alt = this.alt = function(){
			var arg = arguments;
			var title = '系统提示';
			var message = '系统提示-消息';
			var callBack = function(){};
			//在只有一个参数的时候说明用户只传入了消息
			if(arg.length === 1){
				message = arg[0];
			}
			//两个参数的时候用户传入了标题和消息
			if(arg.length === 2){
				title = arg[0];
				message = arg[1];
			}
			//三个参数的时候用户传入了标题，消息，和回调函数
			if(arg.length === 3){
				title = arg[0];
				message = arg[1];
				callBack = arg[2];
			}


			var w = new self.window({
				//标题
				title:title,
				//内容
				content:'<div>'+message+'</div>',
				//放置的容器
				container:'body',
				//位置
				position:{
					x:'center',
					y:'center'
				},
				buttons:{
					mode:'yes',
					yesCall:function(){
						callBack();
					}
				},
				//关闭回调
				closeCall:function(){}
			});
			w.open();

			return w;
		}

		//显示下拉菜单
		this.showDrMenu = function(_arr,_position,_isAwaysShow,_distoryCall){
			var rightMenuBackGround = $('<table class="n-rBack-g" ><tr><td></td></tr></table>').appendTo('body');
			var rightMenu = $('<div class="n-rightMenu" ></div>').appendTo('body');

			var distroy = function(){
				rightMenuBackGround.remove();
				rightMenu.remove();
				if(typeof _distoryCall === 'function'){
					_distoryCall();
				}
			}

			for(var i=0;i<_arr.length;i++){
				var aitem = _arr[i];
				var elem = aitem.elem = $('<div class="n-rightMenu-item" >'+ aitem.name +'</div>').appendTo(rightMenu);
				if(i % 2){
					elem.addClass('on');
				}
				(function(_elem,_aitem,_distroy){
					_elem.click(function(){
						if(typeof _isAwaysShow === 'undefined'){
							_distroy();
						}
						_aitem.call();
					});
				})(elem,aitem,distroy);
			}

			rightMenuBackGround.height($(window).height() +'px');
			rightMenu.css('top',_position.y+'px');
			rightMenu.css('left',_position.x+'px');

			$(rightMenuBackGround).click(function(){
				distroy();
			});
		}

		//显示高级可调序下拉菜单
		this.showDrOrMenu = function(_arr,_position,_isAwaysShow,_distoryCall,_orderCall){
			var rightMenuBackGround = $('<table class="n-rBack-g" ><tr><td></td></tr></table>').appendTo('body');
			var rightMenu = $('<div class="n-rightMenu" ></div>').appendTo('body');

			var distroy = function(){
				rightMenuBackGround.remove();
				rightMenu.remove();
				if(typeof _distoryCall === 'function'){
					_distoryCall();
				}
			}

			for(var i=0;i<_arr.length;i++){
				var aitem = _arr[i];
				var selection = '';
				if(aitem.item.isDisplay === true){
					selection = '<div class="n-f-smallSelection selected" ></div>'
				}else{
					selection = '<div class="n-f-smallSelection" ></div>'
				}	
				var elem = aitem.elem = $('<div class="n-rightMenu-item" >'+ selection + aitem.name +'<div class="n-rightMenu-item-order" ></div></div>').appendTo(rightMenu);
				aitem.elem.data('sourceData',aitem);
				if(i % 2){
					elem.addClass('on');
				}
				aitem.sec = i;
				(function(_elem,_aitem,_distroy){
					_elem.find('.n-rightMenu-item-order').click(function(e){
						e.stopPropagation();
					});
					_elem.find('.n-rightMenu-item-order').mousedown(function(e){
						var aAitem = _aitem;
						var totalBackground = $('<div></div>').appendTo('body');
						totalBackground.css('background-color','#fff');
						totalBackground.css('position','absolute');
						totalBackground.css('top','0px');
						totalBackground.css('left','0px');
						totalBackground.css('z-index','998');
						totalBackground.css('opacity','0');
						totalBackground.height($(window).height());
						totalBackground.width($(window).width());
						var fakeLayerArr = [];
						for(var j=0;j<_arr.length;j++){
							var elem = _arr[j].elem;
							var fItem = _arr[j].fItem = $('<div></div>').appendTo('body');
							fItem.css('background-color','#fff');
							fItem.css('position','absolute');
							fItem.css('top',elem.offset().top+'px');
							fItem.css('left',elem.offset().left+'px');
							fItem.css('z-index','999');
							fItem.css('opacity','0');
							fItem.height(elem.outerHeight());
							fItem.width(elem.outerWidth());
							fakeLayerArr.push(fItem);
						}
						var dItemPosition = {
							x:(mControl.nowPosition.x - _elem.offset().left),
							y:(mControl.nowPosition.y - _elem.offset().top)
						}
						var dItem = $('<div class="n-rightMenu-item-order-dragItem" >'+ _elem.text() +'</div>').appendTo('body');
						//移动元素
						var moveItem = function(){
							dItem.css('top',(mControl.nowPosition.y -  dItemPosition.y)+'px');
							dItem.css('left',(mControl.nowPosition.x -  dItemPosition.x)+'px');
						}
						//销毁
						var distory = function(){
							mControl.removeMMRFunc('NRIOD-M');
							mControl.removeMURFunc('NRIOD-U');
							dItem.remove();
							totalBackground.remove();
							for(var n in fakeLayerArr){
								fakeLayerArr[n].remove();
							}
						}
						
						dItem.height(_elem.outerHeight()-4);
						dItem.width(_elem.outerWidth());
						dItem.css('line-height',_elem.outerHeight()-4+"px")

						mControl.addMouseMoveFunc('NRIOD-M',function(){
							moveItem();
						});

						mControl.addMouseUpFunc('NRIOD-U',function(){
							distory();
						});

						var blance = $('<div></div>');
						

						totalBackground.mouseover(function(){
							_elem.slideDown(400);
							blance.slideUp(400,function(){
								blance.remove();
							});
						});

						for(var j=0;j<_arr.length;j++){
							(function(_aItem){
								_aItem.fItem.mouseover(function(){
									blance.stop();
									blance.remove();
									if(_aItem.sec >= aAitem.sec){
										blance.insertAfter(_aItem.elem);
									}else{
										blance.insertBefore(_aItem.elem);
									}
									blance.height(elem.outerHeight());
									blance.hide();
									_elem.slideUp(200);
									blance.slideDown(200);
								});
								_aItem.fItem.mouseup(function(){
									blance.replaceWith(_elem);
									_elem.show();
									var c = rightMenu.children();
									var newArr = [];
									for(var k =0;k<c.length;k++){
										var item = $(c[k]).data('sourceData');
										newArr.push(item);
									}
									_orderCall(newArr);
									_distroy();
									self.showDrOrMenu(newArr,_position,_isAwaysShow,_distoryCall,_orderCall);
								})
							})(_arr[j])
						}


						e.stopPropagation();
					});
					_elem.click(function(){
						if(typeof _isAwaysShow === 'undefined'){
							_distroy();
						}
						_aitem.call();
					});
				})(elem,aitem,distroy);
			}

			rightMenuBackGround.height($(window).height() +'px');
			rightMenu.css('top',_position.y+'px');
			rightMenu.css('left',_position.x+'px');

			$(rightMenuBackGround).click(function(){
				distroy();
			});
		}

		//获得两点之间的距离
		this.getLength=function(p1,p2){
			return Math.sqrt(Math.pow(p1.x - p2.x,2) + Math.pow(p1.y - p2.y,2));
		};
		//获得一个随机数
		this.getRand=function(Max,Min){
        	var Range = Max - Min;
          	var Rand = Math.random();
          	if(Math.round(Rand * Range)==0){       
            	return Min + 1;
          	}
          	var num = Min + Math.round(Rand * Range);
          	return num;
        };
        //千分位分割
        this.thousandsSplit=function(num) {
		    var numStr = $.trim(num.toString()).split('.')[0].split('');
		    var output = '';

		    var j = 0;
		    for (var i = numStr.length-1; i >-1; i--) {
		        if (j % 3 == 0 && j!=0) {
		            output = numStr[i] + ","+output;
		        }else{
		            output = numStr[i] + output;
		        }
		        j++;
		    }
		    if(num.toString().split('.')[1]){
		        output += "." + num.toString().split('.')[1];
		    }
		    return output ;
		};


		/**
		 * 提取url参数
		 */
		this.getUrlParams = function() {
		    var url = location.href;
		    var pstart = url.indexOf('?');  
		    var params = {};
		    if(pstart > -1) {
		        url = url.substring(pstart + 1);
		        pstart = url.indexOf('#');
		        if(pstart > -1) {
		            url = url.substring(0,pstart);
		        }
		        var ps = url.split('&');
		        if(ps.length > 0) {
		            for(var i=0;i<ps.length;i++) {
		                var p = ps[i];
		                var kv = p.split('=');
		                if(kv.length == 2) {
		                    params[kv[0]] = kv[1];
		                }
		                if (kv.length == 3) {
		                    var kkk = kv[1].split('?');
		                    if (kkk.length == 2) {
		                        params[kv[0]] = kkk[0];
		                        params[kkk[1]] = kv[2];
		                    }
		                }
		            }
		        }
		    }
		    return params;
		}

		/**
		*设置url参数
		*/
		this.setUrlParam = function(_key,_val){
			//先获取所有的参数
			var params = this.getUrlParams();
			//再写入要写入的参数
			params[_key] = _val;
			//注入到当前url中
			var path = window.location.pathname;
			var paramsStr = '?';
			var k = 0;
			for(var i in params){
				if(i === '_'){
					continue;
				}
				if(k!=0){
					paramsStr += '&';
				}
				paramsStr += i + '=' + params[i];
				k++;
			}
			window.location.href = path + '#/'+paramsStr;
		}

        //去重算法
        this.removeDuplicate = function(array,callBack) {
		    if(typeof callBack === 'undefined'){
		        callBack = function(a,b){
		            return JSON.stringify(a) !== JSON.stringify(b);
		        }
		    }
		    var array = array;
		    //再去重
		    var j = 0;
		    for(var k=0;k<99999999;k++) {
		        var tempArr = [];
		        for (var i = 0; i < array.length; i++) {
		            if (i === j ) {
		                tempArr.push(array[j]);
		                continue;
		            }
		            if (callBack(array[i],array[j])) {
		                tempArr.push(array[i]);
		            }
		        }
		        array = tempArr;
		        if (!array[j + 1]) {
		            break;
		        }
		        j++;
		    }
		    return array;
		};
		//获得一个gui ID
		this.newGuid = function (){
		    var guid = "";
		    for (var i = 1; i <= 32; i++) {
		        var n = Math.floor(Math.random() * 16.0).toString(16);
		        guid += n;
		    }
		    return guid;
		};

		//重写toFixed为四舍五入
		Number.prototype.toFixed=function(len){  
		    var tempNum = 0;  
		    var s,temp;  
		    var s1 = this + "";  
		    var start = s1.indexOf(".");  
		    if(start === -1){
		    	return s1;
		    }
		      
		    //截取小数点后,0之后的数字，判断是否大于5，如果大于5这入为1  

		   if(s1.substr(start+len+1,1)>=5)  
		    tempNum=1;  

		    //计算10的len次方,把原数字扩大它要保留的小数位数的倍数  
		  var temp = Math.pow(10,len);  
		    //求最接近this * temp的最小数字  
		    //floor() 方法执行的是向下取整计算，它返回的是小于或等于函数参数，并且与之最接近的整数  
		    s = Math.floor(this * temp) + tempNum;  
		    return s/temp;  
		}

		//显示正在加载层
		this.showLoad = function(_text){
			var loadLayer = $('<table class="common-load" ><tr><td><img src="../images/loadding.png" /></td></tr></table>').appendTo('body');
			if(typeof _text !== 'undefined'){
				self.console.write(_text);
			}
		}

		this.clearLoad = function(_text){
			$('.common-load').remove();
		}

		/**
		* 格式化时间
		*/
		this.formatDate = function(date, format) {
		    date = date || new Date();
		    format = format || 'yyyy-MM-dd HH:mm:ss';
		    var result = format.replace('yyyy', date.getFullYear().toString())
		    .replace('yy', date.getFullYear().toString().substring(2,4))
		    .replace('MM', (date.getMonth()< 9?'0':'') + (date.getMonth() + 1).toString())
		    .replace('dd', (date.getDate()< 10?'0':'')+date.getDate().toString())
		    .replace('HH', (date.getHours() < 10 ? '0' : '') + date.getHours().toString())
		    .replace('mm', (date.getMinutes() < 10 ? '0' : '') + date.getMinutes().toString())
		    .replace('ss', (date.getSeconds() < 10 ? '0' : '') + date.getSeconds().toString());

		    return result;
		}

		

		//判断是否为json对象
		this.isJsonObject = function(_data){
			if(typeof(_data) == "object" && 
            Object.prototype.toString.call(_data).toLowerCase() == "[object object]" && !_data.length){
	            return true;
	        }
	        return false;
		}

		window.mControl = {
		    //当前鼠标所在位置
		    nowPosition: { x: 0, y: 0 },
		    //[{ 'funcName': 'goodJob', 'func': function () { alert('aa'); } }, { 'funcName': 'nice', 'func': function () { alert('bb'); } }];
		    //鼠标移动的预设方法
		    mMReserveFunction: [],
		    //鼠标左键弹上的预设方法
		    mUReserveFunction: [],
		    //向鼠标移动事件数组中注册一个事件
		    addMouseMoveFunc: function (name, callBack) {
		        this.mMReserveFunction.push({ 'funcName': name, 'func': callBack });
		    },
		    //向鼠标弹起事件数组中注册一个事件
		    addMouseUpFunc: function (name, callBack) {
		        this.mUReserveFunction.push({ 'funcName': name, 'func': callBack });
		    },
		    //移除鼠标移动事件数组中的某个方法
		    removeMMRFunc: function (name) {
		        var tempArr = [];
		        for (var i = 0; i < this.mMReserveFunction.length; i++) {
		            var functionPro = this.mMReserveFunction[i];
		            if (functionPro.funcName != name) {
		                tempArr.push(functionPro);
		            }
		        }
		        this.mMReserveFunction = [];
		        this.mMReserveFunction = tempArr;
		    },
		    //移除鼠标弹起事件数组中的某个方法
		    removeMURFunc: function (name) {
		        var tempArr = [];
		        for (var i = 0; i < this.mUReserveFunction.length; i++) {
		            var functionPro = this.mUReserveFunction[i];
		            if (functionPro.funcName != name) {
		                tempArr.push(functionPro);
		            }
		        }
		        this.mUReserveFunction = [];
		        this.mUReserveFunction = tempArr;
		    }
		}
		$(document).mousemove(function (e) {
		    mControl.nowPosition.x = e.pageX;
		    mControl.nowPosition.y = e.pageY;
		    //运行预设方法
		    if (mControl.mMReserveFunction.length != 0) {
		        for (var i = 0; i < mControl.mMReserveFunction.length; i++) {
		            var functionPro = mControl.mMReserveFunction[i];
		            functionPro.func.call(this, e);
		        }
		    }
		});

		//当鼠标左键弹上时
		$(document).mouseup(function (e) {
		    //运行预设方法
		    if (mControl.mUReserveFunction.length != 0) {
		        for (var i = 0; i < mControl.mUReserveFunction.length; i++) {
		            var functionPro = mControl.mUReserveFunction[i];
		            functionPro.func.call(this, e);
		        }
		    }
		});
		
	}
	return m;
});