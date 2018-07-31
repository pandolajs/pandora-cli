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

## templates

> type: Object

用来指定 `pa create` 创建目录模板时的目标路径.

其中 key 值为 `.pandora/templates` 目录下模板的名称，value 值为创建对象样板代码时的目标路径，值为相对于 `.pandora.conf.json` 的相对路径。

比如在小程序项目中：

在 `.pandora.conf.json` 中配置如下：

```
  {
    templates: {
      page: 'src/pages',
      component: 'src/components'
    }
  }
```

这样在项目的任意目录下执行以下命令时，对应模板的代码都是创建到制定的目录下。

如：

```
  pa c page home
```

无论在哪里支持该命令，`home` 都会创建到 `src/pages` 目录下, 创建 component 同理。

> 注意：如果创建模板代码时，使用路径，则会忽略配置，如： `pa c page src/home` 这时 home 会创建到 `process.cwd()/src/` 目录下。
