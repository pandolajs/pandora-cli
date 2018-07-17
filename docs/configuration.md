# 配置

## components

> type: Array<Object>

用来指定小程序非官方组件库，优先从自定的组件库中安装小程序组件，当指定的小程序中找不到要安装的组件时，将从官方维护的组件库 `@pandolajs/pandora-ui-wechat` 中进行安装。

如果指定了多个组件库，将按序寻找组件

```
  [
    {
      name: 'component-registry-name',  // 组件库名称
      path: 'packages'                  // 组件所在的目录路径，相对于组件库根目录
    }
  ]
```

> path 为选填，如果未指定，path 将使用组件库 package.json 中的 main 字段