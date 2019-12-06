//url处理器
//廖力(bobliao)
//编写于2019年10月29日
//将发布目录中所有的资源引用的url转换成发布url,并加上版本号
//发布编译器

/*
模块逻辑概述:
	将发布目录中所有的资源引用的url转换成发布url

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

	this.currentConfig = this.config.currentConfig;
	this.projectConfig = this.config.projectConfig;
	this.successCall = this.config.successCall;
	this.errorCall = this.config.errorCall;
	this.messageCall = this.config.messageCall;

	this.init = function(){
		try{
			//将文件中的调试url处理成发布的url
			this.handelUrls();
		}catch(_e){
			this.errorCall('url处理器生未知错误::'+_e.message);
		}
		//调用成功回调函数
		this.successCall();
	}

	//处理url
	this.handelUrls = function(){

		var reg = new RegExp(this.currentConfig.fromHost,'g');
		for(var i = 0;i<this.parent.fileMap.list.length; i++  ){
			var fItem  = this.parent.fileMap.list[i];
			//如果又不是文件夹，又是代码文件就进行处理
			if((fItem.isforder === false)&&(self.parent.getIsTextCodeFile(fItem.suffixName))){
				this.messageCall('正在处理url:文件：'+fItem.src.path);
				//将文件中的调试环境的url改成发布环境的url
				fItem.relData = fItem.relData.replace(reg,function(){
					return self.currentConfig.toHost;
				});
			}
		}

		//处理url的同时把入口点页面的hotLoader也去掉
		this.parent.handleEnteryPageOuterScript(function(_fregement){
			if(_fregement.indexOf('arrowHotLoader.js') !== -1){
				return ''
			}
			return _fregement;
		});
	}
}

module.exports = urlCompiler;
