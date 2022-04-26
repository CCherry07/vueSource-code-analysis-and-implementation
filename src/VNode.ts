type IVMattrs = Record<string, any>
interface VNodeOptions {
  tag: string | undefined;
  value: any;
  VMattrs: IVMattrs | undefined;
  type: number;
  children: VNode[] | undefined
}

class VNode {
  tag: string | undefined
  value: any
  VMattrs: IVMattrs | undefined;
  type: number;
  children: VNode[]
  constructor(options: VNodeOptions) {
    this.tag = options.tag || undefined;
    this.value = options.value;
    this.VMattrs = options.VMattrs;
    this.type = options.type;
    this.children = options.children || []
  };

  appendChild(vNode: VNode) {
    this.children.push(vNode)

  }
}

function getVNode(node: Element | Node) {
  let type = node.nodeType
  let _vnode: InstanceType<typeof VNode> | null = null
  if (type === 1) {
    // 元素
    let tag = node.nodeName

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
      VMattrs: attrsObj,
      value: node.nodeValue,
      children: undefined
    }
    _vnode = new VNode(options)

    let childNodes = Array.from(node.childNodes);
    childNodes.forEach(node => {
      if (node && _vnode !== null) {
        _vnode.appendChild(getVNode(node) as VNode)
      }
    })
  } else if (type === 3) {
    _vnode = new VNode({
      tag: undefined,
      type: type,
      VMattrs: undefined,
      value: node.nodeValue,
      children: undefined
    })
  }
  return _vnode
}


function parseVNode(VNode: VNode, preventEl: Element = document.body) {
  let realNode: Element | undefined = undefined
  if (VNode.tag && VNode.type === 1) {
    let el = document.createElement(VNode.tag)
    if (VNode.VMattrs) {
      let attrsKeys = Object.keys(VNode.VMattrs)
      attrsKeys.forEach(key => {
        let attr = document.createAttribute(key)
        attr.nodeValue = (VNode.VMattrs as IVMattrs)[key]
        el.attributes.setNamedItem(attr)
        el.nodeValue = VNode.value
        console.log(el.nodeValue);
      })
    }
    preventEl.appendChild(el)
    realNode = el
  } else if (VNode.type === 3) {
    let textEl = document.createTextNode(VNode.value)
    console.log(textEl, preventEl);
    preventEl.appendChild(textEl)
  }
  if (VNode.children) {
    VNode.children.forEach(vnode => {
      parseVNode(vnode, realNode)
    })
  } else {
    return preventEl
  }
}
