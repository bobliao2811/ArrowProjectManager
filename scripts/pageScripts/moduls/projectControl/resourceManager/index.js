//工程的配置界面
define(['scripts/pageScripts/moduls/projectControl/resourceManager/index.css','scripts/pageScripts/moduls/projectControl/resourceManager/index.html'],function(_css,_html){
    var m = function(_config){
        var self = this;
        var config = {
            loadPath:'',
            parent:null,
            container:"body"
        }
        this.config = $.extend(true,config,_config);
        this.fs = require('fs');

        this.pcHostName = require('os').hostname();
        this.html = _html;
        this.parent = self.config.parent;
        this.projectNode = {
            name:self.parent.projectPhycConfig.orgConfig.projectName,
            path:self.parent.projectPhycConfig.orgConfig.projectPath,
            pPath:'',
            elem:null,
            childrenNode:null,
            isLast:false,
            isOpen:false,
            isTop:true,
            watcher:null,
            isForder:true,
            children:[]
        }

        //初始化
        this.init = function(){
           this.showPage();
           this.bindEvents();
           this.loadPathNode();
           self.resize();
        }

        this.bindEvents = function(){
            $(window).resize(self.resize);
             self.html.find('.rm-button').click(function(){
                self.html.find('.rm-panel').show();
                self.html.find('.backgroundLayer').show();
                self.resize();
             });
            self.html.find('.rmp-title span.button').click(function(){
                self.html.find('.rm-panel').hide();
                self.html.find('.backgroundLayer').hide();
                self.html.find('[data-id=editor]').hide();
                self.resize();
            });
        }

        this.resize = function(){
            self.html.find('.rm-button').css('top',$(window).height()/2 - self.html.find('.rm-button').outerHeight()/2);

            var totalHeight = self.html.find('.outer').outerHeight();
            self.html.find('.rmp-tree').css('height',$(window).height() - totalHeight);
            self.html.find('[data-id=editor]').css('width',$(window).width() - self.html.find('.rm-panel').width());
            self.html.find('[data-id=editor]').css('left',self.html.find('.rm-panel').width());
        }

        //打开编辑器
        this.openEditor = function(_node){
            this.fs.readFile(_node.path,'utf-8',function (_err,_data) {
                self.html.find('[data-id=editor]').show();
                self.html.find('[data-id=editor]')[0].contentWindow.createEditor(_data);
            });
        }

        //显示页面
        this.showPage = function(){
        	self.html = $(self.html).appendTo(self.config.container);
            self.html.find('[data-id=path]').val(self.config.loadPath);
            self.html.find('[data-id=pPath]').val(self.parent.projectPhycConfig.orgConfig.projectHost);   
        }

        this.distory = function(){
            //关闭所有nodejs观察者
            self.closeAllWatcher(self.projectNode);
            self.projectNode.watcher.close();
            window.clearInterval(self.projectNode.watcherInv);
            self.html.remove();
        }

        this.loadPathNode = function(){
            this.projectNode.elem = this.html.find('[data-id=projectNode]');
            this.projectNode.childrenNode = this.openForder(this.projectNode);
        }

        //对某个节点开启监听
        this.watchNode = function(_node){
            _node.isChange = false;
            //检测到目录发生变化，重新载入目录
            _node.watcherInv = window.setInterval(function(){
                if(_node.isChange){
                    self.closeAllWatcher(_node);
                    _node.childrenNode.remove();
                    _node.childrenNode = null;
                    _node.children = [];
                    _node.childrenNode = self.openForder(_node);
                    _node.isChange = false;
                }
            },1000);
           _node.watcher = self.fs.watch(_node.path, {
                persistent: true, // 设为false时，不会阻塞进程。
                recursive: false
            }, function(event, filename) {
                //rename代表新增或者删除，其它或者改名，其它事件忽略
                if(event === 'rename'){
                    _node.isChange = true;
                }
            });
        }

        //关闭某个目录下子目录的所有watcher
        this.closeAllWatcher = function(_node){
            for(var i=0;i<_node.children.length;i++){
                var nItem = _node.children[i];
                if(nItem.isForder && nItem.children.length !== 0){
                    self.closeAllWatcher(nItem);
                }
                if(nItem.isForder && nItem.watcher !== null){
                    nItem.watcher.close();
                    window.clearInterval(nItem.watcherInv);
                }
            }
        }

        //展开目录
        this.openForder = function(_parentNode){
            self.watchNode(_parentNode);
            var fList = self.fs.readdirSync(_parentNode.path+ "\\");
            var itemList = [];
            for(var i=0;i<fList.length;i++){
                fItem = fList[i];
                var isf = false;
                try{
                    isf = self.fs.lstatSync(_parentNode.path + "\\"+fItem).isDirectory();
                }catch(e){};
                if(isf){
                   itemList.push({item:fItem,isForder:true});
                }else{
                    itemList.push({item:fItem,isForder:false});
                }
            }

            var container = $('<div></div>').insertAfter(_parentNode.elem);
            if(!_parentNode.isTop){
                container.addClass('fs-tree-childs');
            }
            if(_parentNode.isLast){
                container.addClass('last');
            }

            if(itemList.length === 0){
                $(`<div class='fs-tree-title last' >
                    <div class='fs-t-t-inset close'>
                        <div style='margin-left:40px' title='没有文件' >没有文件</div>
                    </div>
                </div>`).appendTo(container);
                return container;
            }
            for(var i=0;i<itemList.length;i++){
                var fItem = itemList[i];
                var isLast = false;
                var fIcon = 'forder';
                var shape = 'branch';
                if(i+1 === itemList.length){
                    shape = 'last';
                    isLast = true;
                }
                if(!fItem.isForder){
                    fIcon = 'file';
                }
                var elem = $(`<div class='fs-tree-title `+shape+`' >
                        <div class='fs-t-t-inset close'>
                            <div class='fs-tree-icon  `+ fIcon +`' ></div>
                            <div title=`+ fItem.item +` >`+ fItem.item +`</div>
                        </div>
                    </div>`).appendTo(container);
                
                var fNode = {
                    name:fItem.item,
                    path:_parentNode.path+'\\'+fItem.item,
                    pPath:_parentNode.pPath+'\\'+fItem.item,
                    elem:elem,
                    childrenNode:null,
                    isLast:isLast,
                    isOpen:false,
                    isTop:false,
                    watcher:null,
                    isForder:fItem.isForder,
                    children:[]
                }
                //如果是\src\compoments 下的文件夹都可以添加组件
                if(/^\\src\\compoments/.test(fNode.pPath) && fNode.name !== 'images' && fNode.isForder === true){
                    elem.append('<span class="button blue newCompoments" d-d="drDownMenu" >..</span>');
                }

                _parentNode.children.push(fNode);

                (function(_fNode){
                    //_fNode.elem.find('[d-d=newCompoments]').click(function(_e){
                    //    _e.stopPropagation();
                    //    self.addNewCompoment(_fNode);
                    //});
                    //_fNode.elem.find('[d-d=newForder]').click(function(_e){
                    //    _e.stopPropagation();
                    //    self.addNewForder(_fNode);
                    //});
                    _fNode.elem.find('[d-d=drDownMenu]').click(function(_e){
                        _e.stopPropagation();
                        ac.showDrMenu([
                                {name:'新增文件夹',call:function(){
                                    self.addNewForder(_fNode);
                                }},
                                {name:'新增组件',call:function(){
                                    self.addNewCompoment(_fNode);
                                }},
                                {name:'在系统中打开文件夹',call:function(){
                                    ac.runMainFunc('wsm','openForderFromExplorer',{path:_fNode.path},function(_result){});
                                }}
                            ],{x:mControl.nowPosition.x,y:mControl.nowPosition.y},true,function(){});
                    });


                    _fNode.elem.click(function(){
                        self.fileClick(_fNode);

                        //是文件夹才能展开
                        if(_fNode.isForder){
                            if(_fNode.isOpen){
                                _fNode.childrenNode.hide(); 
                                _fNode.elem.find('.fs-t-t-inset').removeClass('open');
                                _fNode.elem.find('.fs-t-t-inset').addClass('close');
                                _fNode.elem.find('.fs-tree-icon').removeClass('forderOpen');
                                _fNode.elem.find('.fs-tree-icon').addClass('forder');
                                _fNode.isOpen = false;
                            }else{
                                if(_fNode.childrenNode === null){
                                    _fNode.childrenNode = self.openForder(_fNode);
                                }else{
                                   _fNode.childrenNode.show(); 
                                }
                                _fNode.elem.find('.fs-t-t-inset').removeClass('close');
                                _fNode.elem.find('.fs-t-t-inset').addClass('open');
                                _fNode.elem.find('.fs-tree-icon').removeClass('forder');
                                _fNode.elem.find('.fs-tree-icon').addClass('forderOpen');
                                _fNode.isOpen = true;
                            }
                            self.html.find('[data-id=editor]').hide();
                        }else{
                            self.openEditor(_fNode);
                        }
                    });
                })(fNode);
            }
            return container;
        }

        //增加新的文件夹
        this.addNewForder = function(_fNode){
            var content = $(`
                    <div>
                        <table style='width:100%' >
                            <tr>
                                <td style='width: 89px;' >文件夹名称:</td>
                                <td style='text-align:left' ><input data-id='fileName'  style='width: 100%;' placeholder='在此输入文件夹名称' value='newForder' /></td>
                            </tr>
                            <tr>
                                <td colspan='2' data-id='totalPath' >

                                </td>
                            </tr>
                        </table>
                    </div>
                `);

            var totalPath  =content.find('[data-id=totalPath]');
            var input = content.find('[data-id=fileName]');
            var addWindow = new ac.window({
              //标题
              title:'创建文件夹',
              //内容
              content:content,
              //放置的容器
              container:'body',
              //位置
              position:{
                  x:'center',
                  y:'center'
              },
              buttons:{
                  mode:'yesno',
                  yesCall:function(){

                    var name = input.val();

                    //判断空
                    if($.trim(name) === ''){
                        console.write('文件夹名称不可为空!');
                        input.focus();
                        input.click();
                        input.select();
                        return;
                    }

                    //判断是否英文字母打头
                    if(/^[a-zA-Z]{1,}/.test(name) === false){
                        console.write('请使用英文字母作为开头!');
                        input.focus();
                        input.click();
                        input.select();
                        return;
                    }

                     //判断是否夹带中文
                    if(/^[a-zA-Z0-9\-\_]{1,}$/.test(name) === false){
                        console.write('请勿在名称中使用中文或任何特殊字符!(可以使用"-"或"_")');
                        input.focus();
                        input.click();
                        input.select();
                        return;
                    }

                      
                    ask('确定创建文件夹:'+name+'吗?',function(){
                        ac.runMainFunc('wsm','newForder',{path:_fNode.path + '\\'+ name},function(_result){
                            if(_result.data === false){
                                alt('文件夹创建成功!');
                            }else{
                                alt('文件夹创建失败，有同名文件夹存在！');
                            }
                        });
                    },function(){});

                  },
                  noCall:function(){
                      console.write('取消文件夹创建..');
                  }
              },
              //关闭回调
              closeCall:function(){}
            });
            addWindow.open(function(){
                var cupPAth = function(){
                    totalPath.html(_fNode.path + '\\'+ input.val() );
                }
                cupPAth();
                input.keyup(cupPAth);
                input.focus();
                input.click();
                input.select();

            });

        }

        //增加新的组件
        this.addNewCompoment = function(_fNode){
             var content = $(`
                <div>
                    <table style='width:100%' >
                        <tr>
                            <td style='width: 89px;' >模块名称:</td>
                            <td style='text-align:left' ><input  style='width: 100%;' data-id='modulName' placeholder='在此输入模块名称' value='newCom' /></td>
                        </tr>
                        <tr>
                            <td style='width: 89px;' >模块作者:</td>
                            <td style='text-align:left' ><input  style='width: 100%;' data-id='creater' placeholder='在此输入模块作者' value='`+ self.pcHostName +`' /></td>
                        </tr>
                        <tr>
                            <td style='width: 89px;' >模块描述:</td>
                            <td style='text-align:left' ><input  style='width: 100%;' data-id='description' placeholder='在此输入文件夹名称' value='模块作者很懒，什么都没留下~' /></td>
                        </tr>
                        <tr>
                            <td colspan='2' data-id='totalPath' >

                            </td>
                        </tr>
                        <tr>
                            <td colspan='2' data-id='imagePath' >

                            </td>
                        </tr>
                        <tr>
                            <td colspan='2' data-id='cssPath' >

                            </td>
                        </tr>
                        <tr>
                            <td colspan='2' data-id='jsPath' >

                            </td>
                        </tr>
                        <tr>
                            <td colspan='2' data-id='htmlPath' >

                            </td>
                        </tr>
                    </table>
                </div>
            `);

             var modulNameInput = content.find('[data-id=modulName]');
             var createrInput = content.find('[data-id=creater]');
             var descriptionInput = content.find('[data-id=description]');

             var totalPath = content.find('[data-id=totalPath]');
             var imagePath = content.find('[data-id=imagePath]');
             var cssPath = content.find('[data-id=cssPath]');
             var jsPath = content.find('[data-id=jsPath]');
             var htmlPath = content.find('[data-id=htmlPath]');

            var addWindow = new ac.window({
            //标题
            title:'创建新模块',
            //内容
            content:content,
            //放置的容器
            container:'body',
            //位置
            position:{
                x:'center',
                y:'center'
            },
            buttons:{
                mode:'yesno',
                yesCall:function(){
                    //创建参数
                    var args = {
                        devMode:self.parent.projectPhycConfig.devMode,
                    //  path:'模块的总物理路径'
                        path:_fNode.path + '\\'+ modulNameInput.val(),
                    //  host:'模块的总访问路径'
                        host:self.parent.projectPhycConfig.devHost+(_fNode.pPath.replace(/\\/g,'/'))+'/'+modulNameInput.val(),
                    //  name:'模块名称'
                        name:modulNameInput.val(),
                    //  creater:'创建者'
                        creater:createrInput.val(),
                    //  dateTime:'创建时间'
                        dateTime:ac.formatDate(new Date(),'yyyy-MM-dd HH:mm:ss'),
                    //  description:'模块描述'
                        description:descriptionInput.val(),
                    //  pConfig：项目的配置文件
                        pConfig:self.parent.projectPhycConfig
                    }

                    //判断空
                    if($.trim(args.name) === ''){
                        console.write('模块名称不可为空!');
                        modulNameInput.focus();
                        modulNameInput.click();
                        modulNameInput.select();
                        return;
                    }

                    //判断是否英文字母打头
                    if(/^[a-zA-Z]{1,}/.test(args.name) === false){
                        console.write('请使用英文字母作为开头!');
                        modulNameInput.focus();
                        modulNameInput.click();
                        modulNameInput.select();
                        return;
                    }

                     //判断是否夹带中文
                    if(/^[a-zA-Z0-9\-\_]{1,}$/.test(args.name) === false){
                        console.write('请勿在名称中使用中文或任何特殊字符!(可以使用"-"或"_")');
                        modulNameInput.focus();
                        modulNameInput.click();
                        modulNameInput.select();
                        return;
                    }

                    ask('确定创建模块:'+args.name+'吗?',function(){
                        ac.runMainFunc('wsm','newCompoment',args,function(_result){
                            if(_result.data === false){
                                alt('模块创建成功!');
                            }else{
                                alt('模块创建失败，有同名模块存在！');
                            }
                        });
                    },function(){});

                },
                noCall:function(){
                    console.write('取消模块创建..');
                }
            },
            //关闭回调
            closeCall:function(){}
            });
            addWindow.open(function(){
                var cupPAth = function(){
                    totalPath.html(_fNode.path + '\\'+ modulNameInput.val() );
                    imagePath.html(_fNode.path + '\\'+ modulNameInput.val()+'\\images' );
                    cssPath.html(_fNode.path + '\\'+ modulNameInput.val()+'\\'+modulNameInput.val()+'.css' );
                    jsPath.html(_fNode.path + '\\'+ modulNameInput.val()+'\\'+modulNameInput.val()+'.js' );
                    htmlPath.html(_fNode.path + '\\'+ modulNameInput.val()+'\\'+modulNameInput.val()+'.html' );
                }
                cupPAth();

                modulNameInput.keyup(cupPAth);
                modulNameInput.focus();
                modulNameInput.click();
                modulNameInput.select();
            });
        }

        this.fileClick = function(_node){
            $('.fs-tree-title').removeClass('selected');
            _node.elem.addClass('selected');
            this.currentPath = _node.path ;

            var displayStr = this.currentPath ;
            if(this.currentPath.length>40){
                displayStr = this.currentPath.substr(0,15) +'...'+this.currentPath.substr(this.currentPath.length - 15,15) 
            }
            self.html.find('.rmp-path').val(this.currentPath);
            self.html.find('[data-id=pPath]').val(self.parent.projectPhycConfig.devHost+(_node.pPath.replace(/\\/g,'/')));   
        }

    };
    return m
});