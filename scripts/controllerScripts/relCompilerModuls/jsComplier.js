//js处理器
//廖力(bobliao)
//编写于2019年11月01日
//
//发布编译器

/*
模块逻辑概述:
	处理js文件，html入口页面中js的一般压缩
	去除js文件，html入口页面中js的调试代码块
	处理js文件，html入口页面中js的Eval混淆
	处理js文件，html入口页面中js的代码加密

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
const jsComplier = function(_config,_parent){
	var self = this;
	this.parent = _parent;
	this.config = _config;

	this.md5 = require(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\md5.js');
	this.LZString = require(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\LZString.js');
	this.converter = require(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\converter.js');
	this.CryptoJS = require(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\CryptoJS.js');

	this.packer = require(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\packer.js');
	this.compressor = require('uglify-js');
	this.fs = require('fs');

	//载入需要注入到页面中的加密引擎
	//加密代码引擎
	this.crypto_rel_hook = this.fs.readFileSync(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\crypto_engine_forRelease.js',"utf-8");
	this.LZString_rel_hook = this.fs.readFileSync(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\LZString_engine_forRelease.js',"utf-8");
	this.rel_key = this.parent.getRand(10000000,99999999);
	this.rel_vi = this.parent.getRand(100000000,999999999);
	this.decodeSrtrings = '';

	this.currentConfig = this.config.currentConfig;
	this.projectConfig = this.config.projectConfig;
	this.successCall = this.config.successCall;
	this.errorCall = this.config.errorCall;
	this.messageCall = this.config.messageCall;

	this.init = function(){
		try{

			//去除js文件，html入口页面中js的调试代码块
			if(this.currentConfig.javaScriptSettings.clearDebugCode === true){
				this.messageCall('正在去除调试代码块javaScriptSettings.clearDebugCode');
				this.clearDebugCode();
			}

			//处理一般压缩
			if(this.currentConfig.javaScriptSettings.compress === true){
				this.messageCall('正在处理js压缩javaScriptSettings.compress');
				this.compressCode();
			}
			
			//处理js文件，html入口页面中js的Eval混淆
			if(this.currentConfig.javaScriptSettings.evalObfuscation === true){
				this.messageCall('正在进行eval混淆javaScriptSettings.evalObfuscation');
				this.evalCode();
			}

			//处理js文件，html入口页面中js的代码加密
			if(this.currentConfig.javaScriptSettings.AESEncryption === true){
				this.messageCall('正在进行AES加密javaScriptSettings.AESEncryption');
				this.AESForjs();
			}
		}catch(_e){
			this.errorCall('js处理器发生未知错误::'+_e.message);
		}

		this.successCall();
	}

	//AES加密js代码
	this.AESForjs = function(){
		//var runCodeReplace = "E"+this.CryptoJS.Encrypt(this.parent.getRand(9999,1000),this.parent.getRand(99999,10000),this.parent.getRand(999999,100000));
		//this.crypto_rel_hook = this.crypto_rel_hook.replace(/window\.runCode/g,this.runCodeReplace);
		this.crypto_rel_hook = this.crypto_rel_hook.replace(/{replace\:ak}/g,this.rel_key);
		this.crypto_rel_hook = this.crypto_rel_hook.replace(/{replace\:ai}/g,this.rel_vi);

		//循环找到所有的js文件并进行处理
		for(var i=0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'js' && (fi.relData.indexOf('<!--ArrowCommand:DoNotTouch-->')  === -1 ) ){
				//进行压缩
				try{
					var result = this.hAesForFileContent(fi.relData,'window.runCode',self.CryptoJS.Encrypt);
					fi.relData = result;
					
				}catch(e){
					self.errorCall('AES加密js代码出现错误！已经跳过该js文件:'+fi.src.path+'错误信息:'+e.message);
				}
			}
		}

		//处理入口点文件的javascript
		this.parent.handleEnteryPageScript(function(_frgement){
			try{
				var result = self.hAesForFileContent(_frgement,'window.runCode',self.CryptoJS.Encrypt);
				return result;
			}catch(e){
				return _frgement;
			}
		});

		//加密完成后向页面注入解密程序
		for(var i=0;i<this.parent.fileMap.entryPages.arr.length;i++){
			var fi = this.parent.fileMap.entryPages.arr[i];
			if(fi.relData.indexOf('<meta http-equiv="X-UA-Compatible" content="IE=8">') !== -1){
				fi.relData = fi.relData.replace('<meta http-equiv="X-UA-Compatible" content="IE=8">','<meta http-equiv="X-UA-Compatible" content="IE=9">\n{{Arrow:lzStringReplace}}\n{{Arrow:cryptoReplace}}\n{{Arrow:execReplace}}');
			}else{
				fi.relData = fi.relData.replace('<head>','<head>\n<meta http-equiv="X-UA-Compatible" content="IE=9">\n{{Arrow:lzStringReplace}}\n{{Arrow:cryptoReplace}}\n{{Arrow:execReplace}}');
			}
			fi.relData = fi.relData.replace('{{Arrow:cryptoReplace}}',function(){
				return "<script>"+  self.packer.pack(self.packer.minify(self.crypto_rel_hook),true,true)+"</script>";
			});
			fi.relData = fi.relData.replace('{{Arrow:lzStringReplace}}',function(){
				return "<script>"+ self.LZString_rel_hook +"</script>";
			});
			fi.relData = fi.relData.replace('{{Arrow:execReplace}}',function(){
				return "<script>"+ self.packer.pack(self.packer.minify(self.decodeSrtrings),true,true) +"</script>";
			});
		}
	}

	//为该js修改后缀名
	this.modifySuffixName = function(_node){
		if(_node.srcData.indexOf('<!--ArrowCommand:DoNotChangeSuffixName-->')!== -1){
			return;
		}
		var totalHost = _node.rel.host;
		var relatevhost = this.parent.getRelativePath(this.currentConfig.toHost,_node.rel.host).replace(/^\//,'');

		_node.rel.path = _node.rel.path.replace(/\.js/g,'.dll');
		_node.rel.host = _node.rel.host.replace(/\.js/g,'.dll');

		 

		 //扫描其它文件，看是否有该js的引用
		 for(var i=0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'js' ){
				if(fi.relData.match(new RegExp(totalHost,'g')) !== null){
					fi.relData = fi.relData.replace(new RegExp(totalHost,'g'),function(){
						return _node.rel.host;
					});
				}
				if(fi.relData.match(new RegExp(relatevhost,'g')) !== null){
					fi.relData = fi.relData.replace(new RegExp(relatevhost,'g'),function(){
						return _node.rel.host;
					});
				}
			}
		}

		//处理入口点文件的javascript
		this.parent.handleEnteryPageScript(function(_frgement){
			if(_frgement.match(new RegExp(totalHost,'g')) !== null){
				_frgement = _frgement.replace(new RegExp(totalHost,'g'),function(){
					return _node.rel.host;
				});
			}
			if(_frgement.match(new RegExp(relatevhost,'g')) !== null){
				_frgement = _frgement.replace(new RegExp(relatevhost,'g'),function(){
					return _node.rel.host;
				});
			}
			return _frgement;
		});
	}

	 //为文件处理aes加密并压缩
    this.hAesForFileContent = function(_content,_runCodeReplace,_encriptFunc){
    	var code = this.converter.convert_hex_to_base64(this.converter.convert_string_to_hex(this.LZString.compress(_runCodeReplace+"('"+_encriptFunc(_content,this.rel_key,this.rel_vi)+"');")).replace(/\n/g,' '));

    	var name = "E"+this.CryptoJS.Encrypt(this.parent.getRand(999,100),this.parent.getRand(99999,10000),this.parent.getRand(999999,100000));
    	var decoderStr = ";function "+name+"(s){return decodeLz64(s);"+name+" = function(_s){return jiema(_s)};};";
    	self.decodeSrtrings+=decoderStr;
    	return name +"('"+code+"');";
    }

	//混淆代码
	this.evalCode = function(){
		//循环找到所有的js文件并进行处理
		for(var i=0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'js' && (fi.relData.indexOf('<!--ArrowCommand:DoNotTouch-->') === -1 ) ){
				//进行压缩
				try{
					var result = self.packer.pack(fi.relData,true,true);
					if(result.error){
						self.errorCall('混淆js代码出现错误！已经跳过该js文件:'+fi.src.path+'错误信息:'+result.message);
					}else{
						fi.relData = result;
					}
				}catch(e){
					self.errorCall('混淆js代码出现错误！已经跳过该js文件:'+fi.src.path+'错误信息:'+e.message);
				}
			}
		}

		//如果使用了eval混淆就要在入口点加上
		//<meta http-equiv="X-UA-Compatible" content="IE=8">
		//来强制用户在使用ie时强制使用ie8的访问模式
		//因为eval混淆之后在ie下就不兼容ie9  ie10 ie11 了
		for(var i=0;i<this.parent.fileMap.entryPages.arr.length;i++){
			var fi = this.parent.fileMap.entryPages.arr[i];
			fi.relData = fi.relData.replace('<head>','<head>\n<meta http-equiv="X-UA-Compatible" content="IE=8">');
		}

		//处理入口点文件的javascript
		this.parent.handleEnteryPageScript(function(_frgement){
			return self.packer.pack(_frgement,true,true);
		});
	}

	//清除调试代码块
	this.clearDebugCode = function(){
		//.match(/\/\/\<\!\-\-debug(\s|\S)*?\/\/\-\-\>.*/g)
		for(var i=0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'js' && fi.relData.match(/\/\/\<\!\-\-debug(\s|\S)*?\/\/\-\-\>.*/g) !== null && (fi.relData.indexOf('<!--ArrowCommand:DoNotTouch-->') === -1) ){
				fi.relData = fi.relData.replace(/\/\/\<\!\-\-debug(\s|\S)*?\/\/\-\-\>.*/g,'');
			}
		}
	}

	//压缩代码
	this.compressCode = function(){
		//循环找到所有的js文件并进行处理
		for(var i=0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'js' && (fi.relData.indexOf('<!--ArrowCommand:DoNotTouch-->')  === -1 ) ){
				//进行压缩
				try{
					var result = self.compressor.minify(fi.relData,{output: {beautify: false},ie8:true});
					if(result.error){
						self.errorCall('压缩js代码出现错误！已经跳过该js文件:'+fi.src.path+'错误信息:'+result.message);
					}else{
						//如果开启了加密就修改后缀名，在这里修改后缀名的原因是
						//如果加密后再修改的话，那些内容都加密了，没法对后缀名进行完整的更改
						//所以在压缩阶段将后缀名进行更改是很重要的
						if(this.currentConfig.javaScriptSettings.AESEncryption === true){
							//为该js修改后缀名
							this.modifySuffixName(fi);
						}
						
						fi.relData = result.code;;
					}
				}catch(e){
					self.errorCall('压缩js代码出现错误！已经跳过该js文件:'+fi.src.path+'错误信息:'+e.message);
				}
			}
		}

		//处理入口点文件的javascript
		this.parent.handleEnteryPageScript(function(_frgement){
			var result = self.compressor.minify(_frgement,{output: {beautify: false},ie8:true});
			if(result.error){
				return _frgement;
			}else{
				return result.code;
			}
		});
	}
}

module.exports = jsComplier;
