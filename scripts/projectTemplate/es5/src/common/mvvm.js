"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

define(function () {
  "use strict"; //mvvm组件
  //廖力编写
  //2019年09月11日
  //依赖jquery1.8.1及以上版本
  //此mvvm组件使用脏检测来进行实现
  //支持从ie6至今所有浏览器

  var mvvm =
      /*#__PURE__*/
      function () {
        function mvvm(_config) {
          _classCallCheck(this, mvvm);

          var config = {
            //html模板
            htmlObject: undefined,
            //数据
            data: undefined,
            //事件
            eventsList: undefined,
            //（不用管）对比数据
            compData: undefined,
            //创建后回调
            created: function created() {},
            //创建前回调
            create: function create(_next) {
              _next();
            },
            //销毁前回调
            beforeDistory: function beforeDistory(_next) {
              _next();
            },
            //销毁后回调
            distory: function distory() {}
          };
          this.config = $.extend(config, _config);

          var _htmlObject, _data, _eventsList, _compData;

          _htmlObject = _config.htmlObject;
          _data = _config.data;
          _eventsList = _config.eventsList;
          _compData = _config.compData;
          var self = this; //如果两个参数都有的话就依次填写两个参数

          if (typeof _htmlObject === 'undefined' || typeof _data === 'undefined') {
            throw "mvvm创建错误：请确保您向mvvm引擎提交的html模板对象和数据对象有效!";
          } //html模板对象


          this.htmlObject = $(_htmlObject);

          if (typeof _compData === 'undefined') {
            //数据对象
            this.data = JSON.parse(JSON.stringify(_data)); //对比数据对象

            this.compData = JSON.parse(JSON.stringify(_data));
          } else {
            //数据对象
            this.data = _data; //对比数据对象

            this.compData = _compData;
          }

          this.parentCheckUpDate = function () {};

          this.parentParams = {}; //是否为for或者forIn的子节点

          this.isForItem = false; //变量监听列表

          this.listenList = {}; //监听器

          this.listener = null; //事件列表

          this.eventsList = _eventsList; //for-in的mvvm对象

          this.forinMvvmList = []; //for循环列表

          this.forList = {}; //命令匹配正则

          this.cmdRegExpList = {
            //匹配attr命令
            'attr': /attr\((\s|\S)*?\)/g,
            //匹配更改事件命令
            'evn': /evn\((\s|\S)*?\)/g,
            //是否为单个事件绑定
            isSingleEventBind: /^[a-zA-Z0-9]{1,}\:[a-zA-Z0-9]{1,}$/,
            //检测双括号绑定
            isDoubleBracketsBind: /\{\{(\s|\S)*?\}\}/g,
            //判断是否为脚本绑定
            //只要存在运算符就肯定是脚本绑定
            isExpression: /\%|\!|\:|\>|\<|\?|\=|\$|\(|\)|\[|\]|\{|\}|\'|\"|\`|\&|\+|\-|\*|\//g,
            //判断是否为箭头运算符
            isArrowExp: /\-\>/g,
            //判断是否@打头
            isAtInHead: /^\@/,
            //判断是是否：打头
            isColonInHead: /^\:/
          };
        } //初始化全局事件监听器


        _createClass(mvvm, [{
          key: "initListener",
          value: function initListener() {
            if (typeof Proxy === 'undefined') {
              var self = this;
              var AWL = window.ArrowMvvmListener;

              if (typeof AWL === 'undefined') {
                window.ArrowMvvmListener = {
                  timmer: null,
                  timerList: null,
                  startTimmer: null,
                  regTimer: null,
                  stopTimer: null
                };
                AWL = window.ArrowMvvmListener;
                AWL.timerList = [];

                AWL.startTimmer = function () {
                  var setTimmer = function setTimmer() {
                    AWL.timmer = setTimeout(function () {
                      for (var i = 0; i < AWL.timerList.length; i++) {
                        AWL.timerList[i].func();
                      }

                      setTimmer();
                    }, 23.7);
                  };

                  setTimmer();
                }; //注册mvvm事件


                AWL.regTimer = function (_func) {
                  var guid = self.newGuid();
                  AWL.timerList.push({
                    guid: guid,
                    func: _func
                  });
                  return guid;
                }; //注销mvvm事件


                AWL.stopTimer = function (_guid) {
                  var newList = [];

                  for (var i = 0; i < AWL.timerList.length; i++) {
                    var item = AWL.timerList[i];

                    if (_guid !== item.guid) {
                      newList.push(item);
                    }
                  }

                  AWL.timerList = newList;
                }; //开始全局计时器


                AWL.startTimmer();
              }
            }
          } //保存原始的html文档

        }, {
          key: "saveOrgHtmlText",
          value: function saveOrgHtmlText() {
            this.orgHtml = this.htmlObject[0].outerHTML;
          } //初始化

        }, {
          key: "init",
          value: function init(_callBack) {
            var self = this; //执行创建回调函数

            this.config.create(function () {
              //执行初始化监听器
              self.initListener(); //保存原有的html内容

              self.saveOrgHtmlText(); //执行解析器，解析html数据执行数据绑定

              self.compiler(self.htmlObject);
              self.start(); //执行创建后回调函数

              self.config.created();

              if (typeof _callBack === 'function') {
                _callBack();
              }
            });
          } //解析html文件并和数据进行绑定

        }, {
          key: "compiler",
          value: function compiler(_html) {
            var self = this;
            this.transSLan(_html); //处理for循环

            var forNodes = $(_html).find('[for]');

            if (typeof $(_html).attr('for') !== "undefined" && $(_html).attr('for') !== '') {
              forNodes.push($(_html));
            }

            if (forNodes.length !== 0) {
              forNodes = this.findOuterAttrTag('for', forNodes);

              for (var i = 0; i < forNodes.length; i++) {
                this.explainFor($(forNodes[i]).attr('for'), $(forNodes[i]));
              }
            } //绑定data-bind的数据


            this.bindCore(_html, 'data-bind', function (_item) {
              self.explainDataBindCommand($(_item).attr('data-bind'), $(_item), '');
            }); //执行双括号绑定

            this.doubleBracketsBind(_html); //执行class-bind，attr-bind，style-bind三绑定

            this.bindCAS(_html); //执行if绑定

            this.findIfCommand(_html); //执行纯脚本绑定f-bind

            this.findfBindCommand(_html); //最后绑定事件

            this.bindModulEvents(_html, this.data);
          } //简写语法转换

        }, {
          key: "transSLan",
          value: function transSLan(_html) {
            var atEventsNodes = _html.find('*');

            atEventsNodes.push(_html);
            var elems = []; //从所有节点中筛选带有@事件绑定的节点

            for (var i = 0; i < atEventsNodes.length; i++) {
              var item = atEventsNodes[i];

              if (typeof item.attributes !== 'undefined') {
                var tags = [];
                var isCTag = false;

                for (var j = 0; j < item.attributes.length; j++) {
                  var atrItem = item.attributes[j];

                  if ($.trim(atrItem.name).match(this.cmdRegExpList.isColonInHead) !== null) {
                    isCTag = true;
                    var key = atrItem.name;
                    var value = atrItem.value;
                    tags.push({
                      key: key,
                      value: value
                    });
                  }
                }

                if (isCTag) {
                  for (var j = 0; j < tags.length; j++) {
                    var tItem = tags[j];
                    $(item).removeAttr(tItem.key);

                    if (tItem.key === ":data") {
                      tItem.key = 'data-bind';
                    }

                    if (tItem.key === ":class") {
                      tItem.key = 'class-bind';
                    }

                    if (tItem.key === ":attr") {
                      tItem.key = 'attr-bind';
                    }

                    if (tItem.key === ":style") {
                      tItem.key = 'style-bind';
                    }

                    $(item).attr(tItem.key, tItem.value);
                  }
                }
              }
            }
          } //执行class-bind，attr-bind，style-bind三绑定

        }, {
          key: "bindCAS",
          value: function bindCAS(_html) {
            var self = this;

            var bind = function bind(_sourceCommand, _type, _bindFunc, _item, _listenTag) {
              var sourceCommand = _sourceCommand;
              var result = self.explainAttrsExp(_type, sourceCommand); //给每个绑定的值注册监听器

              for (var i = 0; i < result.dataTags.length; i++) {
                var dataTag = result.dataTags[i];
                self.addListenerInList(_listenTag + ':' + dataTag, _item, sourceCommand);
              } //处理绑定


              self[_bindFunc](result.dataTags, sourceCommand, _item);
            }; //1.执行class-bind


            this.bindCore(_html, 'class-bind', function (_item) {
              var sourceCommand = _item.sourceCommand = _item.attr('class-bind');

              bind(sourceCommand, 0, 'bindClass', _item, 'classBind');
            }); //2.执行attr-bind

            this.bindCore(_html, 'attr-bind', function (_item) {
              var sourceCommand = _item.sourceCommand = _item.attr('attr-bind');

              bind(sourceCommand, 1, 'bindAttr', _item, 'attrBind');
            }); //3.执行style-bind

            this.bindCore(_html, 'style-bind', function (_item) {
              var sourceCommand = _item.sourceCommand = _item.attr('style-bind');

              bind(sourceCommand, 2, 'bindStyle', _item, 'styleBind');
            });
          } //执行指定命令的绑定

        }, {
          key: "bindCore",
          value: function bindCore(_html, _com, _callback) {
            var bindNodes = $(_html).find('[' + _com + ']');

            if (typeof $(_html).attr(_com) !== "undefined" && $(_html).attr(_com) !== '') {
              bindNodes.push($(_html)[0]);
            }

            if (bindNodes.length !== 0) {
              for (var i = 0; i < bindNodes.length; i++) {
                _callback($(bindNodes[i]));

                $(bindNodes[i]).removeAttr(_com);
              }
            }
          } //属性绑定表达式的解析
          //type:解析类型 0为class 1为attr 2为style
          //_string:为表达式内容

        }, {
          key: "explainAttrsExp",
          value: function explainAttrsExp(_type, _string) {
            var self = this;
            var result = {
              //类型 0为class 1为attr 2为style
              type: _type,
              //原始语句
              orgStr: _string,
              //是否为箭头表达式
              isArrow: false,
              //绑定的dataTag是哪些
              dataTags: [],
              //箭头表达式返回
              arrowResult: {
                //表达式执行后返回真假
                expResult: false,
                //执行内容的结果列表
                list: []
              },
              expResult: {
                result: ''
              }
            }; //1.先判断是否为箭头运算符

            var res = _string.match(this.cmdRegExpList.isArrowExp);

            if (res !== null) {
              result.isArrow = true; //开始剥离箭头运算符

              var expArr = _string.replace('->', '❤').split('❤'); //先剥离箭头表达式中前置判断的表达式


              var dis = $.trim(expArr[0]).replace(/^\(/, '').replace(/\)$/, '');
              var isExp = this.isExpression(dis);
              result.dataTags = isExp.dataTagList;
              var isHasDataTag = false;

              if (isExp.dataTagList.length > 0) {
                isHasDataTag = true;
              }

              result.arrowResult.expResult = self.executeExpression(dis, isHasDataTag); //如果类型为1或者2
              //说明要剥离括号

              if (_type === 1 || _type === 2) {
                //剥离括号，并剥离分号，将多项设置分离出来
                var resList = $.trim(expArr[1]).replace(/^\(/, '').replace(/\)$/, '').split(';');

                for (var i = 0; i < resList.length; i++) {
                  var ritem = resList[i].split(':');
                  result.arrowResult.list.push({
                    key: ritem[0],
                    value: ritem[1]
                  });
                }
              } else {
                //否则就是class
                var resList = $.trim(expArr[1]).replace(/^\(/, '').replace(/\)$/, '').split(';');

                for (var i = 0; i < resList.length; i++) {
                  var ritem = resList[i];
                  result.arrowResult.list.push(ritem);
                }
              }
            } else {
              //如果不是箭头运算符就是其它绑定
              var isExp = this.isExpression(_string);
              result.dataTags = isExp.dataTagList;
              var isHasDataTag = false;

              if (isExp.dataTagList.length > 0) {
                isHasDataTag = true;
              }

              result.expResult.result = self.executeExpression(_string, isHasDataTag);
            } //返回结果


            return result;
          } //获得数据的字符串
          //用于绑定小脚本或者if语句

        }, {
          key: "getStringsOfData",
          value: function getStringsOfData() {
            var str = '';

            for (var i in this.data) {
              str += 'var ' + i + ' = self.data.' + i + ';\n';
            }

            return str;
          } //重新绑定mvvm模板
          //用于模板中新加元素时使用

        }, {
          key: "bindMvvm",
          value: function bindMvvm(_html) {
            var html = this.htmlObject;

            if (typeof _html !== 'undefined') {
              html = _html;
            }

            this.compiler(html);
          } //向mvvm现有模板中追加新的内容

        }, {
          key: "appendNew",
          value: function appendNew(_target, _html) {
            var html = $(_html).appendTo(_target);
            this.bindMvvm(html);
            return html;
          } //解释用户的绑定命令
          //并执行绑定

        }, {
          key: "explainDataBindCommand",
          value: function explainDataBindCommand(_command, _htmlNode, _description) {
            var self = this;

            var cArr = _command.split(';'); //循环用“;”分割开的多命令


            for (var i = 0; i < cArr.length; i++) {
              self.executeCommand(cArr[i], _htmlNode, _description);
            }
          } //往命令监视器里插入新监视器

        }, {
          key: "addListenerInList",
          value: function addListenerInList(_singleCommand, _htmlNode, _description) {
            if (typeof _description === 'undefined') {
              _description = '';
            }

            if (typeof this.listenList[_singleCommand] !== 'undefined') {
              var isFindSame = false;

              for (var i in this.listenList[_singleCommand]) {
                if (this.listenList[_singleCommand][i].html === _htmlNode) {
                  isFindSame = true;
                }
              }

              if (!isFindSame) {
                var lItem = {
                  html: _htmlNode,
                  cmd: _singleCommand,
                  desc: _description
                };

                this.listenList[_singleCommand].push(lItem);
              }
            }

            if (typeof this.listenList[_singleCommand] === 'undefined') {
              var lItem = {
                html: _htmlNode,
                cmd: _singleCommand,
                desc: _description
              };
              this.listenList[_singleCommand] = [lItem];
            }
          } //执行文本节点的双括号绑定

        }, {
          key: "doubleBracketsBind",
          value: function doubleBracketsBind(_htmlNode) {
            var self = this;
            var childNodes = _htmlNode[0].childNodes;

            for (var i = 0; i < childNodes.length; i++) {
              var child = childNodes[i]; //如果是文本就执行绑定程序

              if (Number(child.nodeType) === 3) {
                var text = child.data; //测试文本中是否含有双括号

                var bindNodes = text.match(this.cmdRegExpList.isDoubleBracketsBind); //如果绑定字段不等于空就实施绑定

                if (bindNodes !== null) {
                  //循环所有的绑定节点，依次添加绑定
                  //这里的逻辑是
                  //将原始的绑定文本例如{{data}}{{data2}}{{data3}}寄存
                  //然后直接销毁显示数据
                  //并注册text:data ,text:data2 ,text:data3 的绑定监听
                  //如果触发其中一个数据的更改事件，就直接重新绑定这整句话
                  var sourceTextCommand = text;
                  child.data = '';

                  for (var j = 0; j < bindNodes.length; j++) {
                    var dataTag = bindNodes[j].replace('{{', '').replace('}}', '');
                    var isExp = this.isExpression(dataTag); //如果不是表达式绑定
                    //就直接添加该dataTag的变量监听

                    if (!isExp.isExp) {
                      //添加数据监视
                      this.addListenerInList('text:' + dataTag, $(child), sourceTextCommand);
                    } else {
                      //否则就要添加多个变量监听
                      for (var e = 0; e < isExp.dataTagList.length; e++) {
                        var dIDataTag = isExp.dataTagList[e]; //添加数据监视

                        this.addListenerInList('text:' + dIDataTag, $(child), sourceTextCommand);
                      }
                    } //执行数据绑定


                    this.bindText(dataTag, 'text:' + dataTag, $(child), sourceTextCommand);
                  }
                }
              } else {
                //如果是其它的就往下查找
                this.doubleBracketsBind($(child));
              }
            }
          } //执行if的绑定

        }, {
          key: "findIfCommand",
          value: function findIfCommand(_html) {
            //绑定if语句
            //算法的核心思想如下
            //如果此节点上同时绑定了for命令，便不作处理
            //如果此if命令节点的上级包含for命令便不作处理
            var ifNodes = [];
            ifNodes = _html.find('[if]'); //排除for中内部的if

            ifNodes = this.findOuterAttrTag('for', ifNodes); //排除和for并列的if

            var newNodes = [];

            for (var i = 0; i < ifNodes.length; i++) {
              var inode = ifNodes[i];

              if (typeof inode.attr('for') === 'undefined' || inode.attr('for') === '') {
                newNodes.push(inode);
              }
            }

            if (typeof _html.attr('if') !== 'undefined' && _html.attr('for') !== '' && (typeof _html.attr('for') === 'undefined' || _html.attr('for') === '')) {
              newNodes.push(_html);
            }

            ifNodes = $(newNodes); //开始绑定if语句

            for (var i = 0; i < ifNodes.length; i++) {
              var ifItem = ifNodes[i];
              var dataTag = ifItem.attr('if'); //判断是否为表达式

              var isExp = this.isExpression(dataTag); //如果不是表达式绑定
              //就直接添加该dataTag的变量监听

              if (!isExp.isExp) {
                //添加数据监视
                this.addListenerInList('if:' + dataTag, ifItem);
              } else {
                //否则就要添加多个变量监听
                for (var e = 0; e < isExp.dataTagList.length; e++) {
                  var dIDataTag = isExp.dataTagList[e]; //添加数据监视

                  this.addListenerInList('if:' + dIDataTag, ifItem);
                }
              }

              ifItem[0].sourceIfCommand = dataTag; //执行数据绑定

              this.bindIf(dataTag, 'if:' + dataTag, ifItem); //移除if命令

              ifItem.removeAttr('if');
            }
          } //执行fbind

        }, {
          key: "findfBindCommand",
          value: function findfBindCommand(_html) {
            //绑定f-bind语句
            //算法的核心思想如下
            //如果此节点上同时绑定了for命令，便不作处理
            //如果此f-bind命令节点的上级包含for命令便不作处理
            var fNodes = [];
            fNodes = _html.find('[f-bind]'); //排除for中内部的f-bind

            fNodes = this.findOuterAttrTag('for', fNodes); //排除和for并列的if

            var newNodes = [];

            for (var i = 0; i < fNodes.length; i++) {
              var inode = fNodes[i];

              if (typeof inode.attr('for') === 'undefined' || inode.attr('for') === '') {
                newNodes.push(inode);
              }
            }

            if (typeof _html.attr('f-bind') !== 'undefined' && _html.attr('for') !== '' && (typeof _html.attr('for') === 'undefined' || _html.attr('for') === '')) {
              newNodes.push(_html);
            }

            fNodes = $(newNodes); //开始绑定f-bind语句

            for (var i = 0; i < fNodes.length; i++) {
              var fItem = fNodes[i];
              var dataTag = fItem.attr('f-bind'); //判断是否为表达式

              var isExp = this.isExpression(dataTag); //如果不是表达式绑定
              //就直接控制台告诉开发者
              //使用f-bind请编写脚本

              if (!isExp.isExp) {
                console.log('mvvm提示:绑定f-bind语句时请使用脚本！');
                console.log(fItem);
                return;
              } else {
                //否则就要添加多个变量监听
                for (var e = 0; e < isExp.dataTagList.length; e++) {
                  var dIDataTag = isExp.dataTagList[e]; //添加数据监视

                  this.addListenerInList('f-bind:' + dIDataTag, fItem);
                }
              }

              fItem[0].sourcefBindCommand = dataTag; //执行数据绑定

              this.bindFB(dataTag, 'f-bind:' + dataTag, fItem); //移除if命令

              fItem.removeAttr('f-bind');
            }
          } //绑定f-bind

        }, {
          key: "bindFB",
          value: function bindFB(_dataTag, _command, _htmlNode) {
            _dataTag = _htmlNode[0].sourcefBindCommand;
            var self = this;
            var isExp = this.isExpression(_dataTag);
            var data = ''; //检查是否为表达式

            if (!isExp.isExp) {
              console.log('mvvm提示:绑定f-bind语句时请使用脚本！');
              console.log(_htmlNode);
              return;
            } else {
              if (isExp.dataTagList.length !== 0) {
                self.executeExpForNode(_dataTag, true, _htmlNode);
              } else {
                self.executeExpForNode(_dataTag, false, _htmlNode);
              }
            }
          } //绑定if命令的节点

        }, {
          key: "bindIf",
          value: function bindIf(_dataTag, _command, _htmlNode) {
            _dataTag = _htmlNode[0].sourceIfCommand;
            var self = this;
            var isExp = this.isExpression(_dataTag);
            var data = ''; //检查是否为表达式

            if (!isExp.isExp) {
              data = self.get(_dataTag);
            } else {
              if (isExp.dataTagList.length !== 0) {
                data = self.executeExpression(_dataTag, true);
              } else {
                data = self.executeExpression(_dataTag, false);
              }
            }

            if (self.getTrueFalese(data)) {
              _htmlNode.show(); //处理else


              if (typeof _htmlNode.next().attr('else') !== 'undefined' || typeof _htmlNode.next().data('else') !== 'undefined') {
                _htmlNode.next().hide();
              }
            } else {
              _htmlNode.hide(); //处理else


              if (typeof _htmlNode.next().attr('else') !== 'undefined' || typeof _htmlNode.next().data('else') !== 'undefined') {
                _htmlNode.next().show();
              }
            }
          } //执行单个命令

        }, {
          key: "executeCommand",
          value: function executeCommand(_singleCommand, _htmlNode, _description) {
            var self = this;

            var cArr = _singleCommand.split(':');

            var command = cArr[0];
            var dataTag = cArr[1]; //添加数据监视

            this.addListenerInList(_singleCommand, _htmlNode); //获得数据值

            var data = this.get(dataTag);

            if ($.trim(command) === 'styleBind') {
              this.bindStyle(dataTag, command, _htmlNode);
            }

            if ($.trim(command) === 'attrBind') {
              this.bindAttr(dataTag, command, _htmlNode);
            }

            if ($.trim(command) === 'classBind') {
              this.bindClass(dataTag, command, _htmlNode);
            }

            if ($.trim(command) === 'f-bind') {
              this.bindFB(dataTag, command, _htmlNode);
            }

            if ($.trim(command) === 'if') {
              this.bindIf(dataTag, command, _htmlNode);
            }

            if ($.trim(command) === 'text') {
              this.bindText(dataTag, command, _htmlNode, _description);
            }

            if ($.trim(command) === 'for') {
              this.explainFor(dataTag, _htmlNode);
            } //处理绑定innerhtml


            if ($.trim(command) === 'html') {
              _htmlNode.html(data);
            } //处理绑定src


            if ($.trim(command) === 'src') {
              _htmlNode.attr('src', data);
            } //处理绑定val


            if ($.trim(command) === 'val') {
              this.bindVal(dataTag, command, _htmlNode, _singleCommand);
            } //处理绑定attr


            if (command.match(self.cmdRegExpList.attr) !== null) {
              this.bindAttr(dataTag, command, _htmlNode, _singleCommand);
            } //处理绑定数据更改事件


            if (command.match(self.cmdRegExpList.evn) !== null) {
              this.bindEvn(dataTag, command, _htmlNode, _singleCommand);
            }
          } //为某html节点执行表达式

        }, {
          key: "executeExpForNode",
          value: function executeExpForNode(_exp, _isUsingData, _htmlNode) {
            var self = this;
            window["___oneTimeEval"] = {};
            window["___oneTimeEval"]["self"] = self; //获得数据中的所有字段文本

            var dataStr = '';

            if (_isUsingData) {
              var dataStr = this.getStringsOfData();
            } //获得当前的事件列表


            var events = this.eventsList;
            var $el = _htmlNode;
            window["___oneTimeEval"]["events"] = this.eventsList;
            window["___oneTimeEval"]["el"] = _htmlNode;
            dataStr = dataStr.replace(/self\./g, 'window.___oneTimeEval.self.');
            _exp = _exp.replace(/events\./g, 'window.___oneTimeEval.events.');
            _exp = _exp.replace(/\$el/g, 'window.___oneTimeEval.el');
            var newExp = dataStr += "(function(){ return " + _exp + ' ;})();';
            var result = eval(newExp);

            try {
              delete window["___oneTimeEval"];
            } catch (_e) {}

            return result;
          } //执行表达式

        }, {
          key: "executeExpression",
          value: function executeExpression(_exp, _isUsingData) {
            var self = this;
            window["___oneTimeEval"] = {};
            window["___oneTimeEval"]["self"] = self; //获得数据中的所有字段文本

            var dataStr = '';

            if (_isUsingData) {
              var dataStr = this.getStringsOfData();
            } //获得当前的事件列表


            var events = this.eventsList;
            window["___oneTimeEval"]["events"] = this.eventsList;
            dataStr = dataStr.replace(/self\./g, 'window.___oneTimeEval.self.');
            _exp = _exp.replace(/events\./g, 'window.___oneTimeEval.events.');
            var newExp = dataStr += "(function(){ return " + _exp + ' ; })();';
            var result = eval(newExp);

            try {
              delete window["___oneTimeEval"];
            } catch (_e) {}

            return result;
          } //判断是否为表达式
          //如果不是表达式返回false
          //如果是表达式就要返回true,并返回其中包含的所有dataTag字段

        }, {
          key: "isExpression",
          value: function isExpression(_dataTag) {
            var result = {
              isExp: false,
              dataTagList: []
            }; //如果是表达式

            this.cmdRegExpList.isExpression.lastIndex = 0;

            if (this.cmdRegExpList.isExpression.test(_dataTag) === true) {
              var dataTags = [];

              for (var i in this.data) {
                if (_dataTag.indexOf(i) !== -1) {
                  dataTags.push(i);
                }
              }

              result.isExp = true;
              result.dataTagList = dataTags;
              return result;
            } else {
              //如果不是表达式
              //直接返回
              return result;
            }
          } //绑定样式处理

        }, {
          key: "bindClass",
          value: function bindClass(_dataTag, _command, _htmlNode) {
            var self = this;
            var sourceCommand = _htmlNode.sourceCommand;
            var result = self.explainAttrsExp(0, sourceCommand); //判断是否为箭头表达式

            if (result.isArrow) {
              //如果为箭头表达式就判断运算结果是否为真
              if (result.arrowResult.expResult) {
                //为真就加载class
                for (var i = 0; i < result.arrowResult.list.length; i++) {
                  var li = result.arrowResult.list[i];

                  _htmlNode.addClass(li);
                }
              } else {
                //为假就移除class
                for (var i = 0; i < result.arrowResult.list.length; i++) {
                  var li = result.arrowResult.list[i];

                  _htmlNode.removeClass(li);
                }
              }
            } else {
              if (typeof _htmlNode.classPreResult !== 'undefined') {
                _htmlNode.removeClass(_htmlNode.classPreResult);
              } //如果不是箭头表达式就直接赋予运算结果


              _htmlNode.addClass(result.expResult.result);

              _htmlNode.classPreResult = result.expResult.result;
            }
          } //绑定行样式处理器

        }, {
          key: "bindStyle",
          value: function bindStyle(_dataTag, _command, _htmlNode) {
            var self = this;
            var sourceCommand = _htmlNode.sourceCommand;
            var result = self.explainAttrsExp(2, sourceCommand); //判断是否为箭头表达式

            if (result.isArrow) {
              //如果为箭头表达式就判断运算结果是否为真
              if (result.arrowResult.expResult) {
                //为真就加载class
                for (var i = 0; i < result.arrowResult.list.length; i++) {
                  var li = result.arrowResult.list[i];

                  _htmlNode.css(li.key, li.value);
                }
              } else {
                //为假就移除class
                for (var i = 0; i < result.arrowResult.list.length; i++) {
                  var li = result.arrowResult.list[i];

                  _htmlNode.css(li.key, '');
                }
              }
            } else {
              if (typeof _htmlNode.stylePreResult !== 'undefined') {
                _htmlNode.css(_htmlNode.stylePreResult.key, '');
              }

              if (typeof result.expResult.result.key === 'undefined' || result.expResult.result.key === '') {
                if (typeof result.expResult.result.value === 'undefined' && typeof result.expResult.result === 'string') {
                  _htmlNode.attr('style', result.expResult.result);
                } else {
                  _htmlNode.attr('style', result.expResult.result.value);
                }
              } else {
                //如果不是箭头表达式就直接赋予运算结果
                _htmlNode.css(result.expResult.result.key, result.expResult.result.value);
              }

              _htmlNode.stylePreResult = result.expResult.result;
            }
          }
        }, {
          key: "bindText",
          value: function bindText(_dataTag, _command, _htmlNode, _description) {
            var self = this; //绑定文本的话，就需要从原始文本信息中执行绑定

            var sourceTextCommand = _description;
            var bindNodes = sourceTextCommand.match(this.cmdRegExpList.isDoubleBracketsBind);
            var ssString = '';

            for (var j = 0; j < bindNodes.length; j++) {
              var dataTag = bindNodes[j].replace('{{', '').replace('}}', '');
              var isExp = this.isExpression(dataTag);
              var data = '';
              var bTag = 'textContent'; //ie8以下浏览器不支持.textContent
              //所以要测试一下

              try {
                _htmlNode[0].textContent = '';
              } catch (_e) {
                bTag = 'data';
              } //检查是否为表达式


              if (!isExp.isExp) {
                data = self.get(dataTag);

                if (ssString !== '') {
                  _htmlNode[0][bTag] = ssString = ssString.replace(new RegExp('\{\{' + dataTag + '\}\}', 'g'), data);
                } else {
                  _htmlNode[0][bTag] = ssString = sourceTextCommand.replace(new RegExp('\{\{' + dataTag + '\}\}', 'g'), data);
                }
              } else {
                if (isExp.dataTagList.length !== 0) {
                  data = self.executeExpression(dataTag, true);
                } else {
                  data = self.executeExpression(dataTag, false);
                }

                if (ssString !== '') {
                  _htmlNode[0][bTag] = ssString = ssString.replace(bindNodes[j], data);
                } else {
                  _htmlNode[0][bTag] = ssString = sourceTextCommand.replace(bindNodes[j], data);
                }
              }
            }
          } //处理数据的更改事件绑定

        }, {
          key: "bindEvn",
          value: function bindEvn(_dataTag, _command, _htmlNode) {
            var self = this;
            var evnTag = $.trim(_command).replace('evn(', '').replace(')', '');
            var func = this.eventsList[evnTag];
            var data = self.get(_dataTag);

            if (typeof _func === 'undefined') {
              console.log('mvvm:data-bind中的evn(事件)不存在:' + _command);
              return;
            }

            (function (_func) {
              _func.apply(_htmlNode, [data, _dataTag, _command]);
            })(func);
          } //绑定attr

        }, {
          key: "bindAttr",
          value: function bindAttr(_dataTag, _command, _htmlNode) {
            var self = this;

            if (_typeof(_htmlNode.sourceCommand) !== undefined) {
              var sourceCommand = _htmlNode.sourceCommand;
              var result = self.explainAttrsExp(1, sourceCommand); //判断是否为箭头表达式

              if (result.isArrow) {
                //如果为箭头表达式就判断运算结果是否为真
                if (result.arrowResult.expResult) {
                  //为真就加载class
                  for (var i = 0; i < result.arrowResult.list.length; i++) {
                    var li = result.arrowResult.list[i];

                    _htmlNode.attr(li.key, li.value);
                  }
                } else {
                  //为假就移除class
                  for (var i = 0; i < result.arrowResult.list.length; i++) {
                    var li = result.arrowResult.list[i];

                    _htmlNode.removeAttr(li.key);
                  }
                }
              } else {
                if (typeof _htmlNode.attrPreResult !== 'undefined') {
                  _htmlNode.removeAttr(_htmlNode.attrPreResult.key);
                } //如果不是箭头表达式就直接赋予运算结果


                _htmlNode.attr(result.expResult.result.key, result.expResult.result.value);

                _htmlNode.attrPreResult = result.expResult.result;
              }
            } else {
              var attrTag = $.trim(_command).replace('attr(', '').replace(')', '');
              var data = self.get(_dataTag);

              _htmlNode.attr(attrTag, data);
            }
          } //绑定val处理

        }, {
          key: "bindVal",
          value: function bindVal(_dataTag, _command, _htmlNode, _singleCommand) {
            var self = this;
            var dataTag = _dataTag;
            var command = _command; //获得数据值

            var data = this.get(dataTag); //给input绑定val

            var bindValForinput = function bindValForinput() {
              var value = _htmlNode.val();

              var gValue = self.get(dataTag); //判断checkbox

              if (_htmlNode[0].tagName === 'INPUT' && typeof _htmlNode.attr('type') !== 'undefined' && _htmlNode.attr('type') !== '' && _htmlNode.attr('type') === 'checkbox') {
                //处理checkbox
                switch (gValue) {
                  case '1':
                    value = '0';
                    break;

                  case '0':
                    value = '1';
                    break;

                  case 1:
                    value = 0;
                    break;

                  case 0:
                    value = 1;
                    break;

                  case true:
                    value = false;
                    break;

                  case false:
                    value = true;
                    break;

                  case 'true':
                    value = 'false';
                    break;

                  case 'false':
                    value = 'true';
                    break;
                }
              } else if (_htmlNode[0].tagName === 'SELECT') {
                console.log(value + '检测到更改');
              }

              if (value !== gValue) {
                self.set(dataTag, value, true); //查找是否有相同的绑定

                self.checkDataAndUpdate(dataTag, value, _htmlNode, _singleCommand);
              }
            }; //判断checkbox


            if (_htmlNode[0].tagName === 'INPUT' && typeof _htmlNode.attr('type') !== 'undefined' && _htmlNode.attr('type') !== '' && _htmlNode.attr('type') === 'checkbox') {
              //处理checkbox
              var vData = false;

              switch (data) {
                case '1':
                  vData = true;
                  break;

                case '0':
                  vData = false;
                  break;

                case 1:
                  vData = true;
                  break;

                case 0:
                  vData = false;
                  break;

                case true:
                  vData = true;
                  break;

                case false:
                  vData = false;
                  break;

                case 'true':
                  vData = true;
                  break;

                case 'false':
                  vData = false;
                  break;
              }

              if (vData) {
                _htmlNode.attr('checked', 'checked');

                _htmlNode[0].checked = true;
              } else {
                _htmlNode.removeAttr('checked');

                _htmlNode[0].checked = false;
              } //绑定过更改事件就不要重复绑定了


              if (typeof _htmlNode.data('data-is-bind-mvvm-event') === 'undefined') {
                _htmlNode.bind('click', bindValForinput);

                _htmlNode.data('data-is-bind-mvvm-event', true);
              }
            } else if (_htmlNode[0].tagName === 'SELECT') {
              _htmlNode.val(data); //绑定过更改事件就不要重复绑定了


              if (typeof _htmlNode.data('data-is-bind-mvvm-event') === 'undefined') {
                _htmlNode.bind('change', bindValForinput);

                _htmlNode.data('data-is-bind-mvvm-event', true);
              }
            } else {
              _htmlNode.val(data); //绑定过更改事件就不要重复绑定了


              if (typeof _htmlNode.data('data-is-bind-mvvm-event') === 'undefined') {
                _htmlNode.unbind('keyup', bindValForinput);

                _htmlNode.unbind('blur', bindValForinput);

                _htmlNode.keyup(bindValForinput);

                _htmlNode.blur(bindValForinput);

                _htmlNode.data('data-is-bind-mvvm-event', true);
              }
            }
          } //获得对照数据集的数据

        }, {
          key: "getFromComp",
          value: function getFromComp(_dataTag) {
            var self = this;

            var getData = function getData() {
              if (_dataTag.indexOf('.') !== -1) {
                var arr = _dataTag.split('.');

                var layer = 0;

                var dig = function dig(_data, _dArr) {
                  if (typeof _data[_dArr[layer]] === 'undefined') {
                    return null;
                  }

                  var l = _data[_dArr[layer]];
                  layer += 1;

                  if (layer === arr.length) {
                    return l;
                  } else {
                    return dig(l, arr);
                  }
                };

                return dig(self.compData, arr);
              } else {
                if (typeof self.compData[_dataTag] === 'undefined') {
                  return null;
                }

                return self.compData[_dataTag];
              }
            }; //获取数据


            var data = getData();
            return data;
          } //使用一个数据套接串获得数据

        }, {
          key: "get",
          value: function get(_dataTag) {
            var self = this;

            var getData = function getData() {
              if (_dataTag.indexOf('.') !== -1) {
                var arr = _dataTag.split('.');

                var layer = 0;

                var dig = function dig(_data, _dArr) {
                  if (typeof _data[_dArr[layer]] === 'undefined') {
                    return null;
                  }

                  var l = _data[_dArr[layer]];
                  layer += 1;

                  if (layer === arr.length) {
                    return l;
                  } else {
                    return dig(l, _dArr);
                  }
                };

                return dig(self.data, arr);
              } else {
                if (typeof self.data[_dataTag] === 'undefined') {
                  return null;
                }

                return self.data[_dataTag];
              }
            }; //获取数据


            var data = getData();

            if (data === null) {
              //如果数据为空说明此时这个_dataTag字段中的数据不存在
              //那就先把它放进数据中，值为空
              self.set(_dataTag, '');
              return '';
            } else {
              return data;
            }
          } //从有嵌套关系的数据名称中设置数据

        }, {
          key: "set",
          value: function set(_dataTag, _value, _isFromControlSet) {
            var self = this;

            if (_dataTag.indexOf('.') !== -1) {
              var arr = _dataTag.split('.');

              var layer = 0;

              var dig = function dig(_data, _compData, _dArr) {
                //如果源数据中的值也不存在就要赋值
                if (typeof _data[_dArr[layer]] === 'undefined') {
                  //如果目前迭代还没到底
                  //就新建对象
                  //如果到底就赋空字符串
                  if (layer + 1 !== arr.length) {
                    _data[_dArr[layer]] = {};
                  } else {
                    _data[_dArr[layer]] = '';
                  }
                }

                var l = _data[_dArr[layer]];
                var c = _compData[_dArr[layer]];

                if (ac.isJsonObject(l) && typeof c === 'uindefined') {
                  c = {};
                }

                if ($.isArray(l) && typeof c === 'uindefined') {
                  c = [];
                }

                layer += 1;

                if (layer === arr.length) {
                  if (ac.isJsonObject(_value) || $.isArray(_value)) {
                    _value = JSON.parse(JSON.stringify(_value));
                  } //设置的话就把对比数据和真实数据全部更新
                  //如果有proxy就不更新主数据


                  if (typeof Proxy === 'undefined' || _isFromControlSet === true) {
                    _data[_dArr[layer - 1]] = _value;
                  }

                  _compData[_dArr[layer - 1]] = JSON.parse(JSON.stringify(_value));
                  return l;
                } else {
                  dig(l, c, _dArr);
                }
              };

              return dig(self.data, self.compData, arr);
            } else {
              if (typeof self.data[_dataTag] === 'undefined') {
                self.data[_dataTag] = '';
              }

              if (ac.isJsonObject(_value) || $.isArray(_value)) {
                _value = JSON.parse(JSON.stringify(_value));
              } //如果有proxy就不更新主数据


              if (typeof Proxy === 'undefined' || _isFromControlSet === true) {
                self.data[_dataTag] = _value;
              }

              self.compData[_dataTag] = JSON.parse(JSON.stringify(_value));
              return self.data[_dataTag];
            }
          } //创建监听器

        }, {
          key: "start",
          value: function start() {
            var self = this; //如果监听代理存在，就使用监听代理进行监听

            if (typeof Proxy !== 'undefined') {
              //深层监听
              var Proxxy = function Proxxy(_data) {
                for (var i in _data) {
                  var item = _data[i];

                  if (_typeof(item) === 'object' && item !== null) {
                    _data[i] = Proxxy(item);
                  }

                  if (typeof item === 'array' && item !== null) {
                    _data[i] = Proxxy(item);
                  }
                }

                _data = new Proxy(_data, {
                  get: function get(target, key, receiver) {
                    return Reflect.get(target, key, receiver);
                  },
                  set: function set(target, key, value, receiver) {
                    var r = Reflect.set(target, key, value, receiver);

                    if (_typeof(value) === 'object' && value !== null) {
                      value = Proxxy(value);
                    }

                    if (typeof value === 'array' && value !== null) {
                      value = Proxxy(value);
                    }

                    self.update();
                    return r;
                  }
                });
                return _data;
              };

              this.data = Proxxy(this.data);
            } else {
              //否则启动脏检测
              var self = this;
              this.listener = window.ArrowMvvmListener.regTimer(function () {
                self.update();
              });
              var self = this;
            }
          } //停止监听

        }, {
          key: "stop",
          value: function stop() {
            if (typeof Proxy === 'undefined') {
              this.stopMvvmInForIn();
              window.ArrowMvvmListener.stopTimer(this.listener);
            }
          } //销毁

        }, {
          key: "distroy",
          value: function distroy() {
            var self = this; //执行销毁前回调函数

            this.beforeDistory(function () {
              self.stop(); //销毁之后还原最原始的html内容

              self.htmlObject.replaceWith($(self.orgHtml)); //执行销毁后回调函数

              self.distroy();
            });
            return $(self.orgHtml);
          } //停止在for-in里的mvvm监听

        }, {
          key: "stopMvvmInForIn",
          value: function stopMvvmInForIn() {
            //html:_htmlNode,
            //cmd:_singleCommand,
            //desc:_description
            var self = this;

            for (var i in self.listenList) {
              var command = i.split(':')[0];

              if (command === 'for') {
                var forMvvmList = self.listenList[i][0].html.formvvmList;

                for (var j in forMvvmList) {
                  forMvvmList[j].stop();
                }
              }
            }
          } //筛选for-in /for /data-event /if
          //只能拿最外层的for-in
          //嵌套for-in要避开

        }, {
          key: "findOuterAttrTag",
          value: function findOuterAttrTag(_forTag, _forinNodes) {
            var newNodes = [];

            for (var i = 0; i < _forinNodes.length; i++) {
              var nItem = $(_forinNodes[i]);

              var findUpper = function findUpper(_node) {
                if (typeof $(_node).attr(_forTag) !== "undefined" && $(_node).attr(_forTag) !== '') {
                  return false;
                } else {
                  if (_node.parent().length !== 0) {
                    return findUpper(_node.parent());
                  } else {
                    return true;
                  }
                }
              };

              if (findUpper(nItem.parent())) {
                newNodes.push(nItem);
              }
            }

            return newNodes;
          } //for循环解释器

        }, {
          key: "explainFor",
          value: function explainFor(_dataTag, _htmlNode) {
            var self = this;
            var data = this.get(_dataTag);
            var gvalue = this.getFromComp(_dataTag);

            if (data === '' && gvalue === '' || data.length === 0 && gvalue.length === 0) {
              //this.set(_dataTag,[{i:0}]);
              data = [{
                i: 0
              }];
              gvalue = [{
                i: 0
              }];
            }

            var guid = ''; //母节点

            var htmlObject = null;
            var htmlTemp = '';
            var replaceableNodes = null;

            if (typeof _htmlNode[0].listId === 'undefined') {
              guid = this.newGuid();
              htmlObject = _htmlNode;
              replaceableNodes = htmlObject;
              htmlObject[0].listId = guid;
              this.forList[guid] = htmlObject;
              htmlObject[0].forChildList = [];
            } else {
              guid = _htmlNode[0].listId;
              htmlObject = this.forList[guid];
              replaceableNodes = $(htmlObject[0].forChildList[htmlObject[0].forChildList.length - 1]);
              var mList = htmlObject[0].formvvmList;

              for (var i = 0; i < mList.length; i++) {
                mList[i].stop();
              }
            }

            htmlTemp = htmlObject[0].outerHTML; //放入替代元素

            var ghostNode = $('<div></div>');
            ghostNode.insertAfter($(replaceableNodes[0]));

            if (htmlObject[0].forChildList.length !== 0) {
              for (var i in htmlObject[0].forChildList) {
                $(htmlObject[0].forChildList[i]).remove();
              }
            } else {
              replaceableNodes.remove();
            }

            htmlObject[0].forChildList = [];
            var forMvvmList = [];
            var sfddi = JSON.stringify(self.data);
            data = JSON.parse(JSON.stringify(data));

            for (var i = 0; i < data.length; i++) {
              var di = data[i];
              var gdi = gvalue[i]; //如果数组里的对象不是一个json
              //或者就是个数组
              //那就要重新封装一下

              if (!ac.isJsonObject(di) || $.isArray(di)) {
                di = {
                  value: di,
                  i: i
                };
                gdi = {
                  value: di,
                  i: i
                };
              } else {
                di['i'] = i;
                gdi['i'] = i;
              } //重新组装给到for的mvvm数据


              var fddi = JSON.parse(sfddi);
              var fdgdi = JSON.parse(sfddi);
              fddi['item'] = di;
              fdgdi['item'] = gdi;
              var html = $(htmlTemp);
              self.bindModulEvents(html, fddi);
              html.removeAttr('for');
              var mvvmConfig = {
                htmlObject: html,
                data: fddi,
                eventsList: this.eventsList
              };
              var fmv = new mvvm(mvvmConfig);
              fmv.data = fddi;
              fmv.compData = fdgdi;

              (function (_fmv, _parent) {
                _fmv.parent = _parent;
                _fmv.parentParams = {
                  dataTag: _dataTag,
                  htmlNode: htmlObject,
                  command: 'for:' + _dataTag,
                  value: data
                };
                _fmv.isForItem = true;
              })(fmv, this);

              fmv.init(function () {
                forMvvmList.push(fmv);
                fmv.htmlObject.data('currentData', di);
                htmlObject[0].forChildList.push(fmv.htmlObject);
                fmv.htmlObject.insertBefore(ghostNode);
              });
            }

            htmlObject[0].formvvmList = forMvvmList;
            htmlObject.trigger('change');
            ghostNode.remove(); //添加for监视

            this.addListenerInList('for:' + _dataTag, htmlObject);
          } //绑定事件
          //用于mvvm模板片段的事件绑定

        }, {
          key: "bindModulEvents",
          value: function bindModulEvents(_html, _currentData) {
            var self = this;
            var elems = [];
            elems = _html.find('[data-event]');

            if (typeof _html.attr('data-event') !== 'undefined' && _html.attr('data-event') !== '') {
              elems.push(_html);
            } //把for中的事件绑定排除掉


            elems = self.findOuterAttrTag('for', elems);

            var bindEvents = function bindEvents(_eventBindCommand) {
              var arr = _eventBindCommand.split(':');

              var event = arr[0];
              var func = arr[1];

              if (typeof self.eventsList[func] !== "undefined") {
                $(eitem).bind(event, function (_event) {
                  var args = [_event]; //执行事件的时候顺道传入mvvm绑定的数据

                  if (typeof _currentData !== 'undefined') {
                    args.push(_currentData);
                  }

                  self.eventsList[func].apply(this, args);
                });
              } else {
                console.log('mvvm: 绑定事件出错！' + func + '不存在于this.events中!');
              }
            };

            for (var i = 0; i < elems.length; i++) {
              var eitem = $(elems[i]);
              var eventBindCommand = eitem.attr('data-event'); //如果是单个事件绑定

              if (this.cmdRegExpList.isSingleEventBind.test(eventBindCommand)) {
                bindEvents(eventBindCommand);
              } else {
                //如果是多个事件绑定
                var eventsArr = eventBindCommand.split(',');

                for (var j = 0; j < eventsArr.length; j++) {
                  if ($.trim(eventsArr[i]) !== '') {
                    bindEvents(eventsArr[i]);
                  }
                }
              } //绑定完事件后，将事件移除


              eitem.removeAttr('data-event');
            } //增加支持@事件的绑定方法


            var atEventsNodes = _html.find('*');

            atEventsNodes.push(_html);
            var elems = []; //从所有节点中筛选带有@事件绑定的节点

            for (var i = 0; i < atEventsNodes.length; i++) {
              var item = atEventsNodes[i];

              if (typeof item.attributes !== 'undefined') {
                for (var j = 0; j < item.attributes.length; j++) {
                  var atrItem = item.attributes[j];

                  if ($.trim(atrItem.name).match(this.cmdRegExpList.isAtInHead) !== null) {
                    elems.push(item);
                  }
                }
              }
            } //把for中的事件绑定排除掉


            elems = self.findOuterAttrTag('for', elems); //排除掉以后绑定事件

            for (var i = 0; i < elems.length; i++) {
              var item = elems[i];

              for (var j = 0; j < item[0].attributes.length; j++) {
                var atrItem = item[0].attributes[j];

                if ($.trim(atrItem.name).match(this.cmdRegExpList.isAtInHead) !== null) {
                  var eTag = $.trim(atrItem.name).replace('@', '');

                  (function (_fName, _fbody, _item, _eTag) {
                    $(_item).bind(_eTag, function (_e) {
                      window["___oneTimeEval"] = {};
                      window["___oneTimeEval"]["event"] = _e;
                      window["___oneTimeEval"]["el"] = this;
                      window["___oneTimeEval"]["dataStr"] = self.getStringsOfData();
                      window["___oneTimeEval"]["self"] = self;
                      window["___oneTimeEval"]["item"] = _item;
                      var fName = _fName;
                      var fbody = _fbody;

                      if (fbody === '') {
                        fbody = 'window.___oneTimeEval.event';
                      } else {
                        fbody = 'window.___oneTimeEval.event,' + fbody;
                      }

                      var d = window["___oneTimeEval"]["dataStr"].replace(/self/g, 'window.___oneTimeEval.self');
                      eval(d + "(function(_self,_e,_el){_self.eventsList." + fName + ".apply(window.___oneTimeEval.el,[" + fbody + "])}).apply(window.___oneTimeEval.el,[window.___oneTimeEval.self,window.___oneTimeEval.event,window.___oneTimeEval.item])");

                      try {
                        delete window["___oneTimeEval"];
                      } catch (_e) {}
                    });
                  })($.trim(atrItem.value).split('(')[0], $.trim(atrItem.value).split('(')[1].replace(')', ''), item, eTag);

                  item.removeAttr(atrItem.name);
                }
              }
            }
          } //匹配绑定的dataTag层级

        }, {
          key: "matchingLevelsOfDatatag",
          value: function matchingLevelsOfDatatag(_a, _b) {
            if (_a.indexOf('.') !== 'undefined') {
              var a = _a.split('.');

              var finalStr = '';

              for (var i = 0; i < a.length; i++) {
                if (i !== 0) {
                  finalStr += '.' + a[i];
                } else {
                  finalStr = a[i];
                }

                if (finalStr === _b) {
                  return true;
                }
              }

              return false;
            } else {
              if (_a === _b) {
                return true;
              } else {
                return false;
              }
            }
          } //检查某个字段并更新

        }, {
          key: "checkDataAndUpdate",
          value: function checkDataAndUpdate(_dataTag, _value, _htmlNode, _command) {
            var self = this;

            for (var i in self.listenList) {
              var dataTag = i.split(':')[1]; //比如 list  和list.0.value 是一个东西，
              //如果更新了list 就要更新 list.0.value中的内容
              //反之亦然
              //所以需要使用matchingLevelsOfDatatag
              //对dataTag进行反复拆分比对

              if (this.matchingLevelsOfDatatag(_dataTag, dataTag) || this.matchingLevelsOfDatatag(dataTag, _dataTag)) {
                var command = i;

                for (var j in self.listenList[i]) {
                  var lli = self.listenList[i][j].html;
                  var desi = self.listenList[i][j].desc; //变更绑定了一样数据的
                  //判断html对象不一样的,绑定数据相等的可以执行
                  //或者
                  //判断命令不相等，但是html节点一样的，绑定数据相等的可以执行

                  if (lli !== _htmlNode || _command !== command && lli === _htmlNode || _command === command && lli !== _htmlNode) {
                    this.explainDataBindCommand(i, lli, desi);
                  }
                }
              }
            } //遇见数据更改就冒泡上去


            if (this.isForItem) {
              //fmv.parentParams = {
              //	dataTag:_dataTag,
              //	htmlNode:html,
              //	command:'for:'+_dataTag
              //};
              this.parent.checkDataAndUpdate(this.parentParams.dataTag, this.parentParams.value, this.parentParams.htmlNode, this.parentParams.command);
            }
          } //手动更新

        }, {
          key: "update",
          value: function update() {
            var self = this;

            for (var i in self.listenList) {
              var command = i;
              var dataTag = i.split(':')[1];
              var value = this.get(dataTag);
              var gvalue = this.getFromComp(dataTag); //如果找到的值为空，说明这个值被删除了

              if (value === null) {
                continue;
              }

              if (JSON.stringify(value) !== JSON.stringify(gvalue)) {
                this.set(dataTag, value);

                for (var j in self.listenList[i]) {
                  var lli = self.listenList[i][j].html;
                  var desi = self.listenList[i][j].desc;
                  this.explainDataBindCommand(i, lli, desi); //联动更新

                  this.checkDataAndUpdate(dataTag, value, lli, i);
                }
              }
            }
          } //获得一个gui ID

        }, {
          key: "newGuid",
          value: function newGuid() {
            var guid = "";

            for (var i = 1; i <= 32; i++) {
              var n = Math.floor(Math.random() * 16.0).toString(16);
              guid += n;
            }

            return guid;
          }
        }, {
          key: "getTrueFalese",
          //获得真假
          value: function getTrueFalese(_value) {
            //处理checkbox
            switch (_value) {
              case '1':
                return true;
                break;

              case '0':
                return false;
                break;

              case 1:
                return true;
                break;

              case 0:
                return false;
                break;

              case true:
                return true;
                break;

              case false:
                return false;
                break;

              case 'true':
                return true;
                break;

              case 'false':
                return false;
                break;
            }

            return false;
          }
        }]);

        return mvvm;
      }();

  ;
  return mvvm;
});