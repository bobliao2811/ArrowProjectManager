//工作目录选择界面
define(['scripts/pageScripts/moduls/compiler/index.css','scripts/pageScripts/moduls/compiler/index.html'],function(_css,_html){
    var m = function(){
        var self = this;

        this.html = _html;
        
        //初始化
        this.init = function(){
        	this.showPage();
        }

        this.bindEvents = function(){

        }

        //显示页面
        this.showPage = function(){
        	self.html = $(self.html).appendTo('body');
        }
    };
    return m
});