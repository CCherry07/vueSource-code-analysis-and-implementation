var tags = "div,span,p,ul,li".split(",");
function makeMap(tags) {
    var tagsSet = new Set(tags);
    return function (tagName) {
        return tagsSet.has(tagName);
    };
}
var isHtmlElement = makeMap(tags);
console.log(isHtmlElement("div"));
