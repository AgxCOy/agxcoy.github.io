---
category:
  - 逆向工程
  - RA2
tag:
  - Syringe
  - 进程注入
---

# 基于 FA2sp 的逆向小记

参考资料：
- Zero-Fanker：[Ares Wiki](https://gitee.com/Zero_Fanker/Ares/wikis)
- 王道论坛：[2023 考研 408 学习资料](https://github.com/ddy-ddy/cs-408)

## 背景

FA2sp 是为了改善红警 2 地图编辑器 FinalAlert2（下面简称 FA2）的使用体验而开发的扩展库。它通过 Syringe 注入 Hook 的方式，无需修改 FA2 本体便能享受到扩展的功能和修复。

2024年3月8日，EA 在发布 Steam 版红警 2 时，终于把 FA2 的源码放了出来，自此 FA2sp 完成了历史使命。
然鹅，FA2sp 的主要开发者 [@secsome](https://github.com/secsome)（书伸）虽然承诺把扩展功能和 bug 修复移植到官方源码中，但由于三次元原因该计划迟迟未能推进。
考虑到《星辰之光》这边仍有对 FA2 的扩展需求，我便当起了接盘侠，继续 [FA2sp](https://github.com/ClLab-YR/FA2sp) 的维护。

那既然接了盘，总该干点事不是。于是才疏学浅的我结合自己备考 408 的粗略理解，尝试研究书伸留下来的逆向成果——`finalalert2yr.exe.idb`。

## 复习一下寄组

> [!note]
> 我事非科班生，对汇编的认识仅限考研 408 计算机组成原理对“指令系统”的考察。
> > 其实我参加的是 24 考研（2023.12.23-24），但回去翻考研群已经只剩 23 考研的资料了。
>
> FA2 显然是 Intel x86 架构的程序，恰好 24 考研主要考 x86 汇编。

### 寄存器

除了考研常考的通用寄存器`e[abcd]x`、帧指针`ebp`栈指针`esp`外，
在遇到 Fatal Error 时，我们还重点关注`except.txt`里的`eip`寄存器：
```
EIP: 00534096	ESP: 013A89D4	EBP: 013A89FC
EAX: 00000000	EBX: 00886240	ECX: 00886240
EDX: 003F5000	ESI: 00886230	EDI: 2A3C0000
```
在 FA2sp 里，这些寄存器可以通过 [Syringe](https://github.com/Ares-Developers/YRpp/blob/master/Syringe.h) Hook 定义里的`REGISTERS *R`指针参数存取。

### 跳转汇编指令

> [!important]
> 考虑到王道书里介绍的多数基本运算指令在分析 FA2 中意义并不大，这里就直接跳过了。  
> 完整版的 x86 汇编指令介绍还请移步《汇编语言程序设计》或者《汇编原理》之类的课程，恕不浪费太多时间咯。

#### 常规：Jump 系列

分为 jmp 无条件跳转，和 j*condition* 有条件跳转两种。其中条件跳转可以**部分**参考 pwsh 的比较：
|条件跳转指令字|PowerShell 比较
|-|-|
|`je` (Equal `==`)|`-eq`|
|`jne` (Not Equal `!=`)|`-ne`|
|`jz` (Zero `== 0`)|`-eq 0`|
|`jg` (Greater than `>`)|`-gt`|
|`jge` (Greater than or Equal to `>=`)|`-ge`|
|...|

在 IDA 中，`jmp` `j...`通常跟的是标签（如`LABEL_20`），标签用于指代某一个虚拟地址（32 位程序基址`0x400000`）。
跳转指令认出标签指代的地址后，将 EIP 寄存器设为该地址，CPU 从那里继续取指、间址（可能跳过）、执行、中断（可能跳过）四部曲。

#### 特殊：函数调用

主要是`call`和`ret`这一对。

`call lbl`是父级函数去“调用”。它会把函数参数、下一指令地址压入栈，然后无条件跳转到`lbl`标签指代的地址（同时改变 EBP 的值，以便建立新的栈帧）；

相对的，`ret`是子函数要“返回”。在回收子函数栈帧、还原 EBP 之后，`ret`指令会无条件跳转回先前执行到的位置。

> [!info]
> 回收栈帧、还原回父级函数的 EBP 这两步由`leave`指令完成，  
> 相当于`mov esp, ebp`再`pop ebp`，详见「栈帧」。

::: details 栈帧

函数的执行是由进程的栈空间管理的（相应的，`malloc` `new`之类则从堆空间申请内存），正所谓“函数调用栈”。
栈帧通常会记录局部变量等临时用到的数据，同时也是实现函数调用的重要跳板。

设有这么两段代码：
```c
int eg_sub(int x, int y) { return x * y; }
int example() {
  int a = 10;
  int b = eg_sub(a, 1024);
  return b - a;
}
```
又假设`example()`被 main 函数调用，那么栈帧可能会是这种分布：
|地址|...|备注|
|-|:--:|-|
|0x520|（`main()`的 EBP）|`example()`栈帧从这里开始|
|0x51C|int a = 10|
|0x518|int b|
|0x514|（空余 8B）|`gcc`编译器要求栈帧大小为 16B 的整数倍|
|0x50C|1024|参数 y|
|0x508|10|参数 x，即复制 a 的值|
|0x504|调用`eg_sub()`时 EIP 指向的下一指令地址|亦即被`call`压栈、`ret`返回的地址<br>`example()`栈帧到此结束|
|0x500|（`example()`函数的 EBP）|这里是`eg_sub()`的栈帧了|
|...|...||

调用`eg_sub()`前，首先把参数`y` `x`压栈（`cdecl`约定采取反向入栈）。
对于`int b`那一行语句，我们不妨拆成这样的汇编指令：
```
push ecx     # 设 a=10 位于 ecx
call eg_sub  # 函数调用，返回值在 eax
mov ebx, eax # 假设 b 在 ebx，把返回值赋给 b
```
那么执行到`call`指令时，EIP 指向下一条`mov`指令，于是`call`指令保存（入栈）EIP 的值，放心地跳转到`eg_sub`的指令地址去了。

在进入`eg_sub`那里之后，首先建立它自己的栈帧：
```
push ebp
...
mov ecx, [ebp + 12]  # 假设 ecx 存 y
mov edx, [ebp + 8]   # 假设 edx 存 x
...
```
执行完之后保存返回值`mov eax, ...`，回收栈帧、还原现场`leave`，然后`ret`指令跳转回`example()`。
`ret`指令把执行`call`指令时的“下一指令地址”弹回 EIP 寄存器，然后 CPU 就若无其事地继续跑 example 函数了。
:::

> [!note]
> 王道计组书和视频课「过程调用的机器级表示」那一节对于`call` `ret`指令以及栈帧的介绍可能更清楚一点。
> 24 考研距今也有半年余了，恕我没有办法准确地复述出来。

### 寻址方式
上面讲栈帧出现了个`[ebp + 12]`，涉及到两种寻址：寄存器间接寻址和 EBP“相对寻址”。  

> [!important]
> 注意我这“相对寻址”是打了引号的，因为并不是以 PC（或者说 IP、EIP 寄存器）为基准的相对，而是 EBP。

首先是 EBP 寻址。进程由操作系统管理，其堆栈空间在内存中开辟。既然如此，EBP 和 ESP 的值实际上就是指向内存中栈空间的地址。
比如在上面「栈帧」里举的例子，执行`example()`函数主体时，\[EBP\]=0x520，\[ESP\]=0x504；
进入`eg_sub()`函数调用后，\[EBP\] 则变为 0x500。

于是，我们可以对栈指针 ESP 和帧指针 EBP 做加减运算，找出函数参数、局部变量等信息。
例如上面建立`eg_sub`的栈帧时把函数参数从栈里读出来（不是`pop`出栈），就用`eg_sub`的 EBP 往上加。
由于两个栈帧之间总隔着一个“返回地址”，所以第一个参数并不是`+4`，而是`+8`。
而相对的，访问局部变量可以用 EBP 往下减，`EBP - 4`，`EBP - 8`，之类的。

> 通常来说，ESP 容易受`pop` `push`指令的影响，比较“多动”；而 EBP 相比起来更“安稳”一些。  
> 当然 ESP 寻址肯定是有的，Syringe 里的`XXX_STACK`就是 ESP 寻址。只是 EBP 寻址我讨论起来方便。

其次是寄存器间接寻址。对 EBP 指针做加减运算，找到参数、局部的地址之后，还需要做一次间接寻址，去内存里把真正的数据抓出来。  
间接寻址不需要你操心，我只是让你注意寄存器旁边的中括号而已：
```
mov eax, ebx    # 把 EBX 寄存器里的值直接传给 EAX
mov eax, [ebx]  # 把 EBX 里的内存地址取出来，再读那个内存地址，把数据传进 EAX。
```

## 初探 IDA

### 案例

FA2 的“国家”和“所属”是靠后缀区分的，国家直接取自 Rules*.ini，所属则是在国家基础上添加了` House`后缀，比如国家`YuriCountry`和所属`YuriCountry House`。  
默认在触发编辑器属性页里，触发所属方会截断空格，只许你选“国家”。现要求把这个碍事的截断给干掉，方便我们实现多人合作地图的“所属”关联。

### 逆向分析

::: details 有源码做题就是快
注意到`TriggerOptionsDlg.cpp`里关于“触发所属方”的事件定义：
```cpp {14,}
void CTriggerOptionsDlg::OnEditchangeHouse()
{
    // ... 前面忘了

	CString newHouse;
	m_House.GetWindowText(newHouse);  // 实际是 GetWindowTextA

	// FA2 读完所属会用 CSF 本地化这些窗口控件的所属名字（但是非常鸡肋）
    // 这一步又把本地化的所属翻译回 INI 的所属 ID
	newHouse=TranslateHouse(newHouse);

	newHouse.TrimLeft();
    // 如果你英语好一点，空格 => space，你便已经找到要淦的位置了：
	TruncSpace(newHouse);

    // ... 后面忘了
}
```
右键对`TruncSpace`转到定义，可以在`functions.cpp`发现：
```cpp
void TruncSpace(CString& str)
{
	str.TrimLeft();
	str.TrimRight();
	if(str.Find(" ")>=0) str.Delete(str.Find(" "), str.GetLength()-str.Find(" "));
}
```
于是确定我们要干掉的就是这个`TruncSpace`。

当然了前面说过，书伸还没搬运完 FA2sp 的功能修复，改源码暂时没什么意义。
:::

> 开始之前赞美一下书伸，书门！（  
> 没有书伸的成果，我不可能很快找出待修改函数的虚拟地址。

在 32 位 IDA 里新建一个反编译项目，打开 FA2 的主程序。我们案例要淦的函（方）数（法）位于`0x501D90`，在菜单栏`Jump`里找到`Jump to address`，把这个地址复制进去确认。  
默认它会切换为 Graph View，你需要右键改为 Text View：

![IDA 默认的图表模式](ida_graph_view.webp)

往下翻到`.text:00501E58`，注意到`GetWindowTextA`这个 WinAPI。如果你翻看了上面的源码，就会发现我们离目标不远了。  

> [!tip]
> 引用的 API，比如说 WinAPI 或者 CString 类的 API，地址通常都比较靠后。
> 在 Text View 里双击那个`GetWindowTextA`，可以发现地址跑到`0x553134`去力（瞄完可以用工具栏上的左箭头返回我们正文看的位置）。
> 所以接下来不要认错函数调用咯。

借着上面的提示，同屏`GetWindowTextA`后面只剩两个怀疑对象：`sub_43C3C0`和`sub_43EA90`。

![找出附近的函数调用](ida_find_calls.webp)

接下来看看这两个嫌疑函数的特征。直接菜单栏`View`，`Open subviews`，`Generate pseudocode (F5)`生成反汇编代码，于是我们得到案例方法的 C 式伪代码：

![辨认嫌疑伸](ida_recog_func_calls.webp)

由上面的源码可得，截断空格的函数`TruncSpace`只有一个参数，至此我们确定是`sub_43EA90`背锅。

## 编写 Hook

目前我已知两种 Hook 用法，我们这里写的 Hook 是第二种用途：

- 在原函数里新增内容实现扩展（`return 0`）
- 绕过（或覆盖）原函数的执行流程（`return`到目标地址）

### 背景芝士：Syringe

`Syringe.h`提供了定义 Hook 的宏：
```cpp
#define EXPORT_FUNC(name) extern "C" __declspec(dllexport) DWORD __cdecl name (REGISTERS *R)

#define DEFINE_HOOK(hook, funcname, size) \
declhook(hook, funcname, size) \
EXPORT_FUNC(funcname)
```

更详细的介绍可以翻 Zero Fanker 的 Ares Wiki。这里只需要知道，写 Hook 靠`DEFINE_HOOK`准没错。  
然后解释一下`DEFINE_HOOK`这个宏要补的三个参数：

- `hook`：即你要灌注（覆盖）的地址。

> 毕竟你外部定义的 Hook 不可能凭空插入原程序里，肯定需要遮掉原有的一部分指令机器码，才有机会跳转到你的 Hook。

- `funcname`：即你的 Hook 名字。

> [!warning]
> 虽然 Hook 名字实际上就是 DLL 导出的函数名字，但并不推荐随性的命名。最好还是讲清楚你淦的原函数叫什么，或者你写这个 Hook 要做什么。

- `size`：即 Hook 覆盖多少字节的原函数指令码（bixv >= 5B）

::: info 简单提一嘴 Syringe 如何“灌注”Hook：
完整版可以参考 Thomas 写的[高阶知识：Syringe 的工作原理](https://gitee.com/Zero_Fanker/Ares/wikis/%E9%AB%98%E9%98%B6%E7%9F%A5%E8%AF%86/Syringe%E7%9A%84%E5%B7%A5%E4%BD%9C%E5%8E%9F%E7%90%86)。

浓缩版就是，向`hook`的地址那里写入`jmp`无条件跳转指令。由于`jmp`指令码本身占 1B，后面跟的虚拟地址总是占 4B，故`size`至少得是 5。
那倘若要覆盖超过 5B 的机器代码呢？答案是多余部分用`nop`（空指令，什么也不做）填充。

![西瓜猫猫头](https://imgs.aixifan.com/content/2020_7_22/1.5954261313865685E9.gif =150x150)
:::

### 注意事项

我们这里针对的是函数调用，需要注意 C++ 的函数执行完成后**会触发栈区局部变量的析构函数**（通常是空间回收），因此并不建议把传参的汇编指令也给覆盖掉。

就这个例子而言，只需覆盖`call`指令：

> [!tip]
> 在 IDA 选项（`Options` > `General`）里，右上角勾选`Stack Pointer`，把`Number of opcode bytes`改为 8，确认即可看到机器码视图。  
> 然后你就会发现`call`指令刚好 5 个字节。
>
> ![call 指令的机器码](ida_call_opcode.webp)

### 实战

> 都有现成项目 FA2sp 了，你不会想着要白手起家吧？

在 FA2sp 项目里依次打开`FA2sp\Ext\CTriggerOption`，在`Hooks.cpp`里添一个 Hook：
```cpp
DEFINE_HOOK(501EAD, CTriggerOption_OnCBHouseChanged, 5)
{
    // 这里什么都不用做，我们只是跳过 FA2 截断空格那一步而已。
    return 0x501EB2;  
}
```
由于`declhook`宏设置 Hook 位置时已经标了`0x`（可以在 Visual Studio 里把鼠标移到宏上面预览展开的代码），
这里`DEFINE_HOOK`后面设置的地址就不需要再补`0x`了。

## 补充

### REGISTERS 寄存器类
在上面的「背景芝士」中，注意到导出的 Hook 函数只有一个`REGISTERS`类的指针参数 R。  
有时我们会需要获取原函数的实参、局部变量等信息，并加以修改，这时就要靠 R 指针获取了：

[进阶知识：Hook 函数的用法](https://gitee.com/Zero_Fanker/Ares/wikis/%E8%BF%9B%E9%98%B6%E7%9F%A5%E8%AF%86/HOOK%E5%87%BD%E6%95%B0%E7%9A%84%E7%94%A8%E6%B3%95)

具体的例子还要结合已有的`idb`逆向成果自行意会。虽然函数调用的基本原理在计组那一块已有涉及，
但一个函数叫什么名字、里面什么寄存器对应什么变量，这些都是前辈们自行逆向出来的结论。对此，咱还是保留点最起码的尊重罢。
