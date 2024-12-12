---
category:
  - Linux
  - RA2
tag:
  - Wine
  - Bottles
  - 虚拟环境
---

# 在 Linux 中游玩《星辰之光》

## 前言

这篇笔记算是我这阵子折腾 Wine 兼容层的一些小结。

::: important 前排提醒
本篇笔记仅以「星辰之光」这个红警 2 模组作为范例，因为它是我这里最早成功跑起来的红警 2 mod。
对于其他 mod 以及原版红红，乃至于其他游戏和 Windows 程序，本篇笔记的方案可能有一定参考价值，**但不保证能够成功运行**。
:::

::: note 图片大小
本篇笔记的插图原图对于电脑端来说会偏大一些，因此我基本上都做了缩小处理——你可以点击图片查看原图。  
如果您在用移动设备阅读，则这种「缩小」效果可能更明显些。还请见谅。
:::

那么正式开始之前，我有必要先说一下我的 Linux 环境。由于 Linux 发行版众多，我**无法保证别的包源、别的发行版能否这么操作**。

- 操作系统：Arch Linux
- 桌面环境：KDE 6
- 包源：flatpak（我是直接用 KDE 的应用商店，也能搜到）

## 一、Bottles

从头开始折腾 Wine 那不得不说是大工程。虽然 [Arch Wiki](https://wiki.archlinux.org/title/Wine) 对此的介绍相对完备，
但就连爱折腾的我都尝试了小半个月，我想你一定不会喜欢像我一样到处踩坑的。

Bottles 是由 [bottlesdevs](https://github.com/bottlesdevs) 开发的可视化 Wine 配置工具，旨在「让用户便利地在喜欢的发行版里运行 Windows 程序」。实际体验下来，Bottles 创建的 Wine 环境确实可以说开箱即用，但体验算不上多好（毕竟说到底只是「兼容」层）。

参考链接：[GitHub](https://github.com/bottlesdevs/Bottles) [官网](https://usebottles.com/)

### 1.1 获取

Bottles 可从 Flatpak 源获取。Flatpak 的安装可以参见 [FlatHub 的指引](https://flathub.org/setup)，
下面以 Arch 默认的包管理器`pacman`为例：

```zsh
sudo pacman -S flatpak
flatpak install com.usebottles.bottles
```

如果你恰好是 KDE 用户，你也可以从 Discover 软件中心中搜索到：

![Discover 软件中心](kde_discover_bottles_search.webp)

::: tip 下载太慢？试试换源
Linux 的包管理器默认从国外的服务器获取数据，而国外源对于简中网络来说可能并不太友好。  
你可能需要自行了解如何给 flatpak 更换镜像源，或者在使用终端安装 Bottles 之前先设置代理环境变量。
:::

::: details 或者，也可以走代理
成熟的代理软件应提供了「复制环境变量」的功能；若没有，也可以手动粘贴以下代码进终端：
```zsh
export HTTP_PROXY=http://localhost:<port>
export HTTPS_PROXY=http://localhost:<port>
```
记得改代理端口号。系统可不知道你这`<port>`到底是哪个 port（端口）。

如果您选择走代理，那么建议您**全程在终端中安装、运行 Bottles**。因为这软件几乎所有的下崽都要连外服——无论是安装 Bottles 本体，还是往 Wine 环境里安装依赖：

![用「游戏」预设环境建立的 Bottle，有一堆依赖需要下崽](bottle_dependencies.webp)
:::

### 1.2 初次运行

装完之后可以从终端里打开它：
```zsh
flatpak run com.usebottles.bottles
```

初次运行 Bottles 会弹出一个向导跟你 blabla，无脑下一步即可。
到最后一步时 Bottles 会下载额外的图形库文件，由于上面介绍过的原因，这里可能也会花费比较长的时间。

<!-- <img src="./bottles_main.webp" alt="Bottles 主界面" width=50% height=50% /> -->
![Bottles 主界面](bottles_main.webp =65%x65%)

### 1.3 给沙箱「凿个洞」

::: info 沙箱模式
经过一番查证，Flatpak 源的 Bottles 现运行于沙箱模式。在这种模式下除非必要，（否则）轻易不会映射 Linux 的目录结构。
因此，正常 Linux 文件系统对其默认隐藏，导致所谓「懒加载」，以及软链接失效等问题。
:::

话虽如此，根据[官方文档](https://docs.usebottles.com/flatpak/expose-directories)的说法，
我们可以暴露一部分目录给 Bottles，让 Bottles 能识别到这些目录里面的内容。
当然，沙箱之所以为沙箱，就是为了隔离。从这一点出发，用命令行参数直接「家」门大敞可能并不是很 OK。

相比之下，我更倾向于用`Flatseal`工具（同样可以在 Discover 找到）：
```zsh
flatpak install com.github.tchx84.Flatseal
```
装完 Flatseal 之后，「你需要在左侧菜单选中 Bottles，然后往下滚屏到 Filesystem 部分」。  
我只需要暴露一个目录`~/Documents`（你可能更希望暴露`~/Games`，自己新建文件夹去），那么点击「其他文件」的右侧图标，新建一项：

![Flatseal 文件系统管理：Bottles](flatseal_fs.webp =65%x65%)

现在可以浏览指定目录了 ~~，但我并不想更新插图~~。

> [!note]
> 在 Linux 中，`~`和`$HOME`^①^通常指代`/home/<user_id>`，比如`/home/chloridep`。
> 类比下 Win7 的`%UserProfile%`和`C:\Users\chloridep`就知道了。
> 
> ① Linux 的路径是**区分大小写**的，终端里的环境变量（通常全大写）也是。
> ::: center
> YURI.exe &ne; yuri.EXE；$HOME &ne; $home
> :::

## 二、部署

### 2.1 新建 Wine Bottle

进入 Bottles 的主界面，点击「新建 Bottle……」（或者窗口左上角的加号），填些基本信息：

- 名称自拟（为便于说明，后面用`$venv`表示）；
- 预设「环境」建议选「自定义」。

> 应用程序和游戏这两个预设，初次新建 Bottle 时会下载巨量的依赖。
> 如果你网不是特别好，也没走代理，直接「自定义」就可以了。

- 兼容层，或者说「运行器」选「sys-wine-...」（以最新版为准）

> 如果你选了「游戏」预设，这里是改不了兼容层的。你得等创建好 Bottle 之后进设置再改。

- Bottle 目录可改可不改（为便于说明，后面用`$bottles`表示）。

> 默认你的环境位于`~/.var/app/com.usebottles.bottles/data/bottles/bottles`这么深的位置。

> [!warning]
> 如果你在全局设置里改过默认目录，千万不要在新建这里又改到同一个位置，否则会报**符号占用，创建失败**。

![新建 Bottle](bottles_new_venv.webp =65%x65%)

然后在右上角点击「创建」即可。

### 2.2 搭建游戏环境

把你的「星辰之光」游戏目录复制进 1.3 小节暴露给 Bottles 的目录。

::: details 为「文档」目录建立软链接
上面 1.3 小节中我把「文档」目录暴露给 Bottles，但沙盒运行的 Bottles 仍会自行建一个空的`Documents`。
为此，可以把`~/Documents`链接到 Wine 虚拟环境的用户目录下，充当虚拟环境的用户「文档」目录。
```zsh
# 切去 *我的* 默认 Bottles 目录
cd $bottles
# 进入 Win 用户目录（假定我的用户名叫 chloridep）
cd $venv/drive_c/users/chloridep/ && ls -l
rm -r Documents  # 移除掉默认建立的空「文档」目录
ln -s ~/Documents Documents  # 把我的「文档」目录链接过去（前提是 1.3 小节给沙箱「凿」了这个洞）
```
对于「文档」目录的链接，Bottles 可能会映射为`Z:`里的同路径目录，也可能直接取用根目录`/`去映射。
但无论如何，对「洞」本身的软链接并不影响 Bottles 识别里面的文件（夹）。

<!-- > [!note]
> 尽管我非常推荐用「软链接」为不同 mod 的公共游戏文件（比如说`ra2md.mix`）去重，
> 但很遗憾，沙盒 Wine 环境对软链接的支持并不尽人意。
> - 若链接指向的文件（夹）并**不在「洞」中，软链接不会被 Bottles 映射**，在 Wine Explorer 里直接「查无此人」；
> - 若链接的目标**在「洞」中，或是打的「洞」本身，软链接会被直接映射为目标文件（夹）**。
>   `explorer`里删除软链接，实际上是直接删除「目标文件」，而 Linux 系统里软链接仍然存在。
> - `mklink`命令无法建立软链接，哪怕这条命令运行起来看似没有错误；
> - 《尤里的复仇》游戏引擎`gamemd.exe`无法读取被映射的文件，运行表现为「请重新安装」报错（即找不到那些文件）。 -->
:::

然后点开你刚建好的 Bottle 进入详情页，为客户端`Extreme Starry.exe`设置快捷方式，这样就不需要每次都「运行可执行程序」找半天了。  

![Bottle 详情](bottle_preferences.webp =65%x65%)

> [!tip]
> 在「选择可执行文件」对话框中，若找不到 exe，请在「过滤」那里改为`Supported Executables`。

::: details 关于 Main Client executable not found! 报错
如果你按照前面 1.3 和 2.2 两个小节的指引，启动 XNA 客户端仍然报下面这个错误：

![Main Client executable not found!](client_not_found.webp)

那么不妨手动指定启动器的「工作目录」。

![在右侧展开快捷方式菜单，点击「更改启动选项」](client_not_found_so1.webp =75%x75%)

![更改「工作目录」](client_not_found_so2.webp =75%x75%)

> [!important]
> 无论客户端是选`Extreme Starry.exe`还是直接选择`Resources/client*.exe`，
> 你的「工作目录」都应该**选择「游戏目录」**（也就是`gamemd.exe`所在目录）。
:::

### 2.3 Bottle 选项

还是点进 Bottle 详情页，点开设置：

1. 需要开启 DirectX 翻译——将「组件」部分的 DXVK 和 VKD3D 打开；
2. 可以考虑在「显示」部分启用独立显卡（我的笔记本没有捏）；
3. 「性能」部分的「同步」可以考虑 Fsync，除此之外的选项建议不动；

做完设置，把依赖装上：

::: note 推荐依赖

- 客户端需要：`mono` (Wine mono .NET 依赖) （耗时较长，建议最后安装）
- 中日韩字体：`cjkfonts`（避免「口口文学」）

> 你也可以手动下载（或复制 C:\Windows\Fonts 里的）msyh.ttc 和 simsun.ttc，
> 并复制到 $bottles/$venv/drive_c/windows/Fonts 里。

- N 卡推荐：`physx`
- 游戏本体需要：`cnc-ddraw`
- Reshade 特效层需要：`d3dcompiler_*.dll` `d3dx*`

> 这里的 * 代表全都要，比如 d3dx11 和 d3dx9。
<!-- - gdiplus -->
:::

## 三、开玩

在做完全部配置之后，点击你建过的快捷方式右边的`▶`图标，开耍。……虽然，读条可能会比较慢。

![在 Arch 里游玩「星辰之光」（图为尚处内测的萌 03）](linux_bottles_ES.webp)

::: info 再次启动客户端没有反应
可能是因为进程还驻留在 Wine 环境当中，需要「强制停止所有进程」手动干掉：

![位于详情页标题栏的「电源」图示](bottle_kill_proc.webp =103x87)
:::

<!-- ## 补充：手搓一个 Ares 启动器

> [!warning]
> 我个人不推荐那种把批处理「打包」成 exe 的启动器。谁知道 Wine 兼容层会如何执行这个批处理呢？

比起用编程手段，我个人更倾向于 WinPE Command（即 PECMD）。
PECMD 这东西，国内的 WinPE 几乎都在用，你可以轻易获取到；另一方面，PECMD 自身预留了空位，非常方便你嵌入自定义脚本。

::: details 小小感慨
听说无忧论坛甚至兴起了「PECMD 编程」，甚至还有卖课的。但说到底 PECMD 也不过是大量调用了 WinAPI 而已。  
呵，不由想到，若是我当年弄清楚了`CALL`命令如何调用`WritePrivateProfileStringW`写 INI，说不定也不会有学习编程和计算机的兴趣。
那我可就真莫得一技之长了（笑）

不过现在搞懂了：
```
CALL $--ret:success kernel32.dll,WritePrivateProfileStringW,ChlorideP,FullName,Kariko Lin,%CurDir%\ssks.ini
//MESS %success%
```
等价于以下 C 实现：
```c
#include <stdbool.h>
#include <windows.h>

int WINAPI WinMain(HINSTANCE hIns, HINSTANCE hPrevIns, LPSTR lpCmdLine, int nCmdShow)
{
  bool success = WritePrivateProfileStringW(
    "ChlorideP", "FullName", "Kariko Lin", "./ssks.ini");
  //MessageBox(NULL, (LPCTSTR)&success, (LPCTSTR)" ", NULL);
  return 0;
}
```
:::

1. 从随便哪个 WinPE 中提取出 PECMD.

> 微 PE 可以说是获取成本最低的 WinPE 了罢。足够小，下载也够快。
> 其安装包本身其实就封装了 PE 的镜像，可以通过 7-Zip 右键打开，进入`Windows\System32`里面找出`pecmd.exe`。

2. 用 Resource Hacker 编辑 PECMD.
  - 在左侧依次点开`SCRIPT` `101: 2052`；
  - 在右侧的空白处敲下`LOAD %CurDir%\syringe-launch.wcs`；

  > 你也可以直接把第 3 步的命令复制粘贴进去，但万一哪天你想改呢？

  - 在工具栏点击`▶`编译资源，然后`Ctrl-S`保存。

3. 新建一个文本文件，就叫`syringe-launch.wcs`，与`pecmd.exe`放在一起。

> Windows 系统请注意「隐藏文件扩展名」这设置有没有开。可别弄成`syringe-launch.wcs.txt`。  
> 顺带一提，`.wcs`是 PECMD 自己推荐的扩展名。

然后复制以下命令：
```
EXEC %CurDir%\Syringe.exe "gamemd.exe" -SPAWN -LOG -CD -SPEEDCONTROL
```
于是启动器就做好咯。 -->
