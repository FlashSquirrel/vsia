/**
 * auth:zhangting
 * Created by 2017 on 2017/4/17.
 */

var cmd = require('node-cmd');
var Promise = require("promise");
var fs = require("fs");
var $ = require("jquery");
(function(){
    'use strict';
    //真实动作
    /**
     * 主要包含的动作为：
     * 1、获取指定文件中对应数据；
     * 2、动态绑定事件
     * 3、动态加载数据。定时进行请求；
     */
    /**
     * 项目对象
     * 主要包含对应数据获取和对应数据展示操作；
     *
     * @constructor
     */
    var Project = function(){
        this.filePath = "project";
        this.commands= {
            list: "pm2 list",
            start: "pm2 start",
            stop: "pm2 stop",
            startAll: "pm2 start all",
            stopAll: "pm2 stop all",
            delete: "pm2 delete"
        };
        this.list = [];
        this._init();
    };
    Project.prototype = {
        _init: function(){
             var self = this;
            //给添加按钮绑定事件
             document.getElementById('addOne').onclick = function () {
                 //弹出页面填写新增服务的信息，同时在文件中添加对应的内容
                 self.addServer().then(function () {
                     self.deteleDoms().then(function () {
                         self.listTask();
                     })
                 })
             }
        },
        addServer:function () {
            var self = this;
            var file = document.getElementsByName('file');
            var filePath = file[0].value;
            var fileName = filePath.replace(/^.+?\\([^\\]+?)(\.[^\.\\]*?)?$/gi,"$1");
            var fileStr = ';'+fileName+',1,'+filePath;
            console.info(fileStr);
            return new Promise(function(fulfill, reject){
                fs.appendFile(self.filePath, fileStr, function (err) {
                    if (err) throw err;
                    alert("添加成功");
                    fulfill();
                });
            });
        },
        findChecked:function () {
            var names = [];
            var testOne = document.getElementsByClassName('testOne');
            var tests = document.getElementsByClassName('test');
            if(testOne[0].checked){
                for(var i =0; i<tests.length; i++){
                    tests[i].checked = true;
                    var name = tests[i].name;
                    names.push(name);
                }
            }else{
                for(var i = 0; i<tests.length;i++){
                    if(tests[i].checked){
                        var name = tests[i].name;
                        names.push(name);
                    }
                }
            }
            console.info(names);
            return names;
        },
        deleteServer:function (checks,method,contents) {
            var self = this;
            var req = fs.readFileSync(self.filePath,"UTF-8");
            for(var i = 0;i<checks.length;i++){
                var check = checks[i];
                var indicator = method+' '+check;
                cmd.get(indicator,function(err,str,stderr){
                    self.regExp(str,contents);
                });
                var reg = ';'+check+'.*'+check;
                if(check != 'vsiaServer'){
                    reg += '.js';
                }
                var str = new RegExp(reg).exec(req)[0];
                req = req.replace(str,'');
            }
            return new Promise(function(fulfill, reject){
                fs.writeFile(self.filePath,req, function (err) {
                    if (err) throw err;
                    alert('删除成功');
                    fulfill();
                });

            });
        },
        deteleDoms:function () {
            var ul = document.getElementsByTagName('ul');
            return new Promise(function(fulfill, reject){
                for(var i = 1;i<ul.length;i++) {
                    ul[i].innerHTML = "";
                }
                fulfill();
            });
        },
        //处理选中事件
        dealCheck:function(checks,method,contents){
            //对选中的服务进行操作
            var self = this;
            if(method == 'pm2 delete'){
                self.deleteServer(checks,method,contents).then(function () {
                    self.deteleDoms().then(function () {
                        self.listTask();
                    })
                });
            }else{
                for(var i = 0;i<checks.length;i++){
                    var check = checks[i];
                    var indicator = method+' '+check;
                    cmd.get(indicator,function(err,str,stderr){
                        self.regExp(str,contents);
                    });
                }
            }
        },
        //展示读取的文件中的数据
        dealData: function (data) {
            var ul = document.createElement("ul");
            ul.id = data[0];
            if(data[0] == 'userAnalyServer'){
                data[0] = 'index'
            }
            if(data[0] == 'redisServer'){
                data[0] = 'dataserver'
            }
            ul.innerHTML = '<li><input type="checkbox" class="test" name="'+data[0]+'"></li><li>' + data[0] + '</li><li>' + data[2] + '</li> <li class="state">未开启</li>' +
                '<li>---</li><li>---</li><li>'+
                '<button class="serverStart" name="'+data[0]+'">开启</button><button class="serverStop" name="'+data[0]+'">停止</button></li>';

            return new Promise(function(fulfill, reject){
                document.getElementById('vsia').appendChild(ul);
                fulfill(data);
            });
        },
        bindClick:function (contents) {
            var self = this;
            //全部开启按钮绑定事件，没有选择任务是默认开启所有服务
            document.getElementById('startAll').onclick = function () {
                var names = self.findChecked();
                if(names.length == 0){
                    alert('请选择要开启的服务');
                    return;
                }else{
                    self.dealCheck(names,self.commands.start,contents);
                }
            }
            //全部停止按钮绑定事件，没有选择任务是默认停止所有服务
            document.getElementById('stopAll').onclick = function () {
                var names = self.findChecked();
                if(names.length == 0){
                    alert('请选择要关闭的服务');
                    return;
                }else{
                    self.dealCheck(names,self.commands.stop,contents);
                }
            }
            //删除所选按钮绑定事件，没有选择任务是不能进行删除动作
            document.getElementById('deleteAll').onclick = function () {
                var names = self.findChecked();
                if(names.length == 0){
                    alert('请选择要删除的服务');
                    return;
                }else{
                    self.dealCheck(names,self.commands.delete,contents);
                }
            }

            var startBtn = document.getElementsByClassName('serverStart');
            var stopBtn = document.getElementsByClassName('serverStop');
            for(var j =0;j<startBtn.length;j++){
                startBtn[j].onclick = function () {
                    for(var i = 0; i<contents.length;i++){
                        if(this.name == contents[i][0]){
                            var type = contents[i][1];
                            if(type == '1'){
                                var req = fs.readFileSync(self.filePath,"UTF-8");
                                var reg = ';'+contents[i][0]+'.*'+contents[i][0];
                                if(contents[i][0] != 'vsiaServer'){
                                    reg += '.js';
                                }
                                var str = new RegExp(reg).exec(req)[0];
                                var str2 =';'+contents[i][0]+',2,'+contents[i][2];
                                var fileStr = req.replace(str,str2);
                                fs.writeFile(self.filePath, fileStr, function (err) {
                                    if (err) throw err;
                                    console.info('change ok');
                                });
                                var path = contents[i][2];
                                var indicator = self.commands.start+' '+path ;
                            }else{
                                var indicator = self.commands.start+' '+this.name ;
                            }
                        }
                    }
                    console.info(indicator);
                    cmd.get(indicator,function(err,str,stderr){
                        self.regExp(str,contents);
                    });
                }

                stopBtn[j].onclick = function () {
                    var indicate = self.commands.stop+' '+this.name;
                    console.info(indicate);
                    cmd.get(indicate,function(err,str,stderr){
                        self.regExp(str,contents);
                    });
                }
            }
        },
        //读取文件中存储的数据
        listTask: function(){
            console.info('-----------------------------------');
            var self = this;
            //展示所有的设定数据；数据主要来源配置文件，
            var req = fs.readFileSync(this.filePath,"UTF-8");
            console.info(req);
            var datas = req.split(';');
            var contents = [];
            for(var i = 1; i<datas.length;i++){
                var data = datas[i].split(',');
                contents.push(self.dealData(data));
                //contents.push(data);
            }
            new Promise.all(contents).then(function (results) {
                //设定对应每行的事件绑定；
                console.info(results);
                self.bindClick(results);

                //开启定时请求任务；
                self.statusTask(results);
            })

        },
        //展示cmd命令的返回结果
        showResult:function (data,contents) {
            if(data.status == 'stopped'){
                data.status = '未开启'
            }else{
                data.status = '已开启'
            }
            var server = document.getElementById(data.name);
            if(data.name == 'dataserver'){
                data.name = 'redisServer';
                data.Name = 'dataserver';
            }else if(data.name == 'index'){
                data.name = 'userAnalyServer';
                data.Name = 'index';
            }else{
                data.Name = data.name;
            }
            server.innerHTML = '<li><input type="checkbox" class="test" name="'+data.Name+'"></li><li>'+data.Name+'</li><li>'+data.path+'</li><li class="state">'+data.status+'</li>'+
                '<li>'+data.cpu+'</li><li>'+data.memory+'</li><li>'+
                '<button class="serverStart" name="'+data.Name+'">开启</button><button class="serverStop" name="'+data.Name+'">停止</button></li>';
            this.bindClick(contents);
        },
        //解析cmd命令返回的结果
        regExp:function (str,contents) {
            console.info(str);
            var self = this;
            for(var i =0;i<contents.length;i++){
                var regStr = '.*'+contents[i][0]+'.*?disabled';
                var reg = new RegExp(regStr);
                var serverStr = reg.exec(str);
                var subStr = serverStr[0];
                var obj = {};
                obj.name = contents[i][0];
                obj.path = contents[i][2];
                obj.status = new RegExp('\\b[a-z]{6,7}\\b').exec(subStr)[0];
                obj.cpu = new RegExp('[0-9]*%').exec(subStr)[0];
                obj.memory = new RegExp('[0-9\.]*\\s.{0,1}B').exec(subStr)[0];
                self.showResult(obj,contents);
            }
        },
        //定时刷新界面内容
        statusTask: function(contents){
            //定时任务；timeOut 进行执行
            var commd = this.commands.list;
            var self = this;
            cmd.get(commd,function(err,str,stderr){
                //返回数据进行解析处理；
                self.regExp(str,contents);
            });
            setTimeout(function () {
                self.statusTask(contents)
            },10000);

        }
    }

    var project = new Project();
    project.listTask();

})();


