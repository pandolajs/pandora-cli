# pandora-cli 

[![npm version](https://badge.fury.io/js/pandora-cli.svg)](https://badge.fury.io/js/pandora-cli)

这是一款能提升程序员幸福感的 CLI 工具！！！

啪（pa）一下，你就可以完成你的项目搭建编译 ~~

罗老师附体：

> 我们重新定义了 CLI.

> 这是东半球最好用的 CLI.

隐约的听到有人在夸我帅 ~~~~ “啊，呸 ... 真没见过这么臭不要脸的开发者 ~~”

哈哈哈 ~~~ 玩笑到此为止，我们还是说点正经的吧！！

`pandora-cli` 旨在统一的开发入口，在开发过程中不用在使用各种各样的工具，比如：项目初始化时，用 yo, 构建时使用 webpack-cli gulp 等等，发布时使用有使用自定义的脚本等等。

聪明的你可能早就想到，都注册为 npm scripts 不就好了么？没错，但是项目初始化你还是需要使用其他的 cli 工具的，如果你能接受这一点，你可能并不需要使用 `pandora-cli`. 但 `pandora-cli` 能做的却绝不仅仅是集成了项目初始化的脚本。

## 使用 

全局安装：
```
  npm i -g pandora-cli

  pa init project
```

或者，本地安装：

```
  npm i -D pandora-cli

  npx pa init project
```

## PANDORA-CLI 能做什么？

我们提供了如下命令来封装开发周期中需要使用的一些功能：

- pa init <projectname | .>

用来初始化项目，`projectname` 是你要创建的项目名，如果项目目录已经创建好，我们在当前项目内执行 `pa init .` 即可。

回车，我们会列出所有可用的官方维护的项目模板，选择模板，按照提示即可完成项目的初始化。

- pa list

列出所有可用的官方维护的项目模板。

- pa start [--env=dev|test|pre|prod]

启动当前项目。默认使用开发环境启动，可以通过 `--env` 来制定对应的环境。

- pa upgrade [--scripts]

升级项目模板，主要是用来更新项目根目录 `.pandora` 目录中的 `templates` 和 `scripts` 中的内容。使用 `--scripts` 来更新项目根目录 `scripts` 中的脚本。

- pa install <component> [--dest=path/to/install/component] [--nocache]

这个命令是专门用来安装小程序组件的，只在由 `@pandolajs/pandora-boilerplate-wechat` 项目模板初始化的项目中生效。[点击查看](https://github.com/pandolajs/pandora-boilerplate-wechat) 项目模板。我们会分析组件的依赖，一并安装。

`component` 是我们的 `@pandolajs/pandora-ui-wechat` 提供的组件名， [点击查看](https://github.com/pandolajs/pandora-ui-wechat) 所有可用的组件。

`dest` 用来指定组件的安装目录，默认安装位置 `cwd/scr/components`

`nocache` 初次安装一个组件后，我们会把整个组件库缓存下来，如果为显示使用 `--nocache`，我们默认从缓存库中安装组件。

- pa create <filename.ext|directory>

用来创建项目中的样板代码，并向样板代码中注入以下变量：

```
@{Description}      文件描述
@{User}             用户名
@{Email}            用户邮箱
@{Date}             当前日期
```

pandora-cli 默认提供支持 `js`, `less`, `json`, `wxml` 后缀文件的创建。

```
// 创建 js 文件
pa create index.js
```

我们也可以在项目的 `.pandora/templates` 目录中自定义样板代码模板。

定义文件类型样板代码，模板命名规则 `文件后缀.temp`, 比如 `md.temp` 就可以定义一个 markdown 的文件模板， 然后 `pa create filename.md` 就会使用你定义的样板代码创建 `filename.md` 文件

定义文件夹类型的样板代码集就比价简单了，直接创建文件目录，然后加入对应的样板代码文件即可，无需 `.temp` 后缀结尾。比如创建如下目录：

```
.
└── page
    ├── index.js
    ├── index.json
    ├── index.less
    └── index.wxml
```

然后执行 `pa create page home`, 就会使用 page 目录中的文件在当前目录中创建 `home` 目录

- pa --version 打印 cli 版本

- pa --help 打印 cli 帮助文档

## PANDORA-CLI 是如何工作的？

开头我们就讲到，`pandora-cli` 的目的是统一开发入口，在开发的各个周期内都使用 `pa` 命令来操作，以提供一种沉浸式的开发体验，如果我们把开发中用到的所有的功能都集成到工具中，那么，这个 cli 将变得极其臃肿，复杂，甚至会变得极其难用，为了适配各种场景，毋庸置疑会有很多的命令，命令参数等等，如果实现成这样，那么必将与我们 “提升程序媛/猿幸福感” 的初衷背道而驰。

所以我们就把各个场景中的个性化的功能都集成到了项目模板中，命令行工具提供钩子，在项目模板根目录 `.pandora/srcipts` 中提供命令同名的钩子脚本即可，命令执行时，我们注入用户输入的参数，所以，`pandora-cli` 并没有提供任何特殊的功能，我们仅仅是各个项目模板中各种脚本的代言人。

换句话说，你可能并不需要这个 cli 工具。

目前支持 hook 的命令：

- start
- release (coming soon...)

钩子脚本就是一个普通的 nodejs 模块，只要导入一个函数即可，函数的参数就是使用 cli 命令是输入的参数

```
module.exports = argv => {
  // do something what you want ...
}
```

## TODO

- [x] pa init 命令增强
  - [x] 支持初始化项目后自动安装项目依赖
  - [ ] 支持使用三方的项目模板进行项目初始化
  - [x] 支持向项目模板注入变量

- [ ] pa list 命令增强
  - [ ] 支持项目模板升级提醒
  - [ ] 支持列出三方项目模板

- [ ] 新增 pa remove <component> 用来移除已安装的小程序组件

- [ ] 新增 pa release 命令用来发布部署项目

- [ ] 升级 command hook 机制，支持 before-cmd post-cmd 脚本

- [ ] pandolajs 静态站点建设

## 彩蛋

使用 `pa` 一下觉得没意思？那 `pia` 一下呢？ 那 `papapa` 呢 ~~~ 总有一款姿势满足您的口味 ~~

> 自己写个工具，还不让我自娱一下？

## 贡献

有任何意见或建议请直接提交 issue 或 PR。您的任何帮助都会让我们开心很久。

## LICENSE

MIT License

Copyright (c) 2018 pandolajs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
