//窗口插件
define(function(){
	var m = function(_config){
		var self = this;
		this.screenState = "H";
		//判断是否为移动端
		self.isMobile = false;
		// 检测userAgent来判断是否为移动端
		if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
		　　self.isMobile = true;
		}

		self.getScreenState = function(){
			if(self.isMobile){
				//竖屏
				if (window.orientation === 180 || window.orientation === 0) { 
					self.screenState = 'V';
				}
				//横屏
				if (window.orientation === 90 || window.orientation === -90 ){ 
					self.screenState = 'H';
				}
			}
		}
		self.getScreenState();

		//请求样式
	   
		var config = {
			//标题
			title:'没有标题',
			//内容
			content:'<div>没有内容</div>',
			//放置的容器
			container:'body',
			//位置
			position:{
				x:'conter',
				y:'conter'
			},
			//大小
			size:{
				width:600,
				height:'auto'
			},
			//按钮设置
			buttons:{
				//none为没有按钮
				//yes为只有确认键
				//yesno为确定和取消
				mode:'none',
				yesCall:function(){},
				noCall:function(){}
			},
			//是否加入背景
			background:{
				enabled:true
			},
			style:'',
			classAdd:'',
			//关闭回调
			closeCall:function(){},
			//是否不显示关闭按钮
			isNoCloseBtn:false
		}

		this.config = $.extend(true,config,_config);

		

		//打开窗口
		this.open = function(_callBack){
			 //请求模版
	    	//<!--ArrowCommand:CatchUsingHere-->
	    	using([
				'/common/window/index.html',
				'/common/window/index.css'],
				function(_html,_css){
					if($.trim(_html)!==""){
						$(_html).appendTo('body');
					}
					//创建主结构
					self.createMainPanel();
					//创建内容
					self.createContent();
					//重定位
					self.resize();
					//绑定事件
					self.bindEvent();
					$(window).resize(self.resize);
					if(typeof _callBack !== "undefined"){
						_callBack();
					}
			});
		}

		//绑定事件
		this.bindEvent = function(){
			//鼠标按下
			this.title.mousedown(function(){
				var bP = {
					x:mControl.nowPosition.x - self.content.offset().left,
					y:mControl.nowPosition.y - self.content.offset().top
				};
				//鼠标移动
				mControl.addMouseMoveFunc('windowMove',function(){
					var p = {
						x:mControl.nowPosition.x - bP.x,
						y:mControl.nowPosition.y - bP.y
					}
					if(self.checkBorder(p,'y')){
						self.content.css('top',p.y+ 'px');
					}
					if(self.checkBorder(p,'x')){
						self.content.css('left',p.x+ 'px');
					}
				});

				//鼠标弹起
				mControl.addMouseUpFunc('windowUp',function(){
					mControl.removeMMRFunc('windowMove');
					mControl.removeMURFunc('windowUp');
				});

			}); 

			this.closeBtn.mousedown(function(e){
				e.stopPropagation();
			});

			//关闭窗口
			this.closeBtn.click(function(){
				self.close();
			});

			if(self.config.isNoCloseBtn === true){
				this.closeBtn.hide();
			};

			if(self.config.buttons.mode !== 'none'){
				self.buttonYes.click(function(){
					self.config.buttons.yesCall();
					self.close();
				});
				if(self.config.buttons.mode === 'yesno'){
					self.buttonCancle.click(function(){
						self.config.buttons.noCall();
						self.close();
					});
				}
			}
		}

		//检查边缘
		this.checkBorder = function(_position,_dir){
			var feedBack = true;
			if(_dir === "x"){
				if(_position.x <= 0){
					self.content.css('left','0px');
					feedBack = false;
				}
				if((_position.x + self.content.width()) > $(window).width()){
					self.content.css('left',$(window).width() - self.content.width()+'px');
					feedBack = false;
				}
			}else{
				if(_position.y <= 0){
					self.content.css('top','0px');
					feedBack = false;
				}
				if((_position.y + self.content.height()) > $(window).height()){
					self.content.css('top',$(window).height() - self.content.height()+'px');
					feedBack = false;
				}
			}
			return feedBack;
		}

		//创建主结构
		this.createMainPanel = function(){
			this.background = $("<div class='b-window-background' ></div>").appendTo(self.config.container);
			this.content = $("<div class='b-ballWindow' >"
					        +"    <div class='b-title' >"
					        +"        <label></label>"
					        +"        <span>这是标题</span>"
					        +"    </div>"
					        +"    <div class='b-window-container' ></div>"
					        +"</div>").appendTo(self.config.container);
			this.title = this.content.find('.b-title');
			this.contentContainer =  this.content.find('.b-window-container');
			this.closeBtn =  this.content.find('.b-title > label');
			this.titleText =  this.content.find('.b-title > span');
			this.background.css('opacity','0');
			this.content.css('opacity','0');
			if(self.config.style !== ''){
				this.contentContainer.attr('style',self.config.style);
			}
			if(self.config.classAdd !== ''){
				this.contentContainer.addClass(self.config.classAdd);
			}
			
			//创建按钮
			this.createButtons();
			if(this.config.background.enabled===false){
				this.background.hide();
			}
		}

		//创建按钮
		this.createButtons = function(){
			if(self.config.buttons.mode !== 'none'){
				self.buttonContainer = $("<div class='b-w-buttonContainer' ></div>").appendTo(self.content);
				if(self.config.buttons.mode === 'yes'){
					self.buttonYes = $("<button class='b-w-b n-button' >确&nbsp;定</button>").appendTo(self.buttonContainer);
				}

				if(self.config.buttons.mode === 'yesno'){
					self.buttonCancle = $("<button class='b-w-b n-button'  >取&nbsp;消</button>&nbsp;&nbsp;").appendTo(self.buttonContainer);
					self.buttonYes = $("<button class='b-w-b n-button' >确&nbsp;定</button>").appendTo(self.buttonContainer);
					if(self.screenState !== 'V'){
						self.buttonYes.css('margin-left','50px');
					}
				}
				self.buttonYes.focus();
			}
		}

		//创建内容
		this.createContent = function(){
			$(self.config.content).appendTo(self.contentContainer);
			this.titleText.html(self.config.title);
			if(self.config.position.x === 'tips'){
				if(self.config.size.width !== 'auto'){
					self.content.width(self.config.size.width);
				}
				if(self.config.size.height !== 'auto'){
					self.contentContainer.height(self.config.size.height);
				}
				self.background.hide();
				self.content.css('top',$(window).height() - self.content.height()+'px');
				self.content.css('left',$(window).width());
				self.contentContainer.css('background-color','#e8ecdc');
				self.content.css('box-shadow','0px 0px 400px rgba(0,0,0,0.2)');
				self.content.animate({left:($(window).width() - self.content.outerWidth()),opacity:1},{
					duration:500,
					easing:'easeOutBack'
				});
			}else{
				if(self.screenState === 'V'){
					self.background.animate({opacity:0.2},200);
					self.content.css('top',$(window).height()+'px');
					if(self.content.height() > $(window).height()){
						self.content.animate({top:0,opacity:1},350);
						self.contentContainer.css('overflow','auto');
					}else{
						self.content.animate({top:$(window).height() - self.content.height(),opacity:1},350);
					}
					
				}else{
					self.background.animate({opacity:0.45},200);
					self.content.animate({opacity:1},350);
				}
			}
		}

		//重定位
		this.resize = function(){
			self.getScreenState();
			if(self.screenState === 'V'){
				self.content.width('100%');
				self.contentContainer.height('auto');
				self.content.css('top',$(window).height() - self.content.height() +'px');
				self.content.css('left',0);
				if(self.content.height() > $(window).height()){
					self.content.css('top','0px');
					var bc = 0;
					if(typeof self.buttonContainer !== 'undefined'){
						bc = self.buttonContainer.outerHeight();
					}
					self.contentContainer.height($(window).height() - self.title.outerHeight() - bc);
				}
				if(self.config.buttons.mode === 'yesno'){
					self.buttonCancle.css('margin-left','');
				}
			}else{
				if(self.config.size.width !== 'auto'){
					self.content.width(self.config.size.width);
				}
				if(self.config.size.height !== 'auto'){
					self.contentContainer.height(self.config.size.height);
				}
				if(self.config.position.x === 'tips'){
					self.content.css('top',$(window).height() - self.content.height()+'px');
					self.content.css('left',$(window).width() - self.content.width()+'px');
				}else{
					if(config.position.y === 'center'){
						self.content.css('top',$(window).height()/2 - self.content.height()/2 );
					}else{
						self.content.css('top',self.config.position.y);
					}

					if(self.config.position.x === 'center'){
						self.content.css('left',$(window).width()/2 - self.content.width()/2 );
					}else{
						self.content.css('left',self.config.position.x);
					}
				}
				if(self.config.buttons.mode === 'yesno'){
					self.buttonCancle.css('margin-left','50px');
				}
			}
			self.background.height($(window).height());
		}

		//关闭窗口
		this.close = function(){
			this.background.animate({opacity:0},200);
			if(self.screenState === 'V'){
				this.content.animate({opacity:0,top:$(window).height()},400,function(){
					self.content.remove();
					self.background.remove();
					self.config.closeCall();
					$(window).unbind('resize',self.resize);
				});
			}else{
				this.content.animate({opacity:0},350,function(){
					self.content.remove();
					self.background.remove();
					self.config.closeCall();
					$(window).unbind('resize',self.resize);
				});
			}
		}

	}

	return m;
});