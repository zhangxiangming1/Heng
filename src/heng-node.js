
/**
 * 标签节点
 */
class HengNode {

  constructor(tagName) {
    this.tag = tagName;      //标签名称
    this.ns = null;          //标签的名称空间
    this.children = [];      //子节点
    this.real = null;        //渲染后绑定的真实节点
    this.props = {};         //数据属性
    //为非空标签节点初始化属性、样式、事件
    if (tagName !== "_") {
      this.attributes = {};   //属性，不包含样式和事件
      this.styles = {};       //style的object形式，注意key是小驼峰命名
      this.events = {};       //事件，注意事件名没有前缀on
    }
  }

  /**
   * 在声明式构建过程中，将节点的引用赋值给一个句柄对象的属性，在声明式构建完成之后，可以通过句柄对象的属性来访问这个节点
   * @param {*} handleObject 句柄对象
   * @param {String} propertyName 句柄对象的属性名
   * @returns {HengNode}
   */
  handle(handleObject, propertyName) {
    handleObject[propertyName] = this;
    return this;
  }

  /**
   * 获取HengNode的真实节点的Rect
   * @returns 
   */
  rect() {
    return this.real?.getBoundingClientRect();
  }

  /**
   * 追加子节点
   * @param {*} child 
   */
  appendChild(child) {
    if (child === null || child === undefined || child === "" || child === false) return this;
    if (child.constructor === HengNode) this.children.push(child);
    else this.children.push(child.toString());
    if (this.tag !== "_" && this.real) {
      if (child.constructor === HengNode) child.render(this.real);
      else this.real.appendChild(child.toString());
    }
    return this;
  }

  /**
 * 在构建过程中给节点配置id属性，并将该节点的引用赋值给一个句柄对象，之后可以通过句柄对象的属性访问该节点
 * @param {String} value id值
 * @param {Object} handleObject 句柄对象
 * @param {String} handlePropertyName 句柄对象的属性名，缺省情况取id的值
 * @returns 
 */
  _id(value, handleObject, handlePropertyName) {
    this.attr("id", value);
    if (handleObject) this.handle(handleObject, handlePropertyName || value);
    return this;
  }

  /**
   * 为当前tag节点配置属性，若tag节点已经完成了挂载，则会同时为真实节点配置属性
   * @param {String|Object} nameOrObject 属性名或属性对象
   * @param {*} value 属性值
   * @returns {HengNode}
   */
  attr(nameOrObject, value) {
    if (this.tag === "_") return this;
    if (nameOrObject.constructor === String) {
      this.attributes[nameOrObject] = value;
      if (this.real) this.real.setAttribute(nameOrObject, value);
    }
    else if (nameOrObject.constructor === Object) {
      for (let key in nameOrObject) this.attr(key, nameOrObject[key]);
    }
    return this;
  }

  /**
   * 移除HengNode的属性，若HengNode已经完成挂载，则同时移除真实节点的属性
   * @param {String} key 属性名
   * @returns {HengNode}
   */
  removeAttr(key) {
    if (this.tag === "_") {
      return this;
    } else {
      delete this.attributes[key];
      if (this.real) this.real.removeAttribute(key);
      return this;
    }
  }

  /**
   * 为节点增加class
   * @param {String} className 
   */
  addClass(className) {
    if (this.tag === "_") return this;
    let classList = this.attributes["class"];
    if (!classList) {
      classList = className;
    } else {
      let arr = classList.split(/\s+/);
      for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === className) arr.splice(i, 1);
      }
      arr.push(className);
      classList == arr.join(" ");
    }
    classList = classList.trim().replace(/\s{2,}/g, " ");
    this.attributes["class"] = classList;
    if (this.real) this.real.classList.add(className);
    return this;
  }

  /**
   * 为节点移除类名
   * @param {String} className 
   */
  removeClass(className) {
    if (this.tag === "_") return this;
    let classList = this.attributes["class"];
    if (!classList) return this;
    let arr = classList.split(/\s+/);
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] === className) arr.splice(i, 1);
    }
    classList == arr.join(" ");
    classList = classList.trim().replace(/\s{2,}/g, " ");
    this.attributes["class"] = classList;
    if (this.real) this.real.classList.remove(className);
    return this;
  }

  /**
   * 为HengNode配置样式，若HengNode已经完成了挂载，则会同时为真实节点配置样式
   * @param {String|Object} nameOrObject 样式属性名或样式对象
   * @param {*} value 样式的值
   * @returns {HengNode} 返回了当前节点，可以链式操作
   */
  css(nameOrObject, value) {
    if (this.tag === "_") return;
    if (nameOrObject.constructor === String) {
      if (typeof (value) === "number") value = value + "px";
      this.styles[nameOrObject] = value;
      if (this.real) this.real.style[nameOrObject] = value;
    }
    else if (nameOrObject.constructor === Object) {
      for (let key in nameOrObject) this.css(key, nameOrObject[key]);
    }
    return this;
  }

  /**
   * 为tag节点绑定事件，若tag节点已经完成挂载，则会同时为真实节点绑定事件
   * @param {String} eventType 事件名，不加on前缀
   * @param {(event)=>void} handler 事件处理函数
   * @param {boolean|AddEventListenerOptions|undefined} options 事件选项
   * @returns {HengNode}
   */
  on(eventType, handler, options = false) {
    if (this.tag === "_") return this;
    if (!this.events[eventType]) this.events[eventType] = [];
    this.events[eventType].push(handler);
    if (this.real) this.real.addEventListener(eventType, handler, options);
    return this;
  }

  /**
   * 清空内容
   */
  clear() {
    this.children = [];
    if (this.real) this.real.innerHTML = "";
    return this;
  }

  /**
   * 设置HengNode的html内容
   * @param {String} content html内容
   */
  html(content) {
    this.children = [content];
    if (this.real) this.real.innerHTML = content;
    return this;
  }

  /**
   * 为子节点添加相同的类名
   * @param {String} className 
   */
  childClass(className) {
    this.children.forEach(child => child.addClass(className));
    return this;
  }

  /**
   * 移除子节点的类名
   * @param {String} className 
   * @returns 
   */
  removeChildClass(className) {
    this.children.forEach(child => child.removeClass(className));
    return this;
  }

  /**
   * 为子节点添加相同的属性
   * @param {String|Object} nameOrObj 
   * @param {*} value 
   */
  childAttr(nameOrObj, value) {
    this.children.forEach(child => child.attr(nameOrObj, value));
    return this;
  }

  /**
   * 移除子节点的attribute
   * @param {String} key 
   */
  removeChildAttr(key) {
    this.children.forEach(child => child.removeAttr(key));
  }

  /**
   * 为子节点配置样式
   * @param {*} name 
   * @param {*} value 
   * @returns 
   */
  childCss(name, value) {
    this.children.forEach(child => child.css(name, value));
    return this;
  }

  /**
   * 在其真实节点下查询dom节点
   * @param {String} selector 
   */
  querySelector(selector) {
    if (this.real) {
      let node = this.real.querySelector(selector);
      //如果没有找到，则尝试到shadowRoot中查找
      if (!node && this.real.shadowRoot) {
        node = this.real.shadowRoot.querySelector(selector);
      }
      return node;
    }
  }

  /**
   * 在其真实节点下查询dom节点
   * @param {String} selector 
   */
  querySelectorAll(selector) {
    if (this.real) {
      let nodes = this.real.querySelectorAll(selector);
      //如果没有找到，则尝试到shadowRoot中查找
      if ((!nodes || !nodes.length) && this.real.shadowRoot) {
        nodes = this.real.shadowRoot.querySelectorAll(selector);
      }
      return nodes;
    }
  }

  /**
   * 将当前tag节点渲染到真实的DOM树中
   * @param {HTMLElement} container 容器节点
   */
  render(container) {
    let realNode;   //创建一个真实节点
    if (this.tag === "_") realNode = new DocumentFragment();  //创建文档碎片
    else if (this.ns) realNode = document.createElementNS(this.ns, this.tag); //创建带命名空间的标签函数
    else realNode = document.createElement(this.tag); //创建普通节点
    this.real = realNode;
    if (this.tag !== "_") {
      //将tag节点的属性映射到真实节点
      for (let key in this.attributes) {
        if (["selected", "checked", "readonly", "disabled"].includes(key)) {
          //selected,checked,readonly,disabled四种属性要特别处理
          if (this.attributes[key]) realNode.setAttribute(key, key);
          else realNode.removeAttribute(key);
        }
        else {
          realNode.setAttribute(key, this.attributes[key]);
        }
      }
      //将tag节点的样式映射到真实节点
      for (let key in this.styles) realNode.style[key] = this.styles[key];
      //将tag节点的事件映射到真实节点
      for (let key in this.events) {
        this.events[key].forEach(item => realNode.addEventListener(key, item))
      }
    }
    //将tag节点的子节点映射到真实节点的子节点
    for (let child of this.children) {
      //如果当前子节点是一个tag节点，则递归，否则当做文本内容追加到真实节点
      if (child.constructor === HengNode) child.render(realNode);
      else realNode.insertAdjacentHTML("beforeend", child);
    }
    //将真实节点插入到容器中
    container.appendChild(realNode);
  }

}

/**
 * 其他未知函数都当做开箱即用的属性配置函数、样式配置函数、事件配置函数，
 * 属性配置函数以_开始（第一个_会被移除，其他_会被替换成-）
 * 事件配置函数的首字母大写
 * 样式配置函数的首字母小写
 * 注意这些函数在HengNode.prototyppe.__proto__上，以避免覆盖实例本身的函数和prototype上的函数
 * 开箱即用函数的搜索过程：HengNode自身->HengNode的原型->HengNode的原型的原型
 */
HengNode.prototype.__proto__ = new Proxy({}, {
  get(_, propertyName) {
    //如果第一个字母是下划线，则返回一个配置(或获取)属性的函数，属性名不含第一个下划线
    const first = propertyName[0];
    if (first === "_") {
      let attributeName = propertyName.substring(1);
      attributeName = attributeName.split("_").join("-");
      let func = function (value) {
        //有参数，则配置属性值
        if (value !== undefined && value !== null) {
          return this.attr(attributeName, value);
        }
        //没有参数，则获取真实节点的属性值
        else if (this.real) {
          return this.real.getAttribute(attributeName);
        }
      }
      return func;
    }
    const isUpperCase = propertyName[0].toLowerCase() !== propertyName[0];  //如果字母转换成小写后不等于自身，则该字母一定是一个大写字母
    //如果以大写字母开始，则返回一个配置事件的函数
    if (isUpperCase) {
      let func = function (handler, options = false) {
        return this.on(propertyName.toLowerCase(), handler, options);
      }
      return func;
    }
    //如果不是以大写字母开始，则返回一个配置(或获取)样式的函数
    return (
      function (value) {
        if (value !== undefined && value !== null) {
          return this.css(propertyName, value);
        }
        else if (this.real) {
          return getComputedStyle(this.real, null)[propertyName];
        }
      }
    );
  }
});

//将一个Element封装为一个HengNode，使其具备链式调用的能力
Object.defineProperty(Element.prototype, "$$", {
  get: function () {
    const tagName = this.tagName.toLowerCase();
    const hengNode = new HengNode(tagName);
    hengNode.real = this;
    return hengNode;
  }
});

/**
* 链接到一个Element，返回一个HengNode，注意这个HengNode是残缺的，只能用于链式调用
* @param {Element|String} elementOrSelector DOM节点或选择器
* @param {Node} host 选择器的上下文
*/
function $$(elementOrSelector, host = document) {
  if (elementOrSelector instanceof Element) {
    const tagName = elementOrSelector.tagName.toLowerCase();
    const hengNode = new HengNode(tagName);
    hengNode.real = elementOrSelector;
    return hengNode;
  }
  if (elementOrSelector.constructor === String) {
    const ele = host.querySelector(elementOrSelector);
    if (ele) {
      const tagName = ele.tagName.toLowerCase();
      const hengNode = new HengNode(tagName);
      hengNode.real = ele;
      return hengNode;
    }
  }
}

//工程化环境下，请打开以下两行注释
//export { HengNode };
//export {$$};
