//发布编译器
'use strict';

const releaseCompiler = function(_window,_app,_projectConfig){
	var self = this;
	this.fs = require('fs');
	this.window = _window;
	this.app = _app;
	this.exec = require('child_process').exec;
	//全部的项目配置
	this.config = _projectConfig;
	//当前编译配置
	this.rConfig = {};

	//当前发布的统筹信息
	this.anilys = {};

	//当前发布的项目地图
	this.fileMap = {
		//项目文件树
		tree:{},
		//所有文件列表
		list:[],
		//入口点页面
		entryPages:{hash:{},arr:[]},
		//物理路径哈希表
		pathHashList:{},
		//HOST路径哈希表
		HostHashList:{}
	}

	//跳过的编译目录
	this.escapePath = [
		'arrowSystem'
	]

	//编译器模块
	this.dcModuls = [
		{name:'url处理器',enName:'urlComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\relCompilerModuls\\urlComplier.js')},
		{name:'图片处理器',enName:'imageComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\relCompilerModuls\\imageComplier.js')},
		{name:'css处理器',enName:'cssComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\relCompilerModuls\\cssComplier.js')},
		{name:'合并处理器',enName:'combineComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\relCompilerModuls\\combineComplier.js')},
		{name:'版本号处理器',enName:'versionControlComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\relCompilerModuls\\versionControlComplier.js')},
		{name:'文件名加密处理器',enName:'fileNameComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\relCompilerModuls\\fileNameComplier.js')},
		{name:'js处理器',enName:'jsComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\relCompilerModuls\\jsComplier.js')},
		{name:'html压缩处理器',enName:'htmlComplier',com:require(this.app.getAppPath()+'\\scripts\\controllerScripts\\relCompilerModuls\\htmlComplier.js')}
	]

	//初始化发布编译器
	this.init = function(_callBack){
		self.sendCompliMessage(1,0,'============================================准备开始发布..=====================================================');
		//设置当前的编译配置
		this.rConfig = this.getCurrentConfig(this.config);

		var listItem = {
			name:this.rConfig.fromPath.split('\\')[this.rConfig.fromPath.split('\\').length-1],
			suffixName:'',
			isforder:true,
			relativePath:'\\',
			relativeHost:'/',
			src:{
				path:this.rConfig.fromPath,
				host:this.rConfig.fromHost,
			},
			rel:{
				path:this.rConfig.toPath,
				host:this.rConfig.toHost,
			},
			srcData:'',
			relData:'',
		  	children:[]
		}
		//执行项目的发布数据分析
		this.anilys = this.analysisFiles(listItem,this.rConfig.fromPath,this.rConfig.toPath);
		listItem.children = this.anilys.list
		this.fileMap.tree = listItem;

		//返回统筹信息
		_callBack({fileCount:this.anilys.fileCount,forderCount:this.anilys.forderCount});

		//修改入口点文件的配置
		this.configEntryPage();

		//执行编译处理器
		this.execCompliers(function(){
			//编译处理完成后写入发布项目
			//先执行目录清理
			self.deleteFiles(self.rConfig.toPath);
			//执行目录清理之后写入文件
			self.writeReleaseData();
			self.sendCompliMessage(1,100,'============================================文件全部发布完成!=====================================================');
		});
	}

	//修改入口点文件的配置
	this.configEntryPage = function(){
		for(var i=0;i<this.fileMap.list.length;i++){
			var li = this.fileMap.list[i];
			//判断既是html页面,也是入口点
			if((li.suffixName === 'html' || li.suffixName === 'htm')
				&& (li.srcData.indexOf('<!--ArrowCommand:EntryPage-->') !== -1)){
				this.fileMap.entryPages.arr.push(li);
				this.fileMap.entryPages.hash[li.relativePath] = li;
				//更改发布配置
				li.relData = li.relData.replace("mode:'src'","mode:'"+ this.rConfig.mode +"'");
				//更改baseUrl
				li.relData = li.relData.replace("baseUrl:'',","baseUrl:'"+ this.rConfig.toHost +"',");
			}
		}
	}

	//执行编译处理器
	this.execCompliers = function(_callBack){
		//一个个按顺序执行处理器
		var totalCompCount = this.dcModuls.length-1;

		var i=0;
		var exec = function(i){
			if(i >= self.dcModuls.length){
				_callBack();
				return;
			}

			var dcItem = self.dcModuls[i];
			self.sendCompliMessage(0,(i/totalCompCount*100)-1,'正在执行:'+dcItem.name);
			new dcItem.com({
				currentConfig:self.rConfig,
				projectConfig:self.config,
				//成功回调
				successCall:function(){
					self.sendCompliMessage(0,(i/totalCompCount*100)-1,'执行完成:'+dcItem.name);
					//成功就执行下一步处理
					i++;
					exec(i);
				},
				//错误回调
				errorCall:function(_e){
					self.sendCompliMessage(2,(i/totalCompCount*100)-1,'编译器:'+dcItem.name+'，执行时发生错误，错误信息:\n'+_e);
				},
				//消息回调
				messageCall:function(_message){
					self.sendCompliMessage(1,(i/totalCompCount*100)-1,_message);
				}
			},self).init();
		}
		exec(i);
	}

	//获得当前的编译配置
	this.getCurrentConfig = function(_config){
		for(var i = 0;i<_config.releaseConfig.length;i++){
			var rItem = _config.releaseConfig[i];
			if(rItem.isSelected === true){
				return rItem;
			}
		}
	}

	//消息类型:0：系统消息 1:编译器消息 2:编译错误消息 3:成功执行命令消息
	this.sendCompliMessage = function(_type,_progress,_message){
		this.window.webContents.send('rel-compiler-channel', {
			type:_type,
			progress:_progress,
			messsage:_message,
			date:(+new Date)
		});
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


	//发布数据分析
	this.analysisFiles = function(_parent,_fromDir,_toDir){
		//执行复制的过程中形成源代码地图
		//源代码地图有四种数据格式
		//第一种是树形数据格式
		//第二种是列表数据格式
		//第三种是物理路径哈希表
		//第四种是host路径哈希表

		//地图中每个元素的数据格式如下
		//{
		//	name:文件或文件夹名称,
		//	suffixName:后缀名
		//	isforder:是否为文件夹,
		//  relativePath:相对源代码目录的相对路径,
		//  relativeHost:源代码相对访问路径,
		//	srcPath:{
		//  	path:物理路径,
		//  	host:源代码访问路径,
		//  },
		//	relPath:{
		//  	path:物理路径,
		//  	host:访问路径,
		//  }
		//	data:(数据),
		//  children:子项目
		//}

		//{
		//	"name": "main",
		//	"suffixName": "js",
		//	"isforder": false,
		//	"relativePath": "\\compoments\\main\\main.js",
		//	"relativeHost": "/compoments/main/main.js",
		//	"src": {
		//		"path": "J:\\work\\testArrowWorkSpace\\newProjectTest\\BUILDSRC\\compoments\\main\\main.js",
		//		"host": "http://localhost:80/testArrowWorkSpace/newProjectTest/BUILDSRC/compoments/main/main.js"
		//	},
		//	"rel": {
		//		"path": "J:\\work\\testArrowWorkSpace\\newProjectTest\\TEST\\compoments\\main\\main.js",
		//		"host": "http://localhost:80/testArrowWorkSpace/newProjectTest/TEST/compoments/main/main.js"
		//	},
		//	"srcData": 'buffer',
		//	"relData": 'buffer',
		//	"children": []
		//}

		var anilys = {
			//文件数量
			fileCount:0,
			//文件夹数量
			forderCount:0,
			//文件列表
			list:[]
		}
		//获取文件和文件夹列表
		var fromList = self.fs.readdirSync(_fromDir);
		//循环原始列表中的所有文件到目录
		for(var i=0;i<fromList.length;i++){
			var dItem = fromList[i];
			var listItem = {
				name:'',
				suffixName:'',
				isforder:false,
				relativePath:'',
				relativeHost:'',
				parent:_parent,
				src:{
					path:'',
					host:'',
				},
				rel:{
					path:'',
					host:'',
				},
				srcData:'',
				relData:'',
			  	children:[]
			}

			listItem.src.path = _fromDir + "\\"+dItem;
			listItem.rel.path = _toDir + "\\"+dItem;

			listItem.relativePath = listItem.src.path.replace(self.config.projectPath+ "\\BUILDSRC",'');
			listItem.relativeHost = listItem.relativePath.replace(/\\/g,'/');

			listItem.src.host = self.config.devHost + "/BUILDSRC"+listItem.relativePath.replace(/\\/g,'/');
			listItem.rel.host = self.rConfig.toHost + listItem.relativeHost;

			

			//如果是个目录，就伸展下去
			if(self.fs.lstatSync(_fromDir + "\\"+dItem).isDirectory()){
				listItem.name = dItem;
				listItem.isforder = true;
				listItem.suffixName = 'forder';
				anilys.forderCount ++;
				var _anilys = self.analysisFiles(listItem,_fromDir + "\\"+dItem,_toDir + "\\"+dItem);
				anilys.fileCount += _anilys.fileCount;
				anilys.forderCount += _anilys.forderCount;
				listItem.children = _anilys.list;
			}else{
				//拷贝文件
				anilys.forderCount ++;
				//获得文件真实的名称
				var name = '';
				for (var j = 0; j < dItem.split('.').length - 1; j++) {
					name += dItem.split('.')[j];
				}
				listItem.name = name;
				//获得后缀名
				listItem.suffixName = dItem.split('.')[dItem.split('.').length - 1];
				if(self.getIsTextCodeFile(listItem.suffixName)){
					//如果是具体的代码文件就用utf-8的方式载入
						listItem.srcData = self.fs.readFileSync(_fromDir + "\\"+dItem,'utf-8');
				}else{
					//否则就用buffer的方式载入
					//例如图片，或者其它资源文件
					listItem.srcData = self.fs.readFileSync(_fromDir + "\\"+dItem);
				}
				listItem.relData = listItem.srcData;
			}

			self.fileMap.list.push(listItem);
			self.fileMap.pathHashList[listItem.relativePath] = listItem;
			self.fileMap.HostHashList[listItem.relativeHost] = listItem;
			anilys.list.push(listItem);
		}
		return anilys;
	}

	//执行发布（文件操作）
	this.writeReleaseData = function(){
		var writeFiles = function(_node){
			self.sendCompliMessage(1,99,'正在写入:'+_node.relativePath);
			if(_node.isforder){
				//将已经删除了的文件排除在发布之外
				if(_node.isDeleted !== true){
					//如果是文件夹就制造文件夹，并深入下去进行发布操作
					if(!self.fs.existsSync(_node.rel.path)){
						var mDir = function(_path){
							//不存在就创建
							try{
								self.fs.mkdirSync(_path,'0777');
							}catch(_e){
								var vp = '';
								var plll = _path.split('\\');
								for(var kn = 0;kn<plll.length-1;kn++){
									if(vp !== ''){
										vp += '\\';
									}
									vp +=  plll[kn];
								}
								mDir(vp);
								self.fs.mkdirSync(_path,'0777');
							}
						}
						mDir(_node.rel.path);
					}
					for(var i=0;i<_node.children.length;i++){
						writeFiles(_node.children[i]);
					}
				}
			}else{
				//将已经删除了的文件排除在发布之外
				if(_node.isDeleted !== true){
					//发布文件时需要检查文件的上级路径是否都存在,
					//不存在就从上面创建下来
					var pathArr = _node.rel.path.split('\\');
					var tPath = pathArr[0];
					for(var i=1;i<pathArr.length-1;i++){
						tPath += '\\' +pathArr[i];
						if(!self.fs.existsSync(tPath)){
							//不存在就创建
							self.fs.mkdirSync(tPath, "0777");
						}
					}
					//如果是文件就直接写入
					self.fs.writeFileSync(_node.rel.path,_node.relData);
				}
			}
		}
		writeFiles(this.fileMap.tree);
	}

	//判断是否为js,html,css,json,htm,txt
	this.getIsTextCodeFile = function(_suffixName){
		if(_suffixName === 'js'
					|| _suffixName === 'css'
					|| _suffixName === 'html'
					|| _suffixName === 'htm'
					|| _suffixName === 'txt'
					|| _suffixName === 'json'){
			return true;
		}
		return false;
	}

	//获取相对路径
	this.getRelativePath = function(_configPath,_filePath){
		return _filePath.replace(_configPath,'');
	}


	//项目文件树
	//tree:{},
	////所有文件列表
	//list:[],
	////入口点页面
	//entryPages:{hash:{},arr:[]},
	////物理路径哈希表
	//pathHashList:{},
	////HOST路径哈希表
	//HostHashList:{}

	//删除目标文件或文件夹
	this.deleteFile = function(_targetNode){
		//判断文件是否存在
		if(typeof self.fileMap.pathHashList[_targetNode.relativePath] !== 'undefined'){
	//		//从树中删除节点
	//		var parent = _targetNode.parent;
	//		var newArr = [];
	//		for(i=0;i<parent.children.length;i++){
	//			var item = parent.children[i];
	//			if(_targetNode !== item){
	//				newArr.push(item);
	//			}
	//		}
	//		//解除和上级的链接
	//		_targetNode.parent = null;
	//		parent.children = newArr;
//
	//		
	//		//物理路径哈希表中删除节点
	//		delete self.fileMap.pathHashList[_targetNode.relativePath];
	//		//HOST路径哈希表中删除节点
	//		delete self.fileMap.HostHashList[_targetNode.relativeHost];
	//		
	//		//从列表中删除节点
	//		var newList = [];
	//		for(var i=0;i<self.fileMap.list.length;i++){
	//			var fi = self.fileMap.list[i];
	//			if(fi !== _targetNode){
	//				newList.push(fi);
	//			}
	//		}
	//		self.fileMap.list = newList;
	//	}
//
	//	//操作入口点
	//	if(typeof self.fileMap.entryPages.hash[_targetNode.relativePath] !== 'undefined'){
	//		delete self.fileMap.entryPages.hash[_targetNode.relativePath];
	//		var newEList = [];
	//		for(var i=0;i<self.fileMap.entryPages.arr.length;i++){
	//			var fi = self.fileMap.entryPages.arr[i];
	//			if(fi !== _targetNode){
	//				newEList.push(fi);
	//			}
	//		}
	//		self.fileMap.entryPages.arr = newEList;
			self.fileMap.pathHashList[_targetNode.relativePath].isDeleted = true;
		}

	}

	//创建文件夹并返回创建的文件夹
	this.createForder = function(_targetNode,_forderName){
		if(_targetNode.isforder === false){
			return 0;
		}
		for(var i=0;i<_targetNode.children.length;i++){
			if(_targetNode.children[i].name === _forderName){
				return 0;
			}
		}

		var forder =  {
			name:_forderName,
			suffixName:'',
			isforder:true,
			relativePath:_targetNode.relativePath+'\\'+_forderName,
			relativeHost:_targetNode.relativeHost+'/'+_forderName,
			parent:_targetNode,
			src:{
				path:'N/A',
				host:'N/A',
			},
			rel:{
				path:_targetNode.rel.path+'\\'+_forderName,
				host:_targetNode.rel.host+'/'+_forderName,
			},
			srcData:'',
			relData:'',
		  	children:[]
		};

		_targetNode.children.push(forder);

		self.fileMap.list.push(forder);
		self.fileMap.pathHashList[forder.relativePath] = forder;
		self.fileMap.HostHashList[forder.relativeHost] = forder;

		return forder;
	}

	//创建文件并返回文件
	this.createFile = function(_targetNode,_fileName,_suffixName,_data){
		if(_targetNode.isforder === false){
			return 0;
		}
		for(var i=0;i<_targetNode.children.length;i++){
			if(_targetNode.children[i].name === _fileName && _targetNode.children[i].suffixName === _suffixName){
				return 0;
			}
		}
		var file ={
			name:_fileName,
			suffixName:_suffixName,
			isforder:false,
			relativePath:_targetNode.relativePath+'\\'+_fileName+'.'+_suffixName,
			relativeHost:_targetNode.relativeHost+'/'+_fileName+'.'+_suffixName,
			parent:_targetNode,
			src:{
				path:'N/A',
				host:'N/A',
			},
			rel:{
				path:_targetNode.rel.path+'\\'+_fileName+'.'+_suffixName,
				host:_targetNode.rel.host+'/'+_fileName+'.'+_suffixName,
			},
			srcData:'N/A',
			relData:_data,
		  	children:[]
		}
		_targetNode.children.push(file);

		self.fileMap.list.push(file);
		self.fileMap.pathHashList[file.relativePath] = file;
		self.fileMap.HostHashList[file.relativeHost] = file;

		if(file.relData.indexOf('<!--ArrowCommand:EntryPage-->') === 0){
			self.fileMap.entryPages.hash[file.relativePath] = file;
			self.fileMap.entryPages.arr.push(file);
		}
		return file;
	}

	//处理入口点页面
	this.handleEnteryPageScript = function(_callBack){
		for(var i=0;i<this.fileMap.entryPages.arr.length;i++){
			var fi = this.fileMap.entryPages.arr[i];
			var scriptList = fi.relData.match(/\<script(\s|\S)*?\<\/script\>/g);
			if(scriptList === null){
				continue;
			}
			for(var j=0;j<scriptList.length;j++){
				var scriptItem = scriptList[j];
				if(scriptItem.match(/\<script.*(src=){1,}?.*\>\<\/script\>/g) === null){
					var result = '<script type="text/javascript" >'+_callBack(scriptItem.replace(/^\<script(\s|\S)*?\>/,'').replace(/\<\/script\>$/,''))+'</script>';
					fi.relData = fi.relData.replace(scriptItem,function(){
					    return '{{{replace：Tag：ps}}}';
					});
					//在result中如果存在“$&”这样的字符，在使用replace的时候，会将替换字符反向替换到result中去，这时候需要做一些处理
					fi.relData = fi.relData.replace('{{{replace：Tag：ps}}}',function(){
					    return result;
					});
				}
			}
		}
	}

	//处理入口点页面的外部链接
	this.handleEnteryPageOuterScript = function(_callBack){
		for(var i=0;i<this.fileMap.entryPages.arr.length;i++){
			var fi = this.fileMap.entryPages.arr[i];
			var scriptList = fi.relData.match(/\<script.*(src=){1,}?.*\>\<\/script\>/g);
			if(scriptList === null){
				continue;
			}
			for(var j=0;j<scriptList.length;j++){
				var scriptItem = scriptList[j];
				var result = _callBack(scriptItem);
				fi.relData = fi.relData.replace(scriptItem,function(){
				    return '{{{replace：Tag：outer}}}';
				});
				fi.relData = fi.relData.replace('{{{replace：Tag：outer}}}',function(){
				    return result;
				});
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

module.exports = releaseCompiler;








































































