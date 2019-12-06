//cdn图片处理器处理器
//廖力(bobliao)
//编写于2019年10月31日
//处理图片雪碧图/处理图片cdn发布
//发布编译器

/*
模块逻辑概述:
	处理图片cdn发布目录和url

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
const imageComplier = function(_config,_parent){
	var self = this;
	this.parent = _parent;
	this.config = _config;

	this.tinify = require("tinify");
	this.tinify.key = '';

	this.currentConfig = this.config.currentConfig;
	this.projectConfig = this.config.projectConfig;
	this.successCall = this.config.successCall;
	this.errorCall = this.config.errorCall;
	this.messageCall = this.config.messageCall;


	this.reg = {
		//查找样式类中的内容
		findImageUrl: new RegExp("((http\:|https\:|)//([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-\+]*)?\.(png|jpg|bmp|gif|jpeg|tiff)","g"),
		//匹配图片类型
		findImageType:/(png|jpg|bmp|gif|jpeg|tiff)/g
	}

	this.init = function(){

		var keep = function (){
			try{
				//如果选中图像cdn加速处理就执行
				if(self.currentConfig.imagesSettings.CDNImagesHandle === true){
					self.messageCall('正在处理cdn图片发布:imagesSettings.CDNImagesHandle');
					//处理cnd图片发布
					self.handleCDNImages();
				}
			}catch(_e){
				this.errorCall('cdn图片处理器处理器发生未知错误::'+_e.message);
			}
			//调用成功回调函数
			self.successCall();
		}

		//如果选中自动压缩图片就执行图片压缩处理
		if(this.currentConfig.imagesSettings.usingTinify){
			self.messageCall('正在对图片进行压缩:imagesSettings.usingTinify');
			//如果key存在的话
			if(this.currentConfig.imagesSettings.usingTinifyKey.length === 32){
				this.tinify.key = this.currentConfig.imagesSettings.usingTinifyKey;
				this.handleTinify(function(){
					keep();
				});
			}else{
				this.errorCall('图片tiniPNG选项失效:key填写无效!');
				keep();
			}
		}else{
			keep();
		}
	}

	//处理图片压缩
	this.handleTinify = function(_callBack){
		//把图片全部找出来
		var images = [];
		var finishCount = 0;
		for(var i=0;i<this.parent.fileMap.list.length;i++){
			var fi = this.parent.fileMap.list[i];
			//如果是图片类型就将其提出并对其数据进行压缩处理
			if(fi.suffixName.match(this.reg.findImageType) !== null ){
				images.push(fi);
			}
		}

		for (var i=0;i<images.length;i++) {
			var fi = images[i];
			(function(fi){
				self.tinify.fromBuffer(fi.relData).toBuffer(function(err, resultData) {
					if(err){
						self.errorCall('压缩图片时(tinify)出现错误!来自图片:('+fi.src.path+'),错误信息:'+err.message);
					}else{
						fi.relData = resultData
					}

					finishCount++;
					if(finishCount === images.length){
						_callBack();
					}
				});
			})(fi)
		}
	}

	//处理cdn图片发布
	this.handleCDNImages = function(){
		//图片cdn处理的逻辑是遍历整个项目中的css,html,js
		//并且拿出其中的图片链接，
		//将图片链接转换成本地地址，从地址中读取具体的图片文件
		//将这些图片文件转移到cnd目标发布目录，转移到目录中去之后要更改图片的名称防止同名文件
		//并且更改css中的图片文件访问路径和名称

		//开始遍历图片
		for(var i=0;i<this.parent.fileMap.list.length;i++){
			var fi = this.parent.fileMap.list[i];
			//判断文件类型为css,并且判断内容中包含图片引用
			if((
				fi.suffixName === 'css' 
				||fi.suffixName === 'js'
				||fi.suffixName === 'html'
				||fi.suffixName === 'htm'
				) && (fi.relData.match(this.reg.findImageType) !== null)){
				//将css取出
				var currentCss = fi;
				//处理css中的图片地址
				var result = this.handleImgPathIncss(currentCss);
				if(result === null){
					continue;
				}
			}
		}
	}

	//处理css中的图片地址
	this.handleImgPathIncss = function(_cssFile){
		var reg = this.reg.findImageUrl;
		var timages = _cssFile.relData.match(reg);
		var images = [];
		var result = {};
		//排除非本域下的图片引用
		if(timages !== null){
			//排除不属于本域名下的图片
			for(var vi=0;vi<timages.length;vi++){
				var item = timages[vi];
				if(item.indexOf(this.currentConfig.toHost) !== -1){
					images.push(item);
				}
			}
			if(images.length === 0){
				return null;
			}

			for(var ii=0;ii<images.length;ii++){
				var imNames = images[ii].replace(this.currentConfig.toHost,'').split('/');
				var finalName = '';
				//组装新的名称
				for(var j=2;j<imNames.length;j++){
					finalName += '_'+imNames[j]
				}
				//修改图片位置
				var result = this.handleImage(images[ii],finalName);
				if(result === null){
					this.errorCall('图片:“'+images[ii]+'”不存在！跳过发布!来自：'+_cssFile.src.path);
					continue;
				}
				_cssFile.relData = _cssFile.relData.replace(RegExp(images[ii],'g'),function(){
					return result.rel.host;
				});
			}

		}
		return null;
	}

	//处理保存图片
	this.handleImage = function(_sourceHost,_finalName){
		var rPath = self.parent.getRelativePath(this.currentConfig.toHost,_sourceHost);
		var image = self.parent.fileMap.HostHashList[rPath];
		if(typeof image === 'undefined'){
			return null;
		}else{
			image.rel.path = this.currentConfig.imagesSettings.CDNImageRelPath + '\\'+_finalName;
			image.rel.host = this.currentConfig.imagesSettings.CDNImageHost + '/'+_finalName;
			return image;
		}
	}
}

module.exports = imageComplier;
