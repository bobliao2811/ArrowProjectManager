//工作目录选择界面
define(['scripts/pageScripts/moduls/workDirSelect/index.css','scripts/pageScripts/moduls/workDirSelect/index.html'],function(_css,_html){
    var m = function(){
        var self = this;

        this.html = _html;
        this.welcome = null;
        this.projectManager = null;
        
        //初始化
        this.init = function(){
        	this.showPage();
            this.bindEvents();
            this.testWorkSpaceCount();
        }

        //检查工作空间数量，没有的话就是第一次使用
        this.testWorkSpaceCount = function(){
            //判断c盘中是否存在系统配置文件
            ac.showLoad();
            ac.runMainFunc('wsm','getArrowConfigIsExistInC',{},function(_result){
                if(!_result.data.isExist){
                    ac.clearLoad();
                    ac.console.write('感谢您使用Arrow框架，第一次使用请设置工作目录和相应的HostUrl!');
                    self.initWelcome();
                }else{
                    self.loadList();
                }
            });
        }

        //加载列表
        this.loadList=function(){
            self.html.find('.workDirSelectList').empty();
            ac.showLoad();
            ac.runMainFunc('wsm','readMainConfigFromC',{},function(_result){
                ac.clearLoad();
                var data = _result.data;
                if(data.workSpaceList.length === 0){
                     self.addNewWorkSpace();
                    return;
                }
                for(var i=0;i<data.workSpaceList.length;i++){
                    var ditem = data.workSpaceList[i];
                    var elem = $(`
                            <div class='ListItem' >
                                <div class='li-index' >
                                    #`+ (i+1) +`
                                </div>
                                <div class='li-description' >
                                    <div class='li-d-title' >
                                        <span>`+ ditem.name +`</span>
                                        <label>添加于`+ ac.formatDate(new Date(ditem.createDate),'yyyy/MM/dd HH:mm:ss') +`</label>
                                    </div>
                                    <div class='li-d-phycDir' >
                                        `+ ditem.path +`
                                    </div>
                                    <div class='li-d-baseUrl' >
                                        `+ ditem.host +`
                                    </div>
                                </div>
                                <div class='li-going-to-button' data-event='gointo' >
                                    进入>
                                </div>
                                <div class='li-operations' >  
                                    <span data-event='deleteItem' >删除</span>  
                                    <label>|</label>  
                                    <span  data-event='openforder' >浏览文件夹</span>
                                </div>
                                
                            </div>
                    `).appendTo(self.html.find('.workDirSelectList'));
                    (function(_ditem,_elem){
                        _elem.find('[data-event=deleteItem]').click(function(){
                            ask('确定删除“'+ _ditem.name +'”('+ _ditem.path +')吗?</br>删除操作将会删除硬盘上所有此工作空间目录下的文件以及目录，继续吗？',function(){
                                ac.showLoad();
                                //删除文件
                                ac.runMainFunc('wsm','deleteWorspaceForder',_ditem,function(_result){
                                    ac.clearLoad();
                                    self.loadList();
                                });
                            },function(){

                            });
                        });

                        //打开所在文件夹
                        _elem.find('[data-event=openforder]').click(function(){
                            ac.runMainFunc('wsm','openForderFromExplorer',_ditem,function(_result){});
                        });

                        _elem.find('[data-event=gointo]').click(function(){
                            self.initProjectManager(_ditem);
                        });
                    })(ditem,elem)
                }
            });
        };

        this.bindEvents = function(){
            this.html.find('[data-event=newWorkSpace]').click(function(){
                self.addNewWorkSpace();
            });
        }

        this.addNewWorkSpace = function(){
            using('scripts/pageScripts/moduls/workDirSelect/newWorkSpace/index.js',function(_newWorkSpace){
                var newWorkSpace = new _newWorkSpace({nextCallBack:function(){
                  newWorkSpace.hide(function(){
                    newWorkSpace.distroy();
                  });
                  self.loadList();
                },cencalCallBack:function(){
                    newWorkSpace.hide(function(){
                        newWorkSpace.distroy();
                    });
                }});
                newWorkSpace.init();
            });
        }

        //打开开始界面
        this.initWelcome = function(){
            using('scripts/pageScripts/moduls/welcome/index.js',function(_welcome){
                self.welcome = new _welcome({nextCallBack:function(){
                  self.welcome.hide(function(){
                    self.welcome.distroy();
                  });
                  self.show();
                  self.loadList();
                }});
                self.welcome.init();
                self.hide()
            });
        }

        //打开项目管理界面
        this.initProjectManager = function(_ditem){
            using('scripts/pageScripts/moduls/projectManager/index.js',function(_projectManager){
                self.projectManager = new _projectManager({
                    ditem:_ditem,
                    enterProjectCall:function(_pItem){
                        self.openProject(_pItem);
                    },
                    backCall:function(){
                        self.show();
                        self.projectManager.distory();
                        self.projectManager = null;
                    }
                });
                self.projectManager.init();
                self.hide();
            });
        }

        this.hide = function(){
            self.html.hide();
        };

        this.show = function(){
            self.html.show();
        };

        //打开一个项目
        this.openProject = function(_pItem){
            self.projectManager.hide();
            using('scripts/pageScripts/moduls/projectControl/index.js',function(_projectControl){
                self.projectControl = new _projectControl({
                    loadPath:_pItem.projectPath+'\\',
                    backCall:function(){
                        self.projectManager.show();
                        self.projectControl.distory();
                        self.projectControl = null;
                    }
                });
                self.projectControl.init();
                self.projectManager.hide();
            });
        }

        //显示页面
        this.showPage = function(){
        	self.html = $(self.html).appendTo('body');
        }
    };
    return m
});