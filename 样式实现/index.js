var mustacheReg = /\{\{(.+?)\}\}/g;
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
var compiler = function (template, data) {
    var nodes = Array.from(template.childNodes);
    nodes.forEach(function (node) {
        var tagNumber = node.nodeType;
        if (tagNumber === 3) { // 1元素，3文本
            var txt = node.nodeValue;
            //判断是否是插值表达式
            var value = txt.replace(mustacheReg, function (_, terget) {
                var mapValue = data[terget.trim()];
                return mapValue;
            });
            node.nodeValue = value;
        }
        else {
            compiler(node, data);
        }
    });
};
