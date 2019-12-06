//与主进程通信的事件控制器
define(function(){
	var eventController = function(){
		var self = this;
		this.electron = require('electron');
		this.ipcRenderer = this.electron.ipcRenderer;
		this.listener = null;

		this.eventList = {};


		//发送消息
		this.execute = function(_type,_event,_args,_callBack){
			var eventListItem = {type:_type,_event:_event,_args:_args,_callBack:_callBack,id:ac.newGuid()};
			this.eventList[eventListItem.id] = eventListItem;
			var args = {
				event:_event,
				eventId:eventListItem.id,
				arg:_args
			};
			this.sendMessage(_type,args);
		};

		//初始化函数
		this.init = function(){
			this.openListener();
		}

		//开始监听
		this.openListener = function(){
			this.listener = this.ipcRenderer.on('reply-render', function(event, _result) {
				//控制台输出
				if(_result.status === 666){
					ac.console.write(_result.message);
					return
				}

				if(_result.status !== 0){
					console.log(_result);
					ac.console.write('执行主线程方法出错，请关注浏览器控制台！');
					ac.console.write(_result.message);
					throw _result.message;
					
				}else{
					self.eventList[_result.eventId]._callBack(_result);
				}
				delete self.eventList[_result.eventId];
			});
		}

		//发送
		this.sendMessage = function(_eventType,_args){
			this.ipcRenderer.send('resver-'+_eventType, _args);
		}

		//停止监听
		this.stop = function(){
			this.ipcRenderer.removeListener('reply-render', this.listener);
		}

	}

	return new eventController();
});