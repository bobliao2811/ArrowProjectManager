//页面路由器
//页面路由器在主程序载入的时候就会初始化并开始检测当前页面，并载入相应页面
define(function(){
	//主框架模块定义
	var m = function(_config){
		var self = this;
		var config = {
			//所有路由模块的容器
			container:'',
			//上级对象
			parent:null,
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
		this.config = $.extend(config,_config);
		this.isSetBySwitch = false;

		//事件模板
		this.eTemp = {
				//标题
				title:'',
				//路由器的值
				//可为none或是某个具体值
				value:'',
				//可以为空，或是某个模块的url
				module:'',
				//路由目标模块的容器
				container:null,
				//是否自动初始化模块
				isAutoInit:null,
				//自动初始化模块的配置
				autoInitConfig:null,
				//路由变动到此模块时的回调函数
				action:function(_module,_value){
			
				}
			}
		
		//初始化方法
		this.init = function(){
			//当hash值改变的时候通知changeHash
			this.handleHashChange();
			
			this.load();
			this.config.createCall();
		}

		this.handleHashChange = function(){
			//如果时ie6/7就使用定时器来检测浏览器hash数值变化
			if(zZ.fn.Borwser() === "msie 7.0"
			    || zZ.fn.Borwser() === "msie 6.0"
			    || zZ.fn.Borwser() === "msie 5.0"){

				var hashStr ='';
				if(typeof window.location.href.split('#')[1] === 'undefined'){
					hashStr = '';
				}else{
					hashStr = window.location.href.split('#')[1].split('?')[0];
				}
				var detactHash = function(){
					this.hashTimer = window.setTimeout(function(){
						var nowHash ='';
						if(typeof window.location.href.split('#')[1] === 'undefined'){
							nowHash = '';
						}else{
							nowHash = window.location.href.split('#')[1].split('?')[0];
						}
						if(hashStr !== nowHash){
							self.load();
							hashStr = nowHash;
						}
						detactHash();
					},23.7);
				}
				detactHash();
			}else{
				$(window).bind('hashchange',function(){
					self.load();
				});
			}
		}

		//加载路由
		this.load = function(_value){
			if(window.isSetBySwitch === true){
				window.isSetBySwitch = false;
				return;
			}

			var currentValue = _value;
			if(typeof _value === 'undefined'){
				currentValue = this.get();
			}else{
				this.setValue(_value);
			}
			
			//如果当前路由值不存在就放入默认值
			//并执行动作
			if(currentValue === null){
				//如果事件集中存在事件,并且默认值为空
				if(this.config.events.length !== 0 && this.config.defaultValue === ''){
					//this.setValue(this.config.events[0].value);
					currentValue = this.config.events[0].value;
				}
				//如果默认值不为空
				if(this.config.defaultValue !== ''){
					//this.setValue(this.config.defaultValue);
					currentValue = this.config.defaultValue;
				}
				//如果都为空
				if(this.config.events.length === 0 && this.config.defaultValue === ''){
					//this.setValue(-1);
					currentValue = -1
				}
			}
			//查找到对应的事件
			var event = this.findEventWithValue(currentValue);
			//如果找到对应的事件
			if(event !== null){
				//就进行事件处理
				this.handleEvent(event);
			}else{
				this.handleNoneEvents(currentValue);
			}
		}

		//处理匿名事件
		this.handleNoneEvents = function(currentValue){
			var args = [null,currentValue];
			self.config.action.apply(self,args);
		}

		//找到对应时间时的处理
		this.handleEvent = function(_event){
			var container = '';
			var isAutoInit = false;
			var autoInitConfig = {};
			if(_event.container !== null){
				container = _event.container;
			}else if(this.config.container !== ''){
				container = this.config.container;
			}

			if(_event.isAutoInit !== null){
				isAutoInit = _event.isAutoInit;
			}else{
				isAutoInit = this.config.isAutoInit;
			}

			if(_event.autoInitConfig !== null){
				autoInitConfig = _event.autoInitConfig;
			}else{
				autoInitConfig = this.config.autoInitConfig;
			}

			if(_event.title !== ''){
				$('title').html(_event.title);
			}
			if(_event.module !== ''){
				//如果设置了不自动实例化模块
				if(this.config.isAutoLoad){
					this.config.parent.usingCompoment([_event.module],function(_module){
						if(isAutoInit === true){
							_module.init(autoInitConfig);
						}
						var args = [_module,_event.value];
						_event.action.apply(_event,args);
						self.config.action.apply(_event,args);
					},container);
				}else{
					using([_event.module],function(_module){
						var args = [_module,_event.value];
						_event.action.apply(_event,args);
						self.config.action.apply(_event,args);
					});
				}
			}else{
				//如果modul等于空，那么就只执行回调函数
				var args = [null,_event.value];
				_event.action.apply(_event,args);
				self.config.action.apply(_event,args);
			}
		}

		//使用值来查找事件
		this.findEventWithValue = function(_value){
			for(var i=0;i<this.config.events.length;i++){
				var eItem = this.config.events[i];
				eItem = $.extend(this.eTemp,eItem);
				if(eItem.value === _value){
					return eItem;
				}
			}
			return null;
		}

		this.setValue = function(_value){
			window.isSetBySwitch = true;
			this.set(_value);
			setTimeout(function(){
				window.isSetBySwitch = false;
			},100);
		}

		//设置当前路由的hash值
		this.set = function(_value){

			var hashStr ='';
			if(typeof window.location.href.split('#')[1] === 'undefined'){
				hashStr = '';
			}else{
				hashStr = window.location.href.split('#')[1].split('?')[0];
			}
			var paramates = '';
			if(typeof hashStr.split('?')[1] !== 'undefined'){
				paramates = hashStr.split('?')[1];
			}
			var location = window.location.href.split('#')[0];
			var isFind = false;
			//销毁的设置
			if(_value === null){
				if(typeof hashStr !== 'undefined'){
					var hashArr = hashStr.split('/');
					var newHash = '';
					for(var i=0;i<hashArr.length;i++){
						if($.trim(hashArr[i]) === this.config.key && isFind === false){
							isFind = true;
						}else if(isFind === true){
							isFind = false;
						}else{
							if(hashArr[i] !== ''){
								newHash +='/'+hashArr[i];
							}
						}
					}
				}
				if(typeof paramates!== 'undefined'){
					newHash + '?' +paramates;
				}
				location+= '#'+newHash;
				window.location = location;
				return;
			}
			//正常设置
			if(typeof hashStr !== 'undefined'){
				var hashArr = hashStr.split('/');
				var newHash = '';
				for(var i=0;i<hashArr.length;i++){
					if($.trim(hashArr[i]) === this.config.key && isFind === false){
						hashArr[i+1] = _value;
						isFind = true;
					}
					if(hashArr[i] !== ''){
						newHash +='/'+hashArr[i];
					}
				}
				if(typeof paramates!== 'undefined'){
					newHash + '?' +paramates;
				}
				location+= '#'+newHash;
				window.location = location;
			}else{
				location+= '#/'+this.config.key+'/'+_value;
				if(typeof paramates!== 'undefined'){
					location + '?' +paramates;
				}
				window.location = location;
			}
			if(isFind === false && typeof hashStr !== 'undefined'){
				location+= hashStr+'/'+this.config.key+'/'+_value;
				if(typeof paramates!== 'undefined'){
					location + '?' +paramates;
				}
				window.location = location;
			}
		}

		//获取当前路由的hash值
		this.get = function(){
			var hashStr = window.location.href.split('#')[1];
			if(typeof hashStr !== 'undefined'){
				var hashArr = hashStr.split('/');
				for(var i=0;i<hashArr.length;i++){
					if($.trim(hashArr[i]) === this.config.key){
						return hashArr[i+1];
					}
				}
			}
			return null;
		}

		//销毁方法
		this.distroy = function(){
			$(window).unbind('hashchange',this.load);
			this.set(null);
			this.config.distroyCall();
		}
	}
		
	return m;
});





















