/**
  tag:string|undefined; 元素的名称
  value:any;  元素的nodeValue
  VMattrs:Object| undefined; 元素的属性
  type:number; 节点的类型
  children:VNode[] | undefined 子元素
  *
 */
var MustacheReg = /\{\{(.+?)\}\}/g;
var VNode = /** @class */ (function () {
    function VNode(options) {
        this.tag = options.tag || undefined;
        this.value = options.value;
        this.VMattrs = options.VMattrs;
        this.type = options.type;
        this.children = options.children || [];
    }
    ;
    //追加子元素
    VNode.prototype.appendChild = function (vNode) {
        this.children.push(vNode);
    };
    return VNode;
}());
// 将real Dom 转化为 VNode
function createVNode(node) {
    var type = node.nodeType;
    var _vnode = null;
    if (type === 1) {
        // 元素名称
        var tag = node.nodeName;
        //元素的属性
        var attrsObj_1 = {};
        if (node instanceof Element) {
            var attrs = Array.from(node.attributes);
            attrs.forEach(function (prop) {
                attrsObj_1[prop.name] = prop.value;
            });
        }
        var options = {
            tag: tag,
            type: type,
            VMattrs: attrsObj_1,
            value: node.nodeValue,
            children: undefined
        };
        //创建VNode实例对象
        _vnode = new VNode(options);
        // 添加子节点
        var childNodes = Array.from(node.childNodes);
        childNodes.forEach(function (node) {
            if (node && _vnode !== null) {
                //递归调用getVNode
                _vnode.appendChild(createVNode(node));
            }
        });
    }
    else if (type === 3) {
        _vnode = new VNode({
            tag: undefined,
            type: type,
            VMattrs: undefined,
            value: node.nodeValue,
            children: undefined
        });
    }
    return _vnode;
}
//编译VNode->realDom
function parseVNode(VNode) {
    // 定义真实的element
    var realNode = null;
    if (VNode.tag && VNode.type === 1) {
        // 根据 tag 生成对应的element
        realNode = document.createElement(VNode.tag);
        // 给element 添加 attrs
        if (VNode.VMattrs) {
            Object.keys(VNode.VMattrs).forEach(function (key) {
                // attr.nodeValue = VNode.VMattrs[key]
                if (realNode instanceof Element)
                    realNode.setAttribute(key, VNode.VMattrs[key]);
                //给元素赋值的nodeValue
                realNode.nodeValue = VNode.value;
            });
        }
    }
    else if (VNode.type === 3) {
        return document.createTextNode(VNode.value);
    }
    //存在children 递归使用parseVNode，并将当前创建的元素作为children的父元素
    if (VNode.children.length > 0) {
        VNode.children.forEach(function (vnode) {
            realNode.appendChild(parseVNode(vnode));
        });
    }
    return realNode;
}
var mainVue = /** @class */ (function () {
    function mainVue(options) {
        this._data = options.data();
        // this.render = this.createRenderFunc(this.template)
    }
    mainVue.createApp = function (options) {
        return new mainVue(options);
    };
    mainVue.prototype.mount = function (selector) {
        var el = document.querySelector(selector);
        this.template = el;
        this.render = this.createRenderFunc(this.template);
        this.mountComponent(el);
    };
    mainVue.prototype.mountComponent = function (el) {
        var mount = function () {
            this.update(this.render());
        };
        mount.call(this);
    };
    mainVue.prototype.update = function (realDom) {
        //parseVNode vnode -> realDom
        this.template.parentElement.replaceChild(realDom, this.template);
    };
    mainVue.prototype.createRenderFunc = function (el) {
        var VNodes = createVNode(el);
        return function () {
            //将data更新至vNodes
            mainVue.compiler(VNodes, this._data);
            var realDom = parseVNode(VNodes);
            return realDom;
        };
    };
    // VNode 中的 {{}} 替换成值
    mainVue.compiler = function (VNodes, data) {
        var value = VNodes.value, children = VNodes.children;
        if (MustacheReg.test(value)) {
            var realValue = value.replace(MustacheReg, function (_, terget) {
                var mapValue = data[terget.trim()];
                if (terget.includes(".")) {
                    var propsKeys = terget.split(".");
                    mapValue = propsKeys.reduce(function (preData, nextkey) {
                        return preData[nextkey.trim()];
                    }, data);
                }
                return mapValue;
            });
            VNodes.value = realValue;
        }
        if (children.length > 0) {
            children.forEach(function (vnode) {
                mainVue.compiler(vnode, data);
            });
        }
    };
    return mainVue;
}());
