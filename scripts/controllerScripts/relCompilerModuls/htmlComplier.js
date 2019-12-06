//html处理器
//廖力(bobliao)
//编写于2019年11月10日
//将发布目录中所有的html入口点页面进行压缩
//发布编译器

/*
模块逻辑概述:
	将发布目录中所有的html入口点页面进行压缩

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

	this.init = function(){
		try{
			if(this.currentConfig.otherSettings.compressEntryPage === true){
				this.messageCall('正在处理html压缩:otherSettings.compressEntryPage');
				this.handelHtml();
			}
		}catch(_e){
			this.errorCall('html处理器发生未知错误::'+_e.message);
		}

		//调用成功回调函数
		this.successCall();
	}

	//处理html
	this.handelHtml = function(){
		for(var i=0;i<this.parent.fileMap.entryPages.arr.length;i++){
			var fi = this.parent.fileMap.entryPages.arr[i];
			fi.relData =  self.packer.minify(fi.relData).replace(/\<\!\-\-(\s|\S)*?\-\-\>/g,'').replace(/\/\*(\s|\S)*?\*\//g,'');
		}
	}
}

module.exports = urlCompiler;
