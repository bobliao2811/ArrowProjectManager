//文件夹名称以及文件名称加密处理器
//廖力(bobliao)
//编写于2019年11月05日
//对发布的文件以及文件夹进行加密，并且替换文件内容里的引用路径
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
let fileNameComplier;
fileNameComplier = function (_config, _parent) {
	var self = this;
	this.parent = _parent;
	this.config = _config;

	this.md5 = require(this.parent.app.getAppPath() + '\\scripts\\controllerScripts\\com\\md5.js');
	this.CryptoJS = require(this.parent.app.getAppPath() + '\\scripts\\controllerScripts\\com\\CryptoJS.js');
	this.packer = require(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\packer.js');

	this.currentConfig = this.config.currentConfig;
	this.projectConfig = this.config.projectConfig;
	this.successCall = this.config.successCall;
	this.errorCall = this.config.errorCall;
	this.messageCall = this.config.messageCall;

	this.fileAesKey = 18681449125;
	this.fileAesvi = 807352267070;

	this.reg = {
		findUrl: /(http\:|https\:|)\/\/(\s|\S)*?\.(js|css|html|htm)|[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html|htm)/g,
		findUrlForCss:/(http\:|https\:|)\/\/(\s|\S)*?\.(js|css|html|htm)|[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html|htm)/g,
	}

	this.init = function () {
		try{
			//如果勾选上了文件名称加密
			if (this.currentConfig.otherSettings.AESEncryptionFileNameAndForderName === true) {
				this.messageCall('正在处理文件名称加密:AESEncryptionFileNameAndForderName');
				this.handleFileName();
			}
		}catch(_e){
			this.errorCall('文件夹名称以及文件名称加密处理器发生未知错误::'+_e.message);
		}

		this.successCall();
	}

	//处理文件名称的加密
	this.handleFileName = function () {
		//文件夹以及文件名称加密算法概述
		//1.循环所有文件，找到文件内的站内引用并剥离出来进行加密，之后替换文件内的相应引用
		//2.第一步执行完成之后，对该文件对象的 item.rel.path 字段进行拆分加密。
		var newItems = [];
		for (var i = 0; i < this.parent.fileMap.list.length; i++) {
			var item = this.parent.fileMap.list[i];
			//判断文件为文本类型的文件
			if (item.suffixName === 'html'
				|| item.suffixName === 'htm'
				|| item.suffixName === 'css'
				|| item.suffixName === 'js') {
				//如果是文本类型的文件就进入对里面的引用进行加密
				this.findOutUrlsAndChange(item,item.suffixName, function (_url) {
					var urlArr = _url.split('/');
					var finalUrl = '';
					for (var j = 0; j < urlArr.length; j++) {
						var ui = urlArr[j];
						var suffix = ui.split('.')[ui.split('.').length - 1];
						if(ui.split('.').length === 1){
							suffix = undefined;
						}

						if (ui !== '') {
							if (j === urlArr.length - 1) {
								var namme = '';
								for (var kn = 0; kn < ui.split('.').length - 1; kn++) {
									namme += ui.split('.')[kn];
								}
								ui = namme;
							}
							finalUrl += '/' + self.fileNameEncrypt(ui, self.fileAesKey, self.fileAesvi);
							if (j === urlArr.length - 1) {
								finalUrl += '.' + suffix;
							}
						}
					}
					return finalUrl;
				});
			}

			//更改除图片以外所有文件的文件名称以及路径
			if(item.suffixName !== 'jpg'
				&&item.suffixName !== 'png'
				&&item.suffixName !== 'jpeg'
				&&item.suffixName !== 'gif'
				&&item.suffixName !== 'tiff'
				&&item.suffixName !== 'bmp'
				){
				//更改物理路径的加密
				var rPath = this.parent.getRelativePath(this.currentConfig.toPath, item.rel.path);
				var pathArr = rPath.split('\\');
				var finalPath = '';
				for (var j = 0; j < pathArr.length; j++) {
					var pi = pathArr[j];
					var suffix = pi.split('.')[pi.split('.').length - 1];
					if(pi.split('.').length === 1){
						suffix = undefined;
					}
					if (pi !== '') {
						if (j === pathArr.length - 1) {
							var namme = '';
							for (var kn = 0; kn < pi.split('.').length - 1; kn++) {
								namme += pi.split('.')[kn];
							}
							pi = namme;
						}
						finalPath += '\\' + self.fileNameEncrypt(pi, self.fileAesKey, self.fileAesvi);
						if (j === pathArr.length - 1 && typeof suffix !== 'undefined') {
							finalPath += '.' + suffix;
						}
					}
				}

				//更改host的加密
				var rHost = this.parent.getRelativePath(this.currentConfig.toHost, item.rel.host);
				var hostArr = rHost.split('/');
				var finalHost = '';
				for (var j = 0; j < hostArr.length; j++) {
					var hi = hostArr[j];
					var suffix = hi.split('.')[hi.split('.').length - 1];
					if(hi.split('.').length === 1){
						suffix = undefined;
					}
					if (hi !== '') {
						if (j === hostArr.length - 1) {
							var namme = '';
							for (var kn = 0; kn < hi.split('.').length - 1; kn++) {
								namme += hi.split('.')[kn];
							}
							hi = namme;
						}
						finalHost += '/' + self.fileNameEncrypt(hi, self.fileAesKey, self.fileAesvi);
						if (j === hostArr.length - 1 && typeof suffix !== 'undefined') {
							finalHost += '.' + suffix;
						}
					}
				}

				//更改的时候需要检测是否为入口点文件
				//如果是入口点文件就需要复制一份原始文件名的版本出来，避免单独浏览的时候出现无法访问的问题
				var parent = item.parent;
				if(item.relData.indexOf('<!--ArrowCommand:EntryPage-->') !== -1){
					item.parent = '';
					var copy = JSON.parse(JSON.stringify(item));
					copy.parent = parent;
					newItems.push(copy);
					parent.children.push(copy);
				}
				item.parent = parent;
				item.rel.path = this.currentConfig.toPath + finalPath;
				item.rel.host = this.currentConfig.toHost + finalHost;
			}
		}

		for(var  i=0;i<newItems.length;i++){
			this.parent.fileMap.list.push(newItems[i]);
			this.parent.fileMap.entryPages.arr.push(newItems[i]);
		}

	}

	//查找url
	this.findOutUrlsAndChange = function (_file,_suffixName, _callBack) {
		var code = _file.relData;

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

		//从文件里找到所有的引用链接
		var urls =[];
		if(_suffixName === 'css'){
			urls = code.match(this.reg.findUrlForCss);
		}else{
			urls = code.match(this.reg.findUrl);
		}
		if(urls !== null) {
			//去除url里的引号
			//判断url引用是否为站内引用
			for (var i = 0; i < urls.length; i++) {
				var ui = urls[i];
				var srcUrl = urls[i];
				ui = ui.replace(/(\'|\"|\`)/g, '');
				srcUrl = srcUrl.replace(/(\'|\"|\`)/g, '');
				if (ui.match(/^(http\:|https\:|)\/\//) === null && ui.match(/^\//) === null) {
					ui = "/" + ui;
				}
				ui = self.parent.getRelativePath(self.currentConfig.toHost, ui);

				//查找到相应的文件并回调
				var combineItem = self.parent.fileMap.HostHashList[ui];
				if (typeof combineItem !== 'undefined') {
					//讲路径传进去进行操作
					//操作完成后替换回去
					var result = _callBack(ui);
					_file.relData = _file.relData.replace(new RegExp(srcUrl,'g'), function () {
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


	//加密文件名的关键算法
	this.fileNameEncrypt = function (word, key, vi) {
		var ak = this.CryptoJS.CryptoJS.enc.Utf8.parse(key);
		var ai = this.CryptoJS.CryptoJS.enc.Utf8.parse(vi);
		var srcs = this.CryptoJS.CryptoJS.enc.Utf8.parse(word);
		var encrypted = this.CryptoJS.CryptoJS.AES.encrypt(srcs, ak, {
			iv: ai,
			mode: this.CryptoJS.CryptoJS.mode.CBC,
			padding: this.CryptoJS.CryptoJS.pad.Pkcs7
		});
		return this.md5(encrypted.ciphertext.toString().toUpperCase());
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


};

module.exports = fileNameComplier;
