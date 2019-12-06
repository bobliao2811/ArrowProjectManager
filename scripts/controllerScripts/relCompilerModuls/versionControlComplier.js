//url处理器
//廖力(bobliao)
//编写于2019年10月29日
//版本控制器
//发布编译器

/*
模块逻辑概述:
	版本控制器

	//参数：_config
	currentConfig:this.rConfig,
	projectConfig:this.config,
	successCall:function(){},
	errorCall:function(_e){},
	messageCall:function(){}


	currentConfig
	-----------------------------------
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
		combineEngineToEntryPages:true,
		combineHtmlAndCssToMainOfModul:true,
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
		CDNImagesHandle:false,
		CDNImageHost:'',
		CDNImageRelPath:''
	},
	otherSettings:{
		compressEntryPage:false,
		AESEncryptionFileNameAndForderName:false
	}
	------------------------------------------

	projectConfig
	------------------------------------------
	"devHost": "http://localhost:80/testArrowWorkSpace/ES67NodeSharp",
	"devMode": "1",
	"id": "badfdaabe04088986035ff38e35d73e1",
	"isCompileES6Codes": true,
	"orgConfig": {
		"devMode": "1",
		"host": "http://localhost:80/testArrowWorkSpace/",
		"id": "badfdaabe04088986035ff38e35d73e1",
		"path": "J:\work\testArrowWorkSpace",
		"projectHost": "http://localhost:80/testArrowWorkSpace/ES67NodeSharp",
		"projectName": "ES67NodeSharp",
		"projectPath": "J:\work\testArrowWorkSpace\ES67NodeSharp"
	},
	"projectName": "ES67NodeSharp",
	"projectPath": "J:\work\testArrowWorkSpace\ES67NodeSharp",
	"releaseConfig": {}
*/

'use strict';
const urlCompiler = function(_config,_parent){
	var self = this;
	this.parent = _parent;
	this.config = _config;

	this.packer = require(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\packer.js');

	this.currentConfig = this.config.currentConfig;
	this.projectConfig = this.config.projectConfig;
	this.successCall = this.config.successCall;
	this.errorCall = this.config.errorCall;
	this.messageCall = this.config.messageCall;

	this.reg = {
		findUrl: /(http\:|https\:|)\/\/(\s|\S)*?\.(js|css|html|htm|jpg|png|jpeg|gif|tiff|bmp)(\?(\s|\S)*?(\'|\"|\`|\))|)|[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html|htm|jpg|png|jpeg|gif|tiff|bmp)(\?(\s|\S)*?(\'|\"|\`|\))|)/g,
		findUrlForCss:/(http\:|https\:|)\/\/(\s|\S)*?\.(js|css|html|htm|jpg|png|jpeg|gif|tiff|bmp)(\?(\s|\S)*?(\'|\"|\`|\))|)|[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html|htm|jpg|png|jpeg|gif|tiff|bmp)(\?(\s|\S)*?(\'|\"|\`|\))|)/g,
	}

	this.init = function(){
		try{
			//设置版本号
			this.setVersion();
		}catch(_e){
			this.errorCall('url处理器未知错误::'+_e.message);
		}
		//调用成功回调函数
		this.successCall();
	}

	//设置版本号
	this.setVersion = function(){
		//先设置主版本号
		for(var i = 0;i<this.parent.fileMap.list.length; i++  ){
			var fItem  = this.parent.fileMap.list[i];
			//如果又不是文件夹，又是代码文件就进行处理
			if((fItem.isforder === false)&&(self.parent.getIsTextCodeFile(fItem.suffixName))){
				this.messageCall('正在处理版本号：'+fItem.src.path);
				self.findOutUrlsAndChange(fItem,fItem.suffixName,function(_url,_condition){
					if(_condition === ''){
						return _url +'?__av='+self.currentConfig.versionControl.mainVersion;
					}else{
						return _url +'?__av='+self.currentConfig.versionControl.mainVersion+'&'+_condition;
					}
				});
			}
		}

		//处理增量发布
		//如果配置为增量发布，就要开始增量
		if(self.currentConfig.versionControl.isIncrementalRelease === true){
			//先给所有增量包都用倒序排列
			//排序的key为发布时间
			self.currentConfig.versionControl.incrementalQueue = self.currentConfig.versionControl.incrementalQueue.sort(function(a,b){
				return a.date - b.date;
			});

			for(var i=0; i<self.currentConfig.versionControl.incrementalQueue.length;i++){
				this.messageCall('正在处理增量发布..');
				var qItem = self.currentConfig.versionControl.incrementalQueue[i];
				self.handleIrRelease(qItem);
				this.messageCall('增量处理完成!');
			}

		}

	}
	
	//处理某个增量版本的文件
	this.handleIrRelease = function(_qItem){
		//循环这个版本的所有文件列表
		for(var i=0;i<_qItem.fileList.length;i++){
			var fi = self.parent.fileMap.pathHashList[_qItem.fileList[i]];
			//拿到文件列表当中的每一个文件，并判断它是否在项目中
			//如果在项目中的话，就在项目的所有文件中查找引用了这个文件的链接
			//并更新链接中的版本号
			if(typeof fi !== "undefined" && (fi.isforder === false)){
				this.findUrlWithUrl(fi,_qItem);
			}
		}
	}

	//查找所有页面的引用
	this.findUrlWithUrl = function(_fi,_qItem){
		for(var i = 0;i<this.parent.fileMap.list.length;i++){
			var fItem  = this.parent.fileMap.list[i];
			//如果又不是文件夹，又是代码文件就进行处理
			if((fItem.isforder === false)&&(self.parent.getIsTextCodeFile(fItem.suffixName))){
				var isHasUrl = false;
				self.findOutUrlsAndChange(fItem,fItem.suffixName,function(_url,_condition){
					if(_url === _fi.rel.host || _url === self.parent.getRelativePath(self.currentConfig.toHost, _fi.rel.host).replace(/^\//,'')|| _url === self.parent.getRelativePath(self.currentConfig.toHost, _fi.rel.host)){
						var conditionArr = _condition.split('&');
						var newCondition = '';
						for(var k in conditionArr){
							if(conditionArr[k].indexOf('__av') === -1){
								newCondition += '&'+conditionArr[k];
							}
						}
						isHasUrl = true;
						return _url + '?__av='+ +self.currentConfig.versionControl.mainVersion+'_'+_qItem.version +  newCondition;
					}else{
						return _url + '?'+_condition;
					}
				});
				if(isHasUrl === true){
					//如果发现此文件有引用，那么此文件也需要进行增量
					this.findUrlWithUrl(fItem,_qItem);
				}
			}
		}
	}

	//查找url
	this.findOutUrlsAndChange = function (_file,_suffixName, _callBack) {
		var code = _file.relData;
		//从文件里找到所有的引用链接
		var urls =[];

		if(_file.suffixName === 'js'){
            code = self.packer.pack(code.replace(/\/\*(\s|\S)*?\*\//g,'').replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g,'').replace(/\<\!\-\-(\s|\S)*?\-\-\>/g,'').replace(/\/\*(\s|\S)*?\*\//g,''));
        }
        if(_file.suffixName === 'html' || _file.suffixName === 'htm'){
            code = code.replace(/\<\!\-\-(\s|\S)*?\-\-\>/g,'').replace(/\/\*(\s|\S)*?\*\//g,'');
            code = self.packer.minify(code);
        }
        if(_file.suffixName === 'css'){
            code = this.lCSSCoder.pack(code);
        }

		if(_suffixName === 'css'){
			urls = code.match(this.reg.findUrlForCss);
		}else{
			urls = code.match(this.reg.findUrl);
		}
		if(urls !== null) {

			//去重url
			urls = this.removeDuplicate(urls,function(a,b){
				return a !== b;
			});

			//去除url里的引号
			//判断url引用是否为站内引用
			for (var i = 0; i < urls.length; i++) {
				var ui = urls[i];
				var srcUrl = urls[i];
				ui = ui.replace(/(\'|\"|\`|\))/g, '');
				srcUrl = srcUrl.replace(/(\'|\"|\`|\))/g, '');
				if (ui.match(/^(http\:|https\:|)\/\//) === null && ui.match(/^\//) === null) {
					ui = "/" + ui;
				}
				ui = self.parent.getRelativePath(self.currentConfig.toHost, ui);
				var condition = '';
				if(ui.indexOf('?') !==  -1){
					condition = ui.split('?')[1];
					ui = ui.split('?')[0];
				}

				//查找到相应的文件并回调
				var combineItem = self.parent.fileMap.HostHashList[ui];
				if (typeof combineItem !== 'undefined') {
					//讲路径传进去进行操作
					//操作完成后替换回去
					var result = _callBack(ui,condition);
					if(srcUrl.indexOf('"') !==-1){
						result += '"';
					}
					if(srcUrl.indexOf("'") !==-1){
						result += "'";
					}
					if(srcUrl.indexOf(")") !==-1){
						result += ")";
					}
					if(srcUrl.indexOf('`') !==-1){
						result += '`';
					}
					_file.relData = _file.relData.replace(new RegExp(srcUrl.replace(/\?/g,'\\?').replace(/\_/g,'\\_'),'g'), function () {
						if(srcUrl.indexOf(self.currentConfig.toHost) !== -1){
							return self.currentConfig.toHost + result;
						}else{
							return result.replace(/^\//,'');
						}
					})
				}
			}
		}
	}


	//去重算法
    this.removeDuplicate = function(array,callBack) {
	    if(typeof callBack === 'undefined'){
	        callBack = function(a,b){
	            return JSON.stringify(a) !== JSON.stringify(b);
	        }
	    }
	    var array = array;
	    //再去重
	    var j = 0;
	    for(var k=0;k<99999999;k++) {
	        var tempArr = [];
	        for (var i = 0; i < array.length; i++) {
	            if (i === j ) {
	                tempArr.push(array[j]);
	                continue;
	            }
	            if (callBack(array[i],array[j])) {
	                tempArr.push(array[i]);
	            }
	        }
	        array = tempArr;
	        if (!array[j + 1]) {
	            break;
	        }
	        j++;
	    }
	    return array;
	};

	//css处理器
	this.lCSSCoder = {
        format: function (s) {//格式化代码
            s = s.replace(/\s*([\{\}\:\;\,])\s*/g, "$1");
            s = s.replace(/;\s*;/g, ";"); //清除连续分号
            s = s.replace(/\,[\s\.\#\d]*{/g, "{");
            s = s.replace(/([^\s])\{([^\s])/g, "$1 {\n\t$2");
            s = s.replace(/([^\s])\}([^\n]*)/g, "$1\n}\n$2");
            s = s.replace(/([^\s]);([^\s\}])/g, "$1;\n\t$2");
            if ($("#chk").prop("checked")) {
                s = s.replace(/(\r|\n|\t)/g, "");
                s = s.replace(/(})/g, "$1\r\n");
            }
            return s;
        },
        pack: function (s) {//压缩代码
            s = s.replace(/\/\*(.|\n)*?\*\//g, ""); //删除注释
            s = s.replace(/\s*([\{\}\:\;\,])\s*/g, "$1");
            s = s.replace(/\,[\s\.\#\d]*\{/g, "{"); //容错处理
            s = s.replace(/;\s*;/g, ";"); //清除连续分号
            s = s.match(/^\s*(\S+(\s+\S+)*)\s*$/); //去掉首尾空白
            return (s == null) ? "" : s[1];
        }
    };


}

module.exports = urlCompiler;
