---
category:
  - 操作系统
  - Linux
tag:
  - Arch Linux
  - Grub
  - UEFI
  - UKI
---

# Arch Linux 启动二三事

由于我对 Linux 乃至整个 UEFI 加载机制尚且「浅尝辄止」，本文并不会展开很多硬核内容，只是对我个人使用过的启动方案做个总结。

此「实验」原本只是[《Arch Linux 配置小贴士》](./ArchLinuxConfig.md)的其中一个议题。在此感谢岛风 [@frg2089](https://github.com/frg2089) 指路。

## UEFI 启动简述：启动项管理

> UEFI 规范定义了名为「UEFI 启动管理器」的一项功能 …… UEFI 提供了一种非常优秀的机制，可以从上层架构执行此操作：你可以从已启动的操作系统中配置系统启动行为。如果已通过 UEFI 启动 Linux，就可以使用`efibootmgr`工具来完成所有这些操作。……
> ::: right
> ——[（译）UEFI 启动：实际工作原理](https://www.cnblogs.com/mahocon/p/5691348.html)
> :::

本「议题」只讨论 UEFI 原生启动项和回退路径启动项。恕不对 BIOS 兼容的部分作详细展开。

### i. 原生启动项
用 Windows 7 及更高版本系统的朋友肯定知道这个东西：Windows Boot Manager。`bootmgr`它代替了`ntldr`，从此便沿用至今。

事实上，Windows Boot Manager 是在系统安装完成后，**初次加载系统时**为其创建的启动项。它明确指出需要启动**指定存储设备中**的**指定引导文件**（即`bootmgfw.efi`）。  
即便 WinToGo 也是如此——在初次以 U 盘身份进入 WTG 系统时，Windows 也会为该设备作配置——所谓「正在准备设备」。在此过程中，顺带把原生启动项建立好。然后重启之后再按快捷键进入启动菜单，你**可能会在部分主板上**发现有两个启动项，指向同一个设备：
```
Windows Boot Manager ( Koi Series Pro ...)
USB HDD: Koi Series Pro ...
```

### ii. 回退路径启动项
对于 WinPE、Windows 安装镜像而言，它们并非用于长线运行，往往没有「配置设备」的步骤，那么 UEFI 如何认出它们捏？  
还记得上面提到的「以 U 盘身份」、「USB HDD: ...」吗？UEFI 固件是能够找到可启动设备，并且尝试启动的。但它是依据什么去找的捏？

UEFI 固件首先会**遍历各硬盘的 ESP**，并在其中查找`\EFI\BOOT\boot{cpu_arch}.efi`。对于同一硬盘的多个匹配项，**只选第一个**有效的。其中，`cpu_arch`即 CPU 架构，已知的有：
- `x64`：x86-64
- `ia32`：x86-32
- `ia64`：Itanium
- `arm`：AArch32，即 arm32 ~~（胳膊 32）~~
- `aa64`：AArch64，即 arm64 ~~（64 条胳膊）~~

> [!note]
> UEFI 的路径系统与 Windows 类似：以`\`分隔，不区分大小写。

对于 WinPE U 盘，通常它们是 MBR 分区表，那就考虑更泛用的搜索：采用 **FAT** 文件系统的**活动分区**；
对于 GPT 分区表，可以直接找 ESP 分区。当然如今的主板并不会卡那么死，哪怕只是普通的 FAT 分区，也会尝试搜索、执行。

也就是说，哪怕原生启动项意外被固件扬了，只要还有回退启动项，便仍可从同一个硬盘启动系统。

## 启动加载器（以 Grub 为主）
这也是最广泛使用的启动方式 ~~，Windows 也干了~~。在 Linux 当中，最常用的加载器是 Grub。当然，Arch 这边也有使用 rEFInd 的。

启动加载器本身作为跳板，被 UEFI 固件加载后，需要根据配置找到真正的 Linux 内核，并经由内核引导用户硬盘上的 Arch 系统。而在 Windows 中，`bootmgfw.efi`会查找硬盘系统中的`winload.exe`，并将其余的启动流程交给它完成。

正常使用 Windows 单系统的用户可能对启动过程并无察觉。但一旦与 Linux 混用，你就需要**留意 UEFI 启动项是否有被 Windows 刷新**。除此之外，尽管因「机」而异，但 UEFI 固件**有可能会自动剔除不再可用的启动项**。比如重新插拔固态，有可能会出现掉引导的情况。因此就个人来说，我不会再考虑 bootloader 了。

### i. 修复 Grub 引导
Windows 启不动我们会尝试「修复引导」，Arch 亦然。修复 Grub 引导实际上就是**重走 Grub 安装流程**：

- `mount`挂载相应分区；
- `genfstab`重建挂载表（如有必要）；
> 个人建议无论如何都重建一遍`fstab`。反正刷完绝对是最新的。
- `arch-chroot`切换进硬盘上的系统；
- `grub-install`重建 grub 引导。

### ii. 补充回退启动项
事实上，需要反复重建 Grub 引导的一大原因就在于，Grub 只会写入它自己的`grubx64.efi`，以及原生启动项：

![群友的 ESP 分区目录树](./esp_without_bootARCH.png =25%x25%)

那么办法也很简单：复制重命名嘛。Windows 不就喜欢复制。  
当然如果是像图中那样不止一个 Grub，甚至 Windows 和 Arch 双系统，那我不推荐你这么干。

> [!warning]
> 不要在这边试图软链接节省空间！

## 固件直接引导（EFIStub）
Grub 本身写入 ESP 的内容不多，配置啊、Linux 内核啊都在`/boot`。有人便主张把`/boot`还给`/`，ESP 分区实际挂载`/efi`。
而岛风则提出了更激进的主张：让固件直接引导内核。

> An EFI boot stub (aka EFI stub) is **a kernel that is an EFI executable**,
> i.e. that can directly be booted from the UEFI.
> ::: right
> —— [Arch Wiki: EFIStub](https://wiki.archlinux.org/title/EFISTUB)
> :::

根据 Wiki，Arch Linux 的内核本身就是可启动 EFI，只是需要附加[**内核参数**](https://wiki.archlinux.org/title/Kernel_parameters#Parameter_list)：
```
# 为便于阅读，这里分了三行。
root=UUID=7a6afcd0-a25a-4a6c-bf7b-920b53097eae
resume=UUID=b84ae173-edbc-442c-b00b-5c47eef203f1
rw loglevel=3 quiet initrd=\intel-ucode.img initrd=\initramfs-linux.img
```
::: details 内核参数详解
Grub 等启动加载器的本职工作就是帮你引导内核，因此它们的配置文件已经包含完整的内核参数了。
我上面列的内核参数是参照 Wiki 自行搭配，确认可行的参数。你也可以查 Wiki 自行组合。
- `root`：`/`分区。目前只见到 UUID 填法。
- `rw rootflags=subvol=@`：对`/`分区挂载的附加属性，比如可读写、指定 Btrfs 子卷。
- `resume`：休眠使用的交换分区，同样只见到 UUID 填法。休眠时会在指定 Swap 里创建内存映像。
- `loglevel=3 quiet`：内核加载时的附加属性，如日志等级之类。
- `initrd=\intel-ucode.img`：加载的初始化内存盘 (Init RAM Disk)。  
  一个`.img`一条`initrd=`，路径用`\`分隔，顺序自左向右（可以参见 grub 的配置文件）

> [!note]
> 个人觉得这里 initrd 称作「初始化映像」更合适，毕竟需要填`.img`嘛。
:::

LiveCD 里的`efibootmgr`工具可以直接操作固件的启动项。当然若是遵照律回指南和 Miku 指南，那么`efibootmgr`业已安装到你的系统中，你可以在运行中的本机 Arch 系统中折腾：
```bash
# 首先确定你要操作的硬盘和分区，不要搞错。UUID 马上就会用到。
lsblk -o name,mountpoint,uuid
# 参见 Wiki，以 Btrfs 为例，仅供参考
sudo efibootmgr --create --disk /dev/nvme0n1 --part 1 \
  --label "Arch Linux" --loader /vmlinuz-linux \
  --unicode 'root=UUID=f6419b76-c55b-4d7b-92f7-99c3b04a2a6f rw rootflags=subvol=@  loglevel=3 quiet initrd=\intel-ucode.img initrd=\initramfs-linux.img'
```
::: note 创建启动项命令详解
- `--part 1`：你的 ESP 分区序号。根据`lsblk`的树状图顺序判别。
- `--label "Arch Linux"`：启动项名称。大多数固件并不支持中文。
- `--unicode`后面跟内核参数。
:::

归根结底，EFIStub 代替了启动加载器，由我们用户手动建立 UEFI 原生启动项。但这种方式硬要说优点吧……可能也就比 Grub 快那么几秒而已。维护起来并不比 Grub 轻松多少。

## 统一内核映像（UKI）
在应用 EFIStub 的时候我就在想，有没有可能写一个`bootx64.efi`，直接带内核参数启动`vmlinuz-linux`呢。后面偶然找到了「统一内核映像」的介绍，豁然开朗。

> A unified kernel image (UKI) is a **single executable** which can be booted **directly from UEFI firmware**, or automatically **sourced by boot loaders with little or no configuration**.
> ::: right
> —— [Arch Wiki: Unified Kernel Image](https://wiki.archlinux.org/title/Unified_kernel_image)
> :::

根据介绍，UKI 实际上就是将内核引导的资源整合起来，打包而成的 EFI 可执行文件。某种意义上这也算是一种「固件直接引导」，只不过 EFIStub 创建原生启动项，而它两种启动项都可以做。

::: info UKI 通常包含……
> 摘自 [UAPI Group Specifications](https://uapi-group.org/specifications/specs/unified_kernel_image/)。

- EFI 执行代码（决定它「可执行 EFI」的本质）
- Linux 内核
- 【可选】内核参数
- 【可选】初始化内存盘
- 【可选】CPU 微码
- 【可选】描述信息、启动屏幕图、设备树……（不重要）

只要集成了 EFI 启动代码和 Linux 内核，那它就已经可以称作「统一内核映像」了。
:::

接下来以`mkinitcpio`为例，但是玩点花活。

### i. 内核参数
Wiki 中介绍了两种方法：
- 动`/etc/cmdline.d/`里的`.conf`配置。像`root.conf`决定`/`如何挂载，等等。
- 直接把所有参数搓成一行 echo 给`/etc/kernel/cmdline`文件。

于我而言，显然第二种更方便。
```bash
# 我在 LiveCD 里 arch-chroot 进去做的。别问我为什么没权限。
echo 'root=UUID=... resume=UUID=... rw loglevel=3 quiet' > /etc/kernel/cmdline
```
与 EFIStub 不同，这里不需要指定`initrd=`——工具会自己打包。

> [!warning]
> 若启用「安全启动」，且 UKI 封装了内核参数，则 UEFI 固件会无视外部传入的其余参数。

### ii. 预设文件
编辑`/etc/mkinitcpio.d/linux.preset`。我们前面说过「玩点花活」，就在这里玩。

下面是我自用的`linux.preset`。~~不玩花活的话别抄我的。~~
```properties
# mkinitcpio preset file for the 'linux' package

ALL_config="/etc/mkinitcpio.conf"
ALL_kver="/boot/vmlinuz-linux"

PRESETS=('default' 'fallback')

#default_config="/etc/mkinitcpio.conf"
#default_image="/boot/initramfs-linux.img"

default_uki="/efi/EFI/BOOT/bootx64.efi"
#default_uki="/efi/EFI/Linux/arch-linux.efi"
#default_options="--splash /usr/share/systemd/bootctl/splash-arch.bmp"

#fallback_config="/etc/mkinitcpio.conf"
#fallback_image="/boot/initramfs-linux-fallback.img"

fallback_uki="/boot/arch-linux-fallback.efi"
#fallback_uki="/efi/EFI/Linux/arch-linux-fallback.efi"
fallback_options="-S autodetect"
```
> [!warning]
> 有的教程会出现`ALL_microcode=(/boot/*-ucode.img)`这一句。
> 这种指定微码的方法已经废弃，`/etc/mkinitcpio.conf`已经有针对微码的 Hook 了，无需手动指定。

接下来我们来解释下花活怎么玩的。

正常来说 UKI 均会输出到`/efi/EFI/Linux/arch-linux*.efi`，据称`systemd-boot`可以扫到并引导 UKI。
但生成`bootx64.efi`让固件去加载不更直接？所以我选择直接导出到回退路径，如此连`efibootmgr`都不需要了。  
另一方面，`fallback`也会生成 UKI，但`bootx64.efi`只有一个。注意到之前 EFIStub 一节我只给`initramfs-linux`构建原生启动项，那么`fallback`自然打入冷宫。

> [!note]
> 把`fallback`移回`/boot`还有一重原因：尽量缩减 ESP 分区体积。本来`/efi`设计也有减小 ESP 分区大小的意图。
> 我试跑完发现`fallback.efi`高达 140+MB，而`arch-linux.efi`不过 30MB。
>
> 当然，保险起见，我并没有尝试`default`生成 UKI、`fallback`仍生成内存盘的做法，也没有试图把`fallback`预设直接干掉。
> 如有勇士试验过一切正常，欢迎 Issues 反馈（

### iii. 创建映像
按需建立路径，并跑一遍生成：
```bash
mkdir -p /efi/EFI/BOOT/
mkinitcpio -p linux
```
还是那句话，不玩花活不要学我。

---

建完之后退出系统，LiveCD 关机，重启按快捷键进入启动菜单，这下该有你硬盘的 UEFI 回退路径启动项了：
```
HDD: PM8512GPKTCB4BACE-E162
```
