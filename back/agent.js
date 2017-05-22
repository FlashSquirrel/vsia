/**
 *
 * 代理类。主要为了方便进行对应切换到不同方式进行展示处理
 * auth: liyangli
 * date: 17/5/19 下午5:12 .
 */
"use strict";

const EventEmmit = require('events');
const God = require('./back/god.js');
var Agent = function(){
    //对应执行的方式;


    this.ev = new EventEmmit();
    this.god = new  God(this.ev);
    /*try {

    } catch (e) {
        //表明不存在。进行通过异步方式进行获取相关数据;主要可以针对http方式继续处理;
        throw e;
    }*/

};
Agent.prototype = {
    /**
     * 查询所有的设定好的数据
     * @param vm vue对应组件对象
     */
    findList: function(vm){
        this.god.findList();
        const self = this;
        this.ev.on("findListFinish",function(err,result){
            self.ev.removeAllListeners("findListFinish");
            if(err){
                console.error(err);
                return;
            }
            //需要把组装的数据进行返回出去
            if(!result){
                console.info("数据不存在");
            }
            //需要进行遍历其中的数据。进行动态设定上去。主要是防止设定选中状态而被取消掉了。。
            var list = vm.list;
            for(var i in result){
                var newObj = result[i];
                for(var k in list){
                    var oldObj = list[k];
                    if(oldObj.name == newObj.name){
                        newObj.flag = oldObj.flag;
                        break;
                    }
                }
            }
            vm.list = result;
        });
    },
    /**
     * 添加或者修改对应数据
     * @param vm
     */
    addOrModify: function(vm){
        
    },
    /**
     * 开启对应保存动作。
     * 操作步骤为:
     * 1、进行对应文件操作
     * 2、直接调用god类进行操作
     * 
     * 返回promise对象
     * @param obj
     */
    doSave: function(obj,vm){
        this.god.doSave(obj);
        var self = this;
        this.ev.on("doSaveFinish",function(err,result){
            self.ev.removeAllListeners("doSaveFinish");
            if(!err){
                //表明能够正常保存了。需要进行同步进行处理了
                self.findList(vm);
                alert("保存成功!");
            }else{
                throw err;
            }
        });
    },
    /**
     * 删除对应缓存数据
     * @param name
     */
    delCache: function(name){
        const self =this;
        this.god.delCache(name);
        this.ev.on("delCacheFinish",(err,result)=>{
            self.ev.removeAllListeners("delCacheFinish");
           if(err){
               alert(err);
               return;
           }else{
               alert("删除成功");
           }

    })
    }
};


var agent = new Agent();
var vm = {};
agent.findList(vm);
