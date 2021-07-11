//事件控制器
'use strict';



const workSpaceManagerController = function(_window,_app){
	var self = this;
	this.fs = require('fs');
	this.window = _window;
	this.app = _app;
	this.exec = require('child_process').exec;
	this.open = require('opn');

	//总配置文件的位置
	this.totalConfigPath = "C:\\arrowConfig.acfg";
	//工作目录的配置文件名称
	this.workSpaceConfigName = "arrowWorkSpace.acfg";
	//项目的配置文件名称
	this.projectConfigName = "project.acfg";

	//编译器列表
	this.devCompilerList = {};


	//打开开发时编译器
	this.openDevCompiler = function(_args,_callBack){
		//如果开发时编译器中不存在这个项目的编译对象，就创建对象
		if(typeof this.devCompilerList[_args.id] ==='undefined'){
			var _devCompiler = require(this.app.getAppPath()+'\\scripts\\controllerScripts\\devCompiler.js');
			var devCompiler = new _devCompiler(this.window,this.app,_args);
			devCompiler.init(function(){
				_callBack();
			});
			this.devCompilerList[_args.id] = devCompiler;
		}else{
			//否则不创建对象，直接通知创建成功
			_callBack();
		}
	}

	this.getHotDebugPort = function(_args,_callBack){
		_callBack({
				port:this.devCompilerList[_args.id].config['hotLoaderPort']
		})
	}

	//停止开发时编译器
	this.closeDevCompiler = function(_args,_callBack){
		//如果开发时编译器中存在就销毁这个编译器
		if(typeof this.devCompilerList[_args.id] !=='undefined'){
			this.devCompilerList[_args.id].distroy();
			delete this.devCompilerList[_args.id];
			_callBack();
		}else{
			//不存在就直接返回成功
			_callBack();
		}
	}

	//开始进行发布编译
	this.openRelCompiler = function(_args,_callBack){
		var _relCompiler = require(this.app.getAppPath()+'\\scripts\\controllerScripts\\releaseCompiler.js');
		var relCompiler = new _relCompiler(this.window,this.app,_args);
		relCompiler.init(function(_data){
			_callBack(_data);
		});
	}



	//载入工程的配置文件
	this.loadProjectConfig = function(_args,_callBack){
		this.fs.readFile(_args.loadPath + this.projectConfigName,'utf-8',function (_err,_data) {
			if(_err){
				throw _err;
			}else{
				var data = JSON.parse(_data);
				_callBack(data);
			}
		});
	}

	//删除工程
	this.deleteProject = function(_args,_callBack){
		//删除物理文件夹
		try{
			this.deleteFiles(_args.projectPath);
		}catch(_e){
			throw _e;
			return;
		}

		//删除配置
		var callBack = _callBack;
		this.fs.readFile(_args.workSpacePath + this.workSpaceConfigName,'utf-8',function (_err,_data) {
			if(_err){
				throw _err;
			}else{
				var data = JSON.parse(_data);
				var newList = [];
				for(var i=0;i<data.projects.length;i++){
					var litem = data.projects[i];
					if(litem.id !== _args.id){
						newList.push(litem);
					}
				}
				data.projects = newList;

				//将配置文件写入到c盘
				self.fs.writeFile(_args.workSpacePath + self.workSpaceConfigName,JSON.stringify(data),function(_err){
					if(_err){
						throw _err;
						console.log(_err);
						_callBack({
							status:-1
						});
					}else{
						_callBack({
							status:1
						});
					}
				});
			}
		});
	}

	//新建文件夹
	this.newForder = function(_args,_callBack){
		//判断文件夹是否存在
		this.fs.exists(_args.path,function (flag) {
			//不存在的话就创建
			if(flag === false){
				self.fs.mkdir(_args.path,function(_err){
					if(_err){
						throw _err;
						console.log(_err);
					}
					_callBack(flag);
				});
			}else{
				_callBack(flag);
			}
		});
	}

	//新建模块
	this.newCompoment = function(_args,_callBack){
		//判断文件夹是否存在
		this.fs.exists(_args.path,function (flag) {
			//不存在的话就创建
			if(flag === false){
				self.fs.mkdir(_args.path,function(_err){
					if(_err){
						throw _err;
						console.log(_err);
					}
					//创建文件夹完成后创建模块中的文件
					self.newComContent(_args,function(){
						_callBack(flag);
					});
					
				});
			}else{
				_callBack(flag);
			}
		});
	}

	//新建模块内容处理
	this.newComContent = function(_args,_callBack){

		//_args = {
		//	path:'模块的总物理路径'
		//	host:'模块的总访问路径'
		//	name:'模块名称'
		//	creater:'创建者'
		//	dateTime:'创建时间'
		//	description:'模块描述'

		//	pConfig：项目的配置文件
		//}

		//_args.pConfig = {
		//	"devHost": "http://localhost:80/testArrowWorkSpace/ES67NodeSharp",
		//	"devMode": "1",
		//	"id": "badfdaabe04088986035ff38e35d73e1",
		//	"isCompileES6Codes": true,
		//	"orgConfig": {
		//		"devMode": "1",
		//		"host": "http://localhost:80/testArrowWorkSpace/",
		//		"id": "badfdaabe04088986035ff38e35d73e1",
		//		"path": "J:\work\testArrowWorkSpace",
		//		"projectHost": "http://localhost:80/testArrowWorkSpace/ES67NodeSharp",
		//		"projectName": "ES67NodeSharp",
		//		"projectPath": "J:\work\testArrowWorkSpace\ES67NodeSharp"
		//	},
		//	"projectName": "ES67NodeSharp",
		//	"projectPath": "J:\work\testArrowWorkSpace\ES67NodeSharp",
		//	"releaseConfig": {}
		//}

		//项目配置文件
		var pConfig = _args.pConfig;

		var tem = {
			'js':self.app.getAppPath()+'\\scripts\\modulTemplate\\{mode}\\com.js',
			'css':self.app.getAppPath()+'\\scripts\\modulTemplate\\{mode}\\com.css',
			'html':self.app.getAppPath()+'\\scripts\\modulTemplate\\{mode}\\com.html'
		}
		
		if(_args.devMode === '0'){
			tem.js = tem.js.replace(/\{mode\}/,'es5');
			tem.css = tem.css.replace(/\{mode\}/,'es5');
			tem.html = tem.html.replace(/\{mode\}/,'es5');
		}else{
			tem.js = tem.js.replace(/\{mode\}/,'es6');
			tem.css = tem.css.replace(/\{mode\}/,'es6');
			tem.html = tem.html.replace(/\{mode\}/,'es6');
		}

		//获取模板
		var temFiles = {
			'js':this.fs.readFileSync(tem.js,'utf-8'),
			'css':this.fs.readFileSync(tem.css,'utf-8'),
			'html':this.fs.readFileSync(tem.html,'utf-8')
		}

		//获取模板文件后替换模板文件的一些参数
		//然后保存
		for(var i in temFiles){
			var file = temFiles[i];
			file = file.replace(/\{modulPath\}/g,_args.host.replace(_args.pConfig.devHost+'/src',''));
			file = file.replace(/\{filePath\}/g,(_args.host + '/' + _args.name +'.'+i).replace(_args.pConfig.devHost+'/src',''));
			file = file.replace(/\{creater\}/g,_args.creater);
			file = file.replace(/\{dateTime\}/g,_args.dateTime);
			file = file.replace(/\{comName\}/g,_args.name);
			file = file.replace(/\{description\}/g,_args.description);

			self.fs.writeFileSync(_args.path + '\\' + _args.name +'.'+i,file);
		}

		//创建images文件夹
		self.fs.mkdir(_args.path + '\\images',function(_err){
			if(_err){
				throw _err;
				console.log(_err);
			}
			_callBack();
		});
	}

	//判断是否有工程配置文件
	this.isHaveProjectConfig = function(_args,_callBack){
		this.fs.exists(_args.path + "project.acfg" ,function (flag) {
			if(flag === false){
				_callBack({
						isHave:flag,
						config:{}
					});
			}else{
				_callBack({
						isHave:flag,
						config:self.fs.readFileSync(_args.path + "project.acfg",'utf-8')
					});
			}
		});
	}

	//新建工程新建文件夹
	this.newProjectNewForder = function(_args,_callBack){
		//判断工程文件夹是否存在
		this.fs.exists(_args.projectPath,function (flag) {
			//不存在的话就创建
			if(flag === false){
				self.fs.mkdir(_args.projectPath,function(_err){
					if(_err){
						throw _err;
						console.log(_err);
					}
					_callBack(flag);
				});
			}else{
				_callBack(flag);
			}
		});

	}

	//保存配置文件
	this.saveProjectConfig = function(_args,_callBack){
		self.fs.writeFile(_args.projectPath +"\\"+ self.projectConfigName,JSON.stringify(_args.config),function(_err){
			_callBack({
				status:1
			});
		});
	}

	//新建工程
	this.newProject = function(_args,_callBack){
		var callBack = _callBack;

		//发布配置模板
		var rcItem = {
			mode:'test',
			name:'测试发布',
			lastTotalReleaseVersion:'',
			unDeleteable:true,
			isSelected:false,
			fromPath:'',
			toPath:'',
			fromHost:'',
			toHost:'',
			combineSettings:{
				combineEngineToEntryPages:false,
				combineHtmlAndCssToMainOfModul:false,
				execCatchDepsToEntryPage:false,
				execCatchUsingToEntryPage:false,
				execCatchDepsHere:false,
				execCatchUsingHere:false,
				execCatchModulToEntryPage:false
			},
			javaScriptSettings:{
				compress:true,
				clearDebugCode:false,
				evalObfuscation:false,
				AESEncryption:false
			},
			cssSettings:{
				compress:true,
				combineCssesToCommonCss:false,
				imageCssAsyncLoad:false
			},
			imagesSettings:{
				spritesOfModuls:false,
				spritesOfGlobel:false,
				usingTinify:false,
				CDNImagesHandle:false,
				usingTinifyKey:'',
				CDNImageHost:'',
				CDNImageRelPath:''
			},
			otherSettings:{
				compressEntryPage:false,
				AESEncryptionFileNameAndForderName:false
			},
			//版本控制配置
			versionControl:{
				//标识是否为增量发布，全量发布为false,增量发布为true
				isIncrementalRelease:false,
				//主版本号
				mainVersion:0,
				//主版本发布日期
				mainVersionRelDate:'',
				//发布上一个主版本时使用的配置
				currentMainVersionConfig:{},
				//增量发布列队
				//每次在某一个主版本下发布的增量，都需要依次叠加，避免版本混乱
				incrementalQueue:[]
			}
		}

		this.newProjectNewForder(_args,function(_flag){
			if(_flag){
				callBack({
					status:0
				});
				return;
			}
			self.fs.readFile(_args.path + self.workSpaceConfigName,'utf-8',function (_err,_data) {
				if(_err){
					throw _err;
				}else{
					var data = JSON.parse(_data);
					data.projects.push(_args);
					//将配置文件写入
					self.fs.writeFile(_args.path + self.workSpaceConfigName,JSON.stringify(data),function(_err){

						//复制工程模板文件到目标工程
						//this.app.getAppPath();
						//J:\work\ImportantWorks\phpWorks\study\ArrowOpenSource\ArrowSourceManager
						if(_args.devMode === '0'){
							self.copyContentsOfDir(self.app.getAppPath()+'\\scripts\\projectTemplate\\es5',_args.projectPath);
						}else{
							self.copyContentsOfDir(self.app.getAppPath()+'\\scripts\\projectTemplate\\node#',_args.projectPath);
						}
						
						self.fs.readFile(_args.projectPath +"\\"+ self.projectConfigName,'utf-8',function (_err,_data) {
							if(_err){
								throw _err;
							}else{
								var data = JSON.parse(_data);
								data.orgConfig = _args;
								data.id = _args.id;
								data.projectName = _args.projectName;
								data.projectPath = _args.projectPath;
								data.devHost = _args.projectHost;
								data.devMode = _args.devMode;
								data.releaseConfig = [];

								//设置发布配置
								var testConfig = JSON.parse(JSON.stringify(rcItem));
								var grayConfig = JSON.parse(JSON.stringify(rcItem));
								var relConfig = JSON.parse(JSON.stringify(rcItem));
								testConfig.mode = 'test';
								testConfig.name = '测试发布';
								testConfig.isSelected = true;
								testConfig.fromPath = data.projectPath + '\\BUILDSRC';
								testConfig.toPath = data.projectPath + '\\TEST';
								testConfig.fromHost = data.devHost +'/BUILDSRC';
								testConfig.toHost = data.devHost +'/TEST';
								testConfig.imagesSettings.CDNImageHost = data.devHost + '/TEST/common/images';
								testConfig.imagesSettings.CDNImageRelPath = data.projectPath + '\\TEST\\common\\images';
								data.releaseConfig.push(testConfig);

								grayConfig.mode = 'gray';
								grayConfig.name = '灰度发布';
								grayConfig.fromPath = data.projectPath + '\\BUILDSRC';
								grayConfig.toPath = data.projectPath + '\\GRAY';
								grayConfig.fromHost = data.devHost +'/BUILDSRC';
								grayConfig.toHost = data.devHost +'/GRAY';
								grayConfig.imagesSettings.CDNImageHost = data.devHost + '/GRAY/common/images';
								grayConfig.imagesSettings.CDNImageRelPath = data.projectPath + '\\GRAY\\common\\images';
								data.releaseConfig.push(grayConfig);

								relConfig.mode = 'rel';
								relConfig.name = '正式发布';
								relConfig.fromPath = data.projectPath + '\\BUILDSRC';
								relConfig.toPath = data.projectPath + '\\REL';
								relConfig.fromHost = data.devHost +'/BUILDSRC';
								relConfig.toHost = data.devHost +'/REL';
								relConfig.imagesSettings.CDNImageHost = data.devHost + '/REL/common/images';
								relConfig.imagesSettings.CDNImageRelPath = data.projectPath + '\\REL\\common\\images';
								data.releaseConfig.push(relConfig);

								self.fs.writeFile(_args.projectPath +"\\"+ self.projectConfigName,JSON.stringify(data),function(_err){

								});
							}
						});

						if(_err){
							throw _err;
							console.log(_err);
							callBack({
								status:-1
							});
						}else{
							callBack({
								status:1
							});
						}
					});
				}
			});
		});
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

	//探测工作目录中是否有配置文件
	//有配置文件的话就打开配置文件并返回
	//没有的话就创建配置文件并返回配置文件
	this.detactProjectConfig = function(_args,_callBack){
		var callBack = _callBack;
		this.fs.exists(_args.path + this.workSpaceConfigName,function (flag) {
			if(flag){
				//如果文件存在就读取
				self.fs.readFile(_args.path + self.workSpaceConfigName,'utf-8',function (_err,_data) {
					if(_err){
						throw _err;
					}else{
						var data = JSON.parse(_data);
						callBack(data);
					}
				});
			}else{
				//不存在就创建
				var wkConfig = {
					projects:[]
				}
				//将配置文件写入到c盘
				self.fs.writeFile(_args.path + self.workSpaceConfigName,JSON.stringify(wkConfig),function(_err){
					if(_err){
						throw _err;
						console.log(_err);
						callBack({
							status:-1
						});
					}else{
						callBack(wkConfig);
					}
				});
			}
		});
	}

	//打开某个文件夹
	this.openForderFromExplorer = function(_args,_callBack){
		this.exec('explorer.exe "'+ _args.path +'"');
		_callBack({});
	}

	//打开某个文件夹
	this.openPage = function(_args,_callBack){
		this.open(_args.host);
		_callBack({});
	}


	//判断c盘是否存在arrowConfig.acfg
	this.getArrowConfigIsExistInC = function(_args,_callBack){
		var callBack = _callBack;
		this.fs.exists(this.totalConfigPath,function (flag) {
			callBack({isExist:flag});
		});
	}

	//从c盘读取arrowConfig.acfg
	this.readMainConfigFromC = function(_args,_callBack){
		var callBack = _callBack;
		this.fs.readFile(this.totalConfigPath,'utf-8',function (_err,_data) {
			if(_err){
				throw _err;
			}else{
				var data = JSON.parse(_data);
				_callBack(data);
			}
		});
	}

	//在c盘创建arrowConfig
	this.createArrowConfigInC = function(_args,_callBack){
		var workSpaceItem = {
			id:_args.workSpaceid,
			path:_args.workSpacePath,
			host:_args.workSpaceHost,
			name:_args.workSpaceName,
			desc:_args.workSpaceDesc,
			createDate:_args.createDate
		}
		var ArrowConfig = {
			createDate:+(new Date),
			workSpaceList:[workSpaceItem]
		}
		//将配置文件写入到c盘
		this.fs.writeFile(this.totalConfigPath,JSON.stringify(ArrowConfig),function(_err){
			if(_err){
				throw _err;
				console.log(_err);
				_callBack({
					status:-1
				});
			}else{
				_callBack({
					status:1
				});
			}
		});
	}

	//往c盘的配置文件中新增工作空间
	this.addArrowConfigInC = function(_args,_callBack){
		var workSpaceItem = {
			id:_args.workSpaceid,
			path:_args.workSpacePath,
			host:_args.workSpaceHost,
			name:_args.workSpaceName,
			desc:_args.workSpaceDesc,
			createDate:_args.createDate
		}
		var callBack = _callBack;
		this.fs.readFile(this.totalConfigPath,'utf-8',function (_err,_data) {
			if(_err){
				throw _err;
			}else{
				var data = JSON.parse(_data);
				data.workSpaceList.push(workSpaceItem);
				//将配置文件写入到c盘
				self.fs.writeFile(self.totalConfigPath,JSON.stringify(data),function(_err){
					if(_err){
						throw _err;
						console.log(_err);
						_callBack({
							status:-1
						});
					}else{
						_callBack({
							status:1
						});
					}
				});
			}
		});
	}

	//删除工作空间
	this.deleteWorspaceForder = function(_args,_callBack){
		//删除物理文件夹
		try{
			this.deleteFiles(_args.path);
		}catch(_e){
			throw _e;
			return;
		}

		//删除配置
		var callBack = _callBack;
		this.fs.readFile(this.totalConfigPath,'utf-8',function (_err,_data) {
			if(_err){
				throw _err;
			}else{
				var data = JSON.parse(_data);
				var newList = [];
				for(var i=0;i<data.workSpaceList.length;i++){
					var litem = data.workSpaceList[i];
					if(litem.id !== _args.id){
						newList.push(litem);
					}
				}
				data.workSpaceList = newList;

				//将配置文件写入到c盘
				self.fs.writeFile(self.totalConfigPath,JSON.stringify(data),function(_err){
					if(_err){
						throw _err;
						console.log(_err);
						_callBack({
							status:-1
						});
					}else{
						_callBack({
							status:1
						});
					}
				});
			}
		});
	}

	//删除目标文件夹下所有文件
	this.deleteFiles = function(_path){
	    var files = [];
	    if( self.fs.existsSync(_path) ) {
	        files = self.fs.readdirSync(_path);
	        files.forEach(function(file,index){
	            var cur_Path = _path + "/" + file;
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


	//判断某个文件夹是否存在
	this.isExist = function(_args,_callBack){
		var callBack = _callBack;
		this.fs.exists(_args.path,function (flag) {
			callBack({isExist:flag});
		});
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

module.exports = workSpaceManagerController;
