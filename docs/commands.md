# Pandora-cli 命令详解

我们提供了如下命令来封装开发周期中需要使用的一些功能：

- pa init <projectname | .>

用来初始化项目，`projectname` 是你要创建的项目名，如果项目目录已经创建好，我们在当前项目内执行 `pa init .` 即可。

回车，我们会列出所有可用的官方维护的项目模板，选择模板，按照提示即可完成项目的初始化。

如果官方维护的项目模板中没有你需要的，那么你可以使用 `-b` 参数来指定你想使用的项目模板名（需发布到 npm 或者 npm 私服）

```bash
  pa init <projectName> -b <boilerplate>
```

如果你是对已有项目进行初始化，你还可以使用 `--ignores` 来指定 `glob` 表达式来忽略脚手架中的目录或者文件，比如现有目录中已经有 `src` 目录，则我们可以在项目根目录下执行以下命令来把当前项目初始化为制定脚手架的项目

```bash
  pa init . -b <boilerplate> --ignores 'src/**/*' --
```

这样项目在解压后就会会略 src 目录下的所有文件

- pa list

列出所有可用的官方维护的项目模板。

- pa start [--env=dev|test|pre|prod]

启动当前项目。默认使用开发环境启动，可以通过 `--env` 来制定对应的环境。

- pa upgrade [--scripts]

升级项目模板，主要是用来更新项目根目录 `.pandora` 目录中的 `templates` 和 `scripts` 中的内容。使用 `--scripts` 来更新项目根目录 `scripts` 中的脚本。

如果你的项目不是 pandora 项目，你也可以执行以下命令将已有项目升级为指定脚手架的 pandora 项目

```bash
  pa upgrade -b <boilerplate-name>
```

比如将一个非 pandora 小程序项目升级为使用 `@pandolajs/pandora-boilerplate-wechat` 的 pandora 小程序，可以执行此命令

```bash
  pa upgrade -b @pandolajs/pandora-boilerplate-wechat
```

> 执行完此命令，项目中会新增 `.pandora.conf.json` 配置文件和 `.pandora` pandora 项目配置文件夹

如果你希望使用脚手架中的构建脚本，那么，你可以可以以下命令：

```bash
  pa upgrade -b @pandolajs/pandora-boilerplate-wechat --scripts
```

> 执行完此命令，除了会新增上述的配置文件与文件夹外，还会新增 scripts 目录，并在 package.json 中新增对应的 scripts 字段值。

- `pa install <component> [--dest=path/to/install/component] [--nocache]`

这个命令是专门用来安装小程序组件的，只在由 `@pandolajs/pandora-boilerplate-wechat` 项目模板初始化的项目中生效。[点击查看](https://github.com/pandolajs/pandora-boilerplate-wechat) 项目模板。我们会分析组件的依赖，一并安装。

`component` 是我们的 `@pandolajs/pandora-ui-wechat` 提供的组件名， [点击查看](https://github.com/pandolajs/pandora-ui-wechat) 所有可用的组件。

`dest` 用来指定组件的安装目录，默认安装位置 `cwd/scr/components`

`nocache` 初次安装一个组件后，我们会把整个组件库缓存下来，如果为显示使用 `--nocache`，我们默认从缓存库中安装组件。

- pa create <filename.ext|directory>

用来创建项目中的样板代码，并向样板代码中注入以下变量：

```bash
@{Description}      文件描述
@{User}             用户名
@{Email}            用户邮箱
@{Date}             当前日期
```

pandora-cli 默认提供支持 `js`, `less`, `json`, `wxml` 后缀文件的创建。

```bash
// 创建 js 文件
pa create index.js
```

我们也可以在项目的 `.pandora/templates` 目录中自定义样板代码模板。

定义文件类型样板代码，模板命名规则 `文件后缀.temp`, 比如 `md.temp` 就可以定义一个 markdown 的文件模板， 然后 `pa create filename.md` 就会使用你定义的样板代码创建 `filename.md` 文件

定义文件夹类型的样板代码集就比价简单了，直接创建文件目录，然后加入对应的样板代码文件即可，无需 `.temp` 后缀结尾。比如创建如下目录：

```bash
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
- build
- release(仅支持小程序)

钩子脚本就是一个普通的 nodejs 模块，只要导入一个函数即可，函数的参数就是使用 cli 命令是输入的参数

```javascript
module.exports = argv => {
  // do something what you want ...
}
```
