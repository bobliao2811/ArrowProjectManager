//zTool.Core - alpha 1.1.4 - Beta 1.1.0
//廖力编写@2012-12-27 ~ 2013-12-18
//DOM集成对象操作器
window.zTool = window.zZ = function(input) {
    return new _zTool(input)
};
window._zTool = function(inputObj) {
    this.InputObj = inputObj;
    if (typeof(inputObj) == "string" && new RegExp("^<([a-zA-Z]+)[ ]*([ ]+[a-zA-Z0-9]+=.+)*>.*</[a-zA-Z]+>$|^<([a-zA-Z]*)[ ]*([ ]+[a-zA-Z0-9]{1,}=.+)*/>$").test(inputObj)) {
        if (!this.createElement) {
            alert('zTool.Core：Undefined function of "zT.createElement" ,\n if you need create elements width zTool.Core, \n please add "part 2" of zebra tool to your zTool.Core-Beta-x.x.x.js.')
        }
        this.lObj = this.createElement(inputObj)
    } else {
        this.lObj = this.findElement(inputObj)
    }
};
window.zZ.fn = window._zTool.prototype = window.zT = {
    InputObj: null,
    findElement: function(selectObj) {
        var elements = [];
        if (selectObj) {
            switch (typeof(selectObj)) {
                case "string":
                    elements = this.stringSeleter(selectObj);
                    break;
                case "object":
                    elements.push(selectObj);
                    break
            }
        }
        return elements
    },
    stringSeleter: function(string, inputNode) {
        var elements = [];
        if (!inputNode) {
            inputNode = document.documentElement.childNodes
        }
        if (new RegExp("^[.]").test(string)) {
            string = string.replace(".", "");
            var allElements = document.body;
            elements = zZ.Zstatic.selector.selectCss(inputNode, string);
            return elements
        }
        if (new RegExp("^[#]").test(string)) {
            string = string.replace("#", "");
            elements = zZ.Zstatic.selector.selectPrototype(inputNode, "id=" + string);
            return elements
        }
        if (new RegExp("^<.{1,}>").test(string)) {
            string = string.replace("<", "").replace(">", "");
            elements = zZ.Zstatic.selector.selectTagName(inputNode, string);
            return elements
        }
        if (/^\:[a-zA-Z0-9-_]{1,}\=[a-zA-Z0-9-_]{1,}$/.test(string)) {
            string = string.replace(":", "");
            elements = zZ.Zstatic.selector.selectPrototype(inputNode, string);
            return elements
        }
        elements.push(document.getElementById(string));
        return elements
    },
    find: function(input) {
        this.lObj = this.stringSeleter(input, this.lObj);
        return this
    },
    Elements: function() {
        if (this.lObj.length == 0) {
            return undefined
        }
        return this.lObj
    },
    E: function() {
        if (this.lObj.length == 0) {
            return undefined
        }
        return this.lObj[0]
    },
    delArr: function(arr, value) {
        var rArr = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] != value) {
                rArr.push(arr[i])
            }
        }
        return rArr
    },
    clearEmptyItem: function(arr) {
        var rArr = [];
        for (var i = 0; i < arr.length; i++) {
            if (arr[i]) {
                rArr.push(arr[i])
            }
        }
        return rArr
    },
    joinArr: function(inArr, pArr) {
        for (var i = 0; i < pArr.length; i++) {
            inArr.push(pArr[i])
        }
        return inArr
    },
    trim: function(str) {
        if (str == "") {
            return str
        }
        return str.toString().trim()
    }
};
window.zZ.Zstatic = {
    clCss: null,
    intervalList: [],
    frequencyTime: 1,
    frameAction: null,
    fxFrame: null,
    fxFrameFunction: null,
    selector: null,
    delayTimerArr: []
};
window.zZ.Zstatic.selector = {
    selectCss: function(nodes, string) {
        var elements = [];
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].getAttribute) {
                if (nodes[i].getAttribute("className") || nodes[i].getAttribute("class")) {
                    if (nodes[i].getAttribute("className")) {
                        if (zZ.fn.trim(nodes[i].getAttribute("className")) == string) {
                            elements.push(nodes[i])
                        }
                    } else {
                        if (zZ.fn.trim(nodes[i].getAttribute("class")) == string) {
                            elements.push(nodes[i])
                        }
                    }
                }
            }
            if (nodes[i].childNodes) {
                elements = zZ.fn.joinArr(elements, zZ.Zstatic.selector.selectCss(nodes[i].childNodes, string))
            }
        }
        return elements
    },
    selectPrototype: function(nodes, string) {
        var elements = [],
            Pname = string.split("=")[0],
            Pvalue = string.split("=")[1];
        for (var i = 0; i < nodes.length; i++) {
            var added = false;
            if (nodes[i][Pname]) {
                if (nodes[i][Pname].toString().trim() == Pvalue.trim()) {
                    elements.push(nodes[i]);
                    added = true
                }
            }
            if (!added) {
                if (nodes[i].attributes) {
                    if (nodes[i].attributes[Pname]) {
                        if (nodes[i].attributes[Pname].value == Pvalue) {
                            elements.push(nodes[i])
                        }
                    }
                }
            }
            if (nodes[i].childNodes) {
                elements = zZ.fn.joinArr(elements, zZ.Zstatic.selector.selectPrototype(nodes[i].childNodes, string))
            }
        }
        return elements
    },
    selectTagName: function(nodes, string) {
        var elements = [];
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].tagName) {
                if (nodes[i].tagName.toLowerCase() == string.toLowerCase()) {
                    elements.push(nodes[i])
                } else {
                    if (string == "*") {
                        elements.push(nodes[i])
                    }
                }
            }
            if (nodes[i].childNodes) {
                elements = zZ.fn.joinArr(elements, zZ.Zstatic.selector.selectTagName(nodes[i].childNodes, string))
            }
        }
        return elements
    }
};
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "")
};
zT.childen = function() {
    var elements = [];
    for (var i = 0; i < this.lObj[0].childNodes.length; i++) {
        if (this.lObj[0].childNodes[i].tagName) {
            elements.push(this.lObj[0].childNodes[i])
        }
    }
    this.lObj = elements;
    return this
};
zT.parent = function() {
    var a = [];
    a.push(this.lObj[0].parentNode);
    this.lObj = a;
    return this
};
zT.html = function(v) {
    if (this.lObj.length == 0) {
        return undefined
    }
    if (!v) {
        return this.lObj[0].innerHTML
    }
    for (var j = 0; j < this.lObj.length; j++) {
        this.lObj[j].innerHTML = v
    }
    return this
};
zT.createElement = function(input) {
    var adder = document.createElement("div"),
        sub = "",
        nodes = null,
        identity = "data-zTool-appendNode-" + ( + new Date / Math.random()).toString().replace(".", "");
    input = zZ.fn.trim(input);
    sub = 0;
    if (new RegExp("^[ ]{0,}<(td|th|tr|thead|tbody|tfoot)").test(input)) {
        var tInput = input;
        input = "<table>" + input + "</table>";
        if (new RegExp("^[ ]{0,}<(tr)[ ]*([ ]+[a-zA-Z0-9]+=.+)*>").test(tInput)) {
            sub = 2
        } else {
            if (new RegExp("^[ ]{0,}<(td|th)[ ]*([ ]+[a-zA-Z0-9]+=.+)*>").test(tInput)) {
                sub = 3
            } else {
                sub = 1
            }
        }
    }
    adder.setAttribute("id", identity);
    adder.innerHTML = input;
    document.body.appendChild(adder);
    nodes = document.getElementById(identity);
    var thatObj = document.getElementById(identity);
    for (var i = 0; i < sub; i++) {
        thatObj = thatObj.childNodes[0]
    }
    nodes = thatObj.childNodes;
    var nodeArr = [];
    for (var i = 0; i < nodes.length; i++) {
        nodeArr.push(zZ.fn.clone(nodes[i]))
    }
    document.body.removeChild(document.getElementById(identity));
    return nodeArr
};
zT.append = function(input) {
    if (this.lObj.length == 0) {
        return undefined
    }
    for (var j = 0; j < this.lObj.length; j++) {
        if (typeof(input) == "string") {
            var nodeArr = this.createElement(input);
            for (var i = 0; i < nodeArr.length; i++) {
                this.lObj[j].appendChild(nodeArr[i])
            }
        } else {
            this.lObj[j].appendChild(input)
        }
    }
    return this
};
zT.appendTo = function(input) {
    if (this.lObj.length == 0) {
        return undefined
    }
    var appNode = zTool(input).Elements();
    var cNodes = [];
    for (var i = 0; i < appNode.length; i++) {
        for (var j = 0; j < this.lObj.length; j++) {
            var tNode = zT.clone(this.lObj[j]);
            appNode[i].appendChild(tNode);
            cNodes.push(tNode)
        }
    }
    this.lObj = cNodes;
    return this
};
zT.empty = function() {
    if (this.lObj.length == 0) {
        return undefined
    }
    for (var j = 0; j < this.lObj.length; j++) {
        if (this.lObj[j].childNodes.length != 0) {
            this.lObj[j].removeChild(this.lObj[j].childNodes[0]);
            if (this.lObj[j].childNodes.length != 0) {
                zZ(this.lObj[j]).empty()
            }
        }
    }
    return this
};
zT.remove = function() {
    if (this.lObj.length == 0) {
        return undefined
    }
    for (var j = 0; j < this.lObj.length; j++) {
        try {
            this.lObj[j].parentNode.removeChild(this.lObj[j])
        } catch(e) {}
    }
};
zT.replaceWith = function(htmlDocument) {
    if (this.lObj.length == 0) {
        return undefined
    }
    for (var j = 0; j < this.lObj.length; j++) {
        var rId = "replaceWith_Sine_" + ( + new Date / Math.random()).toString().replace(".", "");
        zTool(this.lObj[j]).insertBefore("<a id='" + rId + "'></a>");
        zTool(this.lObj[j]).remove();
        zTool("#" + rId).insertBefore(htmlDocument);
        zTool("#" + rId).remove()
    }
};
zT.clone = function(Object) {
    if (Object) {
        return Object.cloneNode(true)
    } else {
        return this.lObj[0].cloneNode(true)
    }
};
zT.bor = function(b) {
    if (!b) {
        return this.Borwser()
    }
    if (this.Borwser().indexOf(b) != -1) {
        return true
    }
    return false
};
zT.Borwser = function() {
    var ua = navigator.userAgent.toLowerCase();
    if (ua == null) {
        return "ie"
    } else {
        if (ua.indexOf("chrome") != -1) {
            return "chrome"
        } else {
            if (ua.indexOf("opera") != -1) {
                return "opera"
            } else {
                if (ua.indexOf("safari") != -1) {
                    return "safari"
                } else {
                    if (ua.indexOf("firefox") != -1) {
                        return "firefox"
                    } else {
                        if (ua.indexOf("gecko") != -1) {
                            return "gecko"
                        } else {
                            if (ua.indexOf("msie 6.0") != -1) {
                                return "msie 6.0"
                            } else {
                                if (ua.indexOf("msie 7.0") != -1) {
                                    return "msie 7.0"
                                } else {
                                    if (ua.indexOf("msie 8.0") != -1) {
                                        return "msie 8.0"
                                    } else {
                                        if (ua.indexOf("msie 9.0") != -1) {
                                            return "msie 9.0"
                                        } else {
                                            if (ua.indexOf("msie") != -1) {
                                                return "msie"
                                            } else {
                                                return "ie"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
};
zT.attr = function(attrName, attrValue) {
    if (this.lObj.length == 0) {
        return undefined
    }
    if (attrValue && attrValue) {
        for (var j = 0; j < this.lObj.length; j++) {
            if (attrName == "class" && (this.bor("msie 6.0") || this.bor("msie 7.0") || this.bor("msie 8.0"))) {
                this.lObj[j].setAttribute("className", attrValue)
            } else {
                if (attrName == "style" && this.bor("msie")) {
                    this.lObj[j].style.cssText = attrValue
                } else {
                    this.lObj[j].setAttribute(attrName, attrValue)
                }
            }
        }
        return this
    } else {
        if (attrName == "class" && (this.bor("msie 6.0") || this.bor("msie 7.0") || this.bor("msie 8.0"))) {
            return this.lObj[0].getAttribute("className") || this.lObj[0].getAttribute("class")
        }
        if (attrName == "style" && this.bor("msie")) {
            return this.lObj[0].style.cssText
        }
        return this.lObj[0].getAttribute(attrName)
    }
};
zT.removeAttr = function(attrName) {
    for (var j = 0; j < this.lObj.length; j++) {
        if (attrName == "class" && (this.bor("msie 6.0") || this.bor("msie 7.0") || this.bor("msie 8.0"))) {
            this.lObj[j].removeAttribute("className")
        }
        this.lObj[j].removeAttribute(attrName)
    }
    return this
};
zT.val = function(value) {
    if (this.lObj.length == 0) {
        return undefined
    }
    if (value == undefined || value == null) {
        return this.lObj[0].value
    } else {
        for (var j = 0; j < this.lObj.length; j++) {
            this.lObj[j].value = value
        }
    }
    return this
};
zT.bind = function(event, callBack) {
    if (this.lObj.length == 0) {
        return undefined
    }
    for (var i = 0; i < this.lObj.length; i++) {
        this.unInsEvent(event, this.lObj[i]);
        if (!this.lObj[i]["zEvent-club"]) {
            this.lObj[i]["zEvent-club"] = {}
        }
        if (!this.lObj[i]["zEvent-club"][event]) {
            this.lObj[i]["zEvent-club"][event] = {
                arr: [],
                fFunc: null
            }
        }
        this.lObj[i]["zEvent-club"][event]["arr"].push(callBack);
        this.evalEvent(this.lObj[i], event, false)
    }
    return this
};
zT.evalEvent = function(thisObj, event, useCapture) {
    var action = new zZ.eventFunction(thisObj, thisObj["zEvent-club"][event]["arr"]);
    thisObj["zEvent-club"][event]["fFunc"] = action.callFunction;
    if (thisObj.attachEvent) {
        var eventString = "on" + event;
        thisObj.attachEvent(eventString, action.callFunction)
    } else {
        thisObj.addEventListener(event, action.callFunction, useCapture || false)
    }
};
zT.unInsEvent = function(event, thisObj) {
    if (!thisObj["zEvent-club"]) {
        return
    }
    if (!thisObj["zEvent-club"][event]) {
        return
    }
    var action = thisObj["zEvent-club"][event]["fFunc"];
    this.removeEvent(thisObj, action, event)
};
zT.removeEvent = function(thisObj, action, event) {
    if (thisObj.detachEvent) {
        var eventString = "on" + event;
        thisObj.detachEvent(eventString, action)
    } else {
        thisObj.removeEventListener(event, action, false)
    }
};
zT.unbind = function(event, func) {
    if (this.lObj.length == 0) {
        return undefined
    }
    for (var i = 0; i < this.lObj.length; i++) {
        if (func) {
            this.removeEvent(this.lObj[i], func, event)
        }
        if (!this.lObj[i]["zEvent-club"]) {
            return
        }
        if (!this.lObj[i]["zEvent-club"][event]) {
            return
        }
        if (func && this.lObj[i]["zEvent-club"][event]["arr"].length > 1) {
            this.unInsEvent(event, this.lObj[i]);
            for (var j = 0; j < this.lObj[i]["zEvent-club"][event]["arr"].length; j++) {
                if (this.lObj[i]["zEvent-club"][event]["arr"][j] == func) {
                    delete this.lObj[i]["zEvent-club"][event]["arr"][j]
                }
            }
            this.lObj[i]["zEvent-club"][event]["arr"] = zZ.fn.clearEmptyItem(this.lObj[i]["zEvent-club"][event]["arr"]);
            this.evalEvent(this.lObj[i], event, false)
        } else {
            this.unInsEvent(event, this.lObj[i]);
            this.lObj[i]["zEvent-club"][event] = undefined
        }
    }
    return this
};
zT.click = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].click()
        }
        return
    }
    this.bind("click", callBack)
};
zT.dblclick = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].dblclick()
        }
        return
    }
    this.bind("dblclick", callBack)
};
zT.blur = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].blur()
        }
        return
    }
    this.bind("blur", callBack)
};
zT.focus = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].focus()
        }
        return
    }
    this.bind("focus", callBack)
};
zT.keydown = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].keydown()
        }
        return
    }
    this.bind("keydown", callBack)
};
zT.keypress = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].keypress()
        }
        return
    }
    this.bind("keypress", callBack)
};
zT.keyup = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].keyup()
        }
        return
    }
    this.bind("keyup", callBack)
};
zT.mousedown = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].mousedown()
        }
        return
    }
    this.bind("mousedown", callBack)
};
zT.mousemove = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].mousemove()
        }
        return
    }
    this.bind("mousemove", callBack)
};
zT.mouseout = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].mouseout()
        }
        return
    }
    this.bind("mouseout", callBack)
};
zT.mouseover = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].mouseover()
        }
        return
    }
    this.bind("mouseover", callBack)
};
zT.mouseup = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].mouseup()
        }
        return
    }
    this.bind("mouseup", callBack)
};
zT.change = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].change()
        }
        return
    }
    this.bind("change", callBack)
};
zT.scroll = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].scroll()
        }
        return
    }
    this.bind("scroll", callBack)
};
zT.load = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].load()
        }
        return
    }
    this.bind("load", callBack)
};
zT.resize = function(callBack) {
    if (!zZ.fn.isFunction(callBack)) {
        for (var i in this.lObj) {
            this.lObj[i].resize()
        }
        return
    }
    this.bind("resize", callBack)
};
zT.ready = function(callBack) {
    if (document.readyState == "complete") {
        callBack();
        return this
    }
    this.bind("readystatechange",
        function() {
            if (this.readyState == "complete") {
                callBack()
            }
        })
};
zT.isFunction = function(o) {
    if (typeof(o) == "function") {
        return true
    }
    return false
};
zZ.eventFunction = function(thisObj, callBackArr) {
    this.callFunction = function() {
        for (var i = 0; i < callBackArr.length; i++) {
            callBackArr[i].apply(thisObj, arguments)
        }
    }
};

/*
*ArrowExpress AMD规范异步请求资源框架
*此框架可以请求.js文件，以及任何其它文本形式的文本文件
*廖力编写于 2019/07/17
*版本号:beta 0.1
*/
window._arrowExpress = function(_config){
    var self = this;
    //设置DOM集成对象操作器
    var $ = window.zZ;
    //默认配置文件
    var config = {
        //基准访问路径
        "baseUrl":'',
        //版本号
        "version":+(new Date),
        //在请求js的时候是否使用xhr
        //true:使用xhr不能跨域，因为使用eval效率比不使用xhr较低
        //false:不使用xhr使用js标签来获取运行js文件的话
        //低端浏览器由于不支持document.currentScript
        //低端浏览器将串行请求数据
        //高端浏览器将并行请求数据
        javascriptXHR:false,
        //是否将请求到的css自动进行处理
        //自动处理css是指，在请求到css类型
        //的文件后，将css直接写到页面上去
        //然后框架对其进行缓存
        isAutoHandleCss:true
    }
    //对配置文件进行处理
    self.config = _config || config;

    //请求缓存
    this.catche = {};
    //css缓存
    this.cssCatche = [];
    //已载入css缓存表
    this.loadedCssList = {};
    //并行请求列表
    this.parallelRequireList = {};
    //每次require的任务列表
    //用于不兼容document.currentScript时的多次require
    this.requireTaskList = [];
    //基础请求地址
    this.baseUrl = self.config.baseUrl;
    //版本管理
    this.version = self.config.version;
    //异步等待列表
    //当检测到要请求的模块中又包含了别的模块，说明需要进行等待，等待请求模块中的其它模块加载完成。
    this.syncRequireList = {};
    //正则表达式集合
    this.regStrList = {
        //去除空格
        "trim":/^\s+|\s+$/gm,
        //判断url开头是否包含.
        "urlDot":/^\./,
        //判断是否为js文件
        "isJavascript":/\.js$|.js\?/,
       //判断是否为css文件
        "isStyleFile":/\.css$|.css\?/,
        //判断是否在css中存在@using('./asdasd/asdasd/asdasd.css')
        "usingInCssFile":/\@[ ]{0,}using[ ]{0,}\((\s|\S)*?\)/g,
        //判断是否为绝对路径或者相对协议路径
        "isAbsUrl":/^http\:\/\/|^https\:\/\/|^\/\//
    };
    //拉取资源
    this.require = function(_u,_callBack,_syncGuid){
        //如果只传入了url，说明想同步请求资源
        //同步请求资源只能请求不包含引用的defin()模块
        if(typeof _u === "string" && typeof _callBack === 'undefined' && typeof _syncGuid === 'undefined'){
            return this.nonasyncRequire(_u);
        }

        //如果关闭了javascriptXHR选项,并且浏览器不支持document.currentScript就只能串行require了
        if(self.config.javascriptXHR === false && typeof document.currentScript === 'undefined'){
            var task = {
                url:_u,
                callBack:_callBack,
                syncGuid:_syncGuid,
                taskGuid:self.getGuid(),
                taskObj:null,
                taskCall:function(){
                    var newList = [];
                    var seq = 0;
                    var next = null;
                    for(var i=0;i<self.requireTaskList.length;i++){
                        var item = self.requireTaskList[i];
                        if(item.taskGuid !== task.taskGuid){
                            newList.push(item);
                            if(seq === 0){
                                next = item;
                            }
                            seq ++;
                        }
                    }
                    self.requireTaskList = newList;
                    if(next !== null){
                        next.state = "loadding";
                        next.taskObj = self.circleRequire(next.url,next.taskCall,next.syncGuid);
                    }
                    _callBack.apply(self,arguments);
                },
                state:'waitting'
            }
            this.requireTaskList.push(task);

            if(this.requireTaskList.length === 1){
                task.state = "loadding";
                task.taskObj = this.circleRequire(_u,task.taskCall,_syncGuid);
            }

            return task;
        }else{
            return this.circleRequire(_u,_callBack,_syncGuid);
        }
    };

    //同步请求资源
    //无论js还是其它文件，
    //只要同步加载都是使用xhr请求,
    //并且不能多个同时请求，而且无法跨域请求数据
    this.nonasyncRequire = function(_u){

        //先对url进行处理,判断url是否为相对路径，
        //还是需要预处理baseUrl的绝对路径
        _u = this.urlHandler(_u);
        var result = null;
        var sysCatche = this.checkCatch(_u);
        if(sysCatche !== null){
            return sysCatche;
        }

        //设置window的define函数实现
        window.define = (function(){
            result = self.define.apply(window,arguments);
            self.catche[_u] = result;
        });

        //无论js还是其它文件，只要同步加载都是使用xhr请求,并且不能多个同时请求
        this.getNonSync(_u,function(_r){
            if(self.regStrList.isJavascript.test(_u)){
                eval(_r);
            }else{
                result = _r;
            }
            //如果是.css文件,并且开启了css自动处理 就对css进行相应的处理
            if(self.regStrList.isStyleFile.test(_u) === true && self.config.isAutoHandleCss){
                self.autoHandleCssFiles(_u,result);
            }
        },function(_e){
            result = _e;
        });
        window.define = self.define;
        return result;
    }

    //用于程序内部的require
    this.circleRequire = function(_u,_callBack,_syncGuid){
        //如果_u参数为string便视为请求单个资源文件
        if(typeof _u === 'string'){
            return this.makeRequire(_u,_callBack,_syncGuid);
        }
        //如果为对象就视为要同时请求多个文件
        if(typeof _u === 'object'){
            return this.makeMuliRequire(_u,_callBack,_syncGuid);
        }
    };

    //请求多个文件
    this.makeMuliRequire = function(_urlArr,_callBack,_syncGuid){
        var resultJson = {};
        var requireCount = 0;
        var requireobjs = [];
        var statusObj = {
            "isRequireobj":true,
            "request":requireobjs,
            "status":0
        }
        if(typeof _syncGuid != 'undefined'){
            statusObj['syncGuid'] = _syncGuid;
        }
        //每请求成功一个资源文件就在这里进行登记，登记完成以后检查还剩多少请求,没有剩余请求的时候触发请求完成
        var checkList = function(){
            requireCount ++;
            if(requireCount === _urlArr.length){
                var applyList = [];
                for(var i=0;i<_urlArr.length;i++){
                    applyList.push(resultJson[_urlArr[i]]);
                }
                //向回调函数传递多个参数
                _callBack.apply(self,applyList);
                statusObj.status = 1;
                return false;
            }
            return true;
        };

        //如果关闭了javascriptXHR选项,并且浏览器不支持document.currentScript就只能串行加载模块了
        if(self.config.javascriptXHR === false && typeof document.currentScript === 'undefined'){
            //串行加载这些模块
            var makeSerialLoad = function(_index){
                var ro = self.makeRequire(_urlArr[_index],function(_content){
                    resultJson[_urlArr[_index]] = _content;
                    var isKeepGoing = checkList(_content);
                    if(isKeepGoing){
                        makeSerialLoad(_index+1);
                    }
                });
                requireobjs.push(ro);
            }
            makeSerialLoad(0);
        }else{
            //并行加载
            for(var i=0;i<_urlArr.length;i++){
                var item  = _urlArr[i];
                (function(_item){
                    var ro = self.makeRequire(item,function(_content){
                        resultJson[_item] = _content;
                        checkList();
                    });
                    requireobjs.push(ro);
                })(item);
            }
        }

        return statusObj;
    };
    //检查缓存，
    //判断是否存在已经存在的请求，如果存在就不重新请求了，直接在缓存里获取
    this.checkCatch = function(_url){
        if(typeof this.catche[_url] !== 'undefined'){
            return this.catche[_url];
        }else{
            return null;
        }
    }
    //对baseurl进行处理
    this.urlHandler = function(_url){
        //如果url前面包含点，表示为相对路径
        if(this.regStrList.urlDot.test(_url)){
            return this.trim(_url);

        }else if(this.regStrList.isAbsUrl.test(_url)){
            //判断是否为绝对路径
            return this.trim(_url);

        }else{//否则要么请求命名模块，要么需要使用baseurl对路径进行绑定
            if(_url.indexOf('.') === -1){
                return _url;
            }else{
                return this.trim(this.config.baseUrl) + this.trim(_url);
            }
        }
    };


    //单个请求资源
    this.makeRequire = function(_url,_callBack,_syncGuid){
        //先对url进行处理,判断url是否为相对路径，
        //还是需要预处理baseUrl的绝对路径
        _url = this.urlHandler(_url);

        //第一步检查缓存，检查缓存中是否有已经存在的请求
        //存在的话就直接返回已经存在的请求
        var object = this.checkCatch(_url);
        if(object !== null){
            if(typeof object._a_isDepsModul !== 'undefined' && object._a_isDepsModul === true){
                self.circleRequire(object.deps,function(){
                    var result = object.callBack.apply(self,arguments)
                    _callBack(result);
                });
            }else{
                _callBack(object);
            }
            return;
        }

        //如果请求的是js文件，并且请求的设置中设置了XHR请求，就使用XHR请求文件
        if(self.config.javascriptXHR === true && self.regStrList.isJavascript.test(_url)){
            //使用xhr的形式请求js文件
            //并返回请求对象
            return this.makeXHRrequire(_url,_callBack,_syncGuid);
            //如果请求的不是js文件，并且没有使用XHR的方式请求
        }else if(self.config.javascriptXHR === false && self.regStrList.isJavascript.test(_url)){
            //创建javascript的请求
            return this.makeJavascriptRequire(_url,_callBack,_syncGuid);
        }else{
            //使用xhr的形式请求文件
            //并返回请求对象
            return this.makeXHRrequire(_url,_callBack,_syncGuid);
        }
    }

    //创建javascript的请求
    this.makeJavascriptRequire = function(_url,_callBack,_syncGuid){
        var taskGuid = this.getGuid();
        //如果存在document.currentScript对象，说明浏览器支持并行请求
        //使浏览器并行请求脚本
        if(typeof document.currentScript !== 'undefined'){
            window.define = self.define;
            try{
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = 'async';
                script.src = _url + "?_=" + self.version;
                script.setAttribute('data-task',taskGuid);

                self.parallelRequireList[taskGuid] = {
                    callBack:function(_result){
                        var result = _result;
                        //将请求到得数据保存进缓存
                        self.catche[_url] = result;
                        //如果返回的对象指示有依赖组件，就先去请求依赖组件再返回
                        if(typeof result._a_isDepsModul !== 'undefined' && result._a_isDepsModul === true){
                            self.circleRequire(result.deps,function(){
                                result = result.callBack.apply(self,arguments);
                                _callBack(result);
                            });
                        }else{
                            _callBack(result);
                        }
                    }
                };

                if(zZ.fn.Borwser().indexOf('ie') !== -1){
                    try{
                        window.document.appendChild(script);
                    }catch(_e){
                        $('<head>').E().appendChild(script);
                    }
                }else{
                    $('<head>').E().appendChild(script);
                }
                script.onerror = function(){
                    if( !this.readyState || ( (this.readyState==='loaded' || this.readyState==='complete')) ){
                        var eStr = '请求js文件错误，请观察浏览器网络请求一栏!';
                        self.makeError(_url,eStr,_callBack);
                    }
                };
            }catch(_e){
                var eStr = '请求js文件错误，请观察浏览器网络请求一栏!';
                self.makeError(_url,eStr,_callBack);
            }
            //requireIframe.src='about:blank';
            return {isRequireobj:true,javascriptObj:script};

        }else{//如果不存在document.currentScript对象，就说明浏览器可能很老需要进行串行请求
            //设置window的define函数实现
            window.define = (function(){
                var result = self.define.apply(window,arguments);
                //将请求到得数据保存进缓存
                self.catche[_url] = result;
                //如果返回的对象指示有依赖组件，就先去请求依赖组件再返回
                if(typeof result._a_isDepsModul !== 'undefined' && result._a_isDepsModul === true){
                    self.circleRequire(result.deps,function(){
                        result = result.callBack.apply(self,arguments);
                        _callBack(result);
                    });
                }else{
                    _callBack(result);
                }

                try{
                    delete window.define;
                }catch(_e){}
            });
            try{
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.async = 'async';
                script.src = _url + "?_=" + self.version;
                if(zZ.fn.Borwser().indexOf('ie') !== -1){
                    try{
                        window.document.appendChild(script);
                    }catch(_e){
                        $('<head>').E().appendChild(script);
                    }
                }else{
                    $('<head>').E().appendChild(script);
                }
                script.onerror = function(){
                    if( !this.readyState || ( (this.readyState==='loaded' || this.readyState==='complete')) ){
                        var eStr = '请求js文件错误，请观察浏览器网络请求一栏!';
                        self.makeError(_url,eStr,_callBack);
                    }
                };
            }catch(_e){
                var eStr = '请求js文件错误，请观察浏览器网络请求一栏!';
                self.makeError(_url,eStr,_callBack);
            }

            //requireIframe.src='about:blank';
            return {isRequireobj:true,javascriptObj:script};
        }
    }


    //请求xhr文件
    this.makeXHRrequire = function(_url,_callBack,_syncGuid){
        window.define = self.define;
        //如果请求不存在缓存中就直接请求文件
        var rObj = this.get(_url,function(_content){
            var result = "undefined";
            var b = (+ new Date)
            //如果是js文件就需要进行模块导出,
            //否则其它文件一律当作文本输出
            if(self.regStrList.isJavascript.test(_url)){
                result = eval(_content);
                //进行到这一步说明这个组件里面还有别的组件需要预先加载
                //所以需要进行等待
                //等待时通过syncRequireList保存一份在编译时生成好的guid
                //当模块中的define响应的时候会找到syncRequireList中对应的
                //guid函数,并通知模块加载完成.
                if(typeof result !=='undefined' && typeof result.isRequireobj !=='undefined' && result.isRequireobj === true){
                    self.syncRequireList[result.syncGuid] = function(_result){
                        self.catche[_url] = _result;
                        _callBack(_result);
                    }
                    return;
                }
            }else{
                result = _content;
            }


            //将请求到得数据保存进缓存
            self.catche[_url] = result;

            //如果是.css文件,并且开启了css自动处理 就对css进行相应的处理
            var isHaveUsinginCssFile = false;
            if(self.regStrList.isStyleFile.test(_url) === true && self.config.isAutoHandleCss){
                var isHaveUsinginCssFile = self.autoHandleCssFiles(_url,result,_callBack);
            }

            //如果返回的对象指示有依赖组件，就先去请求依赖组件再返回
            if(typeof result._a_isDepsModul !== 'undefined' && result._a_isDepsModul === true){
                self.circleRequire(result.deps,function(){
                    result = result.callBack.apply(self,arguments);
                    _callBack(result);
                });
            }else{
                //如果此文件为css,然后在它之中没有任何其它的css引用，就直接调用回调函数
                if(isHaveUsinginCssFile === false){
                    _callBack(result);
                }
            }
        },function(){
            //请求出错
            //创建错误信息
            self.makeError(_url,_url+"\n:请求失败！请检查浏览器的控制台网络选项卡！",_callBack);
        });
        rObj['isRequireobj'] = true;
        if(typeof _syncGuid != 'undefined'){
            rObj['syncGuid'] = _syncGuid;
        }
        return rObj;
    }

    //自动处理css
    this.autoHandleCssFiles = function(_url,_result,_callBack){
        //处理css中的@using('./XXXX/XXXX/XXXX')
        if(_result.match(self.regStrList.usingInCssFile) !== null){
            self.autoHandleUsingInCssFiles(_url,_result,_callBack);
            return true;
        }else{
            self.handleCssWhrite(_url,_result);
            return false;
        }

    }

    //处理css自动写入
    this.handleCssWhrite = function(_url,_result){
        //如果缓存表中不存在本次载入，就自动向页面写入css
        if(typeof this.loadedCssList[_url] === 'undefined'){
            this.cssCatche.push({url:_url,content:_result});
            this.loadedCssList[_url] = _result;

            //先循环拿出css文本，并把它们拼在一起
            var cssResult = '';
            for(var i =0;i<this.cssCatche.length;i++){
                cssResult += '/*from css : '+ this.cssCatche[i].url +'*/\n'+this.cssCatche[i].content+'\n\n';
            }

            //创建一个新的css标签
            styleNode = document.createElement('style');
            styleNode.type = 'text/css';
            if(styleNode.styleSheet){
                styleNode.styleSheet.cssText = cssResult;
            }else{
                styleNode.appendChild(document.createTextNode(cssResult));
            }

            //找到页面上现有的css标签并移除
            var styleNodeLast = zZ('<head>').find(':data-name-stylePool=total').E();
            if(styleNodeLast !== null){
                $(styleNodeLast).remove();
            }

            //将新的css标签插入到页面头部
            $(styleNode).attr('data-name-stylePool','total');
            zZ('<head>').E().appendChild(styleNode);
        }
    }

    //自动处理css中的@using引用
    this.autoHandleUsingInCssFiles = function(_url,_result,_callback){
        //匹配出文件中所有的using语句
        var usingList = _result.match(self.regStrList.usingInCssFile);
        var usingFileList = [];
        for(var i=0;i<usingList.length;i++){
            usingFileList.push(usingList[i].replace(/\@[ ]{0,}using[ ]{0,}\((\'|\")/,'').replace(/(\'|\")\)/,''));
        }
        //请求那些依赖文件
        this.circleRequire(usingFileList,function(){
            //在代码中去除引用语句
            var result = _result.replace(self.regStrList.usingInCssFile,'');
            //处理css自动写入
            self.handleCssWhrite(_url,result);
            _callback(result);
        });
    }

    //创建错误信息
    this.makeError = function(_url,_str,_callBack){
        throw _url +"::"+_str;
        _callBack({
            isError:true,
            error:_str,
            url:_url
        });
    }

    //通过guid删除syncRequireList中的函数
    this.deleteFuncFromSyncRequireList = function(_id){
        delete this.syncRequireList[_id];
    }

    //定义对象
    //依赖列表
    //具体定义的函数
    this.define = function(){

        var resultObj = null;
        var _deps,//依赖
            _modulFunc,//模块本身
            _modulName;//名称

        //说明是带有依赖的命名模块
        if(arguments.length === 3){
            _deps = arguments[1];
            _modulFunc = arguments[2];
            _modulName = arguments[0];

            //如果依赖数量为0，就视为根本没有依赖
            if(_deps.length === 0){
                _deps = undefined;
            }
        }

        //可能是带有命名的模块
        //或者是带有依赖的模块
        if(arguments.length === 2){
            //如果第一个参数是string类型，说明是命名模块
            if(typeof arguments[0] === 'string'){
                _modulName = arguments[0];//第零位是名称
                _modulFunc = arguments[1];//第一位是模块本身
            }else{
                //否则就是依赖模块
                _deps = arguments[0];//第零位是依赖
                _modulFunc = arguments[1];//第一位是模块本身

                //如果依赖数量为0，就视为根本没有依赖
                if(_deps.length === 0){
                    _deps = undefined;
                }
            }
        }else if(arguments.length === 1){
            _modulFunc = arguments[0];//第零位是模块本身
        }
        

        //如果第二个参数没有任何东西，
        //说明此模块没有其它依赖，
        //可以直接运行并返回定义的对象
        if(typeof _deps === 'undefined'){
            var resultObj =  _modulFunc.call(self);
        }else{
            //返回给缓存器的时候要告诉缓存器这个模块是一个有依赖项的模块
            //缓存器判断到这个缓存_a_isDepsModul:true时请求deps触发callBack
            var resultObj = {
                _a_isDepsModul:true,
                deps:_deps,
                callBack:_modulFunc,
                name: _modulName || ''
            };
        }

        //如果是命名模块，就直接缓存了
        if(typeof _modulName !== 'undefined'){
            self.catche[_modulName] = resultObj;
        }

        
        //如果浏览器支持document.currentScript
        //并且当前js请求模式为script节点加载模式
        if(typeof document.currentScript !== "undefined" && self.config.javascriptXHR === false){
            if(document.currentScript !== null){
                try{
                    //从任务队列中拿出回调函数进行回调
                    self.parallelRequireList[document.currentScript.getAttribute('data-task')].callBack(resultObj);
                    delete self.parallelRequireList[document.currentScript.getAttribute('data-task')];
                    return;
                }catch(_e){
                    
                }
            }
        }

        return resultObj;
    }

    //设置系统兼容AMD语法
    this.define.__proto__.amd=true;

    //获得一个guid
    this.getGuid = function(){
        return 'Func_xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    //去除前后空格
    this.trim = function(_str){
        return _str.replace(this.regStrList.trim,'');
    }


    //ajax发送方法
    this.post = function (url, successCall, failedCall) {
        if (!successCall) { successCall = function () { }; }
        if (!failedCall) { failedCall = function () { }; }
        var ajaxobj = this.ajax(url + "?_=" + this.version,
            { requestType: 'POST',
                asynch: true,
                sendData: {},
                type: "text",
                success: function (data) {
                    successCall(data);
                },
                failed: function (request, status) {
                    failedCall(request, status);
                }
            });
        return ajaxobj;
    }

    //ajax获取数据方法
    this.get = function (url, successCall, failedCall) {
        if (!successCall) { successCall = function () { }; }
        if (!failedCall) { failedCall = function () { }; }
        var ajaxobj = this.ajax(url + "?_=" + this.version,
            { requestType: 'GET',
                asynch: true,
                sendData: {},
                type: "text",
                success: function (data) {
                    successCall(data);
                },
                failed: function (request, status) {
                    failedCall(request, status);
                }
            });
        return ajaxobj;
    }

    //ajax获取数据方法 同步加载
    this.getNonSync = function (url, successCall, failedCall) {
        if (!successCall) { successCall = function () { }; }
        if (!failedCall) { failedCall = function () { }; }
        var ajaxobj = this.ajax(url + "?_=" + this.version,
            { requestType: 'GET',
                asynch: false,
                sendData: {},
                type: "text",
                success: function (data) {
                    successCall(data);
                },
                failed: function (request, status) {
                    failedCall(request, status);
                }
            });
        return ajaxobj;
    }


    //AJAX方法 传入url，options：{requestType:GET/POST,asynch:true/false,sendData:xxxxxx,type:"text/json",success:function,failed:function}
    //廖力编写与2013年
    this.ajax = function (url, options) {
        var statusObj = {request:null,status:0};
        //定义Ajax通讯容器
        var request = false;

        var setUpAjax = function () {
            try {//应对普通浏览器
                request = new XMLHttpRequest();
            } catch (trymicrosoft) {
                try {//应对微软的XMLHTTPREQUEST4.0 : 2013-08-22
                    request = new ActiveXObject("Msxml2.XMLHTTP.4.0");
                } catch (othermicrosoft) {
                    try {//应对微软的XMLHTTPREQUEST
                        request = new ActiveXObject("Msxml2.XMLHTTP");
                    } catch (othermicrosoft) {
                        try {//应对更老的微软XMLHTTPREQUEST
                            request = new ActiveXObject("Microsoft.XMLHTTP");
                        } catch (failed) {//还没有就直接提示用户您浏览器实在太老了，丢不起这脸
                            request = false;
                        }
                    }
                }
            }
            if (!request) {
                var errStr = "Error! Your borwser version is too old, please upgrade your borwser!\n您的浏览器可能版本过低，请升级系统后再继续使用本网页！";
                self.makeError(url,errStr,function(){
                    alert(errStr);
                });
            }
        }

        //回调函数
        //在里面判断请求状态来触发回调函数
        //2013-08-22
        var callBackFunc = function () {
            //成功接受到响应
            if (request.readyState == 4) {
                if (request.status == 200) {
                    //成功之后执行成功的回调函数
                    options.success(request.responseText);
                    statusObj.status = 1;
                }
                else {
                    //失败的回调函数
                    options.failed(request, request.status);
                    statusObj.status = -1;
                }
            }
        }

        //初始化AJAX
        setUpAjax();

        //接收配置
        var options = options || { requestType: 'GET', asynch: true, sendData: null, type: "Text", success: function () { }, failed: function () { } }

        //如果用户注明传送类型为json,那么就将其json格式的传送值转换为string格式
        //2013-09-25
        if (options.type == "json") {
            //如果JSON对象都不存在那完蛋
            if(typeof JSON !== 'undefined'){
                options.sendData = JSON.stringify(options.sendData);
            }else{
                var errStr = 'Error! window.JSON Object undefined,may you are using very old borwser!program has been stoped!\n错误！window.JSON 对象未定义，您可能在使用非常古老的浏览器！程序已经停止运行！ \n';
                self.makeError(url,errStr,function(){
                    alert(errStr);
                });
                return;
            }
        }

        //打开链接
        request.open(options.requestType, encodeURI(url), options.asynch);

        //设置回调函数
        request.onreadystatechange = callBackFunc;

        //则需要设置http头以正确使用send方法,否则请求将会出现一些屎尿未及的错误
        //以form表单方式提交
        //2013-08-22
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        //发送数据
        request.send(options.sendData);

        return statusObj;
    }

    
}
//将组件向外部暴露
window.arrowExpressjs = new window._arrowExpress(window.arrowConfig);
//var require = window.require = function(_u,_callBack,_syncGuid){ return window.arrowExpressjs.require(_u,_callBack,_syncGuid); };
var define = window.define = function(){ return window.arrowExpressjs.define.apply(window,arguments)};
var using = window.using = function(_u,_callBack,_syncGuid){ return window.arrowExpressjs.require(_u,_callBack,_syncGuid); };
var getUI = window.getUI = function(_html,_css,_callBack){
    using([_html,_css],function(_html,_css){
        _callBack(_html,_css);
    })
}
//设置系统兼容AMD语法
window.define.__proto__.amd=true;

/*
*兼容babel编译出来的 Object.defineProperty
*所有低于ie8的ie浏览器都需要这个兼容
*简单有效！咩蛤蛤蛤蛤蛤蛤蛤
*/
window.__fixDefineProperty = function(){
    Object.defineProperty = function(target, key, descriptor){ target[key] = descriptor.value; }
}
/*
*框架兼容性设置部分
*主要修复ie8及以下浏览器的一些问题
*/
if(zZ.fn.Borwser() === "msie 8.0"
    || zZ.fn.Borwser() === "msie 7.0"
    || zZ.fn.Borwser() === "msie 9.0"
    || zZ.fn.Borwser() === "msie 10.0"
    || zZ.fn.Borwser() === "msie 6.0"
    || zZ.fn.Borwser() === "msie 5.0"){
    __fixDefineProperty();
    /*
    *修复JSON对象
    */
    zZ(document).ready(function(){
        if(typeof JSON === 'undefined'){
          using('./json2.js');
        }
    });
}



