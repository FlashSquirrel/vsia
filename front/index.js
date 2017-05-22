/**
 *
 * 前端vux处理类
 * auth: liyangli
 * date: 17/5/19 下午1:43 .
 */

(function(layer){
    "use strict";


    var FileList = {
        template: '<div style="height:100%;">' +
        '<div class="panel panel-primary" style="height:100%;margin-bottom: 0px;">' +
        '<div class="panel-heading">' +
        '<div class="caption">程序集中管理</div>' +
        '<div class="tools">' +
        '<a class="glyphicon glyphicon-plus" v-on:click="add()"></a>' +
        '<a class="glyphicon glyphicon-minus" v-on:click="del()"></a>' +
        '</div>' +
        '</div>' +
        '<div class="panel-body index-panel" id="content">' +
        '<table class="table table-bordered table-striped table-responsive">' +
        '<tr >' +
        '<th width="30px"><input type="checkbox" v-model="allBoxFlag" v-on:click="checkAll()"></th>' +
        '<th width="100px">名称</th>' +
        '<th width="200px">创建时间</th>' +
        '<th width="100px">状态</th>' +
        '<th width="100px">CPU</th>' +
        '<th width="100px">内存</th>' +
        '<th>文件名称</th>' +
        '<th width="100px">文件大小</th>' +
        '<th width="100px">操作</th>' +
        '</tr></table><div class="div-con"><table class="table" >' +
        '<tr v-for="sys in list">' +
        '<td width="30px"><input type="checkbox" v-model="sys.flag"></td>' +
        '<td width="100px">{{sys.name}}</td>' +
        '<td width="200px">{{sys.time}}</td>' +
        '<td width="100px">{{sys.status}}</td>' +
        '<td width="100px">{{sys.cpu}}</td>' +
        '<td width="100px">{{sys.mem}}</td>' +
        '<td>{{sys.fileName}}</td>' +
        '<td width="100px">{{sys.fileSize}}</td>' +
        '<td width="100px" class="opear-con"><a class="glyphicon glyphicon-edit"></a><a class="glyphicon glyphicon-minus" v-on:click="del(sys.name)"></a></td>' +
        '</tr>' +
        '</table></div>' +
        '</div> ' +
        '<div class="panel-footer text-center">BH-V0.0.1</div>' +
        '</div> ' +
        '</div>',
        data: function(){
            return {
                list: [],
                allBoxFlag: false,
                agent: new Agent()
            }
        },
        created: function(){
            //一开始加载就需要从后台后去所有的数据
            var self = this;
            setInterval(function(){
                this.agent.findList(self);
            },1000);
            
        },
        methods: {
           add: function(){
               var self = this;
               //弹出对应也添加页面。需要进行选择具体的文件
               layer.open({
                   type: 1,
                   shade: false,
                   title: "新增",
                   content: $('#sysAdd'), //捕获的元素
                   cancel: function (index) {
                       layer.close(index);
                   },
                   area: ["80%", "80%"],
                   btn: ["确定", "取消"],
                   yes: function (index, layero) {
                       //表明对应点击的确定按钮 
                       self.doSave({name: $("#name").val(),filePath: $("#filePath").val()});
                       $('#sysAdd').hide();
                       layer.close(index);
                       //layero.close();
                   }
               });
               
               
               
           },
           doSave: function(obj){
             //对应进行保存操作,直接交给对应代理工具进行处理
               var self = this;
             this.agent.doSave(obj,self);
               
           },
            /**
             * 删除主要分为3部分
             * 步骤:
             * 1、删除页面上展示即缓存中数据
             * 2、根据缓存数据进行同步数据文件;
             * 3、pm2管理中进行移除掉
             * @param name
             */
           del: function(name){
                if(!name){
                    var list = this.list;
                    for(var i in list){
                        var obj = list[i];
                        if(obj.flag){
                            //表明进行删除的数据;
                            //TODO 此处暂时只支持一个选择进行删除动作
                            name = obj.name;
                        }
                    }
                }

                if(!name){
                    alert("尚未选择对一个项目,请选择一个或者多个项目进行删除");
                    return;
                }
                if(window.confirm("确定要移除该程序?")){
                    //表明开始开启删除动作
                    for(var i in this.list){
                        var sysObj = this.list[i];
                        if(sysObj.name == name){
                            this.list.splice(i, 1);
                            break;
                        }
                    }
                    //删除缓存中对应数据。以及同步数据库文件
                    this.agent.delCache(name);
                    

                }

           },
            checkAll: function(){
                var allBoxFlag = this.allBoxFlag;
                for(var i in this.list){
                    var sys = this.list[i];
                    sys.flag = allBoxFlag;
                }
            }
        }
    };

    var app = new Vue({
        el: '#app',
        data: {

        },
        components: {
            'file-list': FileList
        }
    });
    
})(layer);
