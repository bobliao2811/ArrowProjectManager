//node#编译器
//廖力(bobliao)
//编写于2019年09月09日
//将node#语法编译成AMD语法
//开发时编译器

/*
模块逻辑概述:
	如果项目设置中devMode等于1的话，开启node#编译
	主要针对js进行编译
	具体来说主要将src/compoments 下的.js文件进行编译
	其它目录中的.js文件一概不管

	通过编译的每个js文件将会更改以下内容:
	1.using '/XXXXXXX.js' as xxx 更改为AMD语法 ： define(['/XXXXXXX.js'],function(xxx){ });
	2.export XXX; 更改为 return xxx;
	3.将“ : ”继承符号替换成 "extends"
	4.如果不存在using  '/XXXXXXX.js' as xxx 这样的语法 就直接转换成AMD : define(function(xxx){ });

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
const nodeSharpCompiler = function(_urlArgs,_type,_data,_finishCallBack,_faildCallBack){


	if(_data.indexOf('<!--ArrowCommand:DoNotTouch-->') !== -1){
		_finishCallBack(_data);
	}else {
		try {
			//只针对开启了node# + es6/7编译的项目进行编译
			if (_type === 'js' && this.config.devMode === '1') {
				//正则表达式集合
				var regStrList = {
					//去除空格
					"trim": /^\s+|\s+$/gm,
					//匹配using
					"getUsing": /using[ ]{1,}(\s|\S)*?[ ]{1,}as[ ]{1,}(\s|\S)*?(\;|\n)/g,
					//匹配export
					"getExport": /exportClass(\s|\S)*?(\;|\n)/g,
					//匹配继承符号
					"getExtends": /class[ ]{1,}(\s|\S)*?[ ]{0,}\:[ ]{0,}/g
				}

				var trim = function (_str) {
					return _str.replace(regStrList.trim, '');
				}

				var guid = function () {
					return 'Func_xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
						var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
						return v.toString(16);
					});
				}

				var handleUsing = function (_fileSource) {
					//匹配using命令
					var usingArr = trim(_fileSource).match(regStrList.getUsing);
					//匹配export命令
					var exportArr = trim(_fileSource).match(regStrList.getExport);
					//匹配继承符号
					var extendsArr = trim(_fileSource).match(regStrList.getExtends);

					//如果三者为空，表示此文件不是node#格式，直接返回
					if (usingArr === null && exportArr === null && extendsArr === null) {
						return _fileSource;
					}

					if (exportArr !== null) {
						//更换exportClass成return
						for (var i = 0; i < exportArr.length; i++) {
							var item = trim(exportArr[i]);
							item = trim(item.replace('exportClass', '').replace(/\;/g, ''));
							_fileSource = _fileSource.replace(exportArr[i], '\nreturn ' + item + " ;");
						}
					} else {
						var message = 'Node#编译错误：请确保文件中至少存在一个 "exportClass" 关键字以确保定义的class可以被正确地导出!';
						_faildCallBack(message);
						return "error";
					}

					if (extendsArr !== null) {
						//更换继承符号":"成" extends "
						for (var i = 0; i < extendsArr.length; i++) {
							var item = trim(extendsArr[i]);
							var cItem = item.replace(/[ ]{0,}\:[ ]{0,}/, " extends ");
							_fileSource = _fileSource.replace(item, cItem);
						}
					}

					var requireList = [];
					var rString = "";
					var vString = "";
					var resultStr = "";
					if (usingArr === null) {
						resultStr = 'define(function(){\n' +
							_fileSource
							+ '\n});\n';
					} else {
						for (var i = 0; i < usingArr.length; i++) {
							var item = trim(usingArr[i]);
							_fileSource = _fileSource.replace(item, '');
							var itemArr = item.replace('using', '').replace(' as ', '∰').split('∰');
							requireList.push({
								url: trim(itemArr[0]),
								value: trim(itemArr[1].replace(/\;/g, ''))
							});
							if (i !== 0) {
								rString += ',';
								vString += ',';
							}
							rString += trim(itemArr[0]);
							vString += trim(itemArr[1].replace(/\;/g, ''));
						}
						resultStr = 'define([' + rString + '],function(' + vString + '){\n' +
							_fileSource
							+ '\n});\n';
					}
					return resultStr;
				}
				_data = handleUsing(_data);
				//如果执行过程中没有出错就执行完成回调
				if (_data !== 'error') {
					_finishCallBack(_data);
				}
			} else {
				_finishCallBack(_data);
			}
		} catch (_e) {
			var message = 'Node#编译错误：在编译js文件时nodeSharpCompiler编译器发生程序错误:\n' + _e.stack;
			_faildCallBack(message);
		}
	}
}
module.exports = nodeSharpCompiler;