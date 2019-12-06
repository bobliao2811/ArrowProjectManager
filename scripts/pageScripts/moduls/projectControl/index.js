//工程的配置界面
define(['scripts/pageScripts/moduls/projectControl/index.css','scripts/pageScripts/moduls/projectControl/index.html'],function(_css,_html){
    var m = function(_config){
        var self = this;
        var config = {
            loadPath:'',
            enterProjectCall:function(){},
            backCall:function(){}
        }
        this.ipcRenderer = require('electron').ipcRenderer;

        this.config = $.extend(true,config,_config);

        this.html = _html;

        this.projectPhycConfig = null;

        //资源管理器
        this.resManager = null;

        this.mouseover = false;

        //载入工程配置文件
        this.loadProjectConfig = function(_callBack){
            var config = {
                loadPath:self.config.loadPath
            }
            ac.runMainFunc('wsm','loadProjectConfig',config,function(_result){
                _callBack(_result);
            });
        }

        //初始化开发时编译器
        this.initDevCompiler = function(){
            console.write('正在初始化开发时编译器..');
            ac.runMainFunc('wsm','openDevCompiler',self.projectPhycConfig,function(){
                console.write('开发时编译器初始化成功!');
            });
        }

        //往控制台输出日志
        this.printToConsole = function(message){

            var type= ac.formatDate(new Date(),'yyyy-MM-dd HH:mm:ss')+"&nbsp;&nbsp;&nbsp;&nbsp;";
            var classType='';
            if(message.type===0){
                type = type + '系统消息';
                classType = 'sysmsg';
            }

            if(message.type===1){
                type = type + '编译器消息';
                classType = 'commsg';
            }

            if(message.type===2){
                type = type + '错误消息';
                classType = 'errormsg';
            }



            self.html.find('.console-Content').append(`
                    <div class='log-item' style='user-select:text'  ><span class=`+ classType +` style='user-select:text'  >`+ type +`</span></lable style='user-select:text' >`+ message.messsage.replace(/\\n/g,'</br>') +`</lable></div>
            `);

            if(self.mouseover === false){
                 self.html.find('.console-Content').scrollTop(self.html.find('.console-Content')[0].scrollHeight);
            }
        }

        //初始化
        this.init = function(){
             ac.showLoad();

            this.ipcRenderer.on('dev-compiler-channel', function(event, message) { 
               self.printToConsole(message);
            });

            this.loadProjectConfig(function(_result){
                ac.clearLoad();
                self.projectPhycConfig = _result.data;
            	self.showPage();
                self.bindEvents();
                self.initResManager();
                //初始化开发时编译器
                self.initDevCompiler();
            });
        }

        this.bindEvents = function(){
            this.html.find('.rel-hotDebugger').click(function(){

                var menus = [];
                for(var i=0;i<self.projectPhycConfig.releaseConfig.length;i++){
                    var ri = self.projectPhycConfig.releaseConfig[i];
                    (function(_ri){
                        menus.push({name:'热调试发布的配置：'+_ri.name,call:function(){
                            var url = '';
                            if(_ri.toHost.match(/^http\:\/\/|^https\:\/\//g) === null){
                                url = 'http:' + _ri.toHost;
                            }
                           
                            ac.runMainFunc('wsm','getHotDebugPort',{id:self.projectPhycConfig.id},function(_result){
                                ac.runMainFunc('wsm','openPage',{host:url+"/index.html?ArrowHotDebugger=true&ArrowHotDebuggerUrl=ws://localhost:"+_result.data.port},function(_result){});
                            });
                        }});
                    })(ri)
                }


                ac.showDrMenu(menus,{x:mControl.nowPosition.x,y:mControl.nowPosition.y},true,function(){});
            });

            this.html.find('[data-event=back]').click(function(){
                console.write('正在关闭开发时编译器..');
                ac.runMainFunc('wsm','closeDevCompiler',self.projectPhycConfig,function(_result){
                    console.write('开发时编译器已关闭!');
                    self.config.backCall();
                });
            });

            self.html.find('.console-Content').mouseover(function(){
                self.mouseover = true;
            });
            self.html.find('.console-Content').mouseout(function(){
                self.mouseover = false;
            });

            self.html.find('.openSrc').click(function(){
                ac.runMainFunc('wsm','openForderFromExplorer',{path:self.projectPhycConfig.projectPath+"\\src"},function(_result){});
            });

            self.html.find('.openWebSite').click(function(){
                 var url = '';
                if(self.projectPhycConfig.devHost.match(/^http\:\/\/|^https\:\/\//g) === null){
                    url = 'http:' + self.projectPhycConfig.devHost+"/BUILDSRC";
                }
                ac.runMainFunc('wsm','openPage',{host:url},function(_result){});
            });

            self.html.find('.rel-button').click(function(){
                using(['scripts/pageScripts/moduls/projectControl/releaseManager/index.js'],function(_relManager){
                    var rm = new _relManager({
                        parent:self,
                        phyConfig:self.projectPhycConfig,
                        backCall:function(){
                            rm.distory();
                        }
                    });
                    rm.init();
                });
            });

            $(window).resize(function(){
               self.position();
            });
            self.position();
        }

        this.position = function(){
            try{
                self.html.find('.console-Content').width($(window).width() - self.html.find('.console-Content').offset().left+'px');
                self.html.find('.console-Content').height($(window).height() - 20- self.html.find('.console-Content').offset().top +'px');
                self.html.find('.console-Content').scrollTop(self.html.find('.console-Content')[0].scrollHeight);
            }catch(_e){

            }
        }

        //初始化资源管理器
        this.initResManager = function(){
            using('scripts/pageScripts/moduls/projectControl/resourceManager/index.js',function(_resourceManager){
                self.resManager = new _resourceManager({
                    loadPath:self.config.loadPath,
                    parent:self,
                    container:"body"
                });

                self.resManager.init();
            });
        }

        //显示页面
        this.showPage = function(){
        	self.html = $(self.html).appendTo('body');


            self.html.find('[data-id=projectTitle]').html(self.projectPhycConfig.projectName);
            self.html.find('[data-id=projectPath]').html(self.projectPhycConfig.projectPath+"\\src&nbsp;&nbsp;(源码)");


            var visitDir = 'BUILDSRC';
            self.html.find('[data-id=projectHost]').html(self.projectPhycConfig.devHost+"/"+visitDir);

            self.html.find('.sourcePath').html(self.projectPhycConfig.projectPath+"\\src");
            self.html.find('.targetPath').html(self.projectPhycConfig.projectPath+"\\BUILDSRC");

            if(self.projectPhycConfig.devMode === '1'){
                self.html.find('.dccc-headLeft').html('ES6/7 + Node#');
            }else{
                self.html.find('.dccc-headLeft').html('ES5 + AMD');
                self.html.find('.hh-dm').hide();
            }
        }

        this.distory = function(){
            self.html.remove();
            self.resManager.distory();
            this.ipcRenderer.removeAllListeners(['dev-compiler-channel'])
        }
    };
    return m
});