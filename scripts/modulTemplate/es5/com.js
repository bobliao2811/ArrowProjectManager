/*
	模块位置:{modulPath}
	文件位置:{filePath}
------------------------------
	创建者:{creater}
	创建于:{dateTime}
	模块名称:{comName}
	模块描述:{description}
*/
define(function(){
	//构造函数
	var m = function(){
		var self = this;
		
		//初始化方法
		this.init = function(_config,_callBack){
			//获取css和html
			this.getUi(function(){
				//在此进行取得css和html之后要进行的操作

				//回调表示初始化完成
				if(typeof _callBack !== 'undefined'){
					_callBack();
				}
			});
		}

		//编写页面中需要处理的事件
		this.events = {

		}
	}
	//导出模块
	return m;
})