//url编译器
//廖力(bobliao)
//编写与2019年09月08日
//雪碧图自动生成器
/*

将项目中common/images文件夹下所有的图片
转换成一整张雪碧图并自动写入common/spirit.css中去
css中的格式为:
{
	background-images(/common/spirit.png);
	background-position:???px ???px;
	width:???px;
	height:???px;
}


//参数：_projectConfig
//	"devHost": "http://localhost:80/testArrowWorkSpace/ES67NodeSharp",
//	"devMode": "1",
//	"id": "badfdaabe04088986035ff38e35d73e1",
//	"isCompileES6Codes": true,
//	"orgConfig": {
//		"devMode": "1",
//		"host": "http://localhost:80/testArrowWorkSpace/",
//		"id": "badfdaabe04088986035ff38e35d73e1",
//		"path": "J:\work\testArrowWorkSpace",
//		"projectHost": "http://localhost:80/testArrowWorkSpace/ES67NodeSharp",
//		"projectName": "ES67NodeSharp",
//		"projectPath": "J:\work\testArrowWorkSpace\ES67NodeSharp"
//	},
//	"projectName": "ES67NodeSharp",
//	"projectPath": "J:\work\testArrowWorkSpace\ES67NodeSharp",
//	"releaseConfig": {}

*/

//开发时编译器
'use strict';

const spiritImagesCompiler = function(_projectConfig,_app){
	var self = this;

	//图片操作库
	this.images = null;
	this.fs = require('fs');
	this.pConfig =_projectConfig;
	this.cImagePath = this.pConfig.projectPath+'\\BUILDSRC\\common\\images';
	this.sImage = this.pConfig.projectPath+'\\BUILDSRC\\common\\images\\spirit.png';
	this.sImageHost = this.pConfig.devHost+'/BUILDSRC/common/images/spirit.png';
	this.sCss = this.pConfig.projectPath+'\\BUILDSRC\\common\\spirit.css';

	this.width = 0;
	this.height = 0;

	this.imageList = [];
	this.image = null;

	//制作雪碧图
	this.make = function(){
		this.images = require('images');
		this.width = 0;
		this.height = 0;
		this.imageList = [];
		this.image = null;
		this.image = undefined;
		this.makeHW();
		this.makeImage();
		this.makeCss();
	}

	//创建图像
	this.makeImage = function(){
		this.image = this.images.createImage(this.width,this.height);
		for(var i=0;i<this.imageList.length;i++){
			var ii= this.imageList[i];
			this.image.draw(ii.imageObj, ii.left, ii.top);
		}
		if(this.imageList.length !== 0){
			//判断路径是否存在
			if(self.fs.existsSync(this.sImage)){
				//存在就删除
				self.fs.unlinkSync(this.sImage);
			}
			
			//保存图像
			this.image.save(this.sImage);
		}
	}

	//创建css
	this.makeCss = function(){
		var cssContent = '/*此处自动生成雪碧图样式，请勿手动编写代码*/\n';
		for(var i=0;i<this.imageList.length;i++){
			var ii= this.imageList[i];
			cssContent += `\n
				/*来自图片:`+ ii.name +`*/\n
				.icon-`+ ii.name +`{\n
					background-image:url(`+ this.sImageHost +`);\n
					background-position:-`+ ii.left +`px `+ii.top+`px;\n
					width:`+ ii.width +`px;\n
					height:`+ ii.height +`px;\n
				}\n
			`;
		}
		self.fs.writeFileSync(this.sCss,cssContent,'utf-8');
	}


	//计算高宽并读取图片获得图片信息
	this.makeHW = function(){
		//读取所有在/common/images中的图片，并计算累计高宽
		var files = self.fs.readdirSync(this.cImagePath);
		var left = 0;
		for(var i=0;i<files.length;i++){
			var fi = files[i];
			if(fi === 'spirit.png'){
				continue;
			}
			if(fi.split('.')[1] === 'png'
				|| fi.split('.')[1] === 'jpg'
				|| fi.split('.')[1] === 'jpeg'
				|| fi.split('.')[1] === 'bmp'
				|| fi.split('.')[1] === 'gif'
				|| fi.split('.')[1] === 'tiff'){
				var iItem = {
					name:fi.replace(/\./g,''),
					//图片对象
					imageObj:this.images(this.cImagePath+'\\'+fi),
					width:0,
					height:0,
					left:0,
					top:0
				}
				iItem.width = iItem.imageObj.width();
				iItem.height = iItem.imageObj.height();
				iItem.left = left;
				left += iItem.width;
				this.width += iItem.width;
				if(this.height < iItem.height){
					this.height = iItem.height;
				}
				this.imageList.push(iItem);
			}
		}
	}


}
module.exports = spiritImagesCompiler;


