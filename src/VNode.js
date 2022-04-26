var VNode = /** @class */ (function () {
    function VNode(options) {
        this.tag = options.tag || undefined;
        this.value = options.value;
        this.VMattrs = options.VMattrs;
        this.type = options.type;
        this.children = options.children || [];
    }
    ;
    VNode.prototype.appendChild = function (vNode) {
        this.children.push(vNode);
    };
    return VNode;
}());
function getVNode(node) {
    var type = node.nodeType;
    var _vnode = null;
    if (type === 1) {
        // 元素
        var tag = node.nodeName;
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
        _vnode = new VNode(options);
        var childNodes = Array.from(node.childNodes);
        childNodes.forEach(function (node) {
            if (node && _vnode !== null) {
                _vnode.appendChild(getVNode(node));
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
function parseVNode(VNode, preventEl) {
    if (preventEl === void 0) { preventEl = document.body; }
    var realNode = undefined;
    if (VNode.tag && VNode.type === 1) {
        var el_1 = document.createElement(VNode.tag);
        if (VNode.VMattrs) {
            var attrsKeys = Object.keys(VNode.VMattrs);
            attrsKeys.forEach(function (key) {
                var attr = document.createAttribute(key);
                attr.nodeValue = VNode.VMattrs[key];
                el_1.attributes.setNamedItem(attr);
                el_1.nodeValue = VNode.value;
                console.log(el_1.nodeValue);
            });
        }
        preventEl.appendChild(el_1);
        realNode = el_1;
    }
    else if (VNode.type === 3) {
        var textEl = document.createTextNode(VNode.value);
        console.log(textEl, preventEl);
        preventEl.appendChild(textEl);
    }
    if (VNode.children) {
        VNode.children.forEach(function (vnode) {
            parseVNode(vnode, realNode);
        });
    }
    else {
        return preventEl;
    }
}
