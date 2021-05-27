//工程的发布管理界面
define(['scripts/pageScripts/moduls/projectControl/releaseManager/index.css','scripts/pageScripts/moduls/projectControl/releaseManager/index.html'],function(_css,_html){
	 var m = function(_config){
	 	var self = this;
	 	var config = {
	 		parent:{},
	 		phyConfig:{},
	 		container:'body',
	 		backCall:function(){}
	 	}

	 	this.html = _html;

	 	this.config = $.extend(true,config,_config);

	 	this.settingTabs = [];

	 	this.currentSetting = {};

	 	this.ipcRenderer = require('electron').ipcRenderer;

	 	//初始化
	 	this.init = function(){
	 		this.showPage();
	 		this.bindEvents();
	 		this.show();
	 	}

	 	//绑定事件
	 	this.bindEvents = function(){
	 		this.html.find('.resourceAnilyser').click(function(){
	 			using('scripts/pageScripts/moduls/projectControl/resourceAnilyser/index.js',function(_resourceAnilyser){
	                var resourceAnilyser = new _resourceAnilyser({
	                   	parent:self,
				 		container:'body',
				 		backCall:function(){
				 			resourceAnilyser.distory();
				 		}
	                });

	                resourceAnilyser.init();
	            });
	 		});


	 		this.html.find('[data-event=back]').click(function(){
	 		 	self.saveText();
	 		 	//保存新配置
		 		ac.runMainFunc('wsm','saveProjectConfig',{projectPath:self.config.phyConfig.projectPath,config:self.config.phyConfig},function(_result){
		 			self.config.parent.projectPhycConfig = self.config.phyConfig;
		 			//再返回
	                self.config.backCall();
	            });
            });


	 		this.html.find('[data-settings]').click(function(){
	 			var settingName = $(this).attr('data-settings');
	 			var sName = settingName.split('_')[1];
	 			var sPath = settingName.split('_')[0];
	 			if(self.currentSetting[sPath][sName] === true){
	 				self.currentSetting[sPath][sName] = false;
	 				$(this).removeClass('selected');

	 				//js压缩选项购销的话，影响其它三个选项
	 				if(settingName === 'javaScriptSettings_compress'){
	 					self.currentSetting.javaScriptSettings.evalObfuscation = false;
	 					self.html.find('[data-settings=javaScriptSettings_evalObfuscation]').removeClass('selected');
	 					self.currentSetting.javaScriptSettings.AESEncryption = false;
	 					self.html.find('[data-settings=javaScriptSettings_AESEncryption]').removeClass('selected');
	 				}

	 				//"将组件内容合并到模块主程序"选项购销的话，影响其它三个选项
	 				if(settingName === 'combineSettings_combineHtmlAndCssToMainOfModul'){
	 					self.currentSetting.combineSettings.execCatchDepsHere = false;
	 					self.html.find('[data-settings=combineSettings_execCatchDepsHere]').removeClass('selected');
	 					self.currentSetting.combineSettings.execCatchUsingHere = false;
	 					self.html.find('[data-settings=combineSettings_execCatchUsingHere]').removeClass('selected');
	 					self.currentSetting.combineSettings.execCatchModulToEntryPage = false;
	 					self.html.find('[data-settings=combineSettings_execCatchModulToEntryPage]').removeClass('selected');
	 				}

	 				//eval混淆勾上的话，js压缩也要勾上  
	 				if(settingName === 'combineSettings_combineEngineToEntryPages'){
	 					self.currentSetting.otherSettings.AESEncryptionFileNameAndForderName = false;
	 					self.html.find('[data-settings=otherSettings_AESEncryptionFileNameAndForderName]').removeClass('selected');
	 				}


	 			}else{
	 				self.currentSetting[sPath][sName] = true;
	 				$(this).addClass('selected');

	 				//执行CatchDepsHere勾上的话，"将组件内容合并到模块主程序"也要勾上
	 				if(settingName === 'combineSettings_execCatchDepsHere'){
	 					self.currentSetting.combineSettings.combineHtmlAndCssToMainOfModul = true;
	 					self.html.find('[data-settings=combineSettings_combineHtmlAndCssToMainOfModul]').addClass('selected');
	 					self.currentSetting.combineSettings.execCatchModulToEntryPage = false;
	 					self.html.find('[data-settings=combineSettings_execCatchModulToEntryPage]').removeClass('selected');

	 					
	 				}

	 				//执行CatchUsingHere勾上的话，"将组件内容合并到模块主程序"也要勾上
	 				if(settingName === 'combineSettings_execCatchUsingHere'){
	 					self.currentSetting.combineSettings.combineHtmlAndCssToMainOfModul = true;
	 					self.html.find('[data-settings=combineSettings_combineHtmlAndCssToMainOfModul]').addClass('selected');
	 					self.currentSetting.combineSettings.execCatchModulToEntryPage = false;
	 					self.html.find('[data-settings=combineSettings_execCatchModulToEntryPage]').removeClass('selected');

	 					
	 				}

	 				//打包所有组件到入口点页 勾上的话，"将组件内容合并到模块主程序"也要勾上
	 				if(settingName === 'combineSettings_execCatchModulToEntryPage'){
	 					self.currentSetting.combineSettings.combineHtmlAndCssToMainOfModul = true;
	 					self.html.find('[data-settings=combineSettings_combineHtmlAndCssToMainOfModul]').addClass('selected');

	 					self.currentSetting.javaScriptSettings.AESEncryption = false;
	 					self.html.find('[data-settings=javaScriptSettings_AESEncryption]').removeClass('selected');
	 				}

	 			

	 				//打包所有组件到入口点页 勾上的话，"CatchUsingHere"也要购销
	 				if(settingName === 'combineSettings_execCatchModulToEntryPage'){
	 					self.currentSetting.combineSettings.execCatchUsingHere = false;
	 					self.html.find('[data-settings=combineSettings_execCatchUsingHere]').removeClass('selected');

	 					self.currentSetting.combineSettings.execCatchDepsHere = false;
	 					self.html.find('[data-settings=combineSettings_execCatchDepsHere]').removeClass('selected');
	 				}

	 				//文件夹名称加密勾上的话，合并arrowjs也要勾上
	 				if(settingName === 'javaScriptSettings_evalObfuscation'){
	 					self.currentSetting.javaScriptSettings.compress = true;
	 					self.html.find('[data-settings=javaScriptSettings_compress]').addClass('selected');
	 				}


	 				//eval混淆勾上的话，js压缩也要勾上
	 				if(settingName === 'otherSettings_AESEncryptionFileNameAndForderName'){
	 					self.currentSetting.combineSettings.combineEngineToEntryPages = true;
	 					self.html.find('[data-settings=combineSettings_combineEngineToEntryPages]').addClass('selected');
	 				}
	 				//AES加密勾上的话，js压缩也要勾上
	 				if(settingName === 'javaScriptSettings_AESEncryption'){
	 					self.currentSetting.javaScriptSettings.compress = true;
	 					self.html.find('[data-settings=javaScriptSettings_compress]').addClass('selected');

	 					self.currentSetting.combineSettings.execCatchModulToEntryPage = false;
	 					self.html.find('[data-settings=combineSettings_execCatchModulToEntryPage]').removeClass('selected');
	 				}

	 				//勾上全局雪碧图，分模块雪碧图就要购销
	 				if(settingName === 'imagesSettings_spritesOfGlobel'){
	 					self.currentSetting.imagesSettings.spritesOfModuls = false;
	 					self.html.find('[data-settings=imagesSettings_spritesOfModuls]').removeClass('selected');
	 				}

	 				//勾上分模块雪碧图，全局雪碧图就要购销
	 				if(settingName === 'imagesSettings_spritesOfModuls'){
	 					self.currentSetting.imagesSettings.spritesOfGlobel = false;
	 					self.html.find('[data-settings=imagesSettings_spritesOfGlobel]').removeClass('selected');
	 				}
	 			}

	 			if(self.currentSetting.imagesSettings.CDNImagesHandle === true){
	 				self.html.find('[data-id=imageCDNsettings]').show();
		 		}else{
		 			self.html.find('[data-id=imageCDNsettings]').hide();
		 		}

		 		if(self.currentSetting.imagesSettings.usingTinify === true){
		 			self.html.find('[data-id=usingTinifySettings]').show();
		 		}else{
		 			self.html.find('[data-id=usingTinifySettings]').hide();
		 		}

		 		
		 		self.showirRel();
		 		self.saveText();
	 		});


	 		var fo = function(_elem){
	 			_elem.parent().height(22);
	 			_elem.css('position','absolute');
	 			_elem.css('width','450px');
	 			_elem.css('margin-top','-10px');
	 		}

	 		var bl = function(_elem){
	 			_elem.parent().height('auto');
	 			_elem.css('position','');
	 			_elem.css('width','');
	 			_elem.css('margin-top','');
	 		}

	 		this.html.find('[data-id=CDNImageRelPath]').focus(function(){
	 				fo($(this));
	 		}).blur(function(){
	 			bl($(this));
	 		});;
	 		this.html.find('[data-id=CDNImageHost]').focus(function(){
	 				fo($(this));
	 		}).blur(function(){
	 			bl($(this));
	 		});
	 		this.html.find('[data-id=usingTinifyKey]').focus(function(){
	 				fo($(this));
	 		}).blur(function(){
	 			bl($(this));
	 		});

	 		//增量发布按钮
	 		this.html.find('[data-event=rel-incremental]').click(function(){
	 			self.openIncrementalRelease();
	 		});

	 		//全量发布按钮
	 		this.html.find('[data-event=rel-total]').click(function(){
	 			ask('即将发布版本号为'+(self.currentSetting.versionControl.mainVersion +1)+"的主版本，确定以继续..",function(){
		 			self.html.find('.rel-c').empty();
		 			self.html.find('.rel-m').empty();
		 			self.html.find('.rel-p-number').show(); 
	            	self.html.find('.rel-p-button').hide();
		 			self.html.find('.rel-console').fadeIn(200,function(){
		 				self.resize();
		 				self.showRelInfo();
		 				self.releaseProject();
		 			});
		 			self.resize();
		 		});
	 		});

	 		this.html.find('.rel-p-button').click(function(){
	 			ac.runMainFunc('wsm','openForderFromExplorer',{path:self.currentSetting.toPath},function(_result){});
	 			self.html.find('.rel-console').fadeOut(200,function(){
	 				self.html.find('[data-event=back]').trigger('click');
	 			});
	 		});

	 		$(window).resize(this.resize);
	 	}

	 	//打开增量发布界面进行配置
	 	this.openIncrementalRelease = function(){

	 		if($.trim(self.currentSetting.toPath) === ''){
	 			alt('请填写要发布目标目录！');
	 			return;
	 		}else{
	 			self.currentSetting.versionControl.currentMainVersionConfig.toPath = self.currentSetting.toPath;
	 		}

	 		if(self.currentSetting.imagesSettings.CDNImagesHandle === true){
		 		if($.trim(self.currentSetting.imagesSettings.CDNImageRelPath) === ''){
		 			alt('请填写图片CDN发布处理的目标目录！');
		 			return;
		 		}
	 		}else{
	 			self.currentSetting.versionControl.currentMainVersionConfig.imagesSettings.CDNImageRelPath = self.currentSetting.imagesSettings.CDNImageRelPath;
	 		}

	 		if($.trim(self.currentSetting.imagesSettings.usingTinifyKey) === '' && self.currentSetting.imagesSettings.usingTinify === true){
	 			alt('请填写要tiniPNG的Key，否则无法压缩图片！');
	 			return;
	 		}else{
	 			self.currentSetting.versionControl.currentMainVersionConfig.imagesSettings.usingTinifyKey = self.currentSetting.imagesSettings.usingTinifyKey;
	 		}


	 		using('scripts/pageScripts/moduls/projectControl/incrementRelease/index.js',function(_incrementRelease){
                var incrementRelease = new _incrementRelease({
                   	parent:self,
			 		phyConfig:self.config.phyConfig,
			 		currentConfig:self.currentSetting,
			 		container:'body',
			 		backCall:function(){
			 			incrementRelease.distory();
			 		},
			 		releaseCall:function(){}
                });

                incrementRelease.init();
            });
	 	}

	 	this.showRelInfo = function(){
	 		var showSettings = function(_i,_s,_item){
	 			if(_item === true){
	 				$('<p data-rel-settings="'+ _s +'_'+ _i +'" >'+ _i +'</p>').appendTo(self.html.find('.rel-c'));
	 			}
	 		}
	 		for(var i in this.currentSetting.combineSettings){
	 			showSettings(i,'combineSettings',this.currentSetting.combineSettings[i]);
	 		}

	 		for(var i in this.currentSetting.javaScriptSettings){
	 			showSettings(i,'javaScriptSettings',this.currentSetting.javaScriptSettings[i]);
	 		}
	 		
	 		for(var i in this.currentSetting.cssSettings){
	 			showSettings(i,'cssSettings',this.currentSetting.cssSettings[i]);
	 		}

	 		for(var i in this.currentSetting.imagesSettings){
	 			showSettings(i,'imagesSettings',this.currentSetting.imagesSettings[i]);
	 		}

	 		for(var i in this.currentSetting.otherSettings){
	 			showSettings(i,'otherSettings',this.currentSetting.otherSettings[i]);
	 		}
	 		this.html.find('.rel-p-number').html('0%');
	 		 this.html.find('.rel-p-content').width('0%');

	 		this.ipcRenderer.on('rel-compiler-channel', function(event, message) { 
               self.printToConsole(message);
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

            this.html.find('.rel-p-number').html(message.progress.toString().split('.')[0] + '%');
            this.html.find('.rel-p-content').width(message.progress + '%');

           

            self.html.find('.rel-m').append(`
                    <div class='log-item' style='user-select:text'  ><span class=`+ classType +` style='user-select:text'  >`+ type +`</span></lable style='user-select:text' >`+ message.messsage.replace(/\\n/g,'</br>') +`</lable></div>
            `);

            self.html.find('.rel-m').scrollTop(self.html.find('.rel-m')[0].scrollHeight);

            if(message.progress === 100){
            	this.html.find('.rel-p-number').hide();
            	this.html.find('.rel-p-button').show();
            }
        }

	 	this.resize = function(){
	 		self.html.find('.rel-c').height( $(window).height() - ( self.html.find('.rel-c-title').outerHeight() +  self.html.find('.rel-progress').outerHeight() ));
	 		self.html.find('.rel-m').height( $(window).height() - ( self.html.find('.rel-c-title').outerHeight() +  self.html.find('.rel-progress').outerHeight() ));
	 	}

	 	this.saveText = function(){
	 		try{
		 		this.currentSetting.toPath = this.html.find('[data-id=toPath]').val();
		 		this.currentSetting.toHost = this.html.find('[data-id=toHost]').val();
		 		this.currentSetting.imagesSettings.CDNImageHost = this.html.find('[data-id=CDNImageHost]').val();
		 		this.currentSetting.imagesSettings.CDNImageRelPath = this.html.find('[data-id=CDNImageRelPath]').val();
		 		this.currentSetting.imagesSettings.usingTinifyKey = this.html.find('[data-id=usingTinifyKey]').val();
		 	}catch(e){}
	 	}

	 	this.icr = function(){
	 		self.html.find('.rel-c').empty();
 			self.html.find('.rel-m').empty();
 			self.html.find('.rel-p-number').show();
        	self.html.find('.rel-p-button').hide();
	 		self.html.find('.rel-console').fadeIn(200,function(){
 				self.resize();
 				self.showRelInfo();
 				//保存新配置
		 		ac.runMainFunc('wsm','saveProjectConfig',{projectPath:self.config.phyConfig.projectPath,config:self.config.phyConfig},function(_result){
		 			//发布站点
			 		ac.runMainFunc('wsm','openRelCompiler',self.config.phyConfig,function(_result){

		            });
		 		});
 			});
 			self.resize();
	 	}

	 	//开始发布站点
	 	this.releaseProject = function(){
	 		self.saveText();

	 		if($.trim(self.currentSetting.toPath) === ''){
	 			alt('请填写要发布目标目录！');
	 			return;
	 		}

	 		if($.trim(self.currentSetting.toHost) === ''){
	 			alt('请填写要发布目标Host！');
	 			return;
	 		}

	 		if(self.currentSetting.imagesSettings.CDNImagesHandle === true){
		 		if($.trim(self.currentSetting.imagesSettings.CDNImageHost) === ''){
		 			alt('请填写图片CDN选项的Host！');
		 			return;
		 		}

		 		if($.trim(self.currentSetting.imagesSettings.CDNImageRelPath) === ''){
		 			alt('请填写图片CDN发布处理的目标目录！');
		 			return;
		 		}
	 		}

	 		if($.trim(self.currentSetting.imagesSettings.usingTinifyKey) === '' && self.currentSetting.imagesSettings.usingTinify === true){
	 			alt('请填写要tiniPNG的Key，否则无法压缩图片！');
	 			return;
	 		}

	 		//更新版本号
	 		self.currentSetting.versionControl.mainVersion = self.currentSetting.versionControl.mainVersion+1;
	 		self.currentSetting.versionControl.mainVersionRelDate = (+new Date);
	 		var backup = JSON.parse(JSON.stringify(self.currentSetting));
	 		delete backup.versionControl;
	 		self.currentSetting.versionControl.currentMainVersionConfig = backup;
	 		self.currentSetting.versionControl.incrementalQueue = [];
	 		self.currentSetting.versionControl.isIncrementalRelease = false;

	 		
	 		//保存新配置
	 		ac.runMainFunc('wsm','saveProjectConfig',{projectPath:self.config.phyConfig.projectPath,config:self.config.phyConfig},function(_result){
	 			//发布站点
		 		ac.runMainFunc('wsm','openRelCompiler',self.config.phyConfig,function(_result){

	            });
	 		});
            
	 	}

	 	//展示页面
	 	this.showPage = function(){
	 		self.html = $(self.html).appendTo(self.config.container);
	 		self.html.find('.projectName').html(self.config.phyConfig.projectName);

	 		self.html.find('.rel-c-title label').html(self.config.phyConfig.projectName);

	 		//创建选项卡
	 		this.makeTabs();
	 	}

	 	this.makeTabs = function(_isShow){
	 		var classShow='';
 			if(_isShow){
 				classShow = 'showClass';
 			}
	 		this.html.find('.tab-buttons').empty();
	 		this.settingTabs = [];
	 		//.tab-buttons
	 		for(var i=0;i<this.config.phyConfig.releaseConfig.length;i++){
	 			var sItem = this.config.phyConfig.releaseConfig[i];
	 			var ssItem = {};
	 			ssItem.data = sItem;

	 			
	 			ssItem.elem = $(`
	 					<div class='tab-item `+ classShow +`' >
							`+ sItem.name +`
							<p>mode:'`+sItem.mode +`'</p>
						</div>
	 				`).appendTo(this.html.find('.tab-buttons'));
	 			if(sItem.unDeleteable === false){
	 				var deleteButton =  $('<div class="deleteConfig" >×</div>').appendTo(ssItem.elem);
	 				(function(_deleteButton,_ssItem){
	 					_deleteButton.click(function(){
	 						self.deleteConfig(_ssItem);
	 					});
	 				})(deleteButton,ssItem)
	 			}

	 			(function(_ssItem){
	 				_ssItem.elem.click(function(){
	 					self.saveText();
	 					self.bindTabEvents(_ssItem);
	 				});
	 			})(ssItem)

	 			this.settingTabs.push(ssItem);
	 		}

	 		//最后加入增加按钮
	 		var addConfigElem = $(`
 					<div class='tab-item `+ classShow +`' >
						+
					</div>
 				`).appendTo(this.html.find('.tab-buttons'));
	 		addConfigElem.click(function(){
	 			self.addConfig();
	 		});

	 		for(var i=0;i<this.settingTabs.length;i++){
	 			if(this.settingTabs[i].data.isSelected){
	 				this.settingTabs[i].elem.trigger('click');
	 				this.currentSetting = this.settingTabs[i].data;
	 			}
	 		}
	 	}

	 	//删除一个配置
	 	self.deleteConfig = function(_ssItem){
	 		ask('确定删除用户发布配置:“'+ _ssItem.data.name + '”吗？',function(){
	 			var newSettings = [];
	 			for(var i=0;i<self.config.phyConfig.releaseConfig.length;i++){
	 				if(self.config.phyConfig.releaseConfig[i] !== _ssItem.data){
	 					if(newSettings.length === 0){
	 						self.config.phyConfig.releaseConfig[i].isSelected = true;
	 						this.currentSetting = self.config.phyConfig.releaseConfig[i];
	 					}else{
	 						self.config.phyConfig.releaseConfig[i].isSelected = false;
	 					}
	 					newSettings.push(self.config.phyConfig.releaseConfig[i]);
	 				}
	 			}
	 			self.config.phyConfig.releaseConfig = newSettings;
	 			self.config.parent.projectPhycConfig = self.config.phyConfig;
	 			//保存新配置
		 		ac.runMainFunc('wsm','saveProjectConfig',{projectPath:self.config.phyConfig.projectPath,config:self.config.phyConfig},function(_result){
	                //保存完成后直接重新渲染
	                self.makeTabs(true);
	            });
	 		},function(){});
	 	}

	 	//增加一个配置
	 	this.addConfig = function(){
	 		 var content = $(`
                <div>
                    <table style='width:100%' >
                        <tr>
                            <td style='width: 113px;' >配置名称:</td>
                            <td style='text-align:left' ><input  style='width: 100%;' data-id='settingName' placeholder='在此输入配置名称' value='' /></td>
                        </tr>
                        <tr>
                            <td >配置工作模式:</td>
                            <td style='text-align:left' ><input  style='width: 100%;' data-id='settingMode' placeholder='在此输入配置工作模式' value='' /></td>
                        </tr>
                    </table>
                </div>
            `);

	 		 var settingNameInput = content.find('[data-id=settingName]');
             var settingModeInput = content.find('[data-id=settingMode]');

             var addWindow = new ac.window({
            //标题
            title:'创建新用户发布设置',
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
                	var newSetting = JSON.parse(JSON.stringify(self.settingTabs[0].data));
                	newSetting.name =  settingNameInput.val();
                	newSetting.mode =  settingModeInput.val();
                	newSetting.unDeleteable = false;
                	newSetting.toPath = '';
                	newSetting.toHost = '';
                	newSetting.imagesSettings.CDNImageHost = '';
                	newSetting.imagesSettings.CDNImageRelPath = '';

                	//判断空
                    if($.trim(newSetting.name) === ''){
                        console.write('“设置名称”不可为空!');
                        settingNameInput.focus();
                        settingNameInput.click();
                        settingNameInput.select();
                        return;
                    }

                    if($.trim(newSetting.mode) === ''){
                        console.write('“设置模式”不可为空!');
                        settingModeInput.focus();
                        settingModeInput.click();
                        settingModeInput.select();
                        return;
                    }

                    //判断是否英文字母打头
                    if(/^[a-zA-Z]{1,}/.test(newSetting.mode) === false){
                        console.write('“设置模式”要用英文字母开头!');
                        settingModeInput.focus();
                        settingModeInput.click();
                        settingModeInput.select();
                        return;
                    }

                     //判断是否夹带中文
                    if(/^[a-zA-Z0-9\-\_]{1,}$/.test(newSetting.mode) === false){
                        console.write('请勿在“设置模式”中使用中文或任何特殊字符!(可以使用"-"或"_")');
                        settingModeInput.focus();
                        settingModeInput.click();
                        settingModeInput.select();
                        return;
                    }

                	ask('确定创建用户发布设置:'+newSetting.name+'吗?',function(){
	                    
                		self.config.phyConfig.releaseConfig.push(newSetting);
                		for(var i=0;i<self.config.phyConfig.releaseConfig.length;i++){
				 			self.config.phyConfig.releaseConfig[i].isSelected = false;
				 		}
				 		newSetting.isSelected = true;


	 					self.config.parent.projectPhycConfig = self.config.phyConfig;

				 		//保存新配置
				 		ac.runMainFunc('wsm','saveProjectConfig',{projectPath:self.config.phyConfig.projectPath,config:self.config.phyConfig},function(_result){
			                //保存完成后直接重新渲染
			                self.makeTabs(true);
			            });

                    },function(){});

                },
                noCall:function(){
                    console.write('取消..');
                }
            },
            //关闭回调
            closeCall:function(){}
            });
            addWindow.open(function(){
                settingNameInput.focus();
                settingNameInput.click();
                settingNameInput.select();
            });
	 	}

	 	this.bindTabEvents = function(_ssItem){
	 		$('[data-settings]').removeClass('selected');
	 		this.currentSetting = _ssItem.data;
	 		for(var i=0;i<this.settingTabs.length;i++){
	 			this.settingTabs[i].elem.removeClass('selected');
	 			this.settingTabs[i].data.isSelected = false;
	 		}
	 		_ssItem.elem.addClass('selected');
	 		_ssItem.data.isSelected = true;

	 		var settings = ['otherSettings','combineSettings','javaScriptSettings','cssSettings','imagesSettings'];

	 		for(var k=0;k<settings.length;k++){
	 			for(var i in _ssItem.data[settings[k]]){
		 			if(_ssItem.data[settings[k]][i] === true){
		 				$('[data-settings='+ settings[k] +'_'+ i +']').addClass('selected');
		 			}
		 		}
	 		}
	 		
	 		this.html.find('[data-id=fromPath]').html(this.currentSetting.fromPath);
	 		this.html.find('[data-id=toPath]').val(this.currentSetting.toPath);
	 		this.html.find('[data-id=fromHost]').html(this.currentSetting.fromHost);
	 		this.html.find('[data-id=toHost]').val(this.currentSetting.toHost);

	 		this.html.find('[data-id=CDNImageRelPath]').val(this.currentSetting.imagesSettings.CDNImageRelPath);
	 		this.html.find('[data-id=CDNImageHost]').val(this.currentSetting.imagesSettings.CDNImageHost);
	 		this.html.find('[data-id=usingTinifyKey]').val(this.currentSetting.imagesSettings.usingTinifyKey);

	 		//如果是自定义配置，就可以更改发步的目标物理路径
	 		if(_ssItem.data.unDeleteable === false){
				this.html.find('[data-id=toPath]').removeAttr('readonly');
			}else{
	 			//否则不能更改
				this.html.find('[data-id=toPath]').attr('readonly','readonly');
			}


	 		
	 		if(_ssItem.data.imagesSettings.CDNImagesHandle === true){
	 			this.html.find('[data-id=imageCDNsettings]').show();
	 		}else{
	 			this.html.find('[data-id=imageCDNsettings]').hide();
	 		}

	 		if(self.currentSetting.imagesSettings.usingTinify === true){
	 			self.html.find('[data-id=usingTinifySettings]').show();
	 		}else{
	 			self.html.find('[data-id=usingTinifySettings]').hide();
	 		}
	 		self.showirRel();
	 	}

	 	this.showirRel = function(){
	 		//如果主版本号为0就不允许增量发布
	 		var isShow = false;
	 		if(self.currentSetting.versionControl.mainVersion === 0){
	 			isShow = false;
	 		}else{
	 			isShow = true;
	 		}

	 		if(isShow === true && self.currentSetting.combineSettings.execCatchModulToEntryPage === true){
	 			isShow = false;
	 		}

	 		if(isShow){
	 			self.html.find('[data-event=rel-incremental]').show();
	 		}else{
	 			self.html.find('[data-event=rel-incremental]').hide();
	 		}
	 	}

	 	this.show = function(){
	 		this.html.stop();
	 		this.html.css('left',$(window).width());
	 		this.html.animate({'left':0},{easing:'easeOutQuart',speed:400,complete:function(){
	 			
	 		}});

	 			var tabs = $('.tab-buttons .tab-item');
		 		var settings = $('[data-settings]');
		 		var settingsb = $('.r-s-c-item');

		 		var k=-1;
		 		var setClass = function(){
		 			setTimeout(function(){
		 				k++;
		 				if(k>=tabs.length){return;}
		 				$(tabs[k]).addClass('showClass');
		 				setClass();
		 			},40);
		 		}
		 		setClass();


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



	 	}

	 	this.hide = function(_callBack){
	 		this.html.stop();
	 		this.html.animate({'left':$(window).width()},{easing:'easeOutQuart',speed:400,complete:function(){
	 			_callBack();
	 		}});
	 	}


	 	this.distory = function(){
	 		this.hide(function(){
	 				self.html.remove();
	 		});
	 	}

	 }

	 return m;
});






























































