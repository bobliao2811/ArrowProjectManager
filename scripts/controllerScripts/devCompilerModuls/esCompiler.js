//es6/7编译器
//廖力(bobliao)
//编写于2019年09月09日
//将es6/7语法编译成普通的es5语法,提供兼容性
//开发时编译器

/*
模块逻辑概述:
	调用babel 将源代码放进去，得到es5语法

	//参数：_urlArgs
	buildSrc = "J:\work\testArrowWorkSpace\ES5Amd\BUILDSRC"
	currentFileName = "arrowExpress.js"
	currentFilePath = "J:\work\testArrowWorkSpace\ES5Amd\src\arrowSystem\arrowExpress.js"
	currentHostUrl = "/arrowSystem"
	currentPath = "\arrowSystem"
	targetHost = "//localhost:80/testArrowWorkSpace/ES5Amd/BUILDSRC"
	srcDir = "J:\work\testArrowWorkSpace\ES5Amd\src"
*/

'use strict';
const esCompiler = function(_urlArgs,_type,_data,_finishCallBack,_faildCallBack){

		//如果设置了不要处理就别处理了
		if(_data.indexOf('<!--ArrowCommand:DoNotTouch-->') !== -1){
			_finishCallBack(_data);
		}else{
			//只针对开启了node# + es6/7编译的项目进行编译
			if(_type === 'js' && this.config.devMode === '1'){
				try{
					const babel = require("@babel/core");
					const presets = [
						[
							"@babel/env",
								{
									"targets": {
									"browsers": [ "ie >= 5"]
								}
							}
						]
					];
					_data =  babel.transform(_data, {
						presets:presets,
						plugins: ["@babel/plugin-transform-object-assign"]
					}).code;
				}catch(_e){
					var message = 'es6/7(babel)编译错误：在编译js文件时esCompiler编译器发生程序错误:\n'+_e.stack;
					_faildCallBack(message);
				}
				_finishCallBack(_data);
			}else{
				_finishCallBack(_data);
			}
		}
	
}

module.exports = esCompiler;