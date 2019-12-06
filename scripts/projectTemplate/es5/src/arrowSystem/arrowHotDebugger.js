/*
*arrowHotDebugger AMD规范异步请求资源框架 发布环境代码在线调试器
*此组件接收来自工作流管理器的开发环境模块的更新
*用于发布后进行代码明文调试的组件
*廖力编写于 2019/11/18
*/

var arrowHotDebugger = function(){
	var self = this;
	if(typeof WebSocket === 'undefined'){
		console.log('hotloader:WebSocket初始化失败：浏览器版本过低将无法使用hotloader!');
		return;
	}
	this.config = window.arrowConfig;
	this.socket = null;
	this.socketUrl = '';

	//初始化热更新模块
	this.init = function(){
		this.initWebSocket();
		window.arrowConfig.isBlockModulCssRequest = undefined;
	}

	this.onOpen = function() {
        console.log("hotDebugger:连接已经打开。");
    };
    this.onClose = function() {
        console.log("hotDebugger:连接已经关闭");
    };
    this.onMessage = function(_data) {
       console.log('文件已请求：');
       console.log(_data);
       self.handleHotDebugger(_data.data);
    };
    this.onError = function(_message) {
        console.log("hotDebugger:出现错误.");
        console.log(_message);
        self.socket.close();
    };

    //初始化websocket模块
	this.initWebSocket = function(){
		this.socket = this.createSocket(this.onOpen,this.onClose,this.onError,this.onMessage);
	}

	//创建socket
	this.createSocket = function(_onOpen,_onClose,_onError,_onMessage){
		if(typeof window.arrowExpressjs.getUrlParams()['ArrowHotDebuggerUrl'] === 'undefined'){
			console.log('hotDebugger加载失败：无socket链接!');
			return;
		}
		//创建socket连接
        socket = new WebSocket(window.arrowExpressjs.getUrlParams()['ArrowHotDebuggerUrl'] +"/");
        socket.onopen = _onOpen;
        socket.onclose = _onClose;
        socket.onerror = _onError;
        socket.onmessage = _onMessage;

        return socket;
	}
	this.requireList = {};
	//重写ArrowExpressJs中的请求方法
	var orgMakeRequire = window.arrowExpressjs.makeRequire;
	window.arrowExpressjs.makeRequire = function(_url,_callBack,_syncGuid){
        //第一步检查缓存，检查缓存中是否有已经存在的请求
        //存在的话就直接返回已经存在的请求
        if(_url.indexOf('.') === -1){
	        var object = window.arrowExpressjs.checkCatch(_url);
	        if(object !== null){
	            if(typeof object._a_isDepsModul !== 'undefined' && object._a_isDepsModul === true){
	                window.arrowExpressjs.circleRequire(object.deps,function(){
	                    var result = object.callBack.apply(window.arrowExpressjs,arguments)
	                    _callBack(result);
	                });
	            }else{
	                //自动处理css
	                if(window.arrowExpressjs.regStrList.isStyleFile.test(_url) === true && window.arrowExpressjs.config.isAutoHandleCss){
	                    window.arrowExpressjs.autoHandleCssFiles(_url,object,_callBack);
	                }
	                _callBack(object);
	            }
	            return;
	        }
        }

		//确认请求是当前项目域下的
		//如果不是当前域下的请求就用原版的请求
		if( ( _url.indexOf('http://') !== -1 || _url.indexOf('https://') !== -1) && _url.indexOf(window.arrowConfig.baseUrl) === -1 ){
			orgMakeRequire.apply(window.arrowExpressjs,arguments);
		}else{
			var id = window.arrowExpressjs.getGuid();
			var args = {
				requestId:id,
				url:_url.split('?')[0].replace('.dll','.js').replace(window.arrowConfig.baseUrl,''),
				callBack:_callBack,
				baseUrl:window.arrowConfig.baseUrl
			}
			self.requireList[id] = args;
			try{
				self.socket.send(JSON.stringify({requestId:args.requestId,url:args.url,baseUrl:window.arrowConfig.baseUrl}));
			}catch(_e){
				//如果socket还没加载完成就延后再链接
				var args = arguments;
				setTimeout(function(){
					window.arrowExpressjs.makeRequire.apply(this,args);
				},500)
			}
		}
	}

	//拿到数据后的处理
	this.handleHotDebugger = function(_data){
		var data = JSON.parse(_data);
		var result = null;
		//如果是请求返回就直接返回请求结果
		//如果是主动告知已更新内容就更新内容
		if(typeof data.requestId !== 'undefined'){

			var args = this.requireList[data.requestId];
			delete this.requireList[data.requestId];
			 //如果是js文件或者DLL文件就需要进行模块导出,
	        //否则其它文件一律当作文本输出
	        if(window.arrowExpressjs.regStrList.isJavascript.test(data.url)||window.arrowExpressjs.regStrList.isDll.test(data.url)){
	            window.makeXHRrequireSyncResult = null;
	            eval(data.content);
	            result = window.makeXHRrequireSyncResult;
	        }else{
	            result = data.content;
	        }

	        //如果是.css文件,并且开启了css自动处理 就对css进行相应的处理
	        var isHaveUsinginCssFile = false;
	        if(window.arrowExpressjs.regStrList.isStyleFile.test(data.url) === true && window.arrowExpressjs.config.isAutoHandleCss){
	            var isHaveUsinginCssFile = window.arrowExpressjs.autoHandleCssFiles(data.url,result,args.callBack);
	        }

	        //如果返回的对象指示有依赖组件，就先去请求依赖组件再返回
	        if(typeof result._a_isDepsModul !== 'undefined' && result._a_isDepsModul === true){
	            window.arrowExpressjs.circleRequire(result.deps,function(){
	                result = result.callBack.apply(window.arrowExpressjs,arguments);
	                args.callBack(result);
	            });
	        }else{
	            //如果此文件为css,然后在它之中没有任何其它的css引用，就直接调用回调函数
	            if(isHaveUsinginCssFile === false){
	                args.callBack(result);
	            }
	        }
        }else{
        	//hotLoader请求
        	if(data.hostArrs[0].split('.')[data.hostArrs[0].split('.').length -1] === 'html'||data.hostArrs[0].split('.')[data.hostArrs[0].split('.').length -1] === 'css'){
				var content = 'window.arrowExpressjs.makeCatch(["'+ data.hostArrs[0] +'","'+ data.hostArrs[1] +'"], "'+ data.content.replace(/"/g,'\\"').replace(/(\n|\t|\r|\x0b|\x0c|\x85|\u2028|\u2029)/g,'') +'");';
			}else{
				//先makeCatch
				var content = data.content.replace('define(',' _____define_____ = define(');
				content =  'window.arrowExpressjs.makeCatch(["'+ data.hostArrs[0] +'","'+ data.hostArrs[1] +'"], function(){ window.____loadMakeCatch = true; var _____define_____ = null; '+  content +'; window.____loadMakeCatch = false; return _____define_____; });';
			}
			eval(content);

        	
			for(var i=0;i<data.hostArrs.length;i++){
				var hookUrl = data.hostArrs[i];
				for(var j=0;j<self.depsList.length;j++){
					var dj = self.depsList[j];
					for(var k=0;k<dj.deps.length;k++){
						var ddek = dj.deps[k].split('?')[0].replace('.dll','.js').replace(window.arrowConfig.baseUrl,'');
						if(ddek === hookUrl){
							//如果找到一样的引用了就更新组件
							self.update(dj);
						}
					}
				}
			}

        }

	}

	//热更新
	this.update = function(_dItem){
		if(_dItem.func === "using"){
			using(_dItem.deps,_dItem.callBack);
		}else{
			//如果是define函数就需要一直往上查找冒泡
			//找到离路径最短的using引用并激活using更新组件
			//需要找using而不直接运行define的原因是
			//define最后运行出来返回是一个组件对象，
			//然而拿到这个组件对象并没有什么用也不会更新任
			//何内容，需要向上查找到这一连串请求的最开始的地方，
			//比如using或者require 从新执行using或者require并回调
			//储存到的callback就可以更新内存中的模块。
			var obj = define(_dItem.deps,_dItem.callBack);
			for(var i in window.arrowExpressjs.catche){
				var ci = window.arrowExpressjs.catche[i];
				if(typeof ci.deps !== 'undefined' && JSON.stringify(ci.deps) === JSON.stringify(obj.deps) ){
					var hookUrl = i;
					for(var j=0;j<self.depsList.length;j++){
						var dj = self.depsList[j];
						for(var k=0;k<dj.deps.length;k++){
							var ddek = dj.deps[k].replace(window.arrowConfig.baseUrl,'');
							if(ddek === hookUrl){
								//如果找到一样的引用了就更新组件
								self.update(dj);
							}
						}
					}
				}
			}
			//window.arrowExpressjs.circleRequire(obj.deps,function(){
            //    obj.callBack.apply(self,arguments);
            //});
		}
	}

	//引用以及初始化函数对照表
	this.depsList = [];

	this.require = function(_u,_callBack,_syncGuid){
		if(typeof _u === 'string'){
			_u = [_u];
		}
		var item = {
			func:'using',
			deps:_u,
			callBack:_callBack
		}
		this.addDepsCatch(item);

		return window.arrowExpressjs.require(_u,_callBack,_syncGuid);
	}

	//劫持并重写define
	this.aDefine = window.arrowExpressjs.define;
	window.arrowExpressjs.define = function(){

	    var _deps,//依赖
        _modulFunc,//模块本身
        _modulName;//名称

        //说明是带有依赖的命名模块
        if(arguments.length === 3){
            _deps = arguments[1];
            _modulFunc = arguments[2];
            _modulName = arguments[0];

            //如果依赖数量为0，就视为根本没有依赖
            if(_deps.length === 0){
                _deps = undefined;
            }
        }

        //可能是带有命名的模块
        //或者是带有依赖的模块
        if(arguments.length === 2){
            //如果第一个参数是string类型，说明是命名模块
            if(typeof arguments[0] === 'string'){
                _modulName = arguments[0];//第零位是名称
                _modulFunc = arguments[1];//第一位是模块本身
            }else{
                //否则就是依赖模块
                _deps = arguments[0];//第零位是依赖
                _modulFunc = arguments[1];//第一位是模块本身

                //如果依赖数量为0，就视为根本没有依赖
                if(_deps.length === 0){
                    _deps = undefined;
                }
            }
        }else if(arguments.length === 1){
            _modulFunc = arguments[0];//第零位是模块本身
        }

        if(typeof _deps !== 'undefined'){
	        var item = {
	        	func:'define',
				deps:_deps,
				callBack:_modulFunc
			}
			self.addDepsCatch(item);
		}

		return self.aDefine.apply(window,arguments);
	}

	window.__setDefine();

	this.addDepsCatch = function(_item){
		var isExits = false;
		for(var i=0;i<this.depsList.length;i++){
			if(JSON.stringify(this.depsList[i].deps) === JSON.stringify(_item.deps) ){
				isExits = true;
			}
		}
		if(isExits === false){
			this.depsList.push(_item);
		}
	}

	//重写css自动写入逻辑,
    window.arrowExpressjs.handleCssWhrite = function(_url,_result){
        //如果缓存表中不存在本次载入，就自动向页面写入css
        window.arrowExpressjs.cssCatche.push({url:_url,content:_result});
        window.arrowExpressjs.loadedCssList[_url] = _result;

        //先循环拿出css文本，并把它们拼在一起
        var cssResult = '';
        for(var i =0;i<window.arrowExpressjs.cssCatche.length;i++){
            cssResult += '/*from css : '+ window.arrowExpressjs.cssCatche[i].url +'*/\n'+window.arrowExpressjs.cssCatche[i].content+'\n\n';
        }

        //创建一个新的css标签
        styleNode = document.createElement('style');
        styleNode.type = 'text/css';
        if(styleNode.styleSheet){
            styleNode.styleSheet.cssText = cssResult;
        }else{
            styleNode.appendChild(document.createTextNode(cssResult));
        }

        //找到页面上现有的css标签并移除
        var styleNodeLast = zZ('<head>').find(':data-name-stylePool=total').E();
        if(styleNodeLast !== null){
            zZ(styleNodeLast).remove();
        }

        //将新的css标签插入到页面头部
        zZ(styleNode).attr('data-name-stylePool','total');
        zZ('<head>').E().appendChild(styleNode);
    }

	//自动初始化
	this.init();

	//重写以下函数
	//记录请求的链接并用于重建模块

	//兼容AMD标准
	window.require = window.require = function(_u,_callBack,_syncGuid){ return window.arrowHotDebugger.require(_u,_callBack,_syncGuid); };
	//引用模块
	window.using = window.using = function(_u,_callBack,_syncGuid){ return window.arrowHotDebugger.require(_u,_callBack,_syncGuid); };
}
window.arrowHotDebugger = new arrowHotDebugger();


























