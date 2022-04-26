/**
  tag:string|undefined; 元素的名称
  value:any;  元素的nodeValue
  VMattrs:Object| undefined; 元素的属性
  type:number; 节点的类型
  children:VNode[] | undefined 子元素
  * 
 */
interface VNodeOptions{
  tag:string|undefined;
  value:any;
  VMattrs:Object| undefined;
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
function getVNode(node:Element|Node){
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
          _vnode.appendChild(getVNode(node) as VNode )
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

//编译VNode
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
