//Less编译器
//廖力(bobliao)
//编写于2019年09月08日
//将less语法编译成普通的css语法
//开发时编译器

/*
模块逻辑概述:
该模块不仅要对less进行编译，还要对css文件中出现的using进行编译，具体编译逻辑如下

例如有三个css
a.css
b.css
c.css

a引用了b，b引用c

那么在编译a.css的时候，需要将其中引用的b给合并，合并b的时候发现b又引用了c，那么又要把c也合并
意思是说，如果a引用了b，b又引用了c，那么这三个文件都要进行合并才能扔给less编译器进行编译
编译完成后，再单独把a.css的内容拿出来保存,并还原using引用语法，这样才算严谨

传统的less是粗暴地把所有css全部编译到一起，这样一来在后期用户访问的时候，用户只能一次下载一个巨大的css,影响用户使用体验
当然在框架管理器中，如果后期发布的时候希望将所有css进行合并也可以,有选项提供,但开发时编译器在编译时只负责编译单个css并不作合并操作。
是否合并取决于后期发布时的需求。

这样的编译逻辑意在给后期打包发布提供更多灵活的选择


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
const lessCompiler = function(_urlArgs,_type,_data,_finishCallBack,_faildCallBack){
	
	try{
		//只允许文件类型为css以及less的进行编译
		if(_type === 'css' 
			|| _type === 'less'
				){
			const less = require('less');
			const urlCompiler = require(this.app.getAppPath()+'\\scripts\\controllerScripts\\devCompilerModuls\\urlCompiler.js');
			var self = this;
			var regList = {
				//匹配using
				usingMatch:/\@[ ]{0,}using[ ]{0,}\((\s|\S)*?\)[ ]{0,}\;{0,}/g
			}

			var checkingList = {};
			var checkList = {};

			var mainContent = '';
			var usingStrs = '';
			var usingContents = '';
			//处理using的合并
			var handleUsing = function(_cssStr,_layer){
				var layer = _layer;
				//先将using从文件中匹配出来
				var usingList = _cssStr.match(regList.usingMatch);
				if(usingList === null){
					return _cssStr;
				}

				
				if(layer === 1){
					mainContent = _cssStr;
				}
				var usingFileList = [];
		        for(var i=0;i<usingList.length;i++){
		        	var orgPath = usingList[i].replace(/\@[ ]{0,}using[ ]{0,}\((\'|\"|\`)/,'').replace(/(\'|\"|\`)\)[ ]{0,}\;{0,}/,'');
		        	//如果重复引用了就不进行合并操作了
		        	if(typeof checkList[orgPath] === 'undefined'){
			        	var host = orgPath.replace(_urlArgs.targetHost,'');
			        	var path = orgPath.replace(_urlArgs.targetHost,'').replace(/\//g,'\\');
			        	var pArr = path.split('\\');

			        	//检查路径是否存在
			        	//不存在就直接跳出并报错
			        	if(!self.fs.existsSync(_urlArgs.srcDir +path)){
			        		var message = 'Less编译错误:引用的文件不存在,请检查并确认:\n'+usingList[i];
							_faildCallBack(message);
							return 'error';
			        	}

			        	var item = {
			            	path:path,
			            	orgStr:usingList[i],
			            	orgPath:orgPath,
			            	content:self.fs.readFileSync(_urlArgs.srcDir +path,"utf-8")
			            }

			            var args = {
			            	buildSrc:_urlArgs.buildSrc,
			            	currentFileName:pArr[pArr.length-1],
			            	currentFilePath:_urlArgs.srcDir + path,
			            	currentHostUrl:host.replace(pArr[pArr.length-1],'').replace(/^\//,'').replace(/\/$/,''),
			            	currentPath:path.replace(pArr[pArr.length-1],'').replace(/^\\/,'').replace(/\\$/,''),
			            	targetHost:_urlArgs.targetHost,
			            	srcDir:_urlArgs.srcDir
			            }
			            //对要合并的css处理一遍url
			            item.content = urlCompiler(args,'css',item.content,function(){});
			            //将原文中的using替换成引用的css
			            item.content = "\n\n/*{"+orgPath+"*/\n\n"+item.content+"\n\n/*"+orgPath+"}*/\n\n";
			            //递归到这个引用的内容中去，检查是否有using
			            item.content = handleUsing(item.content,_layer+1);
			            if(item.content === 'error'){
		            		return 'error';
		            	}
			            //如果位于第一层就记录好第一层所有的数据,为后续处理做好准备
			            if(layer === 1){
			            	usingStrs += usingList[i];
			            	mainContent = mainContent.replace(usingList[i],'');
			            	usingContents += item.content;
			            }else{
			            	_cssStr = _cssStr.replace(usingList[i],item.content);
			            }

			            usingFileList.push(item);
			            if(layer === 1){
			            	checkingList[orgPath] = item;
			            }
			            checkList[orgPath] = item;
		            }else{
		            	var message = 'Less编译错误:检测到一些重复使用的using在css引用链中，请将它们剔除掉:\n'+usingList[i];
						_faildCallBack(message);
						return 'error';
		            }
		        }

		        if(layer === 1){
		        	return usingContents + "/*{using::mainContent::begin*/" + mainContent + "/*using::mainContent::end}*/";
		        }

		        return _cssStr;
			}

			_data = handleUsing(_data,1);

			if(_data === 'error'){
				return;
			}

			//去除并记录using

			//向上树形混编using中的代码
			//在向上树形混编的时候检查是否有循环调用
			//如果形成循环调用就直接退出本次css编译并报错

			//转换less格式成css
			less.render(_data, {}, function(error, output) {
				if(error){
					var message = 'Less编译错误：在编译Less文件时Less核心编译程序发生程序错误:\n'+error.message;
					_faildCallBack(message);
					return;
				}
				var mainContentResult = output.css.match(/\/\*\{using\:\:mainContent\:\:begin\*\/[\d|\D]{1,}\/\*using\:\:mainContent\:\:end\}\*\//g);
				if(mainContentResult === null){
					_finishCallBack(output.css);
				}else{
					_finishCallBack(usingStrs + mainContentResult[0].replace(/\/\*\{using\:\:mainContent\:\:begin\*\//g,'').replace(/\/\*using\:\:mainContent\:\:end\}\*\//g,''));
				}
			})

		}else{
			_finishCallBack(_data);
		}
	}catch(_e){
		var message = 'Less编译错误：在编译Less文件时lessCompiler编译器发生程序错误:\n'+_e.stack;
		_faildCallBack(message);
	}

}
module.exports = lessCompiler;
