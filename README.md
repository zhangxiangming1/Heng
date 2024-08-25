# Heng.js
声明式构建HTML文档，不需要CLI，无虚拟DOM

## 框架介绍
Heng.js献给我家小生命珩珩。

Heng.js可实现无CLI，无虚拟DOM，声明式构建HTML。构建完的HengNode可使用类似于jquery的链式方式配置属性、样式、事件。Heng.js巧妙的函数式编程特性天生支持组件化，一个能返回HengNode的函数就是一个可复用的组件。
## 示例
### 静态构建
```
const {ul,li} = Heng.tags;
let hengNode =
ul(
  li(1),
  li(2)
);
Heng.render(hengNode,document.getElementById("container"));
```
### 动态构建
```
let myFamily = [
  {id:1,name:"张向明"},
  {id:2,name:"将海艳"},
  {id:3,name:"张泽珩"}
];
const {table,thead,tbody,th,td} = Heng.tags;
let hengNode =
table(
  thead(
    tr(th("编号"),th("姓名"))
  ),
  tbody(
    myFamily.map(row=>
      tr(td(row.id),td(row.name))
    )
  )
)
Heng.render(hengNode,document.getElementById("container"));
```
