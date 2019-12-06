//开发时编译器
'use strict';

const developmentCompiler = function(_window,_app,_projectConfig){
	var self = this;
	this.fs = require('fs');
	this.chokidar = require('chokidar');
	this.window = _window;
	this.app = _app;
	this.exec = require('child_process').exec;
	this.config = _projectConfig;
	
	this.spiritImagesCompiler = require(this.app.getAppPath()+'\\scripts\\controllerScripts\\com\\spiritImagesCompiler.js');
	this.hotLoader = require(this.app.getAppPath()+'\\scripts\\controllerScripts\\com\\hotLoader.js');

	//编译器模块
	this.dcModuls = [
		{name:'路径处理器',enName:'urlComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\devCompilerModuls\\urlCompiler.js')},
		{name:'less编译器',enName:'lessComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\devCompilerModuls\\lessCompiler.js')},
		{name:'node#编译器',enName:'nodeSharpComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\devCompilerModuls\\nodeSharpCompiler.js')},
		{name:'es6/7编译器',enName:'es67Complier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\devCompilerModuls\\esCompiler.js')}
	]

	//源代码目录
	this.srcDir = this.config.projectPath+'\\src';
	//开发时编译目录
	this.buildSrc = this.config.projectPath+'\\BUILDSRC';
	//监视器
	this.watcher = false;

	//雪碧图构造器
	this.siCompiler = null;


	//跳过的编译目录
	this.escapePath = [
		'arrowSystem'
	]

	this.init = function(_callBack){
		//编译器id
		this.id = this.config.id;
		//热更新端口号
		this.config['hotLoaderPort'] = this.getRand(1000,9999);
		//初始化观察者
		this.openWatcher(function(){
			self.sendCompliMessage(0,'开发时编译器初始化完成！已进入工作状态。');
			_callBack();
		});
	};

	//打开观察者
	this.openWatcher = function(_callBack){
		//初始化编译状态
		this.initCompiler(function(){
			self.sendCompliMessage(0,'正在初始化文件监视器..');
			var ready = false;
			// 文件新增时
			function addFileListener(_path) {
				if(ready){
					var parr = _path.split('\\');
					var fi = parr[parr.length-1];
					var fromDir = _path.replace('\\'+parr[parr.length-1],'');
					var toDir = fromDir.replace(self.srcDir,self.buildSrc);

					//如果是公共图片文件夹下的文件发生变化说明需要重新编译雪碧图
					self.sendCompliMessage(0,'新增了一个文件：'+fromDir.replace(/\\/g,'/'));
					self.handleSingleFile(fi,fromDir,toDir,function(){
						if(fromDir.indexOf('\\src\\common\\images') !== -1){
							self.siCompiler.make();
							self.sendCompliMessage(0,'全局雪碧图已经更新完成:/BUILDSRC/common/images/spirit.png</br>使用雪碧图请前往查阅样式:</br>/BUILDSRC/common/spirit.css</br>');
						}
					});
					self.sendCompliMessage(0,'新增文件已编译至：'+toDir.replace(/\\/g,'/'));


					
				}
			}
			//新增目录时
			function addDirecotryListener(_path) {
				if(ready){
					var fromDir = _path;
					var toDir = fromDir.replace(self.srcDir,self.buildSrc)
					self.compilerAll(fromDir,toDir,function(){});
					self.sendCompliMessage(0,'新增了一个目录：'+fromDir.replace(/\\/g,'/'));
				}
			}

			// 文件内容改变时
			function fileChangeListener(_path) {
				if(ready){
					var parr = _path.split('\\');
					var fi = parr[parr.length-1];
					var fromDir = _path.replace('\\'+parr[parr.length-1],'');
					var toDir = fromDir.replace(self.srcDir,self.buildSrc);
					//如果是公共图片文件夹下的文件发生变化说明需要重新编译雪碧图
					self.sendCompliMessage(0,'文件发生了变更：'+fromDir.replace(/\\/g,'/'));
					self.handleSingleFile(fi,fromDir,toDir,function(){
						if(fromDir.indexOf('\\src\\common\\images') !== -1 && fromDir.indexOf('spirit.png') === -1){
							self.siCompiler.make();
							self.sendCompliMessage(0,'全局雪碧图已经更新完成:/BUILDSRC/common/images/spirit.png</br>使用雪碧图请前往查阅样式:</br>/BUILDSRC/common/spirit.css</br>');
						}
					});
					self.sendCompliMessage(0,'变更文件已编译至：'+toDir.replace(/\\/g,'/'));
					
				}
			}

			// 删除文件时，需要把文件里所有的用例删掉
			function fileRemovedListener(_path) {
				try{
					if(ready){
						self.sendCompliMessage(0,'文件被删除：'+_path);
						_path = _path.replace(self.srcDir,self.buildSrc);
						self.fs.unlinkSync(_path);
						self.sendCompliMessage(0,'文件已经在编译目录中被删除：'+_path.replace(/\\/g,'/'));
					}
				}catch(_e){

				}
			}

			// 删除目录时
			function directoryRemovedListener(_path) {
				if(ready){
					self.sendCompliMessage(0,'文件夹被删除：'+_path);
					_path = _path.replace(self.srcDir,self.buildSrc)
					self.deleteFiles(_path);
					self.sendCompliMessage(0,'文件夹已经在编译目录中被删除：'+_path.replace(/\\/g,'/'));
				}
			}

			if (!self.watcher) {
				//监视开发目录
				self.watcher = self.chokidar.watch(self.srcDir);
			}
			self.watcher.on('add', addFileListener)
			.on('addDir', addDirecotryListener)
			.on('change', fileChangeListener)
			.on('unlink', fileRemovedListener)
			.on('unlinkDir', directoryRemovedListener)
			.on('error', function (error) {
				self.sendCompliMessage(2,'打开文件编译器(watcher)时出现了错误!:'+error.message);
				throw '打开文件编译器(watcher)时出现了错误!:'+error.message;
			}).on('ready', function () {
				ready = true;
				
			});
			self.sendCompliMessage(0,'文件监视器初始化完成。');
			_callBack();
		});

		
	}

	//初始化开发环境编译器
	//全部重新编译代码，从src到BUILDSRC
	this.initCompiler = function(_callBack){
		this.sendCompliMessage(0,'正在初始化开发环境编译器..');

		this.sendCompliMessage(0,'正在清理编译目录:'+this.buildSrc.replace(/\\/g,'/'));
		//将开发时编译目录中的所有文件全部删除
		this.deleteFiles(this.buildSrc);

		this.sendCompliMessage(0,'正在将所有源码（'+this.srcDir.replace(/\\/g,'/')+')重新编译到编译目录('+ this.buildSrc.replace(/\\/g,'/') +')');
		//重新从源代码目录将代码编译到开发时编译目录
		this.compilerAll(this.srcDir,this.buildSrc,function(){

			//执行雪碧图生成器
			self.siCompiler = new self.spiritImagesCompiler(self.config,self.app);
			self.siCompiler.make();

			//初始化热更新编译器
			self.hotLoader = new self.hotLoader(self.config,self.app);
			self.hotLoader.init();

			self.sendCompliMessage(0,'初始化编译完成。');
			_callBack();
		});
		
	}



	//编译所有代码
	this.compilerAll = function(_fromDir,_toDir,_callBack){
		//判断目录是否存在
		if(!self.fs.existsSync(_toDir)){
			//不存在就创建
			self.fs.mkdirSync(_toDir, '0777');
		}
		//获取文件和文件夹列表
		var fromList = self.fs.readdirSync(_fromDir);
		var hCount = 0;
		var countting = function(){
			hCount +=1;
			if(hCount === fromList.length-1){
				_callBack();
			}
		}
		//循环查找要合并的文件
		for(var i=0;i<fromList.length;i++){
			var fi = fromList[i];
			//如果是个目录，就伸展下去
			if(self.fs.lstatSync(_fromDir + "\\"+fi).isDirectory()){
				self.compilerAll(_fromDir + "\\"+fi,_toDir + "\\"+fi,function(){
					countting();
				});
			}else{
				self.handleSingleFile(fi,_fromDir,_toDir,function(){
					countting();
				});
			}
		}
		if(fromList.length === 0){
			_callBack();
		}
	}

	//处理单个文件
	this.handleSingleFile = function(fi,_fromDir,_toDir,_callBack){
		(function(fi,_fromDir,_toDir,_callBack){
				var data='';
				var type= fi.split('.')[1];
				//只对js json less css html htm 进行操作
				//如果不是这些文件就不用utf-8读取
				if(type !== 'css' 
					&& type !== 'html'
					&& type !== 'htm'
					&& type !== 'js'
					&& type !== 'less'
					&& type !== 'json'
					){
					data=self.fs.readFileSync(_fromDir + "/"+fi);
				}else{
					//将文件读取出来放在内存中
					data=self.fs.readFileSync(_fromDir + "/"+fi,"utf-8");
				}

				//净路径
				var currentUrl = _fromDir.replace(self.srcDir+'\\','');

				var urlArgs = {
					//源代码的物理路径
					srcDir:self.srcDir,
					//开发时编译目录
					buildSrc:self.buildSrc,
					//目标Host根目录
					targetHost: self.config.devHost+'/BUILDSRC',
					//净host路径
					currentHostUrl:currentUrl.replace(/\\/,'/'),
					//净物理路径
					currentPath:currentUrl,
					//当前文件名
					currentFileName:fi,
					//当前文件物理路径
					currentFilePath:_fromDir + "\\"+fi,
					//目标文件路径
					targetFilePath:_toDir + "\\"+fi,
					//热更新端口号
					hotLoaderPort:self.config.hotLoaderPort
				}

				//处理文件编译
				self.fileCompiler(urlArgs,type,data,function(_data){
					//保存文件到目标目录
					self.fs.writeFileSync(_toDir + "\\"+fi,_data);

					//通知hotLoader发送文件更新信息
					if(typeof self.hotLoader.sendUpdateData !== 'undefined') {
						var url = _toDir + "\\"+fi;
						var urls = [
							url.replace(self.config.projectPath,'').replace(/\\/g,'/').replace(/^\//,'').replace(/BUILDSRC\//,''),
							self.config.devHost + url.replace(self.config.projectPath,'').replace(/\\/g,'/')
						];
						self.hotLoader.sendUpdateData(urls,_data);
					}

					_callBack();
				});
			})(fi,_fromDir,_toDir,_callBack);
	}

	//文件编译器
	this.fileCompiler = function(_urlArgs,_type,_data,_callBack){
		self.sendCompliMessage(0,"正在处理文件:"+_urlArgs.currentFilePath.replace(/\\/g,'/'));
		//只对js json less css html htm 进行操作
		//如果不是这些文件就直接跳过
		if(_type !== 'css' 
			&& _type !== 'html'
			&& _type !== 'htm'
			&& _type !== 'js'
			&& _type !== 'less'
			&& _type !== 'json'
			){
				_callBack(_data);
			return;
		}

		//跳过不用编译的目录
		for(var i=0;i<self.escapePath.length;i++){
			var eItem = self.escapePath[i];
			if(_urlArgs.currentPath.indexOf(eItem) !== -1){
				_callBack(_data);
				return;
			}
		}

		//1.执行路径编译，将所有相对路径全部编译成相对项目的路径
		//2.执行node#语法编译
		//3.执行es6/7编译
		//4.执行less编译

		//递归执行
		var i=0;
		var scFunc = function(_data,_i){
			if(_i>self.dcModuls.length-1){
				_callBack(_data);
				return;
			}

			var dcItem = self.dcModuls[_i].com;
			var arg = [
				//url参数
				_urlArgs
				//文件类型
				,_type
				//文件具体内容
				,_data
				//成功
				,function(_data){
					scFunc(_data,_i+1);
				},
				//失败
				function(_message){
					_data+='\n\n***************该文件编译错误::begin********************\n';
					_data+=_message;
					_data+='\n***************该文件编译错误::end********************\n\n';
					//编译失败就直接跳过此文件不继续进行下面的编译了
					self.sendCompliMessage(2,"("+  self.dcModuls[_i].name +")文件编译错误:\n文件:"+_urlArgs.currentFilePath.replace(/\\/g,'/')+"\n错误消息:"+_message+'，此次编译已结束!请查找问题并修改故障源码后保存，编译器将再次编译此文件!');
					_callBack(_data);
				}
			]
			dcItem.apply(self,arg);
		}
		scFunc(_data,i);

		self.sendCompliMessage(1,"文件处理完成:"+_urlArgs.targetFilePath.replace(/\\/g,'/'));
	}

	//消息类型:0：系统消息 1:编译器消息 2:编译错误消息
	this.sendCompliMessage = function(_type,_message){
		this.window.webContents.send('dev-compiler-channel', {
			type:_type,
			messsage:_message,
			date:(+new Date)
		});
	}




	//销毁
	this.distroy = function(){
		//通知开发时编译器停止编译
		if(this.watcher){
			this.watcher.close();
			this.hotLoader.destroy();
		}
	}

	//删除目标文件夹下所有文件
	this.deleteFiles = function(_path){
	    var files = [];
	    if( self.fs.existsSync(_path) ) {
	        files = self.fs.readdirSync(_path);
	        files.forEach(function(file,index){
	            var cur_Path = _path + "\\" + file;
	            if(self.fs.statSync(cur_Path).isDirectory()) { // recurse
	                self.deleteFiles(cur_Path);
	            } else { // delete file
	            	try{
	                	self.fs.unlinkSync(cur_Path);
					}catch(_e){
						console.log(_e);
					}
	            }
	        });
			try{
	        	self.fs.rmdirSync(_path);
			}catch(_e){
				console.log(_e);
			}
	    }
	}


	//复制黏贴
	this.copyContentsOfDir = function(_fromDir,_toDir){
		//判断路径是否存在
		if(!self.fs.existsSync(_toDir)){
			//不存在就创建
			self.fs.mkdirSync(_toDir,'0777');
		}
		//获取文件和文件夹列表
		var fromList = self.fs.readdirSync(_fromDir);
		//循环原始列表中的所有文件到目录
		for(var i=0;i<fromList.length;i++){
			var dItem = fromList[i];
			//如果是个目录，就伸展下去
			if(self.fs.lstatSync(_fromDir + "\\"+dItem).isDirectory()){
				self.copyContentsOfDir(_fromDir + "\\"+dItem,_toDir + "\\"+dItem);
			}else{
				//拷贝文件
				var data = self.fs.readFileSync(_fromDir + "\\"+dItem);
				self.fs.writeFileSync(_toDir + "\\"+dItem,data);
			}

		}
	}

	//获得一个随机数
	this.getRand=function(Max,Min){
    	var Range = Max - Min;
      	var Rand = Math.random();
      	if(Math.round(Rand * Range)==0){       
        	return Min + 1;
      	}
      	var num = Min + Math.round(Rand * Range);
      	return num;
    }

}

module.exports = developmentCompiler;