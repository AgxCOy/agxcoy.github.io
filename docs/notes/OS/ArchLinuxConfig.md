---
category:
  - 操作系统
  - Linux
tag:
  - Arch Linux
  - KDE
---

# Arch Linux 个人配（调）置（教）小贴士

[书接上回](ArchInstall.md)，指南写着写着发现能聊的点子还挺多的。这一篇就主打日常使用了。  
仍然与上篇一样，我默认讨论的是 KDE 桌面环境。

## 应用程序问题

::: important 邦不住辣
嗯呢，嗯呢嗯呢～（主要记录一些经常遇到的问题，以及有效的暂行办法喵～）  
嗯呢、呢，嗯呢……（有些问题可能随时间推移会有更好的解法、甚至不再出现，还请原谅我更新得比较慢辣……）  
嗯！嗯呢！（当然！有需要的话可以提 Issue、Pull Request 告知我的喵！）

> 注：笔者并未玩过《绝区零》。只是觉得群友模仿邦布很可爱，也「鹦鹉学舌」几句。
:::

### LinuxQQ 登录界面一片空白

之前 chamber777 就报告过「更新`linuxqq-4:3.2.9_24568-1`打开程序后（登录）界面全空，什么都不显示」；
而今我没在 QQ 里安装更新，却在`paru -Syu`更新 KDE Plasma 软件包之后出现了同样的状况。

经 Flysoft 排查，发现`libssh2.so`未能加载。因此在终端里手动加载该库：
```bash
env LD_PRELOAD="/usr/lib/libssh2.so" linuxqq
```
或者，可以编辑开始菜单的 QQ 快捷方式（`qq.desktop`）：  
右键「编辑应用程序」，在「应用程序」页里粘贴`LD_PRELOAD="/usr/lib/libssh2.so"`环境变量。

## GPG 密钥相关

主要是折腾提交签名（Commit Signing）时遇到的问题。

### i. VSCode 提交签名
大体上跟着 [Commit Signing - VSCode Wiki](https://github.com/microsoft/vscode/wiki/Commit-Signing) 就可以了。唯一需要留意的是`pinentry`。

VSCode 的主侧栏「源代码管理」页提交时并不会走终端，也就莫得 pinentry 的 CUI；莫得 pinentry 输密码验证，提交就签不了名。
虽然有人好像搞了个`pinentry-extension`出来，但 6 月初我去看的时候它连说明书都莫得，也没有上架，那用集贸。

所以我选择编辑`~/.gnupg/gpg-agent.conf`：
```properties
default-cache-ttl 28800
pinentry-program /usr/bin/pinentry-qt
```
保存后重启`gpg-agent`：`gpg-connect-agent reloadagent /bye`。

虽然这么搞反倒在 SSH 上用不了了，但我平时还是用 KDE 图形界面比较多。

### ii. GPG 密钥备份（导出导入）
之前并没有意识到备份 key 的重要性，结果重装 Arch 重新配置提交签名时，
我发现 GitHub 和腾讯 Coding 会重置提交验证（同一个邮箱只能上传一个公钥），届时就是我痛苦的 rebase 重签了。
~~不过好在受影响的多数只是我的个人项目，变基无伤大雅。~~
```bash
gpg --list-secret-keys --keyid-format LONG
# export
gpg -a -o public-file.key --export <keyid>
gpg -a -o private-file.key --export-secret-keys <keyid>
# import
gpg --import ~/public-file.key
gpg --allow-secret-key-import --import ~/private-file.key
```
重新导入 Key 之后，可能还需要`gpg --edit-key`更改密码（`passwd`）、重设信任（`trust`）。

## Linux Shell 相关
Shell 编程说实话也是一门学问，但这里只讨论两个东西，别名`alias`和函数`function`。  
你可以把需要简记、快速调用的东西包装成别名或者函数，写进`~/.bashrc`（或者`~/.zshrc`，如果你换用 zsh 的话）。

### i. 别名
语法很简单：`alias a="b"`。注意等号两边**没有空格**。

> [!note]
> 单引号也可以。区别在于，双引号会「翻译」里面的变量。  
> 比如`alias osf="$HOME/.osf/facetracker.py"`会把`$HOME`翻译成具体的家目录路径，如`/home/chloridep`。

你可以为内置命令附加一些特性，像默认的`.bashrc`有这么两条：
```bash
alias ls='ls --color=auto'
alias grep='grep --color=auto'
```
也可以「化繁为简」，把路径比较长的脚本、打字起来比较长的命令缩短成别名：
```bash
alias pac='sudo pacman'  # 对标一下 yay paru（
```
然后你就可以用`pac -S wine`代替`sudo pacman -S wine`了。

### ii. 函数

Shell 的函数是这么写的：
```bash
function func-name() { }
```
函数适合「批处理」这种需要执行多条命令的场景。~~当然你也可以写`if`判断和`for`循环。但这不是重点。~~
目前来说，我只为了启动 OpenSeeFace 面捕 ~~（唉，皮套壬）~~ 写了个函数：

> 关于面捕和 Live2D 皮套，参见
> [Running VTS on Linux - Vtube Studio Wiki](https://github.com/DenchiSoft/VTubeStudio/wiki/Running-VTS-on-Linux)

```bash
function start-facetrack() {
  # 记录当前目录
  curpath=$(pwd)
  # 切到 OSF 里用 Python 虚拟环境运行面捕
  cd ~/OpenSeeFace
  source .venv/bin/activate
  python facetracker.py  -W 1280 -H 720 --discard-after 0 --scan-every 0 --no-3d-adapt 1 --max-feature-updates 900 -c 0
  # Ctrl-C 退出 Python 进程后，离开虚拟环境
  deactivate
  # 从 OSF 返回当前目录
  cd $curpath
}
```

更多细节（比如说如何传参），还请移步[菜鸟教程](https://www.runoob.com/linux/linux-shell-func.html)。

### iii. 脚本
正如 Windows 能自动识别`%WinDir%`里面的程序和脚本，并在`cmd`中轻易地调用那样，你也可以把一些脚本置于（或者软链接到）`bin`目录中：
- 对所有用户：`/usr/local/bin`
- 对当前用户：`~/.local/bin`

> [!warning]
> 不建议直接塞进`/usr/bin`。若是哪天有个软件包跟你的脚本重名了，而你恰需要安装它，这时候 pacman 就报“文件占用，安装失败”咯。

然后简单说说脚本本身。脚本本身需要赋予「可执行」权限（软链接则对指向的原件赋权），并且在文件开头指定是用什么解释器运行的：
```bash
#!/usr/bin/bash
```
```python
#!/home/chloridep/openseeface/.venv/bin/python
```
然后便可以在终端调用这些脚本了。
```bash
$ where facetracker
/home/chloridep/.local/bin/facetracker
$ facetracker -W 1280 -H 720 --discard-after 0 --scan-every 0 --no-3d-adapt 1 --max-feature-updates 900 -c 0
```

## 运行 Windows 程序

总的来说，两种办法：虚拟机，或是 Wine、Proton 等兼容层。~~当然，直接物理装 Windows 也行。~~

如果你想玩虚拟机，可以移步 [winapps](https://github.com/winapps-org/winapps) 项目。我这边因为 RDP 连接失败，只好放弃。当然传统的 VMWare、VirtualBox 也是不错的选择。  
而若是想折腾 Wine，可以参见我另一篇笔记：[在 Linux 中游玩「星辰之光」](../RA2/ExtremeStarryInLinux.md)。当然也可以依照律回指南推荐的，考虑用 Bottles。这里不再赘述。

> [!note]
> bottlesdev 官方推荐装 Flatpak 版本的 Bottles。但 Flatpak 软件一般是装在沙盒里运行的，
> 这意味着需要 Flatseal 等额外措施去暴露一些目录给沙盒里的 wine 容器做数据交换。
>
> 此外，沙盒的隔离特性还容易出现「懒加载」的问题。经测试发现，单文件 exe 才可以在「懒加载」情况下直接启动。
> 但凡需要读同级文件、子文件夹的，都需要在 Bottle 里添加快捷方式，并在快捷方式的设置里手动指明工作目录。
>
> 弃用后偶然发现 archlinuxcn 源里也有 Bottles，至于它是否沙盒运行，以及上述问题能否得到解决，还有赖进一步测试。

## 系统美化

> “爱美之心，人皆有之。”

> [!tip]
> - **风格统一**是「美观」的必要条件。
> - 少搞「侵入性」美化。或者说，需要**修改系统文件、注入系统进程、破坏系统稳定的美化尽量少做**。
> - **谨遵发布页面附送的安装指引**（KDE、GNOME 主题可以参考项目 GitHub），否则可能安装不全。

### i. 主题
主题这边我也没啥好推荐的，虽然 KDE 6 现在也出现了一些比较好看的主题，但终究是因人而异吧。

我想说明的是，KDE 商店的多数主题在 **X11 会话、125% 甚至更高缩放率**下会出现「非常粗窗口边框，使我的窗口肥胖」的现象（至少我的笔记本如此）。  
我个人目前是直接修改主题 Aurorae 配置文件，利用二分法逐步找到四条边的最适 Padding。
网上貌似也有「把缩放调回 100%，但是更改字体 DPI」的做法，但个人觉得显示效果应该好不到哪去（

### ii. 仿 Mac 上下双栏布局
KDE 原生的桌面 UI 就挺 Windows 的，但胜在自由度足够高。
我**个人觉得** Mac OS 那种双栏比较好看、比较方便，所以稍微按照如下配置调整了面板布局。

仅供参考咯。

::: details Dock 栏
即原本的任务栏。
- 位于底部、居中、适宜宽度、取消悬浮、避开窗口
- 除「图标任务管理器」外，其余组件全部移除。
:::

::: details Finder 栏
即「应用程序菜单栏」（可在「编辑模式—添加面板」处找到）
- 位于顶部、居中、填满宽度、取消悬浮、常驻显示
- 自左到右依次为：
  - 应用程序启动器（类比开始菜单）
  - 窗口列表
  - 全局菜单（默认提供）
  - 「面板间距」留白
  - 数字时钟
    - 日期保持在时间旁边，而不是上下两行
    - 字号略小于菜单栏高度，凭感觉捏
  - 「面板间距」留白
  - 系统监视传感器
    - 横向柱状图（平均 CPU 温度、最高 CPU 温度）
    - 仅文字（网络上行、下行速度；网络上传、下载的总流量）
  - 系统托盘
:::

除了 Finder 栏外，可以在系统设置里更改屏幕四周的鼠标表现。
比如，鼠标移动到左上角可以自动弹出「应用程序启动器」，移到右上角可以切换你的桌面，等等。
