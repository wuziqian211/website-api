// api/modules.js?id=friends 使用的朋友列表

/* 已经注销，但曾经和 wuziqian211 存在一定关系的朋友有这些（下面展示的是注销前被大多数人所熟悉的昵称，不等同于注销前最后使用的昵称）：
 *   生日快乐是个呆瓜（UID：350611270；新号 UID：406599529）
 *   SL_拾壹（UID：424674753；尚未找到新号）
 *   MC_小高（UID：475409751；尚未找到新号）
 *   青岛皓资商贸有限公司（UID：486081918；据说有其他账号）
 *   Succuba-魔女（UID：1721464338；新号 UID：1642793153）
 *   ……
 * 这些朋友的注销，给 wuziqian211 带来了一定程度的损失。wuziqian211 希望能有缘再见到 TA 们。
 */

const friends = [ // 共 248 位用户（每个 UID 后面的注释为最近一次更新此数据时 UID 对应用户的昵称）
  12767, // 艹
  72104, // 苏白
  3090720, // UMKII
  8047632, // 哔哩哔哩弹幕网
  12633437, // Syltus-Chau
  14182567, // 可爱的喜多郁代
  22000661, // EthanYyx
  26596074, // Jiuwenzi_
  33510888, // 绫罗绫罗酱w
  33889266, // 间隙之间warpedspace
  35698830, // 焰圆の喵
  37098548, // -烤焦的薮猫-
  37544886, // Sakura惜缘
  62567078, // 星咲雫
  66083126, // 琉璃玖夏
  78645830, // 鲁顺牌洗衣机
  85819912, // 星云吹雪丶
  87572005, // XCDhan
  96240239, // GoForceX
  96876893, // JONYANDUNH
  98787659, // 钻石弟
  106151689, // 霜落飞雪
  106286557, // 万里阴空
  107922335, // 单推希儿的小希儿
  108428159, // 喵吃鸟
  113575740, // OPPO粉
  134972891, // 仞之下_仞下
  158553238, // 暮晓Mu_Xiao
  174927495, // 唯雨LLKawi
  185273255, // AloneMEMZ
  187046814, // 四宫凛
  198316802, // 传说当中的帅锅
  237783120, // 蓝_远泽
  244784788, // 音律轨迹
  254625075, // tch2002
  266790905, // 榴莲味的暗恋
  272743796, // 难忘的朱古力232
  275681552, // Zombie_CHEN
  282022569, // Ender_3
  283248136, // Yaeto
  286202861, // SkySZyx
  287804183, // B站の飞行员僵尸
  289014064, // 朋友圈APERTURE
  291098307, // 蚕茧自缠萦
  293793435, // 社会易姐QwQ
  296367213, // 小颖大王ovoo
  298030824, // The-Alley-青石巷
  298730211, // 進擊の礦車
  299332849, // 二次元肉丝
  301867903, // AirRuan-小五
  304122884, // 艾伦_安格斯
  308730591, // 一只路过的意外
  310395315, // Cyclophosphate
  312226745, // 易美至图文
  317829434, // 梓゛
  319386407, // YangtzeJen
  320762504, // 铅封の单向镜
  322989832, // TNT_egg233
  324042405, // 肥宅水水呀
  329280499, // AF601
  333655227, // 2599律师函-
  334515064, // 清风拂过QAQ
  335944141, // 北笙霜华
  341614512, // 爱电脑的高中生
  343836794, // LightWing_CM
  346030399, // 雾花亭暮_粼光FFAPAD
  346930951, // 月初YCYC
  350848007, // 幽硫璃
  354097337, // 染浊turbid
  354758619, // 暗影孤狼天下第一帅__
  355778940, // 呕吐教父
  357413690, // RPG_Teng_Lin
  358201006, // 切片面包cc
  361417173, // Niicota
  363763511, // 热爱生活的CM君
  363870923, // _月笙伴星辰_
  367277357, // Ultrasoda
  372836503, // 可受的猪灵
  374807175, // MaXtrusia_雪魂
  379240063, // 一只菜勾勾勾勾
  384068618, // 琉璃阁主-栀子东方
  384755513, // 一个不正经的电脑解说
  385638250, // suxcv
  387964674, // 星耀社长-Official
  388353543, // 行空之旅
  389623999, // 铃叶Suzuha
  389874232, // LiteQwQ
  390321415, // RT游U惹368
  395253454, // Sanjin_Jyuusann
  396282160, // 溯源SOURCE
  396902020, // Friend1y
  397007998, // TMIANDTLI
  397557321, // 鬆鼠黨一鍵殺死系統
  397872234, // せぷとり773
  398217201, // 梅雨-TUYU
  400067046, // 天空为什么要滚动
  400835168, // AG-超玩会梦泪
  401143707, // Herobrine--MC
  401304564, // 动漫唯伦理君
  401579752, // 星辰君鸽鸽
  404563652, // 我是最好传递鸭
  404633853, // 晨光熹微同志
  404658588, // 晨旸
  405966864, // RC_ZdAn
  406599529, // 沉默-_-微笑
  407083438, // 病名为惰
  411891316, // 凊夢yume
  412110898, // wo是谁不重要233
  413092448, // 老鹰捉大象
  414089796, // 乱砸化学实验逝の屑稽
  415240328, // Urbino_194
  425503913, // wuziqian211
  426064686, // 渐漸被你吸引
  429986248, // Ryan650
  430278946, // 讯初FRD
  430942433, // 衷曲明断几回聞
  430967737, // KotlinModule
  432258909, // 顾云淮
  433636684, // 瑛与抱月
  433751453, // Henry_3230
  433849994, // 梅有在剪视频
  434605889, // 中上右Archive
  435619015, // 08C04-泥鳅三世
  437954580, // 桂-VMLD剑妖镇
  438586165, // cgkskssn
  440004933, // 咋咋呼呼的渣渣
  440662801, // 爱玩电脑的特兰克斯
  443529239, // 三文姨
  443646127, // ExplorerExec
  444281310, // 是Mzd鸭
  444309392, // 爱玩电脑の小雨
  446836354, // 098765_
  448189858, // 嘉宾菜的很
  449130968, // 空岛明日川Official
  449328503, // 蛙鸣繁梦
  451489132, // 杰不熬夜
  451918909, // 某激萌萝莉
  452616186, // 迷人的咲老师
  453521951, // 水煮山楂啊啊啊
  453805650, // 石榴守护者Official
  453899463, // 腊八洲
  454258954, // 科技菌Byte
  454719152, // 炒鸡MEMZ导弹
  455568817, // 大胖子玉米
  455591101, // 时崎狂三的猫铃木惠里
  456527365, // Res1sT_
  457843315, // 十星淦员
  458231747, // 天符箓
  470390768, // 啾也君
  472561665, // 元气少年帽子_进水了
  473900065, // 红杉树滑稽Flowey
  473999894, // 是小麦呐_
  474683920, // 我汐了_233
  474899885, // 铁猪不是铁柱
  475160063, // 百小默
  476302796, // 竖琴海豹_official
  479611798, // Hanhan同学
  479880391, // 暂不支持访问
  479906059, // 往来霜雪
  480015861, // 百九十四
  480729923, // 浪淘沙cookie
  481731410, // 苏维埃红星下的摸鱼天
  481823642, // 程序媛你说句话呀
  483236840, // 这个名字竟然值6硬币
  485821637, // 卖蓝屏钙的憨憨
  486329932, // 绫罗绫罗酱
  488790803, // 桃花工作室
  492935673, // 十年之约兔
  494339867, // VOYAGER白开水
  496300862, // dry干燥
  498496837, // Confusion_07
  499230650, // uni_Cesium
  500997122, // 求和-RYY_86-pi
  501312771, // 有梦想の咸鱼-つ三连
  503577862, // 5ATE11lte
  505259355, // xiaozhuawa7656
  505570512, // 轩岚诺_
  505743888, // 红色之桶
  506418994, // 闲人一等_
  509049620, // DunnieWhanante
  510272506, // 坤坤丨宝宝
  510694894, // 曾广_
  512787858, // 枯葉蛺蝶
  513634638, // treni234
  513778858, // 夜雨浅秋
  514802302, // 不爱笑的黑客
  515586861, // AeroGNOME
  516744192, // 穿三不是穿穿穿
  517893335, // 洛天依的锦依卫1578
  517975816, // 机器-
  518868196, // 胜完修狗可爱爱
  518970483, // 隙间少年郎-八云古
  519795342, // Minecraft_enty
  520139927, // sych小孩
  520562672, // 某科学的超万雌王
  520999014, // 绿毛式仰望
  521209706, // 没什么瓜系
  521877083, // 永不沉没的大和
  522208739, // 名侦探柯南土九
  522732174, // 蒙德罗斯
  523423693, // __ReGe__
  524748045, // 明阳QuantumPower
  526705577, // 旅行的心情
  527630206, // ---_更_---
  535324469, // 我是言柯
  535362423, // 梦dream4
  589865539, // 曲悠赋鄉_
  592308904, // 原子电锯小子
  597242903, // The-Ocean海洋
  598397900, // 悠然晓冰
  624532985, // 久侘
  628092353, // 次元菌_
  646061108, // 极光社_ODEN
  660766077, // 观澜亭9事GLT
  694241611, // 我是小苏酱
  1054922166, // U-Demon
  1099742836, // 咩羊菌i
  1108534014, // 刀月大大吖
  1110936584, // 宽带山工作室ForWeMedia
  1112058008, // OxyLite
  1112494292, // Winner365
  1132879610, // 过期了的油条
  1161346046, // 浮生在呢
  1207133469, // 异次元旅人traveler
  1271608370, // 橘沐风のゾ
  1307861343, // 泽哥与你
  1359379497, // LUCK仙生
  1377882998, // 柚子柚子l
  1433618226, // Mikuの自作多情君
  1456149763, // 2神吴
  1498694594, // 难诉衷Chang
  1529167079, // 可某人第五哮着玩
  1550118493, // 绫梦烁少
  1572189367, // 与日落共余生
  1642793153, // 魔女喵喵酱
  1651446751, // Born-for-dreams
  1684665013, // Microhard_1724
  1694284021, // 一只浙江
  1697970104, // AeroMSPaint
  1753797776, // ShaffleFox
  1831775732, // -Fuhrer-
  1860533762, // 4无名氏4
  1980000209, // 吴武陵华灯
  2095498218, // 211可可爱QwQ
  3461573372807835, // Control_River
  3493263004665908, // 林深秋时见鹿
  3493280641714839, // 薇尔莉特-伊芙加-登
  3494355316770879, // 唯念那抹少年蓝鸣浩
];
export default friends;
