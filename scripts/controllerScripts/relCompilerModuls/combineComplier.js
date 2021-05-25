//合并处理器
//廖力(bobliao)
//编写于2019年11月02日
//合并发布文件
//发布编译器

/*
模块逻辑概述:
	合并入口页中的各引用
	将组件内容合并到模块主程序
	执行CatchDepsToEntryPage
	执行CatchUsingToEntryPage
	执行CatchDepsHere
	执行CatchUsingHere
	执行CatchModulToEntryPage

	//参数：_config



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
const combineComplier = function(_config,_parent){
	var self = this;
	this.parent = _parent;
	this.config = _config; 

	this.currentConfig = this.config.currentConfig;
	this.projectConfig = this.config.projectConfig;
	this.successCall = this.config.successCall;
	this.errorCall = this.config.errorCall;
	this.messageCall = this.config.messageCall;

	this.packer = require(this.parent.app.getAppPath()+'\\scripts\\controllerScripts\\com\\packer.js');


	this.reg = {
		findUrl:/((\'|\"|\`)http\:|https\:|)\/\/(\s|\S)*?(js|css|html|htm)(\'|\"|\`)|(\'|\"|\`)[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html|htm)(\'|\"|\`)/g,
		findNextLevel:/(\'|\"|\`|)(http\:|https\:|)\/\/(\s|\S)*?(js)(\'|\"|\`)|(\'|\"|\`|)[a-zA-Z0-9\-\_\.\/]*?\.(js)(\'|\"|\`)/g
	}

	this.init = function(){
		
		try{
			//将组件内容合并到模块主程序
			if(this.currentConfig.combineSettings.combineHtmlAndCssToMainOfModul === true){
				self.messageCall('正在处理将组件内容合并到模块主程序:combineSettings.combineHtmlAndCssToMainOfModul');
				this.combineHtmlAndCssToMainOfModul();
			}

			//执行合并所有组件到入口页中命令
			if(this.currentConfig.combineSettings.execCatchModulToEntryPage === true){
				self.messageCall('正在处理执行合并所有组件到入口页中命令:combineSettings.execCatchModulToEntryPage');
				this.execCatchAll();
			}else{
				//执行CatchDepsHere  和 执行CatchUsingHere
				if(this.currentConfig.combineSettings.execCatchDepsHere === true || this.currentConfig.combineSettings.execCatchUsingHere === true){
					self.messageCall('正在处理CatchDepsHere 和 CatchUsingHere');
					this.execCatchHere();
				}
			}

			//如果需要合并入口页中的ArrowJs
			if(this.currentConfig.combineSettings.combineEngineToEntryPages === true){
				self.messageCall('正在处理合并入口页中的ArrowJs:combineSettings.combineEngineToEntryPages ');
				this.combineEngineToEntryPages();
			}
		}catch(_e){
			this.errorCall('合并处理器发生未知错误::'+_e.message);
		}

		this.successCall();
	}

	//执行合并所有组件到入口页中命令
	this.execCatchAll = function(){
		//循环查找所有依赖
		//将依赖全部都递归找出来并进行合并

		//创建合并原始文件
		//因为每次合并都要使用原始文件，避免合并操作被覆盖
		for(var i=0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'js' || fi.suffixName === 'css'|| fi.suffixName === 'html'|| fi.suffixName === 'htm'){
				fi['comSrcData'] = fi.relData;
			}
		}

		//1.从入口点页面开始运行程序
		this.parent.handleEnteryPageScript(function(_fregement){
			return self.combineAll(_fregement);
		});

	}

	//合并全部
	this.combineAll = function(_fregement){
		var thisLevelCombineStr = '';
		var nextLevelArr = [];

		self.findCatchHere(_fregement,function(_targetItem){},function(_inToItem){
			nextLevelArr.push(_inToItem);
		},true);

		//给所有nextLevelItem打上引用标签
		for(var i=0;i<nextLevelArr.length;i++){
			var ni = nextLevelArr[i];
			ni.isTagCombine = true;
		}

		//先往下进行合并
		for(var i=0;i<nextLevelArr.length;i++){
			//因为查找了全部，所以过滤一下
			if(nextLevelArr[i].suffixName === 'js'){
				if(nextLevelArr[i].comSrcData.indexOf('<!--ArrowCommand:DoNotCatchThis-->') === -1){
					nextLevelArr[i].relData = self.combineAll(nextLevelArr[i].comSrcData.replace('define(',' _____'+ nextLevelArr[i].relativeHost.replace(/\//g,'_').replace(/\./g,'_').replace(/\-/g,'_') + '_____ = define('));
				}else{
					nextLevelArr[i].relData = self.combineAll(nextLevelArr[i].comSrcData);
				}
			}
		}

		//搞定下面的合并后再执行本级别的合并
		for(var i=0;i<nextLevelArr.length;i++){
			var ni = nextLevelArr[i];
			if(typeof ni.comSrcData !== 'undefined' && ni.comSrcData.indexOf('<!--ArrowCommand:DoNotCatchThis-->') === -1){
				thisLevelCombineStr += this.makecatchStr(ni);
			}
		}

		return thisLevelCombineStr + _fregement;
	}

	//执行将依赖合并到本模块中
	this.execCatchHere = function(){
		//循环查找js
		//如果js中存在<!--ArrowCommand:CatchDepsHere-->的字符
		//就查找模块中<!--ArrowCommand:CatchDepsHere-->下的define语句
		//循环所有define语句中的文件引用,并找到相应文件，深入到引用文件中查找是否有相同的<!--ArrowCommand:CatchDepsHere-->语句

		//创建合并原始文件
		//因为每次合并都要使用原始文件，避免合并操作被覆盖
		for(var i=0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'js' || fi.suffixName === 'css'|| fi.suffixName === 'html'|| fi.suffixName === 'htm'){
				fi['comSrcData'] = fi.relData;
			}
		}
		
		//1.从入口点页面开始运行程序
		this.parent.handleEnteryPageScript(function(_fregement){
			return self.combineNext(_fregement);
		});
	}

	//递归合并
	this.combineNext = function(_fregement){
		var thisLevelCombineStr = '';
		var combineableArr = [];
		var nextLevelArr = [];

		self.findCatchHere(_fregement,function(_targetItem){
			combineableArr.push(_targetItem);
		},function(_inToItem){
			nextLevelArr.push(_inToItem);
		},false);

		//查找nextLevelItem中有多少是需要打上引用标签的
		for(var i=0;i<nextLevelArr.length;i++){
			var ni = nextLevelArr[i];
			ni.isTagCombine = false;
			for(var j=0;j<combineableArr.length;j++){
				if(ni === combineableArr[j]){
					ni.isTagCombine = true;
					if(ni.comSrcData.indexOf('<!--ArrowCommand:DoNotCatchThis-->') !== -1){
						ni.isTagCombine = false;
					}
				}
			}
		}

		//先往下进行合并
		for(var i=0;i<nextLevelArr.length;i++){
			if(nextLevelArr[i].isTagCombine === true){
				nextLevelArr[i].relData = self.combineNext(nextLevelArr[i].comSrcData.replace('define(',function(){
					return '_____'+ nextLevelArr[i].relativeHost.replace(/\//g,'_').replace(/\./g,'_').replace(/\-/g,'_')  + '_____ = define('
				}));
			}else{
				nextLevelArr[i].relData = self.combineNext(nextLevelArr[i].comSrcData);
			}
		}
		//搞定下面的合并后再执行本级别的合并
		for(var i=0;i<combineableArr.length;i++){
			var ci = combineableArr[i];
			if(typeof ci.comSrcData !== 'undefined' && ci.comSrcData.indexOf('<!--ArrowCommand:DoNotCatchThis-->') === -1){
				thisLevelCombineStr += this.makecatchStr(ci);
			}
		}

		return thisLevelCombineStr + _fregement;
	}

	this.makecatchStr = function(_target){
		if(_target.suffixName === 'js'){
			return 'window.arrowExpressjs.makeCatch(["'+ _target.relativeHost.replace('/','') +'","'+ _target.rel.host +'"], function(){ window.____loadMakeCatch = true; var _____'+ _target.relativeHost.replace(/\//g,'_').replace(/\./g,'_').replace(/\-/g,'_') +'_____ = null; '+  _target.relData +'; window.____loadMakeCatch = false; return _____'+ _target.relativeHost.replace(/\//g,'_').replace(/\./g,'_').replace(/\-/g,'_') +'_____; });\n\n'
		}else{
			return 'window.arrowExpressjs.makeCatch(["'+ _target.relativeHost.replace('/','') +'","'+ _target.rel.host +'"],"'+  _target.relData.replace(/"/g,'\\"').replace(/(\n|\t|\r|\x0b|\x0c|\x85|\u2028|\u2029)/g,'') +'");\n\n'
		}
	}

	//查找合并字符
	this.findCatchHere = function(_fileStr,_callback,_getIntoCall,_isCombineAll){
		var urls = [];

		var combineItems = [];

		//先match CatchDepsHere
		if(this.currentConfig.combineSettings.execCatchDepsHere === true){
			var deps = _fileStr.match(/\<\!\-\-ArrowCommand\:CatchDepsHere\-\-\>(\s|\S)*?define\((.*?)\[(\s|\S)*?\]\,/g);

			if(deps !== null){
				//把链接抓出来
				for(var i=0;i<deps.length;i++){
					var di = deps[i];
					var urlArr = di.match(this.reg.findUrl);
					if(urlArr !== null){
						urls = urls.concat(urlArr);
					}
				}
			}
		}

		//再match CatchUsingHere
		if(this.currentConfig.combineSettings.execCatchUsingHere === true){
			var usings = _fileStr.match(/\<\!\-\-ArrowCommand\:CatchUsingHere\-\-\>(\s|\S)*?using\(\[(\s|\S)*?\]\,/g);
			//匹配没有using的链接，比如一些页面上的定义，或者路由器的定义等等
			var extraUsings = _fileStr.match(/\<\!\-\-ArrowCommand\:CatchLinkHere\-\-\>(\s|\S)*?((\'|\"|\`)(http\:|https\:|)\/\/.*?(js|css|html|htm)(\'|\"|\`)|(\'|\"|\`)[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html|htm)(\'|\"|\`)(\;|\,|[]){0,1}(\n|\r){1,1})/g);
			if(usings !== null){
				//把链接抓出来
				for(var i=0;i<usings.length;i++){
					var di = usings[i];
					var urlArr = di.match(this.reg.findUrl);
					if(urlArr !== null){
						urls = urls.concat(urlArr);
					}
				}
			}

			if(extraUsings !== null){
				//把链接抓出来
				for(var i=0;i<extraUsings.length;i++){
					var di = extraUsings[i];
					//匹配没有using 的链接不需要define和using
					if(di.indexOf('define') !== -1 || di.indexOf('using') !== -1 ){
						continue;
					}
					var urlArr = di.match(this.reg.findUrl);
					if(urlArr !== null){
						urls = urls.concat(urlArr);
					}
				}
			}
		}
		//去重，去除合并时会重复的引用
		urls = this.removeDuplicate(urls,function(a,b){
			return a !== b;
		});

		//处理url
		//1.将引号去掉
		//2.将一些不完整的相对链接例如‘common/common.css’改成'/common/common.css'
		//3.将完整的链接改成相对链接
		for(var i=0;i<urls.length;i++){
			var ui = urls[i];
			ui = ui.replace(/(\'|\"|\`')/g,'');
			if(ui.match(/^(http\:|https\:|)\/\//) === null && ui.match(/^\//) === null){
				ui = "/"+ui;
			}
			ui = self.parent.getRelativePath(self.currentConfig.toHost,ui);

			//查找到相应的文件并回调
			var combineItem = self.parent.fileMap.HostHashList[ui];
			if(typeof combineItem !== 'undefined'){
				_callback(combineItem);
			}
		}

		//查找往下一级的引用
		var nUrls = [];
		//查找所有链接的时候需要将注释中的链接去除掉再查找
		_fileStr = self.packer.pack(_fileStr.replace(/\/\*(\s|\S)*?\*\//g,'').replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g,'').replace(/\<\!\-\-(\s|\S)*?\-\-\>/g,'').replace(/\/\*(\s|\S)*?\*\//g,''));
		var nextLevel = _fileStr.match(/((\'|\"|\`)http\:|https\:|)\/\/(\s|\S)*?(js|css|html)(\'|\"|\`)|(\'|\"|\`)[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html)(\'|\"|\`)/g);
		if(nextLevel !== null){
			for(var i=0;i<nextLevel.length;i++){
				var di = nextLevel[i];
				if(_isCombineAll){
					var urlArr = di.match(this.reg.findUrl);
				}else{
					var urlArr = di.match(this.reg.findNextLevel);
				}
				if(urlArr !== null){
					nUrls = nUrls.concat(urlArr);
				}
			}
		}

		//去重，去除合并时会重复的引用
		nUrls = this.removeDuplicate(nUrls,function(a,b){
			return a !== b;
		});

		for(var i=0;i<nUrls.length;i++){
			var ui = nUrls[i];
			ui = ui.replace(/(\'|\"|\`)/g,'');
			if(ui.match(/^(http\:|https\:|)\/\//) === null && ui.match(/^\//) === null){
				ui = "/"+ui;
			}
			ui = self.parent.getRelativePath(self.currentConfig.toHost,ui);

			//查找到相应的文件并回调
			var combineItem = self.parent.fileMap.HostHashList[ui];
			if(typeof combineItem !== 'undefined'){
				_getIntoCall(combineItem);
			}
		}

	}

	//合并组件内容到主程序
	this.combineHtmlAndCssToMainOfModul = function(){
		//功能逻辑概述
		//1.查找有组件的模块，例如:main.js + main.html + main.css
		//2.找到所有这些模块并判断是否有做common.css合并，
		//如果有做common.css的合并就只make html 的 catch
		//如果没有做common.css的合并，就把css 和html都makecatch 并删除文件
		//这样的作法不允许模块之间交叉去引用html和css

		var combinedModuls = [];
		for(var i=0;i<self.parent.fileMap.list.length;i++){
			var fi = self.parent.fileMap.list[i];
			if(fi.suffixName === 'js' 
				//只合并/compoments下的css
				&& fi.relativeHost.indexOf('/compoments') !== -1
				//只合并项目模块的css
				&& typeof(self.parent.fileMap.HostHashList[fi.relativeHost.replace('js','html')]) !=='undefined'){
				//说明这是一个可以进行合并的组件
				var module = {
					js:fi,
					html:self.parent.fileMap.HostHashList[fi.relativeHost.replace('js','html')],
					css:false
				}
				//makecatch
				var catchStr = '';
				catchStr += 'window.arrowExpressjs.makeCatch(["'+ module.html.relativeHost.replace('/','') +'","'+ module.html.rel.host +'"],"'+  module.html.relData.replace(/"/g,'\\"').replace(/(\n|\t|\r|\x0b|\x0c|\x85|\u2028|\u2029)/g,'') +'");\n\n';

				//是否进行过common的css合并
				if(
					//首先确保没有设置将css打包到commoncss里去
					this.currentConfig.cssSettings.combineCssesToCommonCss === false 
					//然后确保这个css真实存在在文件系统内，否则就不存在合并这个模块的css这件事情
					&& typeof(self.parent.fileMap.HostHashList[fi.relativeHost.replace('js','css')]) !=='undefined'
					){
					module.css = self.parent.fileMap.HostHashList[fi.relativeHost.replace('js','css')];
					catchStr += 'window.arrowExpressjs.makeCatch(["'+ module.css.relativeHost.replace('/','') +'","'+ module.css.rel.host +'"],"'+  this.lCSSCoder.pack(module.css.relData.replace(/"/g,'\\"')) +'");\n\n';
				}

				fi.relData = catchStr + fi.relData;
				combinedModuls.push(module);
			}
		}

		//删除合并过的文件
		for(var i=0;i<combinedModuls.length;i++){
			var mi = combinedModuls[i];
			self.parent.deleteFile(mi.html);
			if(mi.css !== false){
				self.parent.deleteFile(mi.css);
			}
		}


	}

	//合并入口点页面中的Arrowjs到入口点
	this.combineEngineToEntryPages = function(){
		this.parent.handleEnteryPageOuterScript(function(_fregement){
			if(_fregement.indexOf('arrowExpress.js') !== -1){
				var arrowExpress = self.parent.fileMap.HostHashList['/arrowSystem/arrowExpress.js'];
				return '\n\n<script type="text/javascript" >'+arrowExpress.relData+'</script>';
			}
			return _fregement;
		});
		var arrowExpress = self.parent.fileMap.HostHashList['/arrowSystem/arrowExpress.js'];
		self.parent.deleteFile(arrowExpress);
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

module.exports = combineComplier;
