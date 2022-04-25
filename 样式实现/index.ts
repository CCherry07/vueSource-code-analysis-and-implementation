type compilerType =(template:HTMLElement|Node,data:object)=>void


const mustacheReg = /\{\{(.+?)\}\}/g;
// const compiler:compilerType =(template,data)=>{
//   let childNodes = template.childNodes;
//   for (let i = 0; i < childNodes.length; i++) {
//     let tagNumber = childNodes[i].nodeType // 1元素，3文本
//     if (tagNumber === 3) {
//       let txt = childNodes[i].nodeValue
//       //判断是否是插值表达式
//       const value = txt.replace(mustacheReg,(_,terget:string)=>{
//         let mapValue = data[terget.trim()]
//         return mapValue
//       })
//       childNodes[i].nodeValue = value
//     }else if (tagNumber === 1) {
//       compiler(childNodes[i] , data)
//     }
//   }
// }
const compiler:compilerType =(template,data)=>{
  let nodes = Array.from(template.childNodes);
  nodes.forEach(node=>{
    let tagNumber = node.nodeType;
    if (tagNumber === 3) { // 1元素，3文本
      let txt = node.nodeValue
      //判断是否是插值表达式
      const value = txt.replace(mustacheReg,(_,terget:string)=>{
        let mapValue = data[terget.trim()]
        return mapValue
      })
      node.nodeValue = value
    }else{
      compiler(node,data)
    }
  })
}
