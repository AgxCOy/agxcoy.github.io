---
category:
  - 操作系统
  - Linux
tag:
  - Arch Linux
  - KDE
  - Wayland
  - X11
star: true
---

# Arch Linux 个人安（折）装（腾）流程
<!-- https://www.glowmem.com/archives/archlinux-note -->
<!-- https://arch.icekylin.online/guide/-->

::: details 我选择 Arch 的理由
只能说比起 M$ 如今「Windows 即服务」的理念，我还是更倾向于把操作系统当作纯正的工具。哎，果然还是怀念 Win7 啊。

Ubuntu 我也试过，开箱即用，很不错。而真正决定装 Arch、当作日常系统的理由，可能还是这句话吧：

> 「缘，妙不可言。」

去年（2023）尝鲜 Ubuntu 的时候也有群友撺掇我装 Arch，但查官网 Wiki 发现每一步都要命令行手操，很担心翻车，就拒了；
今年则因为一些契机偶然认识了一群可爱的开发者，正好其中有一只（？）邀请我试「玩」Arch。「玩」我肯定有兴趣，更别说 Ta 还贴了指南给我。

当然，能够放心上 Arch 还有另一重原因：Moonlight 串流证实可行，因此我早就把大部分负载迁移到受控主机上了。就算真的翻车了，也不会对我造成严重损失。
:::

其实这篇笔记说是「流程」，更像是「避坑指南」。因为文中大部分实际操作步骤都是直接贴的参考外链。
我只是为了补充些注意事项，免得以后重装起来忘掉而已。

> [!important]
> 由于 Arch 更迭速度比较快，下面的参考链接以及这篇笔记本身的内容可能随时失效。  
> 在安装、使用过程中遇到的，这里没有提及的问题，还请自行 Google、Bing 或 Baidu。
> > 话虽如此，我还是会尽量保持本文的更新；如有需要，也可以[提 Issues](https://github.com/ChlorideP/ChlorideP.github.io/issues)。
>
> 如果你觉得 Arch 滚动更新很累、玩不太明白，不妨还是先上手`Pop!_OS`或者`Ubuntu`。
>
> 此外，也可以多多留意其他人总结的 Arch 折腾小技巧，说不定会有意外收获。

## 参考链接

本文有参考以下两篇安装教程：

1. [律回彼境：Arch Linux 折腾指南&记录](https://www.glowmem.com/archives/archlinux-note)（以下简称「律回指南」）
2. [Nakano Miku：Arch 简明指南](https://arch.icekylin.online/guide/)（以下简称「Miku 指南」）

我的笔记**以律回 MelodyEcho 的流程为主**，偶尔穿插一下 Miku 指南。

## 零、前期准备

这部分无需赘述，主要工作就是**下载 Arch 安装镜像**，并把它**刻录到 U 盘里**。
网上对此已有很多成熟的教程，恕不在这里浪费时间了。但有两件事稍微还是要注意一下。

首先是主板设置^1^。如今的主板应该都允许使用 UEFI 了，故本篇笔记也不会考虑传统 BIOS 引导，你需要**确保主板是 UEFI 启动**；
除此之外，**需要关闭「安全启动」**（Secure Boot）。该措施系 Windows 内核加载的一种保护机制，但 Linux 的启动文件一般莫得微软签名。

其次是你的 WiFi 名字^2^。在 Arch 的 LiveCD（维护环境，下同）里，大部分安装步骤都需要手敲命令来完成，并且**无法输入、显示中文**。
如果你打算用 WiFi 连接，不妨提前更一下名。

## 一、联网并设置时区

U 盘启动 PE 相信很多人都操作过，或者看过教程。LiveCD 也是这么启动的。但与 Ubuntu 可选联网不同，Arch 的安装**必须联网**。  
本章可直接阅读律回指南[第一章「连接网络和时区配置」](https://www.glowmem.com/archives/archlinux-note#toc-head-2)。直至 6 月初此法仍然可用（

## 二、硬盘分区、格式化和挂载

我目前与律回一样采用`ext4`文件系统，相应地快照用的是`RSYNC`。你也可以试试 Miku 指南介绍的`Btrfs`分区方案：

- :new: [全新安装](https://arch.icekylin.online/guide/rookie/basic-install-detail#%F0%9F%86%95-%E5%85%A8%E6%96%B0%E5%AE%89%E8%A3%85)
- [7. 分区和格式化（使用 Btrfs 文件系统）](https://arch.icekylin.online/guide/rookie/basic-install.html#_7-%E5%88%86%E5%8C%BA%E5%92%8C%E6%A0%BC%E5%BC%8F%E5%8C%96-%E4%BD%BF%E7%94%A8-btrfs-%E6%96%87%E4%BB%B6%E7%B3%BB%E7%BB%9F)

> 我个人不太喜欢 Miku 把 EFI 分区和其他 Linux 分区拆开讲解。  
> 但「分区是这样的。Kariko Lin 只需清空硬盘全新安装就可以，而 Miku 演示双系统要考虑的情况就很多了」。

::: details 补充一下律回的 fdisk 操作流程
> 注：下列内容也只考虑「全新安装」。

首先需要知道你要操作哪块硬盘：`lsblk`命令可以以树形结构呈现出当前都连着什么硬盘，都分了什么区。

![lsblk](lsblk.webp)

然后`fdisk /dev/<disk_id>`进入操作控制台。比如上图那块 M.2 就`fdisk /dev/nvme0n1`。  
在控制台里可以敲`m`看帮助。清空重新分区大致的操作如下（是的，都是单字母喔）：

- `g`：新建 GPT 分区表。
- `d`：如果你不想动分区表，那么就用 d 一个一个删除分区吧。
- `n`：用 n 逐个添加新分区。

> 其中，`n`之后需要指定这是第几个分区（理论上可以做到「插入」分区），以及分区多大。  
> 分区的大小默认用扇区表示。你可以改用`+120G` `+256M` `+512K`这种我们更熟知的`GB` `MB` `KB`单位。  
> 如果你原先的硬盘不是「未分配」状态（也就是使用过，分过区），那么新建时可能会提示你删除文件系统标识。`y`允许即可。

> 建议以「EFI、SWAP、系统分区」这样的顺序新建分区。因为 Linux 引导文件必须放置在磁盘靠前的扇区位置。

- `w`：保存并应用分区表更改。DiskGenius 改分区也不是设置完立马生效的嘛。

:::

完事了格式化、挂载文件系统即可。两篇指南对此都有叙述。

## 三、安装系统

我个人偏向于律回指南。但在正式安装之前，还有一些事要做。

### 3.1 pacman 镜像源配置

Linux 的包管理器默认用的国外的软件源，`pacman`也一样。因此，非常建议先换用国内镜像，加快包下载速度。

编辑`/etc/pacman.d/mirrorlist`（`vim`还是`nano`请自便）：
```ini
# 在文件开头起一空行，复制下列镜像源：
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.ustc.edu.cn/archlinux/$repo/os/$arch
Server = https://mirrors.aliyun.com/archlinux/$repo/os/$arch
```
> [!tip]
> 变更后的`mirrorlist`会在 Arch 安装过程中被复制过去。这样后续就不需要再做一遍换源了。

### 3.2 包管理器配置
默认`pacman`是逐个下载软件的。但哪怕是 1MB/s 小水管，并行下载四、五个软件包也绰绰有余了。

编辑`/etc/pacman.conf`：

1. 找到`# Misc options`，删掉`Color` `ParallelDownloads = 5`前面的注释`#`：
```ini
# Misc options
#UseSyslog
Color            # 输出彩色日志
#NoProgressBar
CheckSpace
#VerbosePkgLists
ParallelDownloads = 5   # 最大并行下载数（根据你的网速自行斟酌，不建议写太大）
```

2. 翻页到文件末尾，删掉`[multilib]`和底下`Include =`这两行的注释`#`。
> `multilib`是 32 位软件源。默认下载的包都是`x86_64`的，而有一些程序仍需要 32 位的库。

> [!note]
> 很遗憾，经实测 pacman 配置并不会复制过去。在安装完系统`arch-chroot`进去进一步配置时，你需要重复做一遍上述操作。

### 3.3 正式部署

在换源、调整设置之后，`pacman -Sy`更新软件库，然后你就可以安装最新版的 Arch Linux 了。  
具体的安装步骤参见律回指南的[第三章「安装系统」](https://www.glowmem.com/archives/archlinux-note#toc-head-4)
和[第四章「系统基本配置」](https://www.glowmem.com/archives/archlinux-note#toc-head-5)两章。以下仅作补充。

> [!note]
> 确保`pacstrap`只执行一次——我不清楚重复刷入系统会不会误覆盖些啥东西。

::: warning AUR 助手
这里千万不要提前装`yay` `paru`等 AUR 助手——`archlinuxcn`源还没配置，并且配置 CN 源略麻烦。
:::

## 四、系统基本配置
跟着律回指南的三、四章装好系统之后，重启登入新系统的终端。你现在应能通过`nmtui`连上 WiFi 了。

### 4.1 CN 源和 AUR 助手
在联好网的新系统里配置`archlinuxcn`源：`sudo nano /etc/pacman.conf`
```ini
# 末行添加
[archlinuxcn]
Server = https://mirrors.tuna.tsinghua.edu.cn/archlinuxcn/$arch
```
并安装 CN 源的签名密钥和 AUR 助手：
```bash
sudo pacman-key --lsign-key "farseerfc@archlinux.org"  # 为密钥环添加本地信任
sudo pacman -S archlinuxcn-keyring  # 安装密钥环
sudo pacman -S yay paru   # 安装 AUR 助手
```
::: info 关于本地信任 Key
简单来说就是给 CN 源密钥环签名的`farseerfc`他的 Key 掉信任了，包管理器「不敢」安装这个密钥环^2^。

事实上，我是通过更笨（也不推荐）的办法装上密钥环的——在刚刚编辑的`/etc/pacman.conf`里**临时**给`[archlinuxcn]`手动添加签名等级：
```ini
SigLevel = Optional TrustAll
```
但这样在安装密钥环时会有警告，所以装完之后我又把`SigLevel`给`#`注释掉了。
:::

### 4.2 硬件（一）音频安装

音频分为固件（或者说驱动）和管理套件两部分：
```bash
# 音频固件
sudo pacman -S sof-firmware alsa-firmware alsa-ucm-conf
# pipewire 及其音频管理套件
sudo pacman -S pipewire gst-plugin-pipewire pipewire-alsa pipewire-jack pipewire-pulse wireplumber
```
::: details wireplumber
> 律回指南里安装的`pipewire-media-session`最近提示「即将过时」，于是我换用`wireplumber`，全面使用 pipewire 音频管理了。

需要指出的是，`wireplumber`最近（应该说持续一个多月）出现「进桌面没有声音」的现象。  
我是 KDE 配 SDDM（在论坛里找到的「病友」多为 GDM），详细症状如下：

- 刚登进桌面，音量栏目里设备没被静音，无论如何拖曳音量条，就是听不到；
- 通过接入（或移除）音频外设可使设备恢复正常。  
  比如开机时接入了 3.5mm 耳机，那么进入桌面后需要拔插一下，耳机才有伸音。

对此，英文论坛里某位「脚本仁兄」给出了如下方案：
```sh
#!/bin/sh
pactl set-sink-mute 0 toggle  # 静音
pactl set-sink-mute 0 toggle  # 重置，也就取消静音
```
但仅仅对刚登入桌面时的音频设备有效。比如，插入耳机之后，耳机无声；拔出耳机之后，扬声器无声；再次拔插，耳机和扬声器才都有伸音。

据 GitLab 那边的反馈似乎得等到八月中旬才方便修，那我还是考虑 pulseaudio 罢。
:::

::: info pulseaudio
除了 pipewire 音频方案之外另有`pulseaudio`可供选择。但务必注意：音频管理套件**只能二选一，不可以混装**。

另外，由于 pipewire 本身不单只负责音频管理的工作，如需装 pulseaudio 仍需安装`pipewire` `gst-plugin-pipewire`两个包。  
相应地，其余的包可换用如下平替：

- `pipewire-alsa` → `pulseaudio-alsa`
- `pipewire-jack` → `jack2`
- `pipewire-pulse` → `pulseaudio`
- `wireplumber` → `pipewire-media-session`【Deprecated】

> 由于 pipewire 那边有 wireplumber 代替 pipewire-media-session，所以这个包被他们自行标记为「过时」。  
> 但 pulseaudio 仍需要这个包。
:::

显卡、蓝牙等其他硬件设施需要在装好桌面环境后再考虑。至少**到本小节为止你的系统里并没有蓝牙服务**，无法启用。

## 五、KDE 桌面环境

跟完我的第三章，律回指南的三、四章，还有我的第四章之后，你便拥有了一个无 GUI 的终端 Arch 系统。
但作为日常使用的话，图形桌面肯定必不可少。

本文与那两篇参考外链一样**采用 KDE 桌面环境**。当然除了 KDE 之外，你也可以考虑 GNOME 桌面环境 ~~（只是我用腻了）~~；
也可以考虑散装方案（比如`hyprland`~~，只是我没装成功~~）。

::: info KDE 6 vs KDE 5？
目前最新版本为 KDE 6。但律回指南发布于 23 年 11 月，介绍的是 KDE 5。

话虽如此，倒也不必惊慌。`pacman`以及`yay` `paru`之流均**默认安装最新版**，以下**安装 KDE 5 的步骤仍可用于安装 KDE 6**：
```bash
# 分别安装 xorg 套件、sddm 登录管理器、KDE 桌面环境，以及配套软件
sudo pacman -S xorg
sudo pacman -S plasma sddm konsole dolphin kate okular spectacle partitionmanager ark filelight gwenview
# 启用 sddm 服务，重启进 SDDM 用户登录
sudo systemctl enable sddm
sudo reboot
```
:::

重启后在用户登录界面输入密码回车，恭喜你，距离投入日常使用只剩几步之遥了。之后对 KDE
和系统的配置**大部分**仍可参考律回指南的[第六章「桌面环境配置」](https://www.glowmem.com/archives/archlinux-note#toc-head-7)。

### 5.1 关于 Wayland 和 X
KDE 的图形实现默认已经是 Wayland 了。在开机后输入用户密码的界面处，找找屏幕边角，你可以看到默认选用`Plasma (Wayland)`。
点击它，你可以选择换用`Plasma (X11)`。  
尽管 X11 有个「锁屏黑屏」的问题，但目前来说我还是推荐换回 X11。

::: details 个人的使用体验
首先说说 X11 的「锁屏黑屏」。KDE 的默认 Breeze 主题锁屏时大概率会出现黑屏、惟有鼠标的现象。在 7 月中旬时已经发现该现象已经蔓延到自定义主题了。查了下 Google 以及 Arch、Manjaro、KDE 的一些讨论帖，均没有有效的解决方案。

在寻求解法无果之后，我一度转向了 Wayland。但新生的 Wayland 说实话还有很长的路要走：
- 部分 Electron 应用需要借助`~/.config/xx-flags.conf`手动添加 Wayland 支持：
  ```ini
  --enable-features=WaylandWindowDecorations
  --ozone-platform-hint=auto
  --enable-wayland-ime
  ```
  像`google-chrome`就需要`chrome-flags.conf`来保证能够正常按 125% 倍率缩放。
- 另有一些应用 125% 缩放后可能会有偏移，例如 OBS Studio 调整场景构成的时候，鼠标需要左移一些才能选中它，更遑论拖曳缩放了。
  当然此现象可以通过最大化窗口缓解。
- 部分 GUI 功能尚未适配 Wayland，可能不可用甚至闪退：像 LinuxQQ 的截图键、VSCode 的 GlassIt-Linux 窗口透明插件，等等。

说实话锁屏界面的其他功能（睡眠、锁屏、切换用户）我都用不上。就算黑屏，我也可以直接盲打密码、回车解锁。至少解锁之后画面能出来。  
于是在安装 GlassIt 插件之后，最终我还是换回 X11 了。
:::

### 5.2 硬件（二）显卡驱动与蓝牙

> 「so NVIDIA, F**K YOU! 」—— Linus Torvalds

AMD 或 NVIDIA 显卡可参见律回指南[6.4 小节「显卡驱动安装」](https://www.glowmem.com/archives/archlinux-note#toc-head-11)
和 Miku 版指南的[新手进阶—显卡驱动](https://arch.icekylin.online/guide/rookie/graphic-driver.html)篇。
但我是锐炬核显捏，只需要在 Konsole 终端里`sudo pacman -S`安装图形 API：

- `mesa` `lib32-mesa`（OpenGL）
- `vulkan-intel` `lib32-vulkan-intel`（Vulkan）
- `intel-media-driver`（VAAPI 解码器，OBS 需要）

如果有蓝牙的话，在 Konsole 里启用（并立即启动）蓝牙服务：
```bash
sudo systemctl enable --now bluetooth
```
> 之前误以为`bluetooth`是 Arch 本身就有的服务，查阅 Miku 版指南结合实测发现是 KDE 提供的。

### 5.3 额外中文字体和输入法

律回指南安装的字体分别是 Noto 系列（Linux 常用的 Unicode 字体）和思源系列（也算是 Noto 系列的子集）。
其中 Noto 系列的汉字部分由于一些神秘的原因，渲染出来只能说……能用。

::: info 参考资料
- [Arch Wiki：关于中文字被异常渲染成日文异体字的说明](https://wiki.archlinux.org/title/Localization/Simplified_Chinese#Chinese_characters_displayed_as_variant_(Japanese)_glyphs)^2^
- [Arch CN BBS：noto-fonts-cjk 打包变化可能导致的回落字体选取问题](https://bbs.archlinuxcn.org/viewtopic.php?pid=60100)^2^
:::

Miku 版指南则建议额外安装文泉驿字体`wqy-zenhei`^extra^，但我个人觉得这个字体笔划太细。
我目前在用小米那套`misans`^aur^，想「遥遥领先」也可以试试鸿蒙字体`ttf-harmonyos-sans`^aur^。

> 7 月初再重装时发现`misans`包会卡在解包—构建的死循环，后面改为手动安装`ttf-misans` `otf-misans` `misans-fontconfig`。

::: note fontconfig
由于`misans`安装时会连带安装`misans-fontconfig`，变相帮你配置 fontconfig（文泉驿也是一样），
因此相当长的一段时间内我很自然地忽略了它，并从其他主观猜测的角度对 Noto 系列字体和鸿蒙字体抱有微词。~~当然现在已经纠正了。~~

如果您希望食用 Noto 系列字体、鸿蒙字体，或是其他没有特别适配的字体，还请**注意在安装完成之后另行配置 fontconfig**。
:::

至于输入法，律回指南推荐安装搜狗拼音`fcitx-sogoupinyin`^aur^，
但它在星火 Wine 版网易云里似乎无法调出来，最近也无法安装（会卡在`build()`开头）：
```bash
tar (child): data.tar.gz: Cannot open: No such file or directory
```
Miku 指南的[输入法介绍](https://arch.icekylin.online/guide/rookie/desktop-env-and-app.html#_10-%E5%AE%89%E8%A3%85%E8%BE%93%E5%85%A5%E6%B3%95)则推荐直接安装`fcitx5`。

::: warning 可能的版本冲突
若先前配置搜狗拼音失败，你需要排查并移除已经安装的 Fcitx 4 组件，它与`fcitx5`冲突：
```bash
# 查询本地（local）已安装的软件库
sudo pacman -Qs fcitx
# 逐个移除，以 fcitx 为例
sudo pacman -R fcitx
```
不用递归移除`-Rs`的原因是，递归可能移除掉你不希望干掉的包依赖。
:::

---

至此，Arch 的安装告一段落，你可以像捣腾 Windows 那样玩转 Arch 了。  
日常使用的一些注意事项我会贴在下一篇[「配置指南」](ArchLinuxConfig.md)中，就不在这里占用太多篇幅了。
