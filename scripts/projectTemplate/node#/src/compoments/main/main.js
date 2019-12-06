//入口点类
//继承arrowBase
"use strict";

using 'arrowBase' as arrowBase;
class main : arrowBase{
		constructor(_config){
			//初始化继承
			super(_config);

			var self = this;
			this.data = {
				title:"欢迎使用Arrowjs!!!",
			}

			//设置事件
			this.events = {
				myalt:function(){
					alt('你弹出了一个窗口!');
				},
				myask:function(){
					ask('你弹出了一个窗口!',function(){
						//确认
					},function(){
						//取消
					});
				},
				consolewhrite:function(){
					console.write('这是一个消息！');
				}
			}
		}

		//初始化
		init(){
			var self = this;
			this.getUi(function(){
				self.bindData();
			});
		}
		
		//绑定数据
		bindData(){
			this.mvvm = this.createMvvm(this.data);
			this.data = this.mvvm.data;
		}
}

exportClass main;