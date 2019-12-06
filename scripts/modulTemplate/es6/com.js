/*
	模块位置:{modulPath}
	文件位置:{filePath}
------------------------------
	创建者:{creater}
	创建于:{dateTime}
	模块名称:{comName}
	模块描述:{description}
*/
"use strict";

using 'arrowBase' as arrowBase;
//继承arrowBase
class {comName} : arrowBase{
	//构造函数
	constructor(_config){
		//初始化继承
		super(_config);
		var self = this;
		//编写页面中需要处理的事件
		this.events = {
			
		}
	}

	//初始化方法
	init(_config,_callBack){
		//获取css和html
		this.getUi(function(){
			//在此进行取得css和html之后要进行的操作

			//回调表示初始化完成
			if(typeof _callBack !== 'undefined'){
				_callBack();
			}
		});
	}
}
//导出模块
exportClass {comName};