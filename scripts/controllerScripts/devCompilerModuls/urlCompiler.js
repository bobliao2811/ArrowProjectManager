//url编译器
//廖力(bobliao)
//编写与2019年09月08日
//将相对路径转换成绝对路径
/*

不用转换的路径：
common/common.js
前面没有加上任何相对路径的符号，不用进行处理

转换到根目录的路径:
/common/common.js
前面加上了斜杠，所以要将其处理到项目的根目录中去，否则就是域名的根

当前文件目录的相对协议
./common/common.js
路径之前加上'./'表示在当前文件的目录里访问文件

相对当前文件目录访问其它资源
../../../../common/common.js
表示跨多级目录进行访问

匹配规则:
"../
"./
"/

'../
'./
'/

`../
`./
`/


//参数：_urlArgs
buildSrc = "J:\work\testArrowWorkSpace\ES5Amd\BUILDSRC"
currentFileName = "arrowExpress.js"
currentFilePath = "J:\work\testArrowWorkSpace\ES5Amd\src\arrowSystem\arrowExpress.js"
currentHostUrl = "/arrowSystem"
currentPath = "\arrowSystem"
targetHost = "//localhost:80/testArrowWorkSpace/ES5Amd/BUILDSRC"
srcDir = "J:\work\testArrowWorkSpace\ES5Amd\src"
hotLoaderPort
*/

//开发时编译器
'use strict';

const urlCompiler = function(_urlArgs,_type,_data,_finishCallBack,_faildCallBack){
	try{

		if(_type === 'css' 
				|| _type === 'html'
				|| _type === 'htm'
				|| _type === 'js'
				|| _type === 'less'
				|| _type === 'json'
				){
			//给入口页面绑定热更新端口号 hotLoaderPort
			if( (_type === 'html' || _type === 'htm') && (_data.indexOf('<!--ArrowCommand:EntryPage-->')) !== -1 ){
				_data = _data.replace("arrow_hotLoaderPort:'',",function(){
					return "arrow_hotLoaderPort:"+ _urlArgs.hotLoaderPort +",";
				});
			}

			var regList = {
				//"/
				//匹配"/xxx也把+"/xxx带加号的匹配出来，方便过滤加号
				isFlatUrl:/((\+(\"|\`|\'|\())\/|((\"|\`|\'|\()\/){1,1}[A-Za-z0-9\u4e00-\u9fa5]{2,})/g,
				//"./
				//匹配"./xxx
				isRootUrl:/(((\"|\`|\'|\()\.\/){1,1}[A-Za-z0-9\u4e00-\u9fa5]{2,})/g,
				//"../
				//匹配"../xxx 或../../../../../xxx
				isRelated:/(((\"|\`|\'|\()(\.\.\/){1,}){1,1}[A-Za-z0-9\u4e00-\u9fa5]{2,})/g
			}


			//先匹配文件中的绝对路径
			var paths = _data.match(regList.isFlatUrl);
			if(paths !== null){
				
				for(var i=0;i<paths.length;i++){
					var pItem = paths[i];
					if(_type !== 'css' && pItem.indexOf('(') === 0){
						//如果在不是css类型的文件中查找出了(/zzzasd 这样的字符就不管它了,
					}else{
						//排除url之前带有加号的，带有加号表示这不是完整url的开头
						if(pItem.indexOf('+') !== 0){
							var mark = pItem.match(/\'|\"|\`|\(/)[0];
							var pItemr = pItem.replace(/\'|\"|\`|\(/,'');
							_data = _data.replace(pItem,mark+_urlArgs.targetHost+pItemr);
						}
					}
				}
			}

			//匹配文件中的相对路径./
			var paths = _data.match(regList.isRootUrl);
			if(paths !== null){
				for(var i=0;i<paths.length;i++){
					var pItem = paths[i];
					var mark = pItem.match(/\'|\"|\`|\(/)[0];
					var pItemr = pItem.replace(/\'|\"|\`|\(/,'');
					var pItemr = pItemr.replace('./','');
					_data = _data.replace(pItem,mark+_urlArgs.targetHost+'/'+_urlArgs.currentHostUrl+'/'+pItemr);
				}
			}

			//匹配文件中的相对路径../
			var paths = _data.match(regList.isRelated);
			if(paths !== null){
				for(var i=0;i<paths.length;i++){
					var pItem = paths[i];
					var mark = pItem.match(/\'|\"|\`|\(/)[0];
					var pItemr = pItem.replace(/\'|\"|\`|\(/,'');

					//当前延申到该目录的所有层级
					var pathLayer = _urlArgs.currentHostUrl.split('/');
					//拿出当前相对路径有多少层级
					var relates = pItemr.match(/\.\.\//g);
					
					//最终循环输出层级的数量
					var fCount = pathLayer.length - relates.length;
					//最终路径
					var fPath = '';
					for(var j=0;j<fCount;j++){
						fPath += "/"+pathLayer[j];
					}
					if(fPath.replace(/[ ]/g,'') === ''){
						fPath = '';
					}

					//得到正确路径
					fPath = mark + _urlArgs.targetHost + fPath+'/' + pItemr.replace(/\.\.\//g,'');
					_data = _data.replace(pItem,fPath);
				}
			}


			_finishCallBack(_data);
		}else{
			_finishCallBack(_data);
		}

		return _data;
	}catch(_e){
		var message = 'url编译错误：在编译文件中url字符时发生程序错误:\n'+_e.stack;
		_faildCallBack(message);
	}
}
module.exports = urlCompiler;


