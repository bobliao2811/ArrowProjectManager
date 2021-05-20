//ajax处理类
define(function(){
	var m = function(_config){
		var self = this;
		var config = {};
		this.config = $.extend(true,config,_config);
		this.common = null;
		this.parent = null;

		this.account = null;

		//ajax请求链接
		this.ajaxPort = '//www.excemple.com/';

		//调试环境
		if(window.arrowConfig.mode === 'debug'){
			this.ajaxPort = '//www.excemple.com/';
		}

		//调试环境
		if(window.arrowConfig.mode  === 'gray'){
			this.ajaxPort = '//www.excemple.com/';
		}

		//调试环境
		if(window.arrowConfig.mode  === 'rel'){
			this.ajaxPort = '//www.excemple.com/';
		}

		//初始化
		this.init = function(_common,_parent){
			this.common = _common;
			this.parent = _parent;
		}
		
		//检查登陆情况
		this.getIsLogin = function(_loginedCallBack,_unLoginCall){
			if(self.account === null){
				_unLoginCall();
			}else{
				_loginedCallBack();
			}
		}

		//获取登陆账号
		this.getLoginAccount = function(){
			return this.account;
		}

		//服务器状态处理器
		this.stateProcresser = function(_data){
			var isShowLogin = false;

			//if(_data.state === "500"){
			//	self.common.console.write('服务器内部错误！');
			//	return;
			//}


			return _data
		}


		//系统专用ajaxPost
		this.post =function(_name,_params,_succCall,_faiCall,_urlPar,_datatType){
			if(typeof _urlPar ==='undefined'){
				_urlPar = "";
			}
			if(typeof _datatType ==='undefined'){
				_datatType = "text";
			}
			var params = {
				url:this.ajaxPort + self.ajaxCGI[_name] +_urlPar,
				type:'post',
				data:_params,
				cache:false,
				dataType: _datatType,
				headers: {'Content-Type': 'application/x-www-form-urlencoded','charset':'UTF-8'},
				success:function(_data,_status,_xhr){
					_succCall(self.stateProcresser(_data),_status,_xhr);
				},
				error:_faiCall
			}
			return this.arrowAjax(params);
		}

		//系统专用ajaxGet
		this.get = function(_name,_params,_succCall,_faiCall,_urlPar,_datatType){
			if(typeof _urlPar ==='undefined'){
				_urlPar = "";
			}
			if(typeof _datatType ==='undefined'){
				_datatType = "text";
			}
			var params = {
				url:this.ajaxPort + self.ajaxCGI[_name] +_urlPar,
				type:'get',
				data:_params,
				cache:false,
				dataType: _datatType,
				headers: {'Content-Type': 'application/json','charset':'UTF-8'},
				success:function(_data,_status,_xhr){
					_succCall(self.stateProcresser(_data),_status,_xhr);
				},
				error:_faiCall
			}
			return this.arrowAjax(params);
		}



		//ajax请求堆
		this.ajaxArr = [];
		//ajax请求方法
		this.arrowAjax = function(_params){
		    //创建ajax参数集
		    var ajaxItem = self.makeAjaxItem(_params);
		    if(!ajaxItem){return};
		    var aParams = {
		        url: _params.url,
		        //<!--debug
		        xhrFields: {withCredentials:true},
		        crossDomain: true,
		        //-->
		        type:  _params.type,
		        data:  _params.data,
		        cache:  _params.cache,
		        dataType:  _params.dataType,
		        success: function (data, status, xhr) {
		            _params.success(data, status, xhr);
		        },
		        error: function (xmlHr, msg, obj) {
		            self.makeError(xmlHr, msg, obj,_params);
		        },
		        fail:function(xmlHr, msg, obj){
		            self.makeError(xmlHr, msg, obj,_params);
		        }
		    };
		    if(typeof _params.contentType !== 'undefined'){
		        aParams.contentType = _params.contentType;
		    }
		    if(typeof _params.headers !== 'undefined'){
		        aParams.headers = _params.headers;
		    }
		    ajaxItem.ajax = $.ajax(aParams).fail(function(xmlHr, msg, obj){
		    	self.makeError(xmlHr, msg, obj,_params);
		    });

		    this.ajaxArr.push(ajaxItem);
		    return ajaxItem.ajax;
		}

		//创建ajax错误
		self.makeError = function(xmlHr,msg,obj,params){
		     //如果使用调试码开启了调试模式
			if(window.arrowConfig.mode !== 'rel'){
		        console.log(msg);
		        self.common.console.write(msg);
		        if(params.error){
		        	params.error(xmlHr,msg,obj,params);
		        }
		    }
		}

		//创建ajax参数集
		self.makeAjaxItem = function(params){
		    //间隔时间
		    //默认为1秒内连续触发5次就拒绝。
		    if(!params.delay){
		        params.delay = 1000;
		    }
		    if(!params.times){
		        params.times = 2;
		    }
		    var times = 0;
		    //url,type,data,cache,dataType,success,error
		    for(var i=0;i<this.ajaxArr.length;i++){
		        if(params.url === this.ajaxArr[i].params.url &&params.data === this.ajaxArr[i].params.data && ((+new Date) - this.ajaxArr[i].time) < params.delay){
		            times++;
		        }
		    }
		    if(times > params.times){
		        self.common.console.write({str:'手速很快哦，但是也要注意休息啊呀！~',e:$(window)});
		        return false ;
		    }

		    var ajaxItem = {ajax:null,params:params,time:(+new Date)};
		    return ajaxItem;
		}


		//ajax接口配置
		this.ajaxCGI = {
		}


	}
	return m;
});











