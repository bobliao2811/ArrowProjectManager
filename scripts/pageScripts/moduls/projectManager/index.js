//工程/项目选择界面
define(['scripts/pageScripts/moduls/projectManager/index.css','scripts/pageScripts/moduls/projectManager/index.html'],function(_css,_html){
    var m = function(_config){
        var self = this;
        var config = {
            ditem:{},
            enterProjectCall:function(){},
            backCall:function(){}
        }
        this.config = $.extend(true,config,_config);

        this.html = _html;
        //初始化
        this.init = function(){
            this.showPage();
            this.bindEvents();
            self.loadList();
        }

        //进入某个工程的管理界面
        this.bindEvents = function(){

            //新建项目
            this.html.find('[data-event=newProject]').click(function(){
                self.addNewProject();
            });

            //this.html.find('[data-event=enter]').click(function(){
            //    self.config.enterProjectCall();
            //});
            this.html.find('[data-event=back]').click(function(){
                self.config.backCall();
            });
        }

        //增加新项目
        this.addNewProject = function(){
            using('scripts/pageScripts/moduls/projectManager/newProject/index.js',function(_newProject){
                var newProject = new _newProject({ditem:self.config.ditem,doneCall:function(){
                  newProject.hide(function(){
                    newProject.distroy();
                  });
                  self.loadList();
                },cancelCall:function(){
                    newProject.hide(function(){
                        newProject.distroy();
                    });
                }});
                newProject.init();
            });
        }

        //渲染列表
        this.loadList = function(){
            ac.showLoad();
            ac.runMainFunc('wsm', 'detactProjectConfig',self.config.ditem, function(_result) {
                ac.clearLoad();
                if(_result.data.projects.length === 0){
                    self.addNewProject();
                }else{
                    self.html.find('.projectSelectList').empty();
                    var data = _result.data.projects;
                    for(var i=0;i<data.length;i++){
                        var pItem = data[i];
                        var elem=$(`<div class='listItem' >
                                        <div class='operationBlock' >
                                            <div><span data-event='enter' >进入</span></div>
                                            <div><span data-event='delete' >删除</span></div>
                                        </div>
                                        <div class='detailBlock' >
                                            <div class='title' >
                                                <span >
                                                    #`+ (i+1) +`
                                                </span>
                                                <label>
                                                    `+ pItem.projectName +`
                                                </label>
                                            </div>
                                            <div class='projectDet' >
                                                <span>
                                                    `+ pItem.projectPath +`
                                                </span>
                                                <label data-event='viewForder' >
                                                    浏览工程文件夹
                                                </label>
                                            </div>
                                            <div class='projectDet bottom' >
                                                <span>
                                                     `+ pItem.projectHost +`
                                                </span>
                                                <label  data-event='viewPage'  >
                                                    浏览器打开本地站点
                                                </label>
                                            </div>
                                        </div>
                                    </div>`).appendTo(self.html.find('.projectSelectList'));
                        (function(_elem,_pItem){
                            //访问文件夹
                            _elem.find('[data-event=viewForder]').click(function(){
                                ac.runMainFunc('wsm','openPage',{host:_pItem.projectPath},function(_result){});
                            });
                            //访问网站
                            _elem.find('[data-event=viewPage]').click(function(){
                                var url = '';
                                if(_pItem.projectHost.match(/^http\:\/\/|^https\:\/\//g) === null){
                                    url = 'http:' + _pItem.projectHost;
                                }
                                ac.runMainFunc('wsm','openPage',{host:url},function(_result){});
                            });
                            //删除
                            _elem.find('[data-event=delete]').click(function(){
                                ask('确定要删除项目"'+_pItem.projectPath+'"?',function(){
                                    var args = {
                                            projectPath:_pItem.projectPath,
                                            workSpacePath:_pItem.path,
                                            id:_pItem.id
                                    }
                                    ac.runMainFunc('wsm','deleteProject',args,function(_result){
                                        alt('项目"'+ _pItem.projectPath +'"删除成功!');
                                        _elem.remove();
                                        self.loadList();
                                    });
                                },function(){});
                            });

                            //进入工程管理
                            _elem.find('[data-event=enter]').click(function(){
                                self.config.enterProjectCall(_pItem);
                            });
                        })(elem,pItem)
                    }
                }
            });
        }

        //显示页面
        this.showPage = function(){
            self.html = $(self.html).appendTo('body');
            self.html.find('[data-id=dirName]').html(self.config.ditem.name);
            self.html.find('[data-id=dirPath]').html(self.config.ditem.path);
        }

        this.hide = function(){
            self.html.hide();
        };

        this.show = function(){
            self.html.show();
        };

        this.distory = function(){
            self.html.remove();
        }
    };
    return m
});







































