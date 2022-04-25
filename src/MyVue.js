var MustacheReg = /\{\{(.+?)\}\}/g;
var MyVue = /** @class */ (function () {
    function MyVue(options) {
        this._data = options.data();
        this._template = options.template || null;
    }
    //创建MyVue instance
    MyVue.createApp = function (options) {
        return new MyVue(options);
    };
    //渲染函数
    MyVue.prototype.render = function () {
        MyVue.compiler(this.rootEl, this._data);
    };
    MyVue.prototype.updated = function (realElement) {
        var rootElement = this.rootEl;
        document.body.replaceChild(rootElement, realElement);
    };
    MyVue.prototype.mount = function (selector) {
        var root = undefined;
        if (this._template) {
            root = document.querySelector(this._template);
        }
        root = document.querySelector(selector);
        if (root) {
            this.cloneRootEl = root.cloneNode(true);
            this.rootEl = root;
            this.render();
            this.updated(this.cloneRootEl);
        }
        else {
            throw new Error("缺失根节点");
        }
    };
    MyVue.compiler = function (template, data) {
        var nodes = Array.from(template.childNodes);
        nodes.forEach(function (node) {
            var tagNumber = node.nodeType;
            if (tagNumber === 3) { // 1元素，3文本
                var txt = node.nodeValue;
                if (txt) {
                    var value = txt.replace(MustacheReg, function (_, terget) {
                        var mapValue = data[terget.trim()];
                        if (terget.includes(".")) {
                            var propsKeys = terget.split(".");
                            mapValue = propsKeys.reduce(function (preData, nextkey) {
                                return preData[nextkey.trim()];
                            }, data);
                        }
                        return mapValue;
                    });
                    node.nodeValue = value;
                }
                //判断是否是插值表达式
            }
            else {
                MyVue.compiler(node, data);
            }
        });
    };
    return MyVue;
}());
