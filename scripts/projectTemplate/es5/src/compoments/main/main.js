define(function(){
	var m = function(){
		var self = this;
				
		this.data={
			title:'欢迎使用ArrowExpress!!'
		}

		//初始化
		this.init = function(){
			this.getUi(function(){
				self.bindData();
			});
		}

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

		this.bindData = function(){
			this.mvvm = this.createMvvm(this.data);
			this.data = this.mvvm.data;
		}

	}

	return m;
})