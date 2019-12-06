//新增工作空间界面
define(['scripts/pageScripts/moduls/workDirSelect/newWorkSpace/index.css', 'scripts/pageScripts/moduls/workDirSelect/newWorkSpace/index.html'], function(_css, _html) {
    var m = function(_config) {
        var self = this;
        var config = {
            nextCallBack: function() {

            },
            cencalCallBack: function() {

            }
        }
        this.config = $.extend(true, config, _config);

        this.html = _html;
        //初始化
        this.init = function() {
            this.showPage();
            this.bindEvents();
        }

        //绑定事件
        this.bindEvents = function() {


            this.html.find('[data-event=cancel]').click(function() {
              self.config.cencalCallBack();
            });

            //选择文件夹
            this.html.find('[data-event=chooseForder]').click(function() {
                //引入文件夹选择器模块
                using('scripts/pageScripts/moduls/forderSelecter/index.js', function(_forderSelecter) {
                    var forderSelecter = new _forderSelecter({
                        yesCallBack: function(_path) {
                            self.html.find('[data-id=forder]').val(_path);
                            forderSelecter.distroy();
                        },
                        noCallBack: function() {
                            forderSelecter.distroy();
                        }
                    });
                    forderSelecter.init();
                });
            });

            //下一步按钮
            this.html.find('[data-event=beginUse]').click(function() {
                //先判断文件夹是否存在
                ac.showLoad('检测文件夹合理性..');
                ac.runMainFunc('wsm', 'isExist', {
                    path: self.html.find('[data-id=forder]').val()
                }, function(_result) {
                    ac.clearLoad();
                    if (!_result.data.isExist) {
                        ac.console.write('文件夹不存在，请重新设置文件夹！');
                    } else {
                        ac.console.write('请设置工作目录的名称！');
                        var contentHtml = $(`<div>
                                                <div>工作目录命名并不会在物理上创建文件夹，只是作为您选择的工作空间目录命名以便识别。</div>
                                                  <div style='margin-top:20px' class="textInputBig">
                                                    <input type="text" class="workSpaceName" value="未命名工作目录">
                                                </div>
                                            </div>`);
                        var workSpaceWindow = new ac.window({
                            //标题
                            title: '请设置工作目录的名称：',
                            //内容
                            content: contentHtml,
                            //放置的容器
                            container: 'body',
                            //位置
                            position: {
                                x: 'center',
                                y: 'center'
                            },
                            buttons: {
                                mode: 'yesno',
                                yesCall: function() {
                                    var name = contentHtml.find('.workSpaceName').val();
                                    if ($.trim(name) === '') {
                                        ac.console.write('名称不可为空');
                                        return;
                                    }
                                    if (/[\\\/\:\*\?\"\<\>\|]/g.test(name)) {
                                        ac.console.write('名称不可包含“\\” “/” “:” “*” “?” “"” “<” “>” “|”,请重新命名!');
                                    }
                                    var args = {
                                        workSpaceid:ac.newGuid(),
                                        workSpacePath: self.html.find('[data-id=forder]').val(),
                                        workSpaceHost: self.html.find('[data-id=host]').val(),
                                        workSpaceName: name,
                                        workSpaceDesc: name,
                                        createDate: (+new Date)
                                    };
                                    ac.showLoad('正在创建工作空间..');

                                    if($.trim(args.workSpacePath).match(/\\$/) === null){
                                        args.workSpacePath += '\\';
                                    }

                                    if($.trim(args.workSpacePath).match(/\/$/) === null){
                                        args.workSpaceHost += '/';
                                    }

                                    ac.runMainFunc('wsm', 'addArrowConfigInC', args, function(_result) {
                                        ac.clearLoad();
                                        if (_result.data.status === 1) {
                                            alt('工作空间创建成功!');
                                            ac.console.write('您的第一个工作空间创建成功啦，在界面中选择您创建的工作空间，点击进入并开始创建项目吧！~');
                                            self.config.nextCallBack();
                                        } else {
                                            alt('工作空间创建失败!请使用管理员权限运行程序！');
                                        }
                                    });
                                },
                                noCall: function() {

                                }
                            },
                            //关闭回调
                            closeCall: function() {}
                        });
                        workSpaceWindow.open();
                    }
                });
            });
        }

        this.hide = function(_callBack) {
            this.html.fadeOut(200, _callBack);
        }

        this.distroy = function() {
            this.html.remove();
        }

        //显示页面
        this.showPage = function() {
            this.html = $(this.html).appendTo('body');
        }
    };
    return m
});