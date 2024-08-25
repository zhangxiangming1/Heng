//工参化环境下，请打开以下一行注释
//import {HengNode } from "./heng-node";

/**
 * html语义化构造器(Heng读"珩")
 */
const Heng = {

  /**
  * 将中划线形式的样式属性名转换成小驼峰形式的样式属性名
  * @param {String} cssName css样式名称
  * @returns {String}
  */
  getStyleName(cssName) {
    const arr = cssName.split("-");
    cssName = arr[0];
    for (let i = 1; i < arr.length; i++) {
      cssName += (arr[i].substring(0, 1).toUpperCase() + arr[i].substring(1));
    }
    return cssName;
  },

  /**
   * 为tag节点配置样式
   * @param {HengNode} hengNode 
   * @param {String|Object} value 
   */
  setStyle(hengNode, value) {
    if (!hengNode?.tag || hengNode.tag === "_") return;
    //如果是字符串形式的样式，则将其组装成对象形式
    if (value.constructor === String) {
      const arr = value.split(";");
      let css, cssName, cssValue, styleName;
      for (let item of arr) {
        if (item.trim() === "") continue;
        css = item.split(":");
        cssName = css[0].trim();
        cssValue = css[1].trim();
        styleName = Heng.getStyleName(cssName);
        hengNode.styles[styleName] = cssValue;
      }
    }
    //如果是对象形式的style，则直接组装
    else if (value.constructor === Object) {
      for (let key in value) hengNode.styles[key] = value[key];
    }
  },

  /**
   * 为tag节点配置属性
   * @param {*} hengNode 目标tag节点
   * @param {*} obj 属性对象
   */
  setAttribute(hengNode, obj) {
    if (!hengNode?.tag || hengNode.tag === "_") return;
    for (let key in obj) {
      let value = obj[key];
      //如果value是一个函数，则配置事件
      if (value.constructor === Function) {
        if (!hengNode.events[key])  hengNode.events[key] = [];
        hengNode.events[key].push(value);
      }
      //如果key是style，则配置样式
      else if (key === "style") {
        Heng.setStyle(hengNode, value);
      }
      //配置attribute
      else {
        hengNode.attributes[key] = obj[key];
      }
    }
  },

  /**
   * 定义一个标签函数
   * @param {String} tagName 标签名称
   * @param {String|undefined} namespace 名称空间，主要用于svg
   * @returns {(...args:any[])=>HengNode}
   */
  define(tagName,namespace) {

    const ignore_args = [null, undefined, "", false, NaN];   //构建过程中忽略的参数，注意没有忽略0
    const reg_id = /(?<=#)[a-zA-Z_\$][\w\$\-]*/g;            //匹配选择器中的id
    const reg_class = /(?<=\.)[a-zA-Z_\-\$][\w\$\-]*/g;      //匹配选择器中的class
    
    //创建标签函数
    let tagFunction = function (...args) {
      let hengNode = new HengNode(tagName);
      if(namespace) hengNode.ns = namespace;
      for (let arg of args) {
        //忽略的参数
        if (ignore_args.includes(arg))  continue;
        if (arg.constructor === Function) {
          //如果是一个无参的函数，则先运行函数，再将返回值追加到父节点
          if (arg.length === 0) {
            hengNode.appendChild(arg());
          }
          //如果函数有一个形参，则将创建一个追加子节点的函数，用该函数来填充形参
          else if (arg.length === 1) {
            arg(child => hengNode.appendChild(child));
          }
        }
        //如果是一个tag节点数组，则追加到children
        else if (arg.constructor === Array) {
          for (let item of arg) {
            if(!ignore_args.includes(item)){
              hengNode.appendChild(item);
            }
          }
        }
        //如果是一个json则为节点配置属性
        else if (arg.constructor === Object) {
          Heng.setAttribute(hengNode, arg);
        }
        //此处可以用正则表达式，如/#nodeid.class1.class2/,以#号开始的段将标记为id，以.开始的段将标记为class
        else if (arg.constructor === RegExp) {
          //从正则中提取文本
          let str = arg.toString();
          let end = str.lastIndexOf("/");
          str = str.substring(1, end);
          //从正则表达式中提取最后一个id
          let ids = str.match(reg_id);
          if (ids?.length) {
            let id = ids[ids.length - 1];
            Heng.setAttribute(hengNode, { id: id });
          }
          //从正则表达式中提取所有的类
          let classes = str.match(reg_class);
          if (classes?.length) {
            classes.forEach(item => hengNode.addClass(item));
          }
        }
        //如果是tag节点
        else {
          hengNode.appendChild(arg);
        }
      }
      return hengNode;
    }

    return tagFunction;

  },

  /**
   * 定义一个svg标签函数
   * @param {String} tagName 标签名称
   * @returns 
   */
  defineSvg(tagName){
    return this.define(tagName,"http://www.w3.org/2000/svg");
  },

  /**
   * 开箱即用的标签函数
   */
  tags: new Proxy({}, {
    get(_, tagName) {
      tagName = tagName === "_" ? tagName : tagName.split("_").join("-");
      return Heng.define(tagName);
    }
  }),

  /**
   * 开箱即用的svg标签函数
   */
  svgTags:new Proxy({},{
    get(_,tagName){
      tagName = tagName==="_"?tagName:tagName.split("_").join("-");
      return Heng.defineSvg(tagName);
    }
  }), 

  /**
   * 挂载tag节点
   * @param {HengNode} hengNode tag节点
   * @param {Node|HengNode} container 容器
   * @param {Boolean} clearContainer 挂载之前是否清空容器
   */
  render(hengNode, container, clearContainer = false) {
    //清空container的内容
    if (clearContainer) {
      if(container instanceof HengNode){
        container.children=[];
        if(container.real) container.real.innerHTML="";
      }else{
        container.innerHTML = "";
      }
    }
    //如果容器是一个HengNode，则将当前HengNode追加到容器的子节点中
    if(container instanceof HengNode){
      container.children.push(hengNode);
      //如果容器已经渲染过了，那么子节点也要渲染
      if(container.real) hengNode.render(container.real);
    }
    else{
      hengNode.render(container);
    }
  }

}

//工参化环境下，请打开以下一行注释
//export {Heng};
