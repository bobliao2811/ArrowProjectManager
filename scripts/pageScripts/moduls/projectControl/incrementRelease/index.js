//增量发布界面
define(['scripts/pageScripts/moduls/projectControl/incrementRelease/index.css','scripts/pageScripts/moduls/projectControl/incrementRelease/index.html'],function(_css,_html){
	var m = function(_config){
		var self = this;
	 	var config = {
	 		parent:{},
	 		phyConfig:{},
	 		currentConfig:{},
	 		container:'body',
	 		backCall:function(){},
	 		releaseCall:function(){}
	 	}

	 	this.html = _html;

	 	this.config = $.extend(true,config,_config);

	 	this.fs = require('fs');
        this.pcHostName = require('os').hostname();

	 	this.phyConfig = this.config.phyConfig;
	 	this.currentSetting = this.config.currentConfig;
	 	this.parent = this.config.parent;

	 	this.projectNode = {
            name:'BUILDSRC',
            path:this.phyConfig.projectPath+'\\BUILDSRC',
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

        this.selectedFileList = [];
        this.relbtnIsShow = false;

	 	//初始化
	 	this.init = function(){
	 		this.showPage();
	 		this.bindEvent();
	 		this.loadPathNode();
	 		$(window).resize(function(){
	 			self.position();
	 		});
	 	}

	 	this.loadPathNode = function(){
            this.projectNode.elem = this.html.find('[data-id=projectNode]');
            this.projectNode.childrenNode = this.openForder(this.projectNode);
        }

                //展开目录
        this.openForder = function(_parentNode,_isSelect){
        	if(_parentNode.childrenNode !== null && _parentNode.isForder){
        		_parentNode.childrenNode.show();
        		if(typeof _isSelect!== 'undefined'){
        			for(var i =0;i<_parentNode.children.length;i++){
						(function(_i){
							ac.eec.qurrer.push({call:function(){
								_parentNode.children[_i].elem.find('.chackBox-custom').trigger('click');
							},time:10});
						})(i);
        			}
        		}
        		return _parentNode.childrenNode;
        	}
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
                    isSelected:false,
                    children:[]
                }
                //如果是\src\compoments 下的文件夹都可以添加组件

                elem.append('<span class="chackBox-custom"></span>');

                _parentNode.children.push(fNode);

                (function(_fNode){
                    _fNode.elem.find('.chackBox-custom').click(function(_e){
                        _e.stopPropagation();
                        self.updateFileList(_fNode);
                       if(_fNode.isSelected === true){
                       		_fNode.elem.find('.chackBox-custom').removeClass('selected');
                       		_fNode.isSelected = false;
                       		if(_fNode.isForder){
                       			_fNode.childrenNode = self.openForder(_fNode,false);
                       		}
                       }else{
                       		_fNode.elem.find('.chackBox-custom').addClass('selected');
                       		_fNode.isSelected = true;
                       		if(_fNode.isForder){
                       			_fNode.childrenNode = self.openForder(_fNode,true);
                                _fNode.elem.find('.fs-t-t-inset').removeClass('close');
                                _fNode.elem.find('.fs-t-t-inset').addClass('open');
                                _fNode.elem.find('.fs-tree-icon').removeClass('forder');
                                _fNode.elem.find('.fs-tree-icon').addClass('forderOpen');
                                _fNode.isOpen = true;
                       		}
                       }
                    });
                    if(typeof _isSelect!== 'undefined'){
						(function(_fNode){
							ac.eec.qurrer.push({call:function(){
								_fNode.elem.find('.chackBox-custom').trigger('click');
							},time:1});
						})(_fNode);
	        		}


                    _fNode.elem.click(function(){
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
                                _fNode.childrenNode = self.openForder(_fNode);
                                _fNode.elem.find('.fs-t-t-inset').removeClass('close');
                                _fNode.elem.find('.fs-t-t-inset').addClass('open');
                                _fNode.elem.find('.fs-tree-icon').removeClass('forder');
                                _fNode.elem.find('.fs-tree-icon').addClass('forderOpen');
                                _fNode.isOpen = true;
                            }
                            self.html.find('[data-id=editor]').hide();
                        }
                    });
                })(fNode);
            }
            return container;
        }

        this.updateFileList = function(_node){

        	var isHasBeenDeleted = false;
        	var newList = [];
        	for(var i =0;i<this.selectedFileList.length;i++){
        		if(_node.path !== this.selectedFileList[i].path){
        			newList.push(this.selectedFileList[i]);
        		}else{
        			isHasBeenDeleted = true;
        		}
        	}

        	if(isHasBeenDeleted){
        		this.selectedFileList = newList;
        	}else{
        		this.selectedFileList.push(_node);
        	}
        	this.showCurrentList();
        }

        this.showCurrentList = function(){
        	this.html.find('.bottom-button-container').stop();
        	this.html.find('.ir-currentList').empty();
        	if(this.selectedFileList.length === 0){
        		this.relbtnIsShow = false;
        		this.html.find('.bottom-button-container').slideUp(200);
        		$(`<tr><td colspan="4" >请在左侧选择需要增量的文件,发布之前请仔细核对文件!</td></tr>`).appendTo(this.html.find('.ir-currentList'));
        		this.position();
        		return;
        	}
        	this.relbtnIsShow = true;

        	this.html.find('.bottom-button-container').slideDown(200,function(){});
        	for(var i=0;i<this.selectedFileList.length;i++){
        		$(`<tr>
						<td>`+ (i+1) +`</td>
						<td>`+ this.selectedFileList[i].name +`</td>
						<td>`+ this.selectedFileList[i].pPath +`</td>
						<td>`+ this.selectedFileList[i].path +`</td>
					</tr>`).appendTo(this.html.find('.ir-currentList'));
        	}

        	this.html.find('.ir-tc-cl-title label').html(this.selectedFileList.length+'个文件');
        	this.position();
        }

	 	this.position = function(){
	 		if(this.relbtnIsShow === true){
	 			var height = $(window).height() - 100 - this.html.find('.ir-me').outerHeight() - this.html.find('.ir-title').outerHeight() -38;
	 		}else{
	 			var height = $(window).height() -  this.html.find('.ir-me').outerHeight() - this.html.find('.ir-title').outerHeight() -38;
	 		}
	 		this.html.find('.ir-config-container').height(height);
	 		this.html.find('.ir-leftTree').height(height);
	 		this.html.find('.ir-split').height(height);
	 		this.html.find('.ir-split').css('line-height',height+'px');
	 		this.html.find('.ir-tableContainer').height(height);
	 	}

	 	//展示界面
	 	this.showPage = function(){
	 		self.html = $(self.html).appendTo(self.config.container);
	 		this.bindData();
	 		this.position();
	 		this.show();
	 	}

	 	//绑定数据
	 	this.bindData = function(){
	 		console.log(this.currentSetting);
	 		console.log(this.phyConfig);
	 		this.html.find('.ir-d-title').html(this.phyConfig.projectName+'/'+this.currentSetting.name);
	 		this.html.find('.ir-d-mainVersion').html(this.currentSetting.versionControl.mainVersion);
	 		if(this.currentSetting.versionControl.incrementalQueue.length !== 0){
	 			//排序
	 			this.currentSetting.versionControl.incrementalQueue = this.currentSetting.versionControl.incrementalQueue.sort(function(a,b){
	 				return b.date - a.date;
	 			});

	 			this.html.find('.ir-d-lastir').html(this.currentSetting.versionControl.incrementalQueue[0].version);
        		this.html.find('.ir-tc-cl-title span').html(this.currentSetting.versionControl.incrementalQueue[0].version +1);
	 			this.html.find('.ir-d-lastIrRelTime').html(ac.formatDate(new Date(this.currentSetting.versionControl.incrementalQueue[0].date),'yyyy-MM-dd HH:mm:ss') );
	 		}else{
	 			this.html.find('.ir-tc-cl-title span').html(0);
	 		}
	 		this.html.find('.ir-d-lastRelTime').html(ac.formatDate(new Date(this.currentSetting.versionControl.mainVersionRelDate),'yyyy-MM-dd HH:mm:ss') );

	 		var settings = ['otherSettings','combineSettings','javaScriptSettings','cssSettings','imagesSettings'];
	 		for(var k=0;k<settings.length;k++){
	 			for(var i in self.currentSetting.versionControl.currentMainVersionConfig[settings[k]]){
		 			if(self.currentSetting.versionControl.currentMainVersionConfig[settings[k]][i] === true){
		 				this.html.find('[data-settings='+ settings[k] +'_'+ i +']').addClass('selected');
		 			}
		 		}
	 		}

	 		this.html.find('[data-id=CDNImageRelPath]').val(self.currentSetting.versionControl.currentMainVersionConfig.imagesSettings.CDNImageRelPath);
	 		this.html.find('[data-id=CDNImageHost]').val(self.currentSetting.versionControl.currentMainVersionConfig.imagesSettings.CDNImageHost);
	 		this.html.find('[data-id=usingTinifyKey]').val(self.currentSetting.versionControl.currentMainVersionConfig.imagesSettings.usingTinifyKey);
	 		
	 		if(self.currentSetting.versionControl.currentMainVersionConfig.imagesSettings.CDNImagesHandle === true){
	 			this.html.find('[data-id=imageCDNsettings]').show();
	 		}else{
	 			this.html.find('[data-id=imageCDNsettings]').hide();
	 		}

	 		if(self.currentSetting.versionControl.currentMainVersionConfig.imagesSettings.usingTinify === true){
	 			self.html.find('[data-id=usingTinifySettings]').show();
	 		}else{
	 			self.html.find('[data-id=usingTinifySettings]').hide();
	 		}

	 		for(var i=0;i<this.currentSetting.versionControl.incrementalQueue.length;i++){
	 			var item = this.currentSetting.versionControl.incrementalQueue[i];
	 			var ie = $(`<div class='ir-tc-cl-title' >
					（历史）增量版本号：`+ item.version +`     增量时间：`+ ac.formatDate(new Date(item.date),'yyyy-MM-dd HH:mm:ss')  +`  
				</div>
				<table class='ir-listTable current' border='0' cellpadding="0" cellspacing="0" >
					<thead>
						<tr>
							<th style='width:100px' >序号</th>
							<th>文件</th>
						</tr>
					</thead>
					<tbody class='ir-currentList-h' >
						
					</tbody>
				</table>`).appendTo(this.html.find('.ir-tc-hisLists'));

				for(var j=0;j<item.fileList.length;j++){
					var fi = item.fileList[j];
					ie.find('.ir-currentList-h').append(`<tr>
							<td>`+ (j+1) +`</td>
							<td>`+ fi +`</td>
						</tr>`);
				}
	 		}
	 	}

	 	this.icRelease = function(){
	 		ask('继续将进行增量发布，若已经检查好文件列表中的内容，确认以继续..',function(){

	 			var icItem = {
	 				version:0,
	 				date:(+new Date),
	 				relPc:this.pcHostName,
	 				fileList:[]
	 			}

	 			if(self.parent.currentSetting.versionControl.incrementalQueue.length !== 0){
	 				icItem.version = self.parent.currentSetting.versionControl.incrementalQueue[0].version +1;
	 			}

	 			for(var i=0;i<self.selectedFileList.length;i++){
	 				icItem.fileList.push(self.selectedFileList[i].pPath);
	 			}

	 			self.parent.currentSetting.versionControl.incrementalQueue.push(icItem);
	 			self.parent.currentSetting.versionControl.isIncrementalRelease = true;

	 			//排序
	 			self.parent.currentSetting.versionControl.incrementalQueue = self.parent.currentSetting.versionControl.incrementalQueue.sort(function(a,b){
	 				return b.date - a.date;
	 			});

	 			//将上次发布的配置合并到主配置中去
	 			self.parent.currentSetting = $.extend(self.parent.currentSetting,self.parent.currentSetting.versionControl.currentMainVersionConfig);



	 			//发布按钮
	 			self.parent.icr();
	 			//返回
	 			self.html.find('.button.blue.back.bbb').trigger('click');

	 		},function(){});
	 	}


	 	this.bindEvent = function(){

	 		this.html.find('[data-event=rel-inc]').click(function(){
	 			self.icRelease();
	 		});

	 		this.html.find('.button.blue.back.bbb').click(function(){
	 			self.config.backCall();
	 		});

	 		this.html.find('.ir-split').mousedown(function(){
	 			var left = window.mControl.nowPosition.x;
	 			var cl = left - self.html.find('.ir-split').offset().left;
	 			var currentLeft =  left - cl;
	 			var bl = $('<div class="big-lay" ></div>').appendTo('body');
	 			bl.mousemove(function(){
	 				currentLeft =   window.mControl.nowPosition.x - cl;
	 				self.html.find('.ir-split').css('left',currentLeft+'px');
	 				self.html.find('.ir-leftTree').width(currentLeft);
	 				self.html.find('.ir-tableContainer').css('margin-left',(currentLeft+17)+'px');
	 			});
	 			bl.mouseup(function(){
	 				bl.remove();
	 			});

	 		});

	 		this.html.find('.watchSettings').mouseover(function(){
	 			self.html.find('.ir-rsc').stop();
	 			self.html.find('.ir-rsc').css('top', (self.html.find('.ir-me').height() + self.html.find('.ir-me').offset().top) +"px");
	 			self.html.find('.ir-rsc').slideDown(200,function(){
			 		var settings = self.html.find('[data-settings]');
			 		var settingsb = self.html.find('.r-s-c-item');


			 		var showItem = function(){
			 			var s=-1;
				 		var setClass2 = function(){
				 			setTimeout(function(){
				 				s++;
				 				if(s>=settings.length){return;}
				 				$(settings[s]).addClass('showClass');
				 				setClass2();
				 			},20);
				 		}
				 		setClass2();
			 		}

			 		

			 		var a=-1;
			 		var setClass3 = function(){
			 			setTimeout(function(){
			 				a++;
			 				if(a>=settingsb.length){ showItem(); return;}
			 				$(settingsb[a]).addClass('showClass');
			 				setClass3();
			 			},20);
			 		}
			 		setClass3();
	 			});

	 		});

	 		this.html.find('.watchSettings').mouseout(function(){
	 			self.html.find('.ir-rsc').stop();
	 			self.html.find('.ir-rsc').slideUp(200,function(){
			 		var settings = self.html.find('[data-settings]');
			 		var settingsb = self.html.find('.r-s-c-item');


			 		var showItem = function(){
			 			var s=-1;
				 		var setClass2 = function(){
				 			setTimeout(function(){
				 				s++;
				 				if(s>=settings.length){return;}
				 				$(settings[s]).removeClass('showClass');
				 				setClass2();
				 			},20);
				 		}
				 		setClass2();
			 		}

			 		

			 		var a=-1;
			 		var setClass3 = function(){
			 			setTimeout(function(){
			 				a++;
			 				if(a>=settingsb.length){ showItem(); return;}
			 				$(settingsb[a]).removeClass('showClass');
			 				setClass3();
			 			},20);
			 		}
			 		setClass3();
	 			});
	 		});
	 	}

	 	this.distory = function(){
	 		this.hide(function(){
	 				self.html.remove();
	 		});
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
	 		this.html.animate({'left':0},{easing:'easeOutQuart',speed:400,complete:function(){}});
	 	}
	}

	return m;
});






























































