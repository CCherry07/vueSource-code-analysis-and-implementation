/**
  tag:string|undefined; 元素的名称
  value:any;  元素的nodeValue
  VMattrs:Object| undefined; 元素的属性
  type:number; 节点的类型
  children:VNode[] | undefined 子元素
  * 
 */
  const MustacheReg = /\{\{(.+?)\}\}/g;
  let  ARRAY_METHOD = [
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice"
  ]
  type compilerType =(VNodes:InstanceType<typeof VNode>,data:Object)=>VNode
  interface VNodeOptions{
    tag:string|undefined;
    value:any;
    VMattrs:Record<string, any>| undefined;
    type:number;
    children:VNode[] | undefined
  }
  
  class VNode{
    tag:string|undefined
    value:any
    VMattrs:Object| undefined;
    type:number;
    children:VNode[]
    constructor(options:VNodeOptions){
      this.tag = options.tag||undefined;
      this.value = options.value;
      this.VMattrs = options.VMattrs;
      this.type = options.type;
      this.children = options.children || []
    };
    //追加子元素
    appendChild(vNode:VNode){
        this.children.push(vNode)
    }
  }
    // 将real Dom 转化为 VNode
  function createVNode(node:Element|Node){
      let type = node.nodeType  
      let _vnode:InstanceType<typeof VNode> | null = null
      if (type === 1) {
        // 元素名称
        let tag = node.nodeName
        //元素的属性
        let attrsObj = {} as any
        if (node instanceof Element) {
          let attrs = Array.from(node.attributes)
          attrs.forEach(prop => {
            attrsObj[prop.name] = prop.value
          });
        }
        let options = {
          tag,
          type,
          VMattrs:attrsObj,
          value:node.nodeValue,
          children:undefined}
          //创建VNode实例对象
         _vnode = new VNode(options)
          // 添加子节点
        let childNodes = Array.from(node.childNodes);
        childNodes.forEach(node=>{
          if (node && _vnode !== null) {
            //递归调用getVNode
            _vnode.appendChild(createVNode(node) as VNode )
          }
        })
      }else if (type === 3) {
        _vnode = new VNode({
          tag:undefined,
          type:type,
          VMattrs:undefined,
          value:node.nodeValue,
          children:undefined
        })
      }
      return _vnode
  }
  
  //编译VNode->realDom
  function parseVNode(VNode:VNode){
    // 定义真实的element
    let realNode:Element | Text| null = null
    if (VNode.tag && VNode.type === 1) {
       // 根据 tag 生成对应的element
      realNode = document.createElement(VNode.tag)
      // 给element 添加 attrs
      if (VNode.VMattrs) {
        Object.keys(VNode.VMattrs).forEach(key=>{
          // attr.nodeValue = VNode.VMattrs[key]
          if ( realNode instanceof Element ) 
            realNode.setAttribute(key, VNode.VMattrs[key]);
            //给元素赋值的nodeValue
            realNode.nodeValue = VNode.value
        })
      }
    }else if(VNode.type === 3){
     return document.createTextNode(VNode.value)
    }
    //存在children 递归使用parseVNode，并将当前创建的元素作为children的父元素
    if(VNode.children.length > 0){
      VNode.children.forEach(vnode=>{
        realNode.appendChild(parseVNode(vnode))
      })
    }
    return realNode
  }


interface mainVueOptionsType{
  data:()=>Object,
  el:Element | Node,
  render:()=>void
}

class mainVue{
  readonly _data:Object
  readonly _el:Element | Node
  template:Element
  render?:()=>void
  parentElement:Element
  constructor(options:mainVueOptionsType){
    this._data = options.data()
    this.initData()
    // deepDefineReactive.call(this,this._data)
    this.render = options.render
  }  
  static createApp(options:mainVueOptionsType){
    return new mainVue(options)
  }
    // VNode 中的 {{}} 替换成值
  static compiler:compilerType = (VNodes:InstanceType<typeof VNode>,data:Object)=>{
      const {value,children} = VNodes;
      // children 是一个坑
      let options = {...VNodes,children:null}
      if (MustacheReg.test(value)) {
      const realValue:any = value.replace(MustacheReg,(_,terget:string)=>{
          let mapValue = data[terget.trim()]
            if (terget.includes(".")) {
              const propsKeys = terget.split(".")
              mapValue = propsKeys.reduce((preData,nextkey)=>{
                return preData[nextkey.trim()]
              },data)
            }
          return mapValue
        })
        options.value = realValue
      }
      let _vnode = new VNode(options)
      if (children.length > 0) {
          children.forEach(vnode=>{
            _vnode.appendChild(mainVue.compiler(vnode,data))
          })
      }
      return _vnode
  }
  mount(selector:string){
    const el = document.querySelector(selector)
    this.template = el
    this.parentElement = el.parentElement
    this.render = this.createRenderFunc(this.template)
    this.mountComponent()
  }
  mountComponent(){
    let mount = function(){
      this.update(this.render())
    }
    mount.call(this)
  }
  //新旧vnode diff算法
  update(newDom){
    //parseVNode vnode -> realDom
   this.parentElement.replaceChild(newDom,document.querySelector("#app"))
  }
  createRenderFunc(el:Element){
    let VNodes = createVNode(el)
    return function(){
      //将data更新至vNodes  
      const realDom = parseVNode(mainVue.compiler(VNodes,this._data))
      return realDom
    }
  }

  initData(){
    let keys = Object.keys(this._data)
    //响应式化
    observer.call(this,this._data)
    // this._data.data => this.data 
    keys.forEach(key=>{
      proxy(this,key,this._data,true)
    })
  }
}

function proxy(target,key,_data,enumerable){
  //this 不需要绑定
  defineReactive(target,key,_data[key],enumerable)
}

function createArrayReactive( target : any[] ){
  let interceptArrayProto = Object.create( Array.prototype )
    ARRAY_METHOD.forEach(method=>{
      //拦截函数
      interceptArrayProto[method] = function(){
      let res =  Array.prototype[method].apply(this,arguments)
      //数组方法执行完后，对数组响应化
      deepDefineReactive(target)
      return res
    }
  })
  try {
    target.__proto__ = interceptArrayProto
  } catch (error) {
    Object.keys( interceptArrayProto ).forEach(funcKey=>{
      target[funcKey] = interceptArrayProto[funcKey]
    })
  }
}


function observer( data , vm ){
  //将data变成响应式
  deepDefineReactive.call(this,data)

  // 代理data



}

// 深度DefineReactive
function deepDefineReactive(deepO){
  Object.keys(deepO).forEach(key=>{
    if (Array.isArray(deepO[key])) {
      createArrayReactive.call(this,deepO[key])
      deepO[key].forEach((value,index)=>{
        if (value instanceof Object) {
          deepDefineReactive.call(this,value)
        }else{
          defineReactive.call(this, deepO[key],index ,value,true )
        }
      })  
    }else if (deepO[key] instanceof Object) {
      deepDefineReactive.call(this,deepO[key])
    }
    //对象也要响应式化
    defineReactive.call(this,deepO,key,deepO[key],true)
  })
}

//使用闭包，将对象中的所有属性defineReactive

type defineReactiveType = ( target:object , key:string , value:any , enumerable:boolean )=>void
const defineReactive:defineReactiveType = function (target , key , value , enumerable){
  Object.defineProperty(target , key ,{
    configurable:true,
    enumerable:enumerable,
    get(){
      return value
    },
    set:( newValue )=>{
      value = newValue
      if (value instanceof Object) {
        deepDefineReactive(value)
      }
      console.log(this);
      this.mountComponent()
    }
  })
}
 
