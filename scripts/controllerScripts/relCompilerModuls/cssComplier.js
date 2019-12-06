//css处理器
//廖力(bobliao)
//编写于2019年10月02日
//
//发布编译器

/*
模块逻辑概述:
	处理css压缩
	处理css合并
	处理css全部合并

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
const cssComplier = function(_config,_parent){
	var self = this;
	this.parent = _parent;
	this.config = _config;

	this.currentConfig = this.config.currentConfig;
	this.projectConfig = this.config.projectConfig;
	this.successCall = this.config.successCall;
	this.errorCall = this.config.errorCall;
	this.messageCall = this.config.messageCall;

	this.init = function(){

		try{
			//处理合并到common.css
			if(this.currentConfig.cssSettings.combineCssesToCommonCss === true){
				this.messageCall('正在处理合并css到common.css:cssSettings.combineCssesToCommonCss');
				this.combineAllCss();
			}

			//处理一般压缩
			if(this.currentConfig.cssSettings.compress === true){
				this.messageCall('正在处理合并css压缩:cssSettings.compress');
				this.compressCode();
			}
		}catch(_e){
			this.errorCall('css处理器发生未知错误::'+_e.message);
		}

		this.successCall();
	}

	//已合并过的using引用
	this.combinedUsing = {};
	//合并所有css代码到common.css
	this.combineAllCss = function(){
		//先处理using引用
		var totalCss = this.handleUsing(self.parent.fileMap.HostHashList['/common/common.css'].relData,1);
		var cssList = [];
		
		for(var i =0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			
				//合并css
			if(fi.suffixName === 'css' 
				//只合并/compoments下的css
				&& fi.relativeHost.indexOf('/compoments') !== -1
				//只合并项目模块的css
				&& typeof(self.parent.fileMap.HostHashList[fi.relativeHost.replace('css','js')]) !=='undefined'){
				totalCss += this.handleUsing(fi.relData,1);
				cssList.push(fi);
			}
		}

		//删除文件
		for(var i =0;i<cssList.length;i++){
			var fi =cssList[i];
			self.parent.deleteFile(fi);
		}
		

		//检查common.css是否存在，不存在的话就创建
		var commonCss = self.parent.fileMap.HostHashList['/common/common.css'];
		if(typeof commonCss === 'undefined'){
			var commonForder = self.parent.fileMap.HostHashList['/common'];
			if(typeof commonForder == 'undefined'){
				var rootPath = self.parent.fileMap.HostHashList['/'];
				commonForder = self.parent.createForder(rootPath,'common');
			}
			commonCss = self.parent.createFile(commonForder,'common','css','');
		}
		commonCss.relData = totalCss;

		//配置入口页不要拉取模块css
		this.parent.handleEnteryPageScript(function(_frgement){
			if(_frgement.indexOf('window.arrowConfig') !== -1){
				return _frgement.replace('{','{isBlockModulCssRequest:true,')
			}else{
				return _frgement;
			}
		});
	}

	//处理引用
	this.handleUsing = function(_cssStr,_layer){
		var layer = _layer;
		//先将using从文件中匹配出来
		var usingList = _cssStr.match(/\@[ ]{0,}using[ ]{0,}\((\s|\S)*?\)[ ]{0,}\;{0,}/g);
		//如果没有using 就直接返回
		if(usingList === null){
			return _cssStr;
		}

		//有using的话就从usingList中找到引用并返回
        for(var i=0;i<usingList.length;i++){
        	var path = usingList[i].replace(/\@[ ]{0,}using[ ]{0,}\((\'|\"|\`)/,'').replace(/(\'|\"|\`)\)[ ]{0,}\;{0,}/,'');
        	//如果重复引用了就不进行合并操作了
        	if(typeof self.combinedUsing[path] === 'undefined'){
	        	//获得相对路径
	        	var reativePath = self.parent.getRelativePath(self.currentConfig.toHost,path);
	        	//获取文件
	        	var targetFile = self.parent.fileMap.HostHashList[reativePath];

	        	//如果文件不存在
	        	if(typeof targetFile === 'undefined'){
	        		self.messageCall('css文件中引用：'+path+'不存在或不是站内引用，已跳过!');
	        		continue;
	        	}

	        	//文件夹存在的话就检查这个引用的文件内容中是否还存在using
	        	var cssString = self.handleUsing(targetFile.relData,_layer++);

	        	_cssStr = _cssStr.replace(usingList[i],function(){
	        		return cssString;
	        	});

	        	self.combinedUsing[path] = true;
            }else{
				self.messageCall('文件：'+path+'重复合并，已跳过!');
	        	continue;
            }
		}

		return _cssStr;
	}

	//压缩代码
	this.compressCode = function(){
		for(var i =0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'css'){
				fi.relData = this.lCSSCoder.pack(fi.relData);
			}
		}
	}


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

module.exports = cssComplier;
