//主程序对象

'use strict';

const mainController = function(){
	const self = this;
	this.electron = require('electron');
	this.workSpaceManagerController = require('./workSpaceManagerController.js');
	this.eventController = require('./eventController.js');
	this.app = this.electron.app;
	this.BrowserWindow  = this.electron.BrowserWindow ;

	this.windowConfig = {
        width: 1400,
        height: 759,
        minWidth:1400,
        minHeight:759,
        resizable :true,
        fullscreenable :false,
        webPreferences: {
            nodeIntegration: true,
			webSecurity: false
        }
    };
    //初始化
	this.init = function(){
		this.app.on('ready', function(){
			self.createWindow();
		})
	}
	//创建窗口
	this.createWindow = function(){
	    // 创建浏览器窗口
	    let win = new this.BrowserWindow(this.windowConfig);
	    this.workSpaceManagerController = new this.workSpaceManagerController(win,this.app);
	    self.openEventAdapter();
	    // 加载index.html文件
	    win.loadFile('./views/index.html');
	}
	//创建事件监听器
	this.openEventAdapter = function(){
		var wsmController = new this.eventController(this.workSpaceManagerController,'wsm');
		wsmController.init();
	}
}

module.exports = new mainController();

