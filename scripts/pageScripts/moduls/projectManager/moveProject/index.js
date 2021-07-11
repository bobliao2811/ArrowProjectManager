//工程/项目选择界面
define(['scripts/pageScripts/moduls/projectManager/moveProject/index.css','scripts/pageScripts/moduls/projectManager/moveProject/index.html'],function(_css,_html){
    var m = function(_config){
        var self = this;
        var config = {
            ditem:{},
            doneCall:function(){},
            cancelCall:function(){}
        }
        this.config = $.extend(true,config,_config);

        this.orgProConfig =  null;

        //选择开发模式
        this.devMode = '0';

        this.html = _html;
        //初始化
        this.init = function(){
            //引入文件夹选择器模块
            using('scripts/pageScripts/moduls/forderSelecter/index.js', function(_forderSelecter) {
                ac.clearLoad();
                alt('请选择一个工程的根目录，以将其工程及其所有文件迁移到本工作目录中..');
                var forderSelecter = new _forderSelecter({
                    yesCallBack: function(_path) {
                        self.isHaveConfig(_path,function(_result){
                            debugger;
                            if(_result.isHave){
                                self.sureLayer(_path,_result);
                                forderSelecter.distroy();
                            }else{
                                alt('您选择的目录并不是Arrow工程所在的目录！请重新选择..');
                            }
                        });
                        
                    },
                    noCallBack: function() {
                        forderSelecter.distroy();
                    }
                });
                forderSelecter.init();
            });
            //this.showPage();
            //this.bindEvents(); 
        }

        //迁移项目
        this.sureLayer = function(_path,_result){
            this.orgProConfig = JSON.parse(_result.config);
            this.showPage();
            this.bindEvents(); 
        }

        //判断该目录是否含有arrow配置文件
        this.isHaveConfig = function(_path,_callback){
            var args = {
                path:_path,
            } 
            ac.runMainFunc('wsm', 'isHaveProjectConfig',args, function(_result) {
                _callback(_result.data);
            });
        }

        //绑定事件
        this.bindEvents = function(){
            this.html.find('[data-id=projectName]').keyup(function(){
                self.showPaths();
            });

            this.html.find('[data-event=cancel]').click(function(){
                self.config.cancelCall();
            });

            this.html.find('[data-event=createProject]').click(function(){
                
            });
        }

        //创建项目
        this.createProject = function(){
            var args = {
                id:ac.newGuid(),
                projectName:this.html.find('[data-id=projectName]').val(),
                path:self.config.ditem.path,
                projectPath:self.config.ditem.path + this.html.find('[data-id=projectName]').val(),
                host:self.config.ditem.host,
                projectHost:self.config.ditem.host + this.html.find('[data-id=projectName]').val(),
                devMode:this.devMode
            } 

            //判断空
            if($.trim(args.projectName) === ''){
                console.write('项目名称不可为空!');
                this.html.find('[data-id=projectName]').focus();
                this.html.find('[data-id=projectName]').select();
                return;
            }

            //判断是否英文字母打头
            if(/^[a-zA-Z]{1,}/.test(args.projectName) === false){
                console.write('请使用英文字母作为开头!');
                this.html.find('[data-id=projectName]').focus();
                this.html.find('[data-id=projectName]').select();
                return;
            }

             //判断是否夹带中文
            if(/^[a-zA-Z0-9\-\_]{1,}$/.test(args.projectName) === false){
                console.write('请勿在名称中使用中文或任何特殊字符!(可以使用"-"或"_")');
                this.html.find('[data-id=projectName]').focus();
                this.html.find('[data-id=projectName]').select();
                return;
            }

            //开始创建项目
             ac.showLoad();
            ac.runMainFunc('wsm', 'newProject',args, function(_result) {
                ac.clearLoad();
                if(_result.data.status === 0){
                    console.write('项目名称"'+ args.projectName +'"已经在工作目录中存在，请另外命名！');
                    return;
                }
                if(_result.data.status === -1){
                    console.write('项目创建错误！');
                    return;
                }
                if(_result.data.status === 1){
                    alt('项目创建成功!');
                    self.config.doneCall();
                    return;
                }
            });

        }

        this.showPaths = function(){
            this.html.find('[data-id=projectPath]').html(self.config.ditem.path + this.html.find('[data-id=projectName]').val());
            this.html.find('[data-id=projectHost]').html(self.config.ditem.host + this.html.find('[data-id=projectName]').val());
        }

        //显示页面
        this.showPage = function(){
            self.html = $(self.html).appendTo('body');
            this.html.find('[data-id=projectName]').val(this.orgProConfig.orgConfig.projectName);
            this.html.find('[data-id=orgProjectPath]').html(this.orgProConfig.orgConfig.projectHost);
            this.html.find('[data-id=orgProjectHost]').html(this.orgProConfig.orgConfig.projectPath);
            this.showPaths();
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