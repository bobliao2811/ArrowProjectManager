//目录选择器
define(['scripts/pageScripts/moduls/forderSelecter/index.css','scripts/pageScripts/moduls/forderSelecter/index.html'],function(_css,_html){
    var m = function(_config){
        var self = this;
        var config = {
            yesCallBack:function(){

            },
            noCallBack:function(){

            }
        }
        this.config = $.extend(true,config,_config);
        this.fs = require('fs');
        this.exec = require('child_process').exec;
        this.fileSystem = [];
        this.currentPath = 'c:\\';

        this.html = _html;
        //初始化
        this.init = function(){
        	this.showPage();
            this.bindEvents();
            this.showLetter(function(_drivers){
                self.showFileSystem(_drivers);
            });
        }

        //绑定事件
        this.bindEvents = function(){
           this.html.find('.yesButton').click(function(){
                self.config.yesCallBack(self.currentPath);
           });
           this.html.find('.cancelButton').click(function(){
                self.config.noCallBack();
           });
        }

        this.fileClick = function(_node){
            $('.fs-tree-title').removeClass('selected');
            _node.elem.addClass('selected');
            this.currentPath = _node.path +'\\';

            var displayStr = this.currentPath ;
            if(this.currentPath.length>40){
                displayStr = this.currentPath.substr(0,15) +'...'+this.currentPath.substr(this.currentPath.length - 15,15) 
            }
            this.html.find('.fs-pathView').html(displayStr);

        }

        //展示文件系统
        this.showFileSystem = function(_drivers){
            for(var i =0;i<_drivers.length;i++){
                var dItem = _drivers[i];
                var isLast = false;
                var shape = 'branch';
                if(i+1 === _drivers.length){
                    shape = 'last';
                    isLast = true;
                }
                var elem = $(`<div class='fs-tree-title `+shape+`' >
                        <div class='fs-t-t-inset close'>
                            <div class='fs-tree-icon  driver' ></div>
                            <div>`+ dItem +`</div>
                        </div>
                    </div>`).appendTo(this.html.find('.fs-fileSystemView-inset'));
                var driverNode = {
                    name:dItem,
                    path:dItem,
                    elem:elem,
                    childrenNode:null,
                    isLast:isLast,
                    isOpen:false,
                    children:[]
                }
                this.fileSystem.push(driverNode);

                (function(_driverNode){
                    _driverNode.elem.click(function(){
                        self.fileClick(_driverNode);
                        if(_driverNode.isOpen){
                            _driverNode.childrenNode.hide(); 
                            _driverNode.elem.find('.fs-t-t-inset').removeClass('open');
                            _driverNode.elem.find('.fs-t-t-inset').addClass('close');
                            _driverNode.isOpen = false;
                        }else{
                            if(_driverNode.childrenNode === null){
                                _driverNode.childrenNode = self.openForder(_driverNode);
                            }else{
                               _driverNode.childrenNode.show(); 
                            }
                            _driverNode.elem.find('.fs-t-t-inset').removeClass('close');
                            _driverNode.elem.find('.fs-t-t-inset').addClass('open');
                            _driverNode.isOpen = true;
                        }
                    });
                })(driverNode);
            }
        }

        //展开目录
        this.openForder = function(_parentNode){
            var fList = self.fs.readdirSync(_parentNode.path+ "\\");
            var forderList = [];
            for(var i=0;i<fList.length;i++){
                fItem = fList[i];
                var isf = false;
                try{
                    isf = self.fs.lstatSync(_parentNode.path + "\\"+fItem).isDirectory();
                }catch(e){};
                if(isf){
                   forderList.push(fItem);
                }
            }

            var container = $('<div></div>').insertAfter(_parentNode.elem);
            container.addClass('fs-tree-childs');
            if(_parentNode.isLast){
                container.addClass('last');
            }

            if(forderList.length === 0){
                $(`<div class='fs-tree-title last' >
                    <div class='fs-t-t-inset close'>
                        <div style='margin-left:40px' title='没有文件夹' >没有文件夹</div>
                    </div>
                </div>`).appendTo(container);
                return container;
            }
            for(var i=0;i<forderList.length;i++){
                var fItem = forderList[i];
                var isLast = false;
                var shape = 'branch';
                if(i+1 === forderList.length){
                    shape = 'last';
                    isLast = true;
                }
                var elem = $(`<div class='fs-tree-title `+shape+`' >
                        <div class='fs-t-t-inset close'>
                            <div class='fs-tree-icon  forder' ></div>
                            <div title=`+ fItem +` >`+ fItem +`</div>
                        </div>
                    </div>`).appendTo(container);
                var forderNode = {
                    name:fItem,
                    path:_parentNode.path+'\\'+fItem,
                    elem:elem,
                    childrenNode:null,
                    isLast:isLast,
                    isOpen:false,
                    children:[]
                }
                _parentNode.children.push(forderNode);

                (function(_forderNode){
                    _forderNode.elem.click(function(){
                        self.fileClick(_forderNode);
                        if(_forderNode.isOpen){
                            _forderNode.childrenNode.hide(); 
                            _forderNode.elem.find('.fs-t-t-inset').removeClass('open');
                            _forderNode.elem.find('.fs-t-t-inset').addClass('close');
                            _forderNode.elem.find('.fs-tree-icon').removeClass('forderOpen');
                            _forderNode.elem.find('.fs-tree-icon').addClass('forder');
                            _forderNode.isOpen = false;
                        }else{
                            if(_forderNode.childrenNode === null){
                                _forderNode.childrenNode = self.openForder(_forderNode);
                            }else{
                               _forderNode.childrenNode.show(); 
                            }
                            _forderNode.elem.find('.fs-t-t-inset').removeClass('close');
                            _forderNode.elem.find('.fs-t-t-inset').addClass('open');
                            _forderNode.elem.find('.fs-tree-icon').removeClass('forder');
                            _forderNode.elem.find('.fs-tree-icon').addClass('forderOpen');
                            _forderNode.isOpen = true;
                        }
                    });
                })(forderNode);
            }
            return container;
        }

        this.showLetter = function(callback) {
            var wmicResult;
            var command = this.exec('wmic logicaldisk get caption', function(err, stdout, stderr) {
                if(err || stderr) {
                    console.log("root path open failed" + err + stderr);
                    return;
                }
                wmicResult = stdout;
            });
            command.stdin.end();   // stop the input pipe, in order to run in windows xp
            command.on('close', function(code) {
                //console.log("wmic close:: code:" + code);
                var data = wmicResult.split('\n');
                var result = [];
                for(var i in data){
                    if(data[i].indexOf('Caption') === -1 && $.trim(data[i]) !== ''){
                        result.push($.trim(data[i]));
                    }
                }
                callback(result);
            });
        }

        
        this.distroy = function(){
            this.html.remove();
        }

        //显示页面
        this.showPage = function(){
        	this.html = $(this.html).appendTo('body');
        }
    };
    return m
});