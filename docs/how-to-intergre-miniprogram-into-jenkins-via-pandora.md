# 使用 pandora-cli 完成小程序项目持续集成以及现有项目的 pandora 化

## 环境要求

- 服务器系统为 windows 或者 macOS

- 服务端安装小程序开发者工具 [下载地址](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

- 准备一个通用打包构建角色微信号，并将改微信号添加到所有小程序的开发者中，提供开发者权限

- 全局安装 pandora-cli `npm i -g pandora-cli`

> 如果安装过程中有进度停顿，可以修改 npm 源为淘宝：`npm config set registry http://registry.npm.taobao.org`

## 集成步骤

### 第零步：准备一个用于发布的微信账号，然后联系对应小程序的管理员，将微信账号加入该小程序开发者组中，然后打开小程序开发者工具，登录

### 第一步：从版本库拉取到项目后，进入到项目根目录

```
  cd project_root
```

### 第二步：安装项目依赖

```
  npm i
```

### 第三步：执行如下命令

```
  // 构建测试环境包
  pa build --env test

  // 构建预发环境包
  pa build --env pre

  // 构建生产环境包
  pa build --env prod
```

### 第四步：发版

```
  pa release <version> -m '这次构建的描述'
```

> version 对应的可选值为 `patch`, `minor`, `major`，对应的意义解释如下：

我们的版本管理一般为 x.y.z

- patch: 将对 z 版本号进行递增，适用场景为 bug 修复，样式微调等修改

- minor: 将对 y 版本号进行递增，z 版本号置零，适用场景为有新功能添加

- major: 将对 x 版本号进行递增，y,z 版本号置零，适用场景，app 进行较大改动（UI，交互等颠覆式更新），项目架构升级，api 进行非向下兼容及改造

### 第五步

由于 `pa release` 命令执行完成后，会修改项目根目录下的 `package.json` 中的版本号，发版之后需要将改文件推送到版本库中，方便下次构建发版时，版本计算正确

## 项目改造

### 使用 pandora-cli 初始化的项目

使用 pandora-cli 初始化的项目，无需做任何改动，

### 使用 WePY, Taro, mpvue 等主流框架的项目

对于这类项目，因为有自己的构建脚本，所以需要进行少量的改造。

第一步：首先要在项目中执行以下命令，对项目进行 pandora 化

```
  pa upgrade -b @pandolajs/pandora-boilerplate-wechat
```

命令执行完成后，项目根目录下会新增如下文件及文件夹

```
 - .pandora.conf.json   // pandora 项目配置
 - .pandora             // pandora 私有工作区文件夹，其中包含项目脚本，样本代码模板，以及后续用来存在 pandora 操作时产生的中间文件，缓存等
```

第二步：在 `package.json` 文件 `scripts` 字段中配置如下命令

```
  {
    "scripts": {
      "start": "the script when run in development environment.",
      "build:test": "the same manner as start script",
      "build:pre": "the same manner as start script",
      "build:prod": "the same manner as start script"
    }
  }
```

pa start 将执行 scripts.start 命令

pa start --env test 将执行 scripts.build:test 命令

pa start --env pre 将执行 scripts.build:pre 命令

pa start --env prod 将执行 scripts.build:prod 命令

其中 scripts 中对应执行的脚本需要各团队根据项目自己的情况自行实现

### 裸小程序项目

如果项目中未使用任何主流框架，则需要将项目的源码部分包含在 `src` 目录下，删除原来的 `project.config.json` 文件，然后现在项目根目录下执行以下命令：

```
  cd project-root
  pa init . -b @pandolajs/pandora-boilerplate-wechat --ignores 'src/**/*' --
```

执行完以上命令，与 src 目录同级将多如下主要文件及文件夹

```
  - .pandora.conf.json        // pandora 配置文件
  - build.config.js           // pandora 小程序构建配置
  - .pandora                  // pandora 私有工作区文件夹，其中包含项目脚本，样本代码模板，以及后续用来存在 pandora 操作时产生的中间文件，缓存等
```
