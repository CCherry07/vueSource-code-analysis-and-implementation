let tags = "div,span,p,ul,li".split(",")
function makeMap(tags:string[]){
  const tagsSet = new Set(tags)
  return function (tagName:string) {
    return tagsSet.has(tagName)
  }
}

const isHtmlElement  = makeMap(tags)
console.log(isHtmlElement("div"));

