//事件控制器
'use strict';

const eventController = function(_targetOject,_eventType){
	const self = this;
	this.electron = require('electron');
	this.ipcMain = this.electron.ipcMain;
	this.listener = null;

	//初始化函数
	this.init = function(){
		this.openListener();
	}

	//开始监听
	this.openListener = function(){
		this.listener = this.ipcMain.on('resver-'+_eventType, function(event, arg) {
		  var result = {
		  	status:0,
		  	message:'成功',
		  	event:arg.event,
		  	eventId:arg.eventId,
		  	data:{}
		  };
		  try{
			  _targetOject[arg.event](arg.arg,function(_result){
			  	result.data = _result;
			  	event.sender.send('reply-render', result);
			  });
			}catch(_e){
				result.status = 500;
				result.message = _e.message;
				result.data = null;
				event.sender.send('reply-render', result);
			}

		});
	}

	//停止监听
	this.stop = function(){
		this.ipcMain.removeListener('resver-'+_eventType, this.listener);
	}
}

module.exports = eventController;