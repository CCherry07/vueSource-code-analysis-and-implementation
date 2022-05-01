var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
  tag:string|undefined; 元素的名称
  value:any;  元素的nodeValue
  VMattrs:Object| undefined; 元素的属性
  type:number; 节点的类型
  children:VNode[] | undefined 子元素
  *
 */
var MustacheReg = /\{\{(.+?)\}\}/g;
var ARRAY_METHOD = [
    "push",
    "pop",
    "shift",
    "unshift",
    "reverse",
    "sort",
    "splice"
];
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
        deepDefineReactive.call(this, this._data);
        this.render = options.render;
    }
    mainVue.createApp = function (options) {
        return new mainVue(options);
    };
    mainVue.prototype.mount = function (selector) {
        var el = document.querySelector(selector);
        this.template = el;
        this.parentElement = el.parentElement;
        this.render = this.createRenderFunc(this.template);
        this.mountComponent();
    };
    mainVue.prototype.mountComponent = function () {
        var mount = function () {
            this.update(this.render());
        };
        mount.call(this);
    };
    //新旧vnode diff算法
    mainVue.prototype.update = function (newDom) {
        console.log(newDom);
        //parseVNode vnode -> realDom
        console.log(this.parentElement);
        this.parentElement.replaceChild(newDom, document.querySelector("#app"));
    };
    mainVue.prototype.createRenderFunc = function (el) {
        var VNodes = createVNode(el);
        return function () {
            //将data更新至vNodes  
            var realDom = parseVNode(mainVue.compiler(VNodes, this._data));
            return realDom;
        };
    };
    // VNode 中的 {{}} 替换成值
    mainVue.compiler = function (VNodes, data) {
        var value = VNodes.value, children = VNodes.children;
        var options = __assign(__assign({}, VNodes), { children: null });
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
            options.value = realValue;
        }
        var _vnode = new VNode(options);
        if (children.length > 0) {
            children.forEach(function (vnode) {
                _vnode.appendChild(mainVue.compiler(vnode, data));
            });
        }
        return _vnode;
    };
    return mainVue;
}());
function createArrayReactive(target) {
    var interceptArrayProto = Object.create(Array.prototype);
    ARRAY_METHOD.forEach(function (method) {
        //拦截函数
        interceptArrayProto[method] = function () {
            var res = Array.prototype[method].apply(this, arguments);
            //数组方法执行完后，对数组响应化
            deepDefineReactive(target);
            return res;
        };
    });
    try {
        target.__proto__ = interceptArrayProto;
    }
    catch (error) {
        Object.keys(interceptArrayProto).forEach(function (funcKey) {
            target[funcKey] = interceptArrayProto[funcKey];
        });
    }
}
// 深度DefineReactive
function deepDefineReactive(deepO) {
    var _this = this;
    Object.keys(deepO).forEach(function (key) {
        if (Array.isArray(deepO[key])) {
            createArrayReactive(deepO[key]);
            deepO[key].forEach(function (value, index) {
                if (value instanceof Object) {
                    deepDefineReactive(value);
                }
                else {
                    defineReactive.call(_this, deepO[key], index, value, true);
                }
            });
        }
        else if (deepO[key] instanceof Object) {
            deepDefineReactive(deepO[key]);
        }
        defineReactive.call(_this, deepO, key, deepO[key], true);
    });
}
//使用闭包，将对象中的所有属性defineReactive
function defineReactive(target, key, value, enumerable) {
    var _this = this;
    Object.defineProperty(target, key, {
        configurable: true,
        enumerable: enumerable,
        get: function () {
            return value;
        },
        set: function (newValue) {
            value = newValue;
            if (value instanceof Object) {
                deepDefineReactive(value);
            }
            _this.mountComponent();
        }
    });
}
