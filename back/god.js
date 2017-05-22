/**
 *
 * 后台上帝类。主要进行所有后台核心逻辑处理对象接口;
 * 主要提供的接口为:
 * 1、获取所有的设置的项目信息;
 * 2、项目指标获取
 * 3、项目启动操作
 * 4、项目停止操作;
 * 5、添加项目操作;
 * 6、删除项目操作;
 *
 * auth: liyangli
 * date: 17/5/19 上午9:22 .
 */
"use strict";
const pm2 = require("pm2");
const fs = require("fs");
const moment = require('moment');

class God{
    constructor(ev){
        this.filePath = "./config.json";
        this.ev = ev;
        this.attrs = {
            START: "start",
            STOP: "stop",
            DELETE: "delete",
            RESTART: "restart",
            DISCONNECT: "disconnect",
            LIST: "list",
            DESCRIBE: "describe"
        };
        this._init();
        this._pm2EventBind();
        this.sysCache = [];
        this._eventBind();
    }


    /**
     * 初始化对象是对应属性处理;
     * @private
     */
    _init(){
        //异步方式进行读取配置文件
        const self = this;
        fs.readFile(this.filePath,'UTF-8',function(err,data){
            //查出数据直接放到对象中作为缓存记录起来;方便下次直接操作
            if(data){
                self.sysCache = JSON.parse(data);
            }
        });
    }

    /**
     * 事件绑定
     * @private
     */
    _eventBind(){
        const self = this;
        /**
         * 自动同步缓存到磁盘上
         */
        this.ev.on('autoSaveDisk',()=>{
            const self = this;
            fs.writeFile(this.filePath,JSON.stringify(self.sysCache),function(err){
                //写入成功;
                self.ev.emit("autoSaveDiskFinish",err);
            });
        });
    }
    /**
     * pm2相关事件绑定
     * @private
     */
    _pm2EventBind(){
       const self = this;
       pm2.connect(function(err){
           if(err){
               console.error(err);
               process.exit(2);
           }
           console.info(self.attrs);
           for(let i in self.attrs){
               let attr = self.attrs[i];
               self.ev.on(attr,function(process){
                   console.log("process->"+process);
                   const callback = function(err,result){

                       self.ev.emit(attr+"Finish",err,result);
                   };

                   if(attr != "list"){
                       pm2[attr](process,callback);
                   }else{
                       pm2[attr](callback);
                   }

               });
           }


       });
    }

    /**
     * 获取所有的设置的项目信息;
     * 主要处理步骤:
     * 1、获取对应缓存数据。
     * 2、根据缓存数据进行获取对应pm2管理实际相关数据的大小;
     */
    findList(){
        const self = this;

        this.ev.emit(this.attrs.LIST);
        this.ev.on(this.attrs.LIST+"Finish",(err,result)=>{
           //表明成功了。需要进行组合一下。通过result作为基础然后进行遍历设定
            this.ev.removeAllListeners(this.attrs.LIST+"Finish");
            const runObjs = [];
            if(!err && result.length> 0){
                for(let i in result){
                    let runObj = result[i];
                    const obj = {
                        name: runObj.name,
                        time: "",
                        status: runObj.pm2_env.status,
                        cpu: runObj.monit.cpu,
                        mem: runObj.monit.memory,
                        fileName: '',
                        fileSize: ''
                    };
                    //含有状态内存、cpu进程名称。需要根据名称进行匹配缓存中相关数据
                    for(let sysObj of this.sysCache){
                        if(runObj.name == sysObj.name){
                            obj.time = sysObj.time;
                            obj.fileName = sysObj.filePath;
                            obj.fileSize = sysObj.fileSize;
                            break;
                        }
                    }

                    runObjs.push(obj);
                }
            }

            self.ev.emit("findListFinish",err,runObjs);
        });

    }

    /**
     * 开启对应新的任务;
     * @param obj 具体开启的任务对象格式为{name: '',filePath: ''}
     */
    doSave(obj){

        this.ev.emit(this.attrs.START,{
            name: obj.name,
            script: obj.filePath,
            output: obj.name+"-out.log",
            logDateFormat: 'YYYY-MM-DD HH:mm:ss'
        });
        this.ev.on(this.attrs.START+"Finish",(err,result)=>{
            this.ev.removeAllListeners(this.attrs.START+"Finish")
            this.ev.emit("doSaveFinish",err,result);
        });
        //获取对应文件大小。设定创建时间
        obj.time = moment().format('YYYY-MM-DD HH:mm:ss');
        //读取文件获取对一个文件大小
        var states = fs.statSync(obj.filePath);
        obj.fileSize = states.size;

        //需要把这个数据存放到磁盘空间上
        this.sysCache.push(obj);
        //需要通知对应进行同步实例化到磁盘上;
        this.ev.emit("autoSaveDisk");

    }

    /**
     * 删除对应缓存数据
     * @param name
     */
    delCache(name){
        for(var i in this.sysCache){
            var sysObj = this.sysCache[i];
            if(sysObj.name == name){
                this.sysCache.slice(i,0);
                break;
            }
        }
        //需要通知进行同步数据
        this.ev.emit("autoSaveDisk");
        //需要进行通知对应pm2进行移除掉
        this.ev.emit(this.attrs.DELETE,name);
        this.ev.on(this.attrs.DELETE+"Finish",(err,result)=>{
            this.ev.removeAllListeners(this.attrs.DELETE+"Finish")
            this.ev.emit("delCache",err,result);
        });

    }



    /**
     * 获取指定进程的的实时指标数据
     * @param names 项目进程名称
     */
    findMonitor(){
        const self = this;
        self.ev.emit(self.attrs.LIST);
        self.ev.on(self.attrs.LIST+"Finish",(err,result)=>{
            self.ev.removeAllListeners(self.attrs.LIST+"Finish");
           if(err){
               console.error(err);
               return;
           } 
           if(!result){
               return;
           } 
           //对应数据;进行处理; 
        });
    }
    
}


module.exports = God;