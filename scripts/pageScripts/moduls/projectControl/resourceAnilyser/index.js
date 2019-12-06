//工程的配置界面
define(['scripts/pageScripts/moduls/projectControl/resourceAnilyser/index.css','scripts/pageScripts/moduls/projectControl/resourceAnilyser/index.html'],function(_css,_html){
    var m = function(_config){
        var self = this;
        var config = {
            parent:{},
            container:'body',
            backCall:function(){}
        }


        this.config = $.extend(true,config,_config);
        this.fs = require('fs');
        this.compressor = require('uglify-js');
        this.packer = require('../scripts/controllerScripts/com/packer.js');

        this.parent = self.config.parent;
        this.html = _html;

        this.aniKey = 'rTree';

        //当前发布的项目地图
        this.fileMap = {
            //项目文件树
            tree:{},
            //所有文件列表
            list:[],
            //入口点页面
            entryPages:{hash:{},arr:[]},
            //物理路径哈希表
            pathHashList:{},
            //HOST路径哈希表
            HostHashList:{}
        }

        //初始化
        this.init = function(){
            this.showPage();
            this.bindEvents();
            this.show();

            //设置当前的编译配置
            this.rConfig = this.parent.currentSetting;

            var listItem = {
                name:this.rConfig.fromPath.split('\\')[this.rConfig.fromPath.split('\\').length-1],
                suffixName:'',
                isforder:true,
                relativePath:'\\',
                relativeHost:'/',
                src:{
                    path:this.rConfig.fromPath,
                    host:this.rConfig.fromHost,
                },
                rel:{
                    path:this.rConfig.toPath,
                    host:this.rConfig.toHost,
                },
                srcData:'',
                relData:'',
                children:[]
            }
            //执行项目的发布数据分析
            this.anilys = this.analysisFiles(listItem,this.rConfig.fromPath,this.rConfig.toPath);

            listItem.children = this.anilys.list
            this.fileMap.tree = listItem;

            //修改入口点文件的配置
            this.configEntryPage();

            this.showList();
        }

        this.showList = function(){
            for(var i=0;i<this.fileMap.entryPages.arr.length;i++){
                var item = this.fileMap.entryPages.arr[i];

                var enteryElem = $(`<div class='ra-e-s-item' >
                        `+ item.relativePath +`
                    </div>`).appendTo(this.html.find('.ra-entryPage-selecter'));
                (function(_enteryElem,_item){
                    _enteryElem.click(function(){
                        self.showAni(_item);
                    });
                })(enteryElem,item)
            }
        }

        //展示分析数据
        this.showAni = function(_item){
            var title = '';
            if(this.aniKey === 'rTree'){
                title = '引用树分析:';
            }else{
                title = '模块合并分析:';
            }

            this.html.find('.ani-l-title').html(title+_item.relativePath);
            var data = this.makeData(this.aniKey,_item);

            var _hicharts = require('../scripts/pageScripts/common/highcharts/code/highcharts.src.js');
            require('../scripts/pageScripts/common/highcharts/code/modules/networkgraph.js')(_hicharts);
            require('../scripts/pageScripts/common/highcharts/code/modules/exporting.js')(_hicharts);
            var Highcharts = _hicharts;
            Highcharts.addEvent(
                Highcharts.Series,
                'afterSetOptions',
                function (e) {
                    var colors = Highcharts.getOptions().colors,
                        i = 0,
                        nodes = {};

                    if (
                        this instanceof Highcharts.seriesTypes.networkgraph &&
                        e.options.id === 'lang-tree'
                    ) {
                        e.options.data.forEach(function (link) {

                            if (link[0] === _item.relativeHost) {
                                nodes[_item.relativeHost] = {
                                    id: _item.relativeHost,
                                    marker: {
                                        radius: 30
                                    }
                                };
                                nodes[link[1]] = {
                                    id: link[1],
                                    marker: {
                                        radius: 10
                                    },
                                    color: colors[i++]
                                };
                            } else if (nodes[link[0]] && nodes[link[0]].color) {
                                nodes[link[1]] = {
                                    id: link[1],
                                    color: nodes[link[0]].color
                                };
                            }
                        });

                        e.options.nodes = Object.keys(nodes).map(function (id) {
                            return nodes[id];
                        });
                    }
                }
            );
             var config =  {
                chart: {
                    type: 'networkgraph',
                    height: '600px'
                },
                title: {
                    text: '站点资源引用图'
                },
                subtitle: {
                    text: '将会展示每个文件中的请求和潜在的请求'
                },
                plotOptions: {
                    networkgraph: {
                        keys: ['from', 'to'],
                        layoutAlgorithm: {
                            enableSimulation: true,
                            friction: -0.9
                        }
                    }
                },
                series: [{
                    dataLabels: {
                        enabled: true,
                        linkFormat: ''
                    },
                    id: 'lang-tree',
                    data: data
                }]
            }
           
            
            this.html.find('.ani-layer').slideDown(200,function(){
                _hicharts.chart(self.html.find('.chartContainer')[0],config);
            });
        }

        //生成数据
        this.makeData = function(_type,_node){
            if(_type === "rTree"){
                var data = [];
                var findfilerelatves = function(_node){
                    var files = [];
                    self.findOutUrlsByFile(_node,_node.suffixName,function(_url,_condition){
                        if(typeof self.fileMap.HostHashList[_url] !== "undefined"){
                            files.push(self.fileMap.HostHashList[_url]);
                        }
                        return _url+'?'+_condition;
                    });

                    if(_node.relativeHost.indexOf('compoments/') && _node.suffixName === 'js'){
                        var css = self.fileMap.HostHashList[_node.relativeHost.split('.')[0]+'.css'];
                        var html = self.fileMap.HostHashList[_node.relativeHost.split('.')[0]+'.html'];
                        if(typeof css !=='undefined'){
                            files.push(css);
                        }
                        if(typeof html !=='undefined'){
                            files.push(html);
                        }

                        //去重url
                        files = self.removeDuplicate(files,function(a,b){
                            return a.relativeHost !== b.relativeHost;
                        });
                    }

                    for(var i=0;i<files.length;i++){
                        data.push([_node.relativeHost,files[i].relativeHost]);
                        findfilerelatves(files[i]);
                    }
                }
                findfilerelatves(_node);
                return data;
            }else{

            }
        }

        //修改入口点文件的配置
        this.configEntryPage = function(){
            for(var i=0;i<this.fileMap.list.length;i++){
                var li = this.fileMap.list[i];
                //判断既是html页面,也是入口点
                if((li.suffixName === 'html' || li.suffixName === 'htm')
                    && (li.srcData.indexOf('<!--ArrowCommand:EntryPage-->') !== -1)){
                    this.fileMap.entryPages.arr.push(li);
                    this.fileMap.entryPages.hash[li.relativePath] = li;
                    //更改发布配置
                    li.relData = li.relData.replace("mode:'src'","mode:'"+ this.rConfig.mode +"'");
                }
            }
        }

        this.bindEvents = function(){
            this.html.find('[data-event=back]').click(function(){
                self.config.backCall();
            });
            this.html.find('[data-event=exit]').click(function(){
                self.html.find('.ani-layer').slideUp();
            });

            this.html.find('.tab-item').click(function(){
                self.html.find('.tab-item').removeClass('selected');
                $(this).addClass('selected');
                self.aniKey =  $(this).attr('key');
            });
        }

        //展示页面
        this.showPage = function(){
            self.html = $(self.html).appendTo(self.config.container);
           self.html.find('.projectName').html(self.parent.config.phyConfig.projectName);
        }

        this.hide = function(_callBack){
            this.html.stop();
            this.html.animate({'left':$(window).width()},{easing:'easeOutQuart',speed:400,complete:function(){
                _callBack();
            }});
        }

        this.show = function(){
            this.html.stop();
            this.html.css('left',$(window).width());
            this.html.animate({'left':0},{easing:'easeOutQuart',speed:400,complete:function(){
                
            }});
        }

        this.distory = function(){
            this.hide(function(){
                self.html.remove();
            });
        }



        //数据项目
        this.analysisFiles = function(_parent,_fromDir,_toDir){
            //执行复制的过程中形成源代码地图
            //源代码地图有四种数据格式
            //第一种是树形数据格式
            //第二种是列表数据格式
            //第三种是物理路径哈希表
            //第四种是host路径哈希表

            //地图中每个元素的数据格式如下
            //{
            //  name:文件或文件夹名称,
            //  suffixName:后缀名
            //  isforder:是否为文件夹,
            //  relativePath:相对源代码目录的相对路径,
            //  relativeHost:源代码相对访问路径,
            //  srcPath:{
            //      path:物理路径,
            //      host:源代码访问路径,
            //  },
            //  relPath:{
            //      path:物理路径,
            //      host:访问路径,
            //  }
            //  data:(数据),
            //  children:子项目
            //}

            //{
            //  "name": "main",
            //  "suffixName": "js",
            //  "isforder": false,
            //  "relativePath": "\\compoments\\main\\main.js",
            //  "relativeHost": "/compoments/main/main.js",
            //  "src": {
            //      "path": "J:\\work\\testArrowWorkSpace\\newProjectTest\\BUILDSRC\\compoments\\main\\main.js",
            //      "host": "http://localhost:80/testArrowWorkSpace/newProjectTest/BUILDSRC/compoments/main/main.js"
            //  },
            //  "rel": {
            //      "path": "J:\\work\\testArrowWorkSpace\\newProjectTest\\TEST\\compoments\\main\\main.js",
            //      "host": "http://localhost:80/testArrowWorkSpace/newProjectTest/TEST/compoments/main/main.js"
            //  },
            //  "srcData": 'buffer',
            //  "relData": 'buffer',
            //  "children": []
            //}

            var anilys = {
                //文件数量
                fileCount:0,
                //文件夹数量
                forderCount:0,
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
                    parent:_parent,
                    src:{
                        path:'',
                        host:'',
                    },
                    rel:{
                        path:'',
                        host:'',
                    },
                    srcData:'',
                    relData:'',
                    children:[]
                }

                listItem.src.path = _fromDir + "\\"+dItem;
                listItem.rel.path = _toDir + "\\"+dItem;

                listItem.relativePath = listItem.src.path.replace(self.parent.config.phyConfig.projectPath+ "\\BUILDSRC",'');
                listItem.relativeHost = listItem.relativePath.replace(/\\/g,'/');

                listItem.src.host = self.parent.config.phyConfig.devHost + "/BUILDSRC"+listItem.relativePath.replace(/\\/g,'/');
                listItem.rel.host = self.rConfig.toHost + listItem.relativeHost;

                

                //如果是个目录，就伸展下去
                if(self.fs.lstatSync(_fromDir + "\\"+dItem).isDirectory()){
                    listItem.name = dItem;
                    listItem.isforder = true;
                    listItem.suffixName = 'forder';
                    anilys.forderCount ++;
                    var _anilys = self.analysisFiles(listItem,_fromDir + "\\"+dItem,_toDir + "\\"+dItem);
                    anilys.fileCount += _anilys.fileCount;
                    anilys.forderCount += _anilys.forderCount;
                    listItem.children = _anilys.list;
                }else{
                    //拷贝文件
                    anilys.forderCount ++;
                    listItem.name = dItem.split('.')[0];
                    listItem.suffixName = dItem.split('.')[1];
                    if(self.getIsTextCodeFile(listItem.suffixName)){
                        //如果是具体的代码文件就用utf-8的方式载入
                            listItem.srcData = self.fs.readFileSync(_fromDir + "\\"+dItem,'utf-8');
                    }else{
                        //否则就用buffer的方式载入
                        //例如图片，或者其它资源文件
                        listItem.srcData = self.fs.readFileSync(_fromDir + "\\"+dItem);
                    }
                    listItem.relData = listItem.srcData;
                }

                self.fileMap.list.push(listItem);
                self.fileMap.pathHashList[listItem.relativePath] = listItem;
                self.fileMap.HostHashList[listItem.relativeHost] = listItem;
                anilys.list.push(listItem);
            }
            return anilys;
        }

        //判断是否为js,html,css,json,htm,txt
        this.getIsTextCodeFile = function(_suffixName){
            if(_suffixName === 'js'
                        || _suffixName === 'css'
                        || _suffixName === 'html'
                        || _suffixName === 'htm'
                        || _suffixName === 'txt'
                        || _suffixName === 'json'){
                return true;
            }
            return false;
        }


        this.reg = {
            findUrl: /(http\:|https\:|)\/\/(\s|\S)*?\.(js|css|html|htm|jpg|png|jpeg|gif|tiff|bmp)(\?(\s|\S)*?(\'|\"|\`|\))|)|[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html|htm|jpg|png|jpeg|gif|tiff|bmp)(\?(\s|\S)*?(\'|\"|\`|\))|)/g,
            findUrlForCss:/(http\:|https\:|)\/\/(\s|\S)*?\.(js|css|html|htm|jpg|png|jpeg|gif|tiff|bmp)(\?(\s|\S)*?(\'|\"|\`|\))|)|[a-zA-Z0-9\-\_\.\/]*?\.(js|css|html|htm|jpg|png|jpeg|gif|tiff|bmp)(\?(\s|\S)*?(\'|\"|\`|\))|)/g,
        }

        //查找url
        this.findOutUrlsByFile = function (_file,_suffixName, _callBack) {
            var code = _file.relData;
            if(_suffixName !== 'js' && _suffixName !== 'css' && _suffixName!== 'html' && _suffixName !=='htm'){
                return;
            }
            //从文件里找到所有的引用链接
            var urls =[];
            if(_file.suffixName === 'js'){
                code = self.packer.pack(code);
            }
            if(_file.suffixName === 'html' || _file.suffixName === 'htm'){
                code = code.replace(/\<\!\-\-(\s|\S)*?\-\-\>/g,'').replace(/\/\*(\s|\S)*?\*\//g,'');
                code = self.packer.minify(code);
            }
            if(_file.suffixName === 'css'){
                code = this.lCSSCoder.pack(code);
            }

            if(_suffixName === 'css'){
                urls = code.match(this.reg.findUrlForCss);
            }else{
                urls = code.match(this.reg.findUrl);
            }
            if(urls !== null) {

                //去重url
                urls = this.removeDuplicate(urls,function(a,b){
                    return a !== b;
                });

                //去除url里的引号
                //判断url引用是否为站内引用
                for (var i = 0; i < urls.length; i++) {
                    var ui = urls[i];
                    var srcUrl = urls[i];
                    ui = ui.replace(/(\'|\"|\`|\))/g, '');
                    srcUrl = srcUrl.replace(/(\'|\"|\`|\))/g, '');
                    if (ui.match(/^(http\:|https\:|)\/\//) === null && ui.match(/^\//) === null) {
                        ui = "/" + ui;
                    }
                    ui = self.getRelativePath(self.rConfig.fromHost, ui);
                    var condition = '';
                    if(ui.indexOf('?') !==  -1){
                        condition = ui.split('?')[1];
                        ui = ui.split('?')[0];
                    }

                    //查找到相应的文件并回调
                    var combineItem = self.fileMap.HostHashList[ui];
                    if (typeof combineItem !== 'undefined') {
                        //讲路径传进去进行操作
                        //操作完成后替换回去
                        var result = _callBack(ui,condition);
                        if(srcUrl.indexOf('"') !==-1){
                            result += '"';
                        }
                        if(srcUrl.indexOf("'") !==-1){
                            result += "'";
                        }
                        if(srcUrl.indexOf(")") !==-1){
                            result += ")";
                        }
                        if(srcUrl.indexOf('`') !==-1){
                            result += '`';
                        }
                        code = code.replace(new RegExp(srcUrl.replace(/\?/g,'\\?').replace(/\_/g,'\\_'),'g'), function () {
                            if(srcUrl.indexOf(self.rConfig.fromHost) !== -1){
                                return self.rConfig.fromHost + result;
                            }else{
                                return result.replace(/^\//,'');
                            }
                        })
                    }
                }
            }
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

        //获取相对路径
        this.getRelativePath = function(_configPath,_filePath){
            return _filePath.replace(_configPath,'');
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



    };
    return m
});