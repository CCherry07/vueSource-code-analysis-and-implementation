interface optionsType{
  data:() => Object,
  template?:string
}
const MustacheReg = /\{\{(.+?)\}\}/g;
type compilerType =(template:Element|Node,data:any)=>void
class MyVue{
  readonly _data:Object
  readonly _template : string | null
  cloneRootEl!: Node;
  rootEl!: Element;
  constructor(options:optionsType){
    this._data = options.data()
    this._template = options.template || null
  }
  //创建MyVue instance
    static createApp(options:optionsType){
    return new MyVue(options)
  }
  //渲染函数
  render() {
    MyVue.compiler(this.cloneRootEl , this._data)
  }
   static compiler:compilerType = (template:Element|Node,data) =>{
      let nodes = Array.from(template.childNodes);
      nodes.forEach(node=>{
        let tagNumber = node.nodeType;
        if (tagNumber === 3) { // 1元素，3文本
          let txt = node.nodeValue
          if (txt) {
            const value:any = txt.replace(MustacheReg,(_,terget:string)=>{
              let mapValue = data[terget.trim()]
                if (terget.includes(".")) {
                  const propsKeys = terget.split(".")
                  mapValue = propsKeys.reduce((preData,nextkey)=>{
                    return preData[nextkey.trim()]
                  },data)
                }
              return mapValue
            })
            node.nodeValue = value
          }
          //判断是否是插值表达式
        }else{
         MyVue.compiler(node,data)
        }
      })
    }
  updated(realElement:Node) { 
     const rootElement = this.rootEl 
    document.body.replaceChild(realElement,rootElement)
  }
  mount(selector:string){
    let root = undefined
    if (this._template) {
     root=document.querySelector(this._template)
    }
    root = document.querySelector(selector)
    if (root) {
      this.cloneRootEl = root.cloneNode(true)
      this.rootEl = root
      this.render()
      this.updated(this.cloneRootEl)
    }else{
      throw new Error("缺失根节点")
    }
  }
}
