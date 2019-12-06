//dev热更新服务
//同时承担hotdebugger的任务
var hotloader = function(_projectConfig,_app){
	var self = this;
	this.WebSocketServer = require('ws').Server;

	this.server = null;
	this.client = [];
	this.fs = require('fs');
	this.md5 = require(_app.getAppPath() + '\\scripts\\controllerScripts\\com\\md5.js');
	this.CryptoJS = require(_app.getAppPath() + '\\scripts\\controllerScripts\\com\\CryptoJS.js');

	//当前的项目地图
    this.fileMap = {
        //项目文件树
        tree:{},
        //所有文件列表
        list:[],
        //物理路径哈希表
        pathHashList:{},
        //HOST路径哈希表
        HostHashList:{},
        //加密过的Host哈希表
        EncriptedHostHashList:{},
    }

	//初始化
	this.init = function(){
		this.initFileMap();
		this.initWebSocket();
	}

	//初始化站点文件映射
	this.initFileMap = function(){
		this.fileMap = {
			//项目文件树
			tree:{},
			//所有文件列表
			list:[],
			//物理路径哈希表
			pathHashList:{},
			//HOST路径哈希表
			HostHashList:{},
			//加密过的Host哈希表
			EncriptedHostHashList:{},
		}

		var listItem = {
            name:_projectConfig.projectPath_+ "\\BUILDSRC",
            suffixName:'',
            isforder:true,
            relativePath:'\\',
            relativeHost:'/',
            children:[]
        }
        //执行项目的发布数据分析
        this.anilys = this.analysisFiles(listItem,_projectConfig.projectPath+ "\\BUILDSRC");

        listItem.children = this.anilys.list;
        this.fileMap.tree = listItem;
        this.getEncriptedFileList();
	}

	//获得加密的文件名称列表
	this.getEncriptedFileList = function(){
		for(var i=0;i<this.fileMap.list.length;i++){
			var fi = this.fileMap.list[i];
			var hostArr = fi.relativeHost.split('/');
			var finalHost = '';
			for (var j = 0; j < hostArr.length; j++) {
				var hi = hostArr[j];
				var suffix = hi.split('.')[1];
				if (hi !== '') {
					if (j === hostArr.length - 1) {
						hi = hi.split('.')[0];
					}
					finalHost += '/' + self.fileNameEncrypt(hi, self.fileAesKey, self.fileAesvi);
					if (j === hostArr.length - 1 && typeof suffix !== 'undefined') {
						finalHost += '.' + suffix;
					}
				}
			}
			this.fileMap.EncriptedHostHashList[finalHost] = fi;
		}
	}

	//发送更新消息
	this.sendUpdateData = function(_hostArrs,_content){
		var newList = [];
		for(var i=0;i<_hostArrs.length;i++){
			var fi = _hostArrs[i];
			if(fi.indexOf(_projectConfig.devHost)!== -1){
				fi = fi.replace(_projectConfig.devHost,'');
			}
			var hostArr = fi.split('/');
			var finalHost = '';
			for (var j = 0; j < hostArr.length; j++) {
				var hi = hostArr[j];
				var suffix = hi.split('.')[1];
				if (hi !== '') {
					if (j === hostArr.length - 1) {
						hi = hi.split('.')[0];
					}
					finalHost += '/' + self.fileNameEncrypt(hi, self.fileAesKey, self.fileAesvi);
					if (j === hostArr.length - 1 && typeof suffix !== 'undefined') {
						finalHost += '.' + suffix;
					}
				}
			}
			newList.push(finalHost);
			newList.push('/'+fi);
			newList.push(finalHost.replace(/^\//,''));
			newList.push(fi.replace(_projectConfig.devHost,''));
		}

		_hostArrs = _hostArrs.concat(newList);

		//如果客户端在线就直接发送，否则忽略
		if(this.client.length !== 0){
			for(var i=0;i<this.client.length;i++){
				var ci = self.client[i];
				var message = {
					hostArrs:_hostArrs,
					content:_content
				}
				ci.send(JSON.stringify(message));
			}
		}
	}

	//初始化webSocket服务
	this.initWebSocket = function(){
		this.server = new this.WebSocketServer({ port: _projectConfig.hotLoaderPort });
		this.server.on('connection', function connection(wsClient) {
			self.client.push(wsClient);

			//接收到消息的时候
			wsClient.on('message', function incoming(message) {
				var clientObj = this;
				var command = JSON.parse(message);
				//处理hotdebug请求
				self.handleHotDebug(command,clientObj);
			});
        		

			//关闭连接
	    	wsClient.on('close', function incoming() {
	    		var newArr = [];
	    		for(var i=0;i<self.client.length;i++){
	    			var ci = self.client[i];
	    			if(ci !== this){
	    				newArr.push(ci);
	    			}
	    		}
	    		self.client = newArr;
	    	});
		});
		
	}

	//处理hotDebug请求
	this.handleHotDebug = function(_command,_clientObj){
		this.initFileMap();
		if(_command.url.match(/^\//) === null){
			_command.url = "/" + _command.url;
		}

		//在正常的urlhash中查找
		var file = this.fileMap.HostHashList[_command.url];
		if(typeof file === 'undefined'){
			file = this.fileMap.EncriptedHostHashList[_command.url];
		}

		if(typeof file !== 'undefined'){
			var fPath = _projectConfig.projectPath+ "\\BUILDSRC" + file.relativePath;
			var content = self.fs.readFileSync(fPath,'utf-8');
			content = content.replace(new RegExp(_projectConfig.devHost+ "/BUILDSRC",'g'),function(){
				return _command.baseUrl;
			});
			_clientObj.send(JSON.stringify({
				requestId:_command.requestId,
				url:_command.url,
				content:content
			}));
		}
	}

	this.destroy = function(){
		try{
			if(this.client.length !== 0){
				for(var i=0;i<this.client.length;i++){
					var ci = self.client[i];
					ci.destroy();
				}
			}
		}catch(_e){}
		this.server.close();
	}


	


	//数据项目
    this.analysisFiles = function(_parent,_fromDir){
        var anilys = {
            //文件列表
            list:[]
        }
        //获取文件和文件夹列表
        var fromList = self.fs.readdirSync(_fromDir);
        //循环原始列表中的所有文件到目录
        for(var i=0;i<fromList.length;i++){
            var dItem = fromList[i];
            var listItem = {
                name:'',
                suffixName:'',
                isforder:false,
                relativePath:'',
                relativeHost:'',
                children:[]
            }

            listItem.relativePath = (_fromDir + "\\"+dItem).replace(_projectConfig.projectPath+ "\\BUILDSRC",'');
            listItem.relativeHost = listItem.relativePath.replace(/\\/g,'/');

            //如果是个目录，就伸展下去
            if(self.fs.lstatSync(_fromDir + "\\"+dItem).isDirectory()){
                listItem.name = dItem;
                listItem.isforder = true;
                listItem.suffixName = 'forder';
                var _anilys = self.analysisFiles(listItem,_fromDir + "\\"+dItem);
                listItem.children = _anilys.list;
            }else{
                //拷贝文件
                anilys.forderCount ++;
                listItem.name = dItem.split('.')[0];
                listItem.suffixName = dItem.split('.')[1];
            }

            self.fileMap.list.push(listItem);
            self.fileMap.pathHashList[listItem.relativePath] = listItem;
            self.fileMap.HostHashList[listItem.relativeHost] = listItem;
            anilys.list.push(listItem);
        }
        return anilys;
    }


    this.fileAesKey = 18681449125;
	this.fileAesvi = 807352267070;

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
}

module.exports = hotloader;