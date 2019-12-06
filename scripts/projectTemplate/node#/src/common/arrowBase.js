/*
*arrowBase.js
*框架基类
*/
"<!--ArrowCommand:CatchDepsHere-->"
define('arrowBase',['/common/mvvm.js','/common/switch.js'],function(_mvvm,_switch){
	var m = function(_config){
		var self = this;
		if(typeof _config.parent ==='undefined'){
			console.log("arrowBase: _config.parent 不可为空!");
			return;
		}
		if(typeof _config.parent ==='undefined'){
			console.log("arrowBase: _config.main 不可为空!");
			return;
		}
		if(typeof _config.thisUrl ==='undefined'){
			console.log("arrowBase: _config.thisUrl 不可为空!");
			return;
		}
		//if(typeof _config.container ==='undefined'){
		//	console.log("arrowBase: _config.container 不可为空!")
		//}
		var config = {
			parent:null,
			main:null,
			thisUrl:'',
			container:''
		}
		//已经继承arrowBase
		this.extendedArrowBase = true;

		this.superConfig = $.extend(true,config,_config);

		this.parent = this.superConfig.parent;
		this.main = this.superConfig.main;
		if(this.main === "this"){
			this.main = this;
			this.superConfig.main = this;
		}
		this.html = '';
		this.css = '';
		this.data = null;

		var urlSplits = this.superConfig.thisUrl.split('/');
		//本模块的baseUrl
		this.modulBase = this.superConfig.thisUrl.replace(urlSplits[urlSplits.length -1],'') ;
		//本模块的模块名
		this.modulName = urlSplits[urlSplits.length -1].split('.')[0];

		//正则表达式集合
		this.regs = {
			//是否单个事件绑定
			isSingleEventBind:/^[a-zA-Z0-9]{1,}\:[a-zA-Z0-9]{1,}$/
		};
		//当前页面事件集合
		this.events = {

		}
		//页面中注册的元素
		this.id = {

		}
	}

	//初始化
	m.prototype.init = function(_config,_callBack){
		//回调表示初始化完成
		if(typeof _callBack !== 'undefined'){
			_callBack();
		}
	}

	//创建路由器
	m.prototype.createSwitch = function(_configArr){
		var self = this;
		var config = {
			//所有路由模块的容器
			container:'',
			//上级对象
			parent:self,
			//此路由器的键
			key:'',
			//是否自动实例化模块
			isAutoLoad:true,
			//是否自动初始化模块
			isAutoInit:true,
			//自动初始化模块的配置
			autoInitConfig:{},
			//默认值
			defaultValue:'',
			//路由器事件
			events:[
			//{
			//	//标题
			//	title:'',
			//	//路由器的值
			//	//可为none或是某个具体值
			//	value:'none',
			//	//可以为空，或是某个模块的url
			//	module:'',
			//	//路由目标模块的容器
			//	container:'',
			//	//是否自动初始化模块
			//	isAutoInit:true,
			//	//自动初始化模块的配置
			//	autoInitConfig:{},
			//	//路由变动到此模块时的回调函数
			//	action:function(_module,_value){
			//
			//	}
			//}
			],
			//路由每次变动的回调函数
			action:function(_module,_value){

			},
			//路由创建时的回调函数
			createCall:function(){

			},
			//路由销毁时的回调函数
			distroyCall:function(){

			}
		};
		config = $.extend(config,_configArr);

		var switcher = new _switch(config);
		switcher.init();
		return switcher;
	}

	//mvvm实现
	m.prototype.createMvvm = function(_config){

		var config = {
			html:this.html,
			data:this.data
		}

		config = $.extend(config,_config);

		if(config.html === ''){
			throw "mvvm创建错误：请确保您向mvvm引擎提交的html模板对象有效!来自文件:"+this.superConfig.thisUrl;
		}
		if(config.data === {}){
			throw "mvvm创建错误：请确保您向mvvm引擎提交的数据对象有效!来自文件:"+this.superConfig.thisUrl;
		}

		//拉取mvvm对象
		var mvvmConfig = {
			htmlObject:config.html,
			data:config.data,
			eventsList:this.events
		}
		var mvvm = new _mvvm(mvvmConfig);
		mvvm.init();
		return mvvm;
	}

	//拉取并构建arrow组件
	m.prototype.usingCompoment = function(_compomentUrls,_callBack,_container){
		var self = this;
		var coms = [];
		if(typeof _compomentUrls === 'string'){
			coms.push(_compomentUrls);
		}else{
			coms = _compomentUrls;
		}

		using(coms,function(){
			var _args = [];
			//将每个请求到的模块继承arrowBase
			//并自动实例化
			for(var i in arguments){
				var comItem = arguments[i];
				comItem = new comItem({
					container:_container,
					parent:self,
					main:self.main,
					thisUrl:coms[i]
				});
				_args.push(comItem);
			}
			_callBack.apply(self,_args);
		});
	}

	//获得模块界面
	m.prototype.getUi = function(_callBack){
		var self = this;

		var requestArr = [this.modulBase  + this.modulName+'.html'];
		//如果打包程序把css全部合并了就没必要再去请求css文件了
		if(typeof window.arrowConfig.isBlockModulCssRequest === 'undefined'){
			requestArr.push(this.modulBase + this.modulName + '.css');
		}
		using(requestArr, function ( _html,_css) {
			if(typeof _css !== 'undefined'){
				self.css = _css;
			}else{
				self.css = '/*文件已被合并至common.css*/';
			}

			if(_html !== ''){
				self.html = $(_html);
				var dataContainer = '';
				for(var i in self.html){
					if($(self.html[i]).attr('data-container')){
						dataContainer = $(self.html[i]).attr('data-container');
						break;
					}
				}

				//如果强行指定的容器存在就把模块html放入强行指定的容器中去
				if(self.superConfig.container !== ''){
					var container = $(self.superConfig.container);
					container.empty();
					if(container.length === 0){
						throw "找不到模板容器,id:"+_container+",绑定容器失败:"+self.modulBase  + this.modulName+'.html';
					}else{
						container.append(self.html);
					}
				}else if(dataContainer !== ''){//如果组件的模板有绑定，就绑定模板
					var _container = dataContainer;
					self.html.attr('data-modul',self.modulBase  + self.modulName+'.js');
					var container = $('[id='+ _container +']');
					if(container.length === 0){
						container =  $('[data-container='+ _container +']');
					}
					if(container.length === 0){
						throw "找不到模板容器,id:"+_container+",绑定容器失败:"+self.modulBase  + this.modulName+'.html';
					}else{
						container.replaceWith(self.html);
					}
				}else{
					_html = "<div data-modul='"+ self.modulBase  + this.modulName+".js' >"+_html+"</div>";
					if(typeof self.config !== 'undefined' && self.config.container !== ''){
						$(self.config.container).empty();
						self.html = $(_html).appendTo($(self.config.container));
					}else if(self.superConfig.container !== ''){
						$(self.superConfig.container).empty();
						self.html = $(_html).appendTo($(self.superConfig.container));
					}else{
						self.html = $(_html);
					}
				}
				self.getIdBindElems();
			}
			if(typeof _callBack !== 'undefined'){
				_callBack(self.css,self.html);
			}
		});
	}

	//获得html模板中注册了id的元素
	m.prototype.getIdBindElems = function(){
		var self = this;
		var elems = this.html.find('[data-id]');
		var arr = {};
		for(var i=0;i<elems.length;i++){
			var eitem = $(elems[i]);
			arr[eitem.attr('data-id')] = eitem.attr('data-id');
		}

		for(var i in arr){
			var elems = this.html.find('[data-id='+ i +']');
			this.id[i] = elems;
			this['elem_'+i] = elems;
		}
	}

	//显示
	m.prototype.show = function(_callBack){
		var self = this;
		if(this.html !== ''){
			this.html.show(function(){
				if(typeof _callBack !== 'undefined'){
					_callBack();
				}
			});
		}
	}

	//隐藏
	m.prototype.hide = function(_callBack){
		var self = this;
		if(this.html !== ''){
			this.html.hide(function(){
				if(typeof _callBack !== 'undefined'){
					_callBack();
				}
			});
		}
	}

	//销毁
	m.prototype.distroy = function(){
		var self = this;
		if(this.html !== ''){
			this.html.remove();
		}
	}

	return m;
});