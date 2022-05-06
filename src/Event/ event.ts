class MyEvent{
  eventQueueObj:object
  constructor(){
    // this.eventQueueMap  = new Map()
    this.eventQueueObj = {}
  }
  //订阅事件
  on( methodType:string , method:Function){
    (this.eventQueueObj[methodType] || (this.eventQueueObj[methodType]=[])).push(method)
    // this.pushEventQueue(methodType , method)
  }
  //移除订阅的事件
  off( type:string,funcHander:Function = null){
    if( !type ) {
      this.eventQueueObj = {}
    }else if (type && !funcHander) {
      delete this.eventQueueObj[type]
    }else{ 
      this.eventQueueObj[type].forEach((func,index) => {
        if (func === funcHander) {
          this.eventQueueObj[type].splice(index,1)
          this.eventQueueObj[type].lenth === 0 && delete this.eventQueueObj[type]
        }
      });
    }
  }
  //发布事件
  emit(type , ...args){
    if (!type) return
    const [ ctx , ...other] = args
    this.eventQueueObj[type].forEach((func)=>{
      func.call(ctx , ...other)
    })
  }
  static createEvent(){
    return new MyEvent()
  }
}


