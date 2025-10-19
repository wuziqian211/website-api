// 常量定义
import type { url, officialType, officialRole } from './types.d.ts';

// 1. 用户认证信息
export const officialVerifyInfo: { type: officialType; role: officialRole; title: string }[] = [
  { type: -1, role: 0, title: '' },
  { type: 0, role: 1, title: '知名UP主' },
  { type: 0, role: 2, title: '身份认证' },
  { type: 1, role: 3, title: '企业' },
  { type: 1, role: 4, title: '组织' },
  { type: 1, role: 5, title: '媒体' },
  { type: 1, role: 6, title: '政府' },
  { type: 0, role: 7, title: '专业认证' }, // 专业认证的信息并不会出现在“official”对象中，而会出现在“attestation”对象中
  { type: 0, role: 8, title: '职业资质认证' }, // 职业资质认证的信息并不会出现在“official”对象中，而会出现在“profession”对象中
  { type: 0, role: 9, title: '社会名人' },
];

// 2. 视频分区列表
interface Zone {
  tid: number;
  name: string;
  desc?: string;
  url: url;
  expired?: true;
  sub?: Zone[];
}
interface ZoneV2 {
  tid: number;
  name: string;
  route: string;
  sub?: ZoneV2[];
}

export const zones: Zone[] = [ // 来自 B 站与 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/video_zone.md（以下简称“API 文档”）；分区有“expired: true”属性的表示该分区已下线，已下线分区的信息均来自“API 文档”
  {
    tid: 217, name: '动物圈', url: 'v/animal', sub: [
      { tid: 218, name: '喵星人', desc: '喵喵喵喵喵', url: 'v/animal/cat' },
      { tid: 219, name: '汪星人', desc: '汪汪汪汪汪', url: 'v/animal/dog' },
      { tid: 222, name: '小宠异宠', desc: '奇妙宠物大赏', url: 'v/animal/reptiles' },
      { tid: 221, name: '野生动物', desc: '内有“猛兽”出没', url: 'v/animal/wild_animal' },
      { tid: 220, name: '动物二创', desc: '解说、配音、剪辑、混剪', url: 'v/animal/second_edition' },
      { tid: 75, name: '动物综合', desc: '收录除上述子分区外，其余动物相关视频以及非动物主体或多个动物主体的动物相关延伸内容', url: 'v/animal/animal_composite' },
    ],
  },
  {
    tid: 13, name: '番剧', url: 'anime/', sub: [
      { tid: 33, name: '连载动画', desc: '连载中TV/WEB动画，新剧场版/OVA/SP/未放送/小剧场', url: 'v/anime/serial/' },
      { tid: 32, name: '完结动画', desc: '已完结TV/WEB动画及其独立系列，旧剧场版/OVA/SP/未放送', url: 'v/anime/finish' },
      { tid: 51, name: '资讯', desc: '以动画/轻小说/漫画/杂志为主的资讯内容，PV/CM/特报/冒头/映像/预告', url: 'v/anime/information/' },
      { tid: 152, name: '官方延伸', desc: '以动画番剧及声优为主的EVENT/生放送/DRAMA/RADIO/LIVE/特典/冒头等', url: 'v/anime/offical/' },
    ],
  },
  {
    tid: 223, name: '汽车', url: 'v/car', sub: [
      { tid: 258, name: '汽车知识科普', desc: '关于汽车技术与文化的硬核科普，以及生活中学车、用车、养车的相关知识', url: 'v/car/knowledge' }, // B 站官方提供的信息中无此分区信息
      { tid: 227, name: '购车攻略', desc: '丰富详实的购车建议和新车体验', url: 'v/car/strategy' },
      { tid: 247, name: '新能源车', desc: '电动汽车、混合动力汽车等新能源车型相关内容，包括新车资讯、试驾体验、专业评测等', url: 'v/car/newenergyvehicle' }, // B 站官方提供的信息中此分区 tid 为 246
      { tid: 245, name: '赛车', desc: 'F1等汽车运动相关', url: 'v/car/racing' },
      { tid: 246, name: '改装玩车', desc: '汽车改装、老车修复、硬核越野、车友聚会等相关内容', url: 'v/car/modifiedvehicle' },
      { tid: 240, name: '摩托车', desc: '骑士们集合啦', url: 'v/car/motorcycle' },
      { tid: 248, name: '房车', desc: '房车及营地相关内容，包括不限于产品介绍、驾驶体验、房车生活和房车旅行等内容', url: 'v/car/touringcar' },
      { tid: 176, name: '汽车生活', desc: '分享汽车及出行相关的生活体验类视频', url: 'v/car/life' },
      { tid: 224, name: '汽车文化', desc: '车迷的精神圣地，包括汽车赛事、品牌历史、汽车改装、经典车型和汽车模型等', url: 'v/car/culture', expired: true },
      { tid: 225, name: '汽车极客', desc: '汽车硬核达人聚集地，包括DIY造车、专业评测和技术知识分享', url: 'v/car/geek', expired: true },
      { tid: 226, name: '智能出行', desc: '探索新能源汽车和未来智能出行的前沿阵地', url: 'v/car/smart', expired: true },
    ],
  },
  {
    tid: 181, name: '影视', url: 'v/cinephile', sub: [
      { tid: 182, name: '影视杂谈', desc: '影视评论、解说、吐槽、科普等', url: 'v/cinephile/cinecism' },
      { tid: 183, name: '影视剪辑', desc: '对影视素材进行剪辑再创作的视频', url: 'v/cinephile/montage' },
      { tid: 85, name: '小剧场', desc: '有场景、有剧情的演绎类内容', url: 'v/cinephile/shortplay' },
      { tid: 256, name: '短片', desc: '各种类型的短片', url: 'v/cinephile/shortfilm' },
      { tid: 184, name: '预告·资讯', desc: '影视类相关资讯，预告，花絮等视频', url: 'v/cinephile/trailer_info' },
    ],
  },
  {
    tid: 129, name: '舞蹈', url: 'v/dance/', sub: [
      { tid: 20, name: '宅舞', desc: '与ACG相关的翻跳、原创舞蹈', url: 'v/dance/otaku/' },
      { tid: 198, name: '街舞', desc: '收录街舞相关内容，包括赛事现场、舞室作品、个人翻跳、FREESTYLE等', url: 'v/dance/hiphop/' },
      { tid: 199, name: '明星舞蹈', desc: '国内外明星发布的官方舞蹈及其翻跳内容', url: 'v/dance/star/' },
      { tid: 200, name: '国风舞蹈', desc: '收录国风向舞蹈内容，包括中国舞、民族民间舞、汉唐舞、国风爵士等', url: 'v/dance/china/' },
      { tid: 255, name: '手势·网红舞', desc: '手势舞及网红流行舞蹈、短视频舞蹈等相关视频', url: 'v/dance/gestures/' },
      { tid: 154, name: '舞蹈综合', desc: '收录无法定义到其他舞蹈子分区的舞蹈视频', url: 'v/dance/three_d/' },
      { tid: 156, name: '舞蹈教程', desc: '镜面慢速，动作分解，基础教程等具有教学意义的舞蹈视频', url: 'v/dance/demo/' },
    ],
  },
  {
    tid: 177, name: '纪录片', url: 'documentary/', sub: [ // B 站官方提供的信息中无子分区信息
      { tid: 37, name: '人文·历史', desc: '除宣传片、影视剪辑外的，人文艺术历史纪录剧集或电影、预告、花絮、二创、5分钟以上纪录短片', url: 'v/documentary/history' },
      { tid: 178, name: '科学·探索·自然', desc: '除演讲、网课、教程外的，科学探索自然纪录剧集或电影、预告、花絮、二创、5分钟以上纪录短片', url: 'v/documentary/science' },
      { tid: 179, name: '军事', desc: '除时政军事新闻外的，军事纪录剧集或电影、预告、花絮、二创、5分钟以上纪录短片', url: 'v/documentary/military' },
      { tid: 180, name: '社会·美食·旅行', desc: '除VLOG、风光摄影外的，社会美食旅行纪录剧集或电影、预告、花絮、二创、5分钟以上纪录短片', url: 'v/documentary/travel' },
    ],
  },
  {
    tid: 1, name: '动画', url: 'v/douga/', sub: [
      { tid: 24, name: 'MAD·AMV', desc: '具有一定制作程度的动画或静画的二次创作视频', url: 'v/douga/mad/' },
      { tid: 25, name: 'MMD·3D', desc: '使用MMD（MikuMikuDance）和其他3D建模类软件制作的视频', url: 'v/douga/mmd/' },
      { tid: 47, name: '短片·手书', desc: '追求个人特色和创意表达的动画短片及手书（绘）', url: 'v/douga/handdrawn/' },
      { tid: 257, name: '配音', desc: '使用ACGN相关画面或台本素材进行人工配音创作的内容', url: 'v/douga/voice/' },
      { tid: 210, name: '手办·模玩', desc: '手办模玩的测评、改造或其他衍生内容', url: 'v/douga/garage_kit/' },
      { tid: 86, name: '特摄', desc: '特摄相关衍生视频', url: 'v/douga/tokusatsu/' },
      { tid: 253, name: '动漫杂谈', desc: '以谈话形式对ACGN文化圈进行的鉴赏、吐槽、评点、解说、推荐、科普等内容', url: 'v/douga/acgntalks/' },
      { tid: 27, name: '综合', desc: '以动画及动画相关内容为素材，包括但不仅限于音频替换、恶搞改编、排行榜等内容', url: 'v/douga/other/' },
    ],
  },
  {
    tid: 5, name: '娱乐', url: 'v/ent/', sub: [
      { tid: 71, name: '综艺', desc: '所有综艺相关，全部一手掌握！', url: 'v/ent/variety' },
      { tid: 241, name: '娱乐杂谈', desc: '娱乐人物解读、娱乐热点点评、娱乐行业分析', url: 'v/ent/talker' },
      { tid: 242, name: '粉丝创作', desc: '粉丝向创作视频', url: 'v/ent/fans' },
      { tid: 137, name: '明星综合', desc: '娱乐圈动态、明星资讯相关', url: 'v/ent/celebrity' },
      { tid: 131, name: 'Korea相关', desc: 'Korea相关音乐、舞蹈、综艺等视频', url: 'v/ent/korea', expired: true },
    ],
  },
  {
    tid: 155, name: '时尚', url: 'v/fashion', sub: [
      { tid: 157, name: '美妆护肤', desc: '彩妆护肤、美甲美发、仿妆、医美相关内容分享或产品测评', url: 'v/fashion/makeup' },
      { tid: 252, name: '仿妆cos', desc: '对二次元、三次元人物角色进行模仿、还原、展示、演绎的内容', url: 'v/fashion/cos' },
      { tid: 158, name: '穿搭', desc: '穿搭风格、穿搭技巧的展示分享，涵盖衣服、鞋靴、箱包配件、配饰（帽子、钟表、珠宝首饰）等', url: 'v/fashion/clothing' },
      { tid: 159, name: '时尚潮流', desc: '时尚街拍、时装周、时尚大片，时尚品牌、潮流等行业相关记录及知识科普', url: 'v/fashion/trend' },
      { tid: 192, name: '风尚标', desc: '时尚明星专访、街拍、时尚购物相关知识科普', url: 'v/fashion/trends', expired: true },
    ],
  },
  {
    tid: 211, name: '美食', url: 'v/food', sub: [
      { tid: 76, name: '美食制作', desc: '学做人间美味，展示精湛厨艺', url: 'v/food/make' },
      { tid: 212, name: '美食侦探', desc: '寻找美味餐厅，发现街头美食', url: 'v/food/detective' },
      { tid: 213, name: '美食测评', desc: '吃货世界，品尝世间美味', url: 'v/food/measurement' },
      { tid: 214, name: '田园美食', desc: '品味乡野美食，寻找山与海的味道', url: 'v/food/rural' },
      { tid: 215, name: '美食记录', desc: '记录一日三餐，给生活添一点幸福感', url: 'v/food/record' },
    ],
  },
  {
    tid: 4, name: '游戏', url: 'v/game/', sub: [
      { tid: 17, name: '单机游戏', desc: '以所有平台（PC、主机、移动端）的单机或联机游戏为主的视频内容，包括游戏预告、CG、实况解说及相关的评测、杂谈与视频剪辑等', url: 'v/game/stand_alone' },
      { tid: 171, name: '电子竞技', desc: '具有高对抗性的电子竞技游戏项目，其相关的赛事、实况、攻略、解说、短剧等视频。', url: 'v/game/esports' },
      { tid: 172, name: '手机游戏', desc: '以手机及平板设备为主要平台的游戏，其相关的实况、攻略、解说、短剧、演示等视频。', url: 'v/game/mobile' },
      { tid: 65, name: '网络游戏', desc: '由网络运营商运营的多人在线游戏，以及电子竞技的相关游戏内容。包括赛事、攻略、实况、解说等相关视频', url: 'v/game/online' },
      { tid: 173, name: '桌游棋牌', desc: '桌游、棋牌、卡牌对战等及其相关电子版游戏的实况、攻略、解说、演示等视频。', url: 'v/game/board' },
      { tid: 121, name: 'GMV', desc: '由游戏素材制作的MV视频。以游戏内容或CG为主制作的，具有一定创作程度的MV类型的视频', url: 'v/game/gmv' },
      { tid: 136, name: '音游', desc: '各个平台上，通过配合音乐与节奏而进行的音乐类游戏视频', url: 'v/game/music' },
      { tid: 19, name: 'Mugen', desc: '以Mugen引擎为平台制作、或与Mugen相关的游戏视频', url: 'v/game/mugen' },
    ],
  },
  {
    tid: 167, name: '国创', url: 'guochuang/', sub: [
      { tid: 153, name: '国产动画', desc: '国产连载动画，国产完结动画', url: 'v/guochuang/chinese/' },
      { tid: 168, name: '国产原创相关', desc: '以国产动画、漫画、小说为素材的二次创作', url: 'v/guochuang/original/' },
      { tid: 169, name: '布袋戏', desc: '布袋戏以及相关剪辑节目', url: 'v/guochuang/puppetry/' },
      { tid: 195, name: '动态漫·广播剧', desc: '国产动态漫画、有声漫画、广播剧', url: 'v/guochuang/motioncomic/' },
      { tid: 170, name: '资讯', desc: '原创国产动画、漫画的相关资讯、宣传节目等', url: 'v/guochuang/information/' },
    ],
  },
  {
    tid: 202, name: '资讯', url: 'v/information/', sub: [
      { tid: 203, name: '热点', desc: '全民关注的时政热门资讯', url: 'v/information/hotspot' },
      { tid: 204, name: '环球', desc: '全球范围内发生的具有重大影响力的事件动态', url: 'v/information/global' },
      { tid: 205, name: '社会', desc: '日常生活的社会事件、社会问题、社会风貌的报道', url: 'v/information/social' },
      { tid: 206, name: '综合', desc: '除上述领域外其它垂直领域的综合资讯', url: 'v/information/multiple' },
    ],
  },
  {
    tid: 165, name: '广告', url: 'v/ad', expired: true, sub: [
      { tid: 166, name: '广告', url: 'v/ad/ad', expired: true },
    ],
  },
  {
    tid: 119, name: '鬼畜', url: 'v/kichiku/', sub: [
      { tid: 22, name: '鬼畜调教', desc: '使用素材在音频、画面上做一定处理，达到与BGM一定的同步感', url: 'v/kichiku/guide' },
      { tid: 26, name: '音MAD', desc: '使用素材音频进行一定的二次创作来达到还原原曲的非商业性质稿件', url: 'v/kichiku/mad' },
      { tid: 126, name: '人力VOCALOID', desc: '将人物或者角色的无伴奏素材进行人工调音，使其就像VOCALOID一样歌唱的技术', url: 'v/kichiku/manual_vocaloid' },
      { tid: 216, name: '鬼畜剧场', desc: '使用素材进行人工剪辑编排的有剧情的作品', url: 'v/kichiku/theatre' },
      { tid: 127, name: '教程演示', desc: '鬼畜相关的教程演示', url: 'v/kichiku/course' },
    ],
  },
  {
    tid: 36, name: '知识', url: 'v/knowledge/', sub: [
      { tid: 201, name: '科学科普', desc: '回答你的十万个为什么', url: 'v/knowledge/science' },
      { tid: 124, name: '社科·法律·心理', desc: '基于社会科学、法学、心理学展开或个人观点输出的知识视频', url: 'v/knowledge/social_science' },
      { tid: 228, name: '人文历史', desc: '看看古今人物，聊聊历史过往，品品文学典籍', url: 'v/knowledge/humanity_history' },
      { tid: 207, name: '财经商业', desc: '说金融市场，谈宏观经济，一起畅聊商业故事', url: 'v/knowledge/business' },
      { tid: 208, name: '校园学习', desc: '老师很有趣，学生也有才，我们一起搞学习', url: 'v/knowledge/campus' },
      { tid: 209, name: '职业职场', desc: '职业分享、升级指南，一起成为最有料的职场人', url: 'v/knowledge/career' },
      { tid: 229, name: '设计·创意', desc: '天马行空，创意设计，都在这里', url: 'v/knowledge/design' },
      { tid: 122, name: '野生技能协会', desc: '技能党集合，是时候展示真正的技术了', url: 'v/knowledge/skill' },
      { tid: 39, name: '演讲·公开课', desc: '涨知识的好地方，给爱学习的你', url: 'v/technology/speech_course', expired: true },
      { tid: 96, name: '星海', desc: '军事类内容的圣地', url: 'v/technology/military', expired: true },
      { tid: 98, name: '机械', desc: '机械设备展示或制作视频', url: 'v/technology/mechanical', expired: true },
    ],
  },
  {
    tid: 160, name: '生活', url: 'v/life', sub: [
      { tid: 138, name: '搞笑', desc: '各种沙雕有趣的搞笑剪辑，挑战，表演，配音等视频', url: 'v/life/funny' },
      { tid: 254, name: '亲子', desc: '分享亲子、萌娃、母婴、育儿相关的视频', url: 'v/life/parenting' },
      { tid: 250, name: '出行', desc: '为达到观光游览、休闲娱乐为目的的远途旅行、中近途户外生活、本地探店', url: 'v/life/travel' },
      { tid: 251, name: '三农', desc: '分享美好农村生活', url: 'v/life/rurallife' },
      { tid: 239, name: '家居房产', desc: '与买房、装修、居家生活相关的分享', url: 'v/life/home' },
      { tid: 161, name: '手工', desc: '手工制品的制作过程或成品展示、教程、测评类视频', url: 'v/life/handmake' },
      { tid: 162, name: '绘画', desc: '绘画过程或绘画教程，以及绘画相关的所有视频', url: 'v/life/painting' },
      { tid: 21, name: '日常', desc: '记录日常生活，分享生活故事', url: 'v/life/daily' },
      { tid: 163, name: '运动', desc: '运动相关的记录、教程、装备评测和精彩瞬间剪辑视频', url: 'v/life/sports', expired: true },
      { tid: 174, name: '其他', desc: '对于分区归属不明的视频进行归纳整合的特定分区', url: 'v/life/other', expired: true },
    ],
  },
  {
    tid: 23, name: '电影', url: 'movie/', sub: [ // B 站官方提供的信息中无子分区信息
      { tid: 147, name: '华语电影', url: 'v/movie/chinese' },
      { tid: 145, name: '欧美电影', url: 'v/movie/west' },
      { tid: 146, name: '日本电影', url: 'v/movie/japan' },
      { tid: 83, name: '其他国家', url: 'v/movie/movie' },
    ],
  },
  {
    tid: 3, name: '音乐', url: 'v/music', sub: [
      { tid: 28, name: '原创音乐', desc: '原创歌曲及纯音乐，包括改编、重编曲及remix', url: 'v/music/original' },
      { tid: 31, name: '翻唱', desc: '对曲目的人声再演绎视频', url: 'v/music/cover' },
      { tid: 59, name: '演奏', desc: '乐器和非传统乐器器材的演奏作品', url: 'v/music/perform' },
      { tid: 30, name: 'VOCALOID·UTAU', desc: '以VOCALOID等歌声合成引擎为基础，运用各类音源进行的创作', url: 'v/music/vocaloid' },
      { tid: 29, name: '音乐现场', desc: '音乐表演的实况视频，包括官方/个人拍摄的综艺节目、音乐剧、音乐节、演唱会等', url: 'v/music/live' },
      { tid: 193, name: 'MV', desc: '为音乐作品配合拍摄或制作的音乐录影带（Music Video），以及自制拍摄、剪辑、翻拍MV', url: 'v/music/mv' },
      { tid: 243, name: '乐评盘点', desc: '音乐类新闻、盘点、点评、reaction、榜单、采访、幕后故事、唱片开箱等', url: 'v/music/commentary' },
      { tid: 244, name: '音乐教学', desc: '以音乐教学为目的的内容', url: 'v/music/tutorial' },
      { tid: 130, name: '音乐综合', desc: '所有无法被收纳到其他音乐二级分区的音乐类视频', url: 'v/music/other' },
      { tid: 194, name: '电音', desc: '以电子合成器、音乐软体等产生的电子声响制作的音乐', url: 'v/music/electronic', expired: true },
    ],
  },
  {
    tid: 234, name: '运动', url: 'v/sports', sub: [
      { tid: 235, name: '篮球', desc: '与篮球相关的视频，包括但不限于篮球赛事、教学、评述、剪辑、剧情等相关内容', url: 'v/sports/basketball' },
      { tid: 249, name: '足球', desc: '与足球相关的视频，包括但不限于足球赛事、教学、评述、剪辑、剧情等相关内容', url: 'v/sports/football' },
      { tid: 164, name: '健身', desc: '与健身相关的视频，包括但不限于瑜伽、CrossFit、健美、力量举、普拉提、街健等相关内容', url: 'v/sports/aerobics' },
      { tid: 236, name: '竞技体育', desc: '与竞技体育相关的视频，包括但不限于乒乓、羽毛球、排球、赛车等竞技项目的赛事、评述、剪辑、剧情等相关内容', url: 'v/sports/athletic' },
      { tid: 237, name: '运动文化', desc: '与运动文化相关的视频，包括但不限于球鞋、球衣、球星卡等运动衍生品的分享、解读，体育产业的分析、科普等相关内容', url: 'v/sports/culture' },
      { tid: 238, name: '运动综合', desc: '与运动综合相关的视频，包括但不限于钓鱼、骑行、滑板等日常运动分享、教学、Vlog等相关内容', url: 'v/sports/comprehensive' },
    ],
  },
  {
    tid: 188, name: '科技', url: 'v/tech/', sub: [
      { tid: 95, name: '数码', desc: '科技数码产品大全，一起来做发烧友', url: 'v/tech/digital' },
      { tid: 230, name: '软件应用', desc: '超全软件应用指南', url: 'v/tech/application' },
      { tid: 231, name: '计算机技术', desc: '研究分析、教学演示、经验分享......有关计算机技术的都在这里', url: 'v/tech/computer_tech' },
      { tid: 232, name: '科工机械', desc: '前方高能，机甲重工即将出没', url: 'v/tech/industry' },
      { tid: 233, name: '极客DIY', desc: '炫酷技能，极客文化，硬核技巧，准备好你的惊讶', url: 'v/tech/diy' }, // B 站官方提供的信息中此分区无 tid
      { tid: 189, name: '电脑装机', desc: '电脑、笔记本、装机配件、外设和软件教程等相关视频', url: 'v/digital/pc', expired: true },
      { tid: 190, name: '摄影摄像', desc: '摄影摄像器材、拍摄剪辑技巧、拍摄作品分享等相关视频', url: 'v/digital/photography', expired: true },
      { tid: 191, name: '影音智能', desc: '影音设备、智能产品等相关视频', url: 'v/digital/intelligence_av', expired: true },
    ],
  },
  {
    tid: 11, name: '电视剧', url: 'tv/', sub: [ // B 站官方提供的信息中无子分区信息
      { tid: 185, name: '国产剧', url: 'v/tv/mainland' },
      { tid: 187, name: '海外剧', url: 'v/tv/overseas' },
    ],
  },
];
export const zonesV2: ZoneV2[] = [
  {
    tid: 1011, name: '人工智能', route: 'ai', sub: [
      { tid: 2096, name: 'AI学习', route: 'tutorial' },
      { tid: 2097, name: 'AI资讯', route: 'information' },
      { tid: 2098, name: 'AI杂谈', route: 'other' },
    ],
  },
  {
    tid: 1024, name: '动物', route: 'animal', sub: [
      { tid: 2167, name: '猫', route: 'cat' },
      { tid: 2168, name: '狗', route: 'dog' },
      { tid: 2169, name: '小宠异宠', route: 'reptiles' },
      { tid: 2170, name: '野生动物·动物解说科普', route: 'science' },
      { tid: 2171, name: '动物综合·二创', route: 'other' },
    ],
  },
  {
    tid: 1013, name: '汽车', route: 'car', sub: [
      { tid: 2106, name: '汽车测评', route: 'commentary' },
      { tid: 2107, name: '汽车文化', route: 'culture' },
      { tid: 2108, name: '汽车生活', route: 'life' },
      { tid: 2109, name: '汽车技术', route: 'tech' },
      { tid: 2110, name: '汽车综合', route: 'other' },
    ],
  },
  {
    tid: 1001, name: '影视', route: 'cinephile', sub: [
      { tid: 2001, name: '影视解读', route: 'commentary' },
      { tid: 2002, name: '影视剪辑', route: 'montage' },
      { tid: 2003, name: '影视资讯', route: 'information' },
      { tid: 2004, name: '影视正片搬运', route: 'porterage' },
      { tid: 2005, name: '短剧短片', route: 'shortfilm' },
      { tid: 2006, name: 'AI影视', route: 'ai' },
      { tid: 2007, name: '影视reaction', route: 'reaction' },
      { tid: 2008, name: '影视综合', route: 'other' },
    ],
  },
  {
    tid: 1004, name: '舞蹈', route: 'dance', sub: [
      { tid: 2028, name: '宅舞', route: 'otaku' },
      { tid: 2029, name: '街舞', route: 'hiphop' },
      { tid: 2030, name: '颜值·网红舞', route: 'gestures' },
      { tid: 2031, name: '明星舞蹈', route: 'star' },
      { tid: 2032, name: '国风舞蹈', route: 'china' },
      { tid: 2033, name: '舞蹈教学', route: 'tutorial' },
      { tid: 2034, name: '芭蕾舞', route: 'ballet' },
      { tid: 2035, name: 'wota艺', route: 'wota' },
      { tid: 2036, name: '舞蹈综合', route: 'other' },
    ],
  },
  {
    tid: 1005, name: '动画', route: 'douga', sub: [
      { tid: 2037, name: '同人动画', route: 'fan_anime' },
      { tid: 2038, name: '模玩周边', route: 'garage_kit' },
      { tid: 2039, name: 'cosplay', route: 'cosplay' },
      { tid: 2040, name: '二次元线下', route: 'offline' },
      { tid: 2041, name: '动漫剪辑', route: 'editing' },
      { tid: 2042, name: '动漫评论', route: 'commentary' },
      { tid: 2043, name: '动漫速读', route: 'quick_view' },
      { tid: 2044, name: '动漫配音', route: 'voice' },
      { tid: 2045, name: '动漫资讯', route: 'information' },
      { tid: 2046, name: '网文解读', route: 'interpret' },
      { tid: 2047, name: '虚拟up主', route: 'vup' },
      { tid: 2048, name: '特摄', route: 'tokusatsu' },
      { tid: 2049, name: '布袋戏', route: 'puppetry' },
      { tid: 2050, name: '漫画·动态漫', route: 'comic' },
      { tid: 2051, name: '广播剧', route: 'motion' },
      { tid: 2052, name: '动漫reaction', route: 'reaction' },
      { tid: 2053, name: '动漫教学', route: 'tutorial' },
      { tid: 2054, name: '二次元其他', route: 'other' },
    ],
  },
  {
    tid: 1027, name: '情感', route: 'emotion', sub: [
      { tid: 2185, name: '家庭关系', route: 'family' },
      { tid: 2186, name: '恋爱关系', route: 'romantic' },
      { tid: 2187, name: '人际关系', route: 'interpersonal' },
      { tid: 2188, name: '自我成长', route: 'growth' },
    ],
  },
  {
    tid: 1002, name: '娱乐', route: 'ent', sub: [
      { tid: 2009, name: '娱乐评论', route: 'commentary' },
      { tid: 2010, name: '明星剪辑', route: 'montage' },
      { tid: 2011, name: '娱乐饭拍&现场', route: 'fans_video' },
      { tid: 2012, name: '娱乐资讯', route: 'information' },
      { tid: 2013, name: '娱乐reaction', route: 'reaction' },
      { tid: 2014, name: '娱乐综艺正片', route: 'variety' },
      { tid: 2015, name: '娱乐综合', route: 'other' },
    ],
  },
  {
    tid: 1014, name: '时尚美妆', route: 'fashion', sub: [
      { tid: 2111, name: '美妆', route: 'makeup' },
      { tid: 2112, name: '护肤', route: 'skincare' },
      { tid: 2113, name: '仿装cos', route: 'cos' },
      { tid: 2114, name: '鞋服穿搭', route: 'outfits' },
      { tid: 2115, name: '箱包配饰', route: 'accessories' },
      { tid: 2116, name: '珠宝首饰', route: 'jewelry' },
      { tid: 2117, name: '三坑', route: 'trick' },
      { tid: 2118, name: '时尚解读', route: 'commentary' },
      { tid: 2119, name: '时尚综合', route: 'other' },
    ],
  },
  {
    tid: 1020, name: '美食', route: 'food', sub: [
      { tid: 2149, name: '美食制作', route: 'make' },
      { tid: 2150, name: '美食探店', route: 'detective' },
      { tid: 2151, name: '美食测评', route: 'commentary' },
      { tid: 2152, name: '美食记录', route: 'record' },
      { tid: 2153, name: '美食综合', route: 'other' },
    ],
  },
  {
    tid: 1008, name: '游戏', route: 'game', sub: [
      { tid: 2064, name: '单人RPG游戏', route: 'rpg' },
      { tid: 2065, name: 'MMORPG游戏', route: 'mmorpg' },
      { tid: 2066, name: '单机主机类游戏', route: 'stand_alone' },
      { tid: 2067, name: 'SLG游戏', route: 'slg' },
      { tid: 2068, name: '回合制策略游戏', route: 'tbs' },
      { tid: 2069, name: '即时策略游戏', route: 'rts' },
      { tid: 2070, name: 'MOBA游戏', route: 'moba' },
      { tid: 2071, name: '射击游戏', route: 'stg' },
      { tid: 2072, name: '体育竞速游戏', route: 'spg' },
      { tid: 2073, name: '动作竞技游戏', route: 'act' },
      { tid: 2074, name: '音游舞游', route: 'msc' },
      { tid: 2075, name: '模拟经营游戏', route: 'sim' },
      { tid: 2076, name: '女性向游戏', route: 'otome' },
      { tid: 2077, name: '休闲/小游戏', route: 'puz' },
      { tid: 2078, name: '沙盒类', route: 'sandbox' },
      { tid: 2079, name: '其他游戏', route: 'other' },
    ],
  },
  {
    tid: 1017, name: '健身', route: 'gym', sub: [
      { tid: 2128, name: '健身科普', route: 'science' },
      { tid: 2129, name: '健身跟练教学', route: 'tutorial' },
      { tid: 2130, name: '健身记录', route: 'record' },
      { tid: 2131, name: '健身身材展示', route: 'figure' },
      { tid: 2132, name: '健身综合', route: 'other' },
    ],
  },
  {
    tid: 1019, name: '手工', route: 'handmake', sub: [
      { tid: 2143, name: '文具手帐', route: 'handbook' },
      { tid: 2144, name: '轻手作', route: 'light' },
      { tid: 2145, name: '传统手工艺', route: 'traditional' },
      { tid: 2146, name: '解压手工', route: 'relief' },
      { tid: 2147, name: 'DIY玩具', route: 'diy' },
      { tid: 2148, name: '其他手工', route: 'other' },
    ],
  },
  {
    tid: 1026, name: '健康', route: 'health', sub: [
      { tid: 2179, name: '健康科普', route: 'science' },
      { tid: 2180, name: '养生', route: 'regimen' },
      { tid: 2181, name: '两性知识', route: 'sexes' },
      { tid: 2182, name: '心理健康', route: 'psychology' },
      { tid: 2183, name: '助眠视频·ASMR', route: 'asmr' },
      { tid: 2184, name: '医疗保健综合', route: 'other' },
    ],
  },
  {
    tid: 1015, name: '家装房产', route: 'home', sub: [
      { tid: 2120, name: '买房租房', route: 'trade' },
      { tid: 2121, name: '家庭装修', route: 'renovation' },
      { tid: 2122, name: '家居展示', route: 'furniture' },
      { tid: 2123, name: '家用电器', route: 'appliances' },
    ],
  },
  {
    tid: 1009, name: '资讯', route: 'information', sub: [
      { tid: 2080, name: '时政资讯', route: 'politics' },
      { tid: 2081, name: '海外资讯', route: 'overseas' },
      { tid: 2082, name: '社会资讯', route: 'social' },
      { tid: 2083, name: '综合资讯', route: 'other' },
    ],
  },
  {
    tid: 1007, name: '鬼畜', route: 'kichiku', sub: [
      { tid: 2059, name: '鬼畜调教', route: 'guide' },
      { tid: 2060, name: '鬼畜剧场', route: 'theatre' },
      { tid: 2061, name: '人力VOCALOID', route: 'manual_vocaloid' },
      { tid: 2062, name: '音MAD', route: 'mad' },
      { tid: 2063, name: '鬼畜综合', route: 'other' },
    ],
  },
  {
    tid: 1010, name: '知识', route: 'knowledge', sub: [
      { tid: 2084, name: '应试教育', route: 'exam' },
      { tid: 2085, name: '非应试语言学习', route: 'lang_skill' },
      { tid: 2086, name: '大学专业知识', route: 'campus' },
      { tid: 2087, name: '商业财经', route: 'business' },
      { tid: 2088, name: '社会观察', route: 'social_observation' },
      { tid: 2089, name: '时政解读', route: 'politics' },
      { tid: 2090, name: '人文历史', route: 'humanity_history' },
      { tid: 2091, name: '设计艺术', route: 'design' },
      { tid: 2092, name: '心理杂谈', route: 'psychology' },
      { tid: 2093, name: '职场发展', route: 'career' },
      { tid: 2094, name: '科学科普', route: 'science' },
      { tid: 2095, name: '其他知识杂谈', route: 'other' },
    ],
  },
  {
    tid: 1031, name: '生活经验', route: 'life_experience', sub: [
      { tid: 2203, name: '生活技能', route: 'skills' },
      { tid: 2204, name: '办事流程', route: 'procedures' },
      { tid: 2205, name: '婚嫁', route: 'marriage' },
    ],
  },
  {
    tid: 1030, name: '生活兴趣', route: 'life_joy', sub: [
      { tid: 2198, name: '休闲玩乐', route: 'leisure' },
      { tid: 2199, name: '线下演出', route: 'on_site' },
      { tid: 2200, name: '文玩文创', route: 'artistic_products' },
      { tid: 2201, name: '潮玩玩具', route: 'trendy_toys' },
      { tid: 2202, name: '兴趣综合', route: 'other' },
    ],
  },
  {
    tid: 1003, name: '音乐', route: 'music', sub: [
      { tid: 2016, name: '原创音乐', route: 'original' },
      { tid: 2017, name: 'MV', route: 'mv' },
      { tid: 2018, name: '音乐现场', route: 'live' },
      { tid: 2019, name: '乐迷饭拍', route: 'fan_videos' },
      { tid: 2020, name: '翻唱', route: 'cover' },
      { tid: 2021, name: '演奏', route: 'perform' },
      { tid: 2022, name: 'VOCALOID', route: 'vocaloid' },
      { tid: 2023, name: 'AI音乐', route: 'ai_music' },
      { tid: 2024, name: '电台·歌单', route: 'radio' },
      { tid: 2025, name: '音乐教学', route: 'tutorial' },
      { tid: 2026, name: '乐评盘点', route: 'commentary' },
      { tid: 2027, name: '音乐综合', route: 'other' },
    ],
  },
  {
    tid: 1028, name: '神秘学', route: 'mysticism', sub: [
      { tid: 2189, name: '塔罗占卜', route: 'tarot' },
      { tid: 2190, name: '星座占星', route: 'horoscope' },
      { tid: 2191, name: '传统玄学', route: 'metaphysics' },
      { tid: 2192, name: '疗愈成长', route: 'healing' },
      { tid: 2193, name: '其他神秘学', route: 'other' },
    ],
  },
  {
    tid: 1016, name: '户外', route: 'outdoors', sub: [
      { tid: 2124, name: '露营', route: 'camping' },
      { tid: 2125, name: '徒步', route: 'hiking' },
      { tid: 2126, name: '户外探秘', route: 'explore' },
      { tid: 2127, name: '户外综合', route: 'other' },
    ],
  },
  {
    tid: 1006, name: '绘画', route: 'painting', sub: [
      { tid: 2055, name: '二次元绘画', route: 'acg' },
      { tid: 2056, name: '非二次元绘画', route: 'none_acg' },
      { tid: 2057, name: '绘画学习', route: 'tutorial' },
      { tid: 2058, name: '绘画综合', route: 'other' },
    ],
  },
  {
    tid: 1025, name: '亲子', route: 'parenting', sub: [
      { tid: 2172, name: '孕产护理', route: 'pregnant_care' },
      { tid: 2173, name: '婴幼护理', route: 'infant_care' },
      { tid: 2174, name: '儿童才艺', route: 'talent' },
      { tid: 2175, name: '萌娃', route: 'cute' },
      { tid: 2176, name: '亲子互动', route: 'interaction' },
      { tid: 2177, name: '亲子教育', route: 'education' },
      { tid: 2178, name: '亲子综合', route: 'other' },
    ],
  },
  {
    tid: 1023, name: '三农', route: 'rural', sub: [
      { tid: 2162, name: '农村种植', route: 'planting' },
      { tid: 2163, name: '赶海捕鱼', route: 'fishing' },
      { tid: 2164, name: '打野采摘', route: 'harvest' },
      { tid: 2165, name: '农业技术', route: 'tech' },
      { tid: 2166, name: '农村生活', route: 'life' },
    ],
  },
  {
    tid: 1021, name: '小剧场', route: 'shortplay', sub: [
      { tid: 2154, name: '剧情演绎', route: 'plot' },
      { tid: 2155, name: '语言类小剧场', route: 'lang' },
      { tid: 2156, name: 'UP主小综艺', route: 'up_variety' },
      { tid: 2157, name: '街头采访', route: 'interview' },
    ],
  },
  {
    tid: 1018, name: '体育运动', route: 'sports', sub: [
      { tid: 2133, name: '潮流运动', route: 'trend' },
      { tid: 2134, name: '足球', route: 'football' },
      { tid: 2135, name: '篮球', route: 'basketball' },
      { tid: 2136, name: '跑步', route: 'running' },
      { tid: 2137, name: '武术', route: 'kungfu' },
      { tid: 2138, name: '格斗', route: 'fighting' },
      { tid: 2139, name: '羽毛球', route: 'badminton' },
      { tid: 2140, name: '体育资讯', route: 'information' },
      { tid: 2141, name: '体育赛事', route: 'match' },
      { tid: 2142, name: '体育综合', route: 'other' },
    ],
  },
  {
    tid: 1012, name: '科技数码', route: 'tech', sub: [
      { tid: 2099, name: '电脑', route: 'computer' },
      { tid: 2100, name: '手机', route: 'phone' },
      { tid: 2101, name: '平板电脑', route: 'pad' },
      { tid: 2102, name: '摄影摄像', route: 'photography' },
      { tid: 2103, name: '工程机械', route: 'machine' },
      { tid: 2104, name: '自制发明/设备', route: 'create' },
      { tid: 2105, name: '科技数码综合', route: 'other' },
    ],
  },
  {
    tid: 1022, name: '旅游出行', route: 'travel', sub: [
      { tid: 2158, name: '旅游记录', route: 'record' },
      { tid: 2159, name: '旅游攻略', route: 'strategy' },
      { tid: 2160, name: '城市出行', route: 'city' },
      { tid: 2161, name: '公共交通', route: 'transport' },
    ],
  },
  {
    tid: 1029, name: 'vlog', route: 'vlog', sub: [
      { tid: 2194, name: '中外生活vlog', route: 'life' },
      { tid: 2195, name: '学生vlog', route: 'student' },
      { tid: 2196, name: '职业vlog', route: 'career' },
      { tid: 2197, name: '其他vlog', route: 'other' },
    ],
  },
];

// 3. 视频状态
export const states: Record<number, string> = { // 来自 https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/video/attribute_data.md
  0: '该视频已开放浏览', // 开放浏览
  1: '该视频通过审核，但可能会受到限制', // 橙色通过
  '-1': '该视频正在审核', // 待审
  '-2': '该视频已被退回', // 被打回
  '-3': '该视频已被锁定', // 网警锁定
  '-4': '该视频已被锁定', // 被锁定
  '-5': '该视频已被锁定', // 管理员锁定
  '-6': '该视频正在审核', // 修复待审
  '-7': '该视频正在等待审核', // 暂缓审核
  '-8': '该视频正在审核', // 补档待审
  '-9': '该视频正在转码', // 等待转码
  '-10': '该视频正在等待审核', // 延迟审核
  '-11': '该视频源正在等待修复', // 视频源待修
  '-12': '该视频转储失败', // 转储失败
  '-13': '该视频正在审核', // 允许评论待审
  '-14': '该视频已被删除', // 临时回收站
  '-15': '该视频正在审核', // 分发中
  '-16': '该视频转码失败', // 转码失败
  '-20': '该视频暂时没有投稿', // 创建未提交
  '-30': '该视频正在审核', // 创建已提交
  '-40': '该视频已审核通过，暂时没有发布', // 定时发布
  '-50': '该视频仅 UP 主自己可见', // 仅 UP 主可见
  '-100': '该视频已被删除', // 用户删除
};

// 4. 朋友列表
export const friends = [ // 共 309（正常用户）＋16（已注销）＝325 位用户
  // 正常用户（每个 UID 后面的注释为最近一次更新此数据时 UID 对应用户的昵称）
  12767, // 艹
  72104, // 苏白
  3090720, // UMKII
  8047632, // 哔哩哔哩弹幕网
  12633437, // _Lostia_
  14182567, // 丸山彩萌萌哒
  22000661, // EthanYyx
  26596074, // Jiuwenzi_
  33510888, // 绫罗绫罗酱w
  33889266, // 间隙之间warpedspace
  35698830, // 焰圆の喵
  37098548, // -烤焦的薮猫-
  37544886, // Sakura惜缘
  57895149, // 孤心狼guxinlang大人
  62567078, // 星咲雫
  66083126, // 琉璃玖夏
  78645830, // Rakh_Zhukovsky
  79567067, // TV768工作室
  85819912, // 星云吹雪NebulaFubiki
  87572005, // XCDhan
  96240239, // GoForceX
  96876893, // JONYANDUNH
  98787659, // 钻石弟
  106151689, // 霜落飞雪
  106286557, // 万里阴空
  107922335, // 可可爱爱小希儿
  108428159, // 喵吃鸟
  113575740, // 粉OPPO
  134972891, // 仞之下_仞下
  153917551, // 秋雨_Akisame
  158553238, // 暮晓Mu_Xiao
  174927495, // Hexzii
  185273255, // AloneMEMZ
  187046814, // 四宫凛
  198316802, // 传说当中的帅锅-极客
  227757756, // 星宇动漫社
  237783120, // 蓝_远泽
  244784788, // Issic005
  254625075, // tch2002
  266790905, // 榴莲味的暗恋
  272743796, // 难忘的朱古力232
  275681552, // Zombie_CHEN
  282022569, // Ender_3
  283248136, // Tsuki_awa
  286202861, // 春日步0号
  287804183, // B站的飞行员
  289014064, // 朋友圈APERTURE
  291098307, // 蚕茧自缠萦
  293793435, // 社会易姐QwQ
  296367213, // 小颖大王ovoo
  298030824, // The-Alley-青石巷
  298730211, // The_advancing礦車
  299332849, // 二次元肉丝
  301867903, // AirRain-小五
  302203436, // 洛凛琉sama
  304122884, // 艾伦_安格斯
  308730591, // 一只路过的意外
  310395315, // Cyclophosphate
  312226745, // 易美至图文
  316774628, // 周小张RL
  317829434, // Ziyv梓雨
  319386407, // bili_75182797221
  320762504, // Mirrorist在云中
  322989832, // BanG_Egg
  324042405, // 肥宅水水呀
  329280499, // 企业爱吃红豆糕
  333655227, // 炽夏の蔷薇
  334515064, // 清风拂过QAQ
  335944141, // 北笙霜华
  341614512, // 爱电脑的高中生
  343276541, // ゚星尘Infinity
  343836794, // 九彩圣临夜星羽
  346030399, // 粼光-Plight-普莱特
  350848007, // 幽硫璃
  353166906, // 征战四方的秦始皇
  354097337, // 染浊turbid
  354130909, // 乔尼丶乔斯达
  356097722, // 双鱼233
  357413690, // RPG_Teng_Lin
  358201006, // Cocoa_Ti
  361417173, // Tascota
  363763511, // 热爱生活的CM君
  363870923, // 云宿山川
  367277357, // emptyirony
  372836503, // 可受的猪灵
  374807175, // 爱丽丝囚徒__
  379240063, // itzM1st
  384068618, // 琉璃阁主-栀子东方
  384755513, // 一个不正经的电脑解说
  385638250, // suxcv
  388353543, // 记得狠狠扣三国杀的分
  389623999, // 铃叶Suzuha
  389874232, // LiteQwQ
  390321415, // RT游U惹368
  395253454, // Sanjin_Jyuusann
  395897659, // 卫宫蔫蔫
  396282160, // 溯源SOURCE
  396902020, // Friend1y
  397007998, // TMIANDTLI
  397464392, // 風間爱理
  397557321, // 鬆鼠黨一鍵殺死系統
  397872234, // 時雨Septrissimo
  398217201, // 梅雨-TUYU
  400067046, // 天空为什么要滚动
  400835168, // 一片青枫叶
  401143707, // Herobrine--MC
  401304564, // 动漫唯伦理君
  401579752, // 星辰君鸽鸽
  402645441, // 晓山樱雪Official
  404563652, // 小哥日常qwq
  404633853, // 晨光熹微同志
  404658588, // 晨旸
  405966864, // RC_ZdAn
  406599529, // 沉默-_-微笑
  407083438, // 病名为惰
  411891316, // 凊夢yume
  412110898, // wo是谁不重要233
  413029476, // 爱玩虚拟机的PRTM21X
  413092448, // 老鹰捉大象
  414089796, // 乱砸化学实验逝の屑稽
  415240328, // Urbino_194
  425503913, // 晨叶梦春
  426064686, // 既如此便
  429890083, // 啊Q症状
  429986248, // Ryan650
  430278946, // CnSywFRD
  430942433, // 衷曲明断几回聞
  430967737, // 浅羽悠真゙
  431227618, // 自律no神
  432258909, // 顾云淮
  433513379, // Kegongteng
  433636684, // 瑛与抱月
  433849994, // 梅有在剪视频
  434605889, // 中上右Archive
  435619015, // 08C04-泥鳅三世
  437954580, // VMLD剑妖镇
  438586165, // cgkskssn
  440004933, // 卡带没有发型
  440662801, // 爱玩电脑的特兰克斯
  443529239, // 小夼鎮暹
  443646127, // ExplorerExec
  444281310, // 纯曦酱咕噜噜
  444309392, // 爱玩电脑の小雨
  444486188, // 薛定谔の哆啦酱
  446836354, // 098765_
  448189858, // _tWiL1ght
  449130968, // 空岛明日川
  449328503, // 蛙鸣繁梦
  451489132, // 杰不熬夜
  451918909, // 某激萌萝莉
  452616186, // 迷人的咲老师
  452915602, // 夏雨不下鱼
  453521951, // 芒果山楂片
  453805650, // 石榴守护者Official
  453899463, // 腊八粥HCO
  454258954, // 科技菌Byte
  454719152, // 只见繁星闪闪
  455568817, // 大胖子玉米
  455591101, // 铃木遥_Suzuki
  456527365, // zhEEo
  457843315, // 十星淦员
  458231747, // 九淼淼淼淼淼
  470390768, // 啾也君
  472561665, // 元气少年帽子_进水了
  473900065, // 红杉树滑稽Flowey
  473999894, // 是小麦呐_
  474683920, // 我汐了_233
  474899885, // 铁猪不是铁柱
  475160063, // 尝妻素食
  476302796, // 後藤ひとり___
  477861287, // miku音空
  478860483, // 请您敲门
  479880391, // 暂不支持访问
  479906059, // 往来霜雪
  480015861, // 百九十四
  480729923, // 咕子曲奇GuZzz
  481132079, // 某植物园
  481731410, // 0nBYhb4
  481823642, // 程序媛你说句话呀
  483236840, // 这个名字竟然值6硬币
  485821637, // 卖蓝屏钙的憨憨
  486329932, // 绫罗绫罗酱
  488790803, // 中国桃花工作室已魔怔
  492935673, // 十年之约兔
  494339867, // 永雏塔爱音
  496300862, // dry干燥
  498496837, // Confusion_07
  499230650, // uni_Cesium
  500997122, // 求和-RYY_86-pi
  501312771, // 海鹽焦糖瑪奇朵
  503577862, // 5ATE11lte
  504274359, // _筒隠月子_
  504572189, // 青韵拾月
  504767542, // 眠雨之心
  505259355, // xiaozhuawa7656
  505570512, // 轩岚诺_
  505743888, // 深红之桶
  506418994, // 闲人一等_
  509049620, // DunnieWhanante
  510272506, // 坤坤丨宝宝
  510694894, // 曾广_
  512787768, // 乘风破败
  512787858, // 小呼铁
  513778858, // 夜雨浅秋
  514802302, // 不爱笑的黑客
  515586861, // 长夜月玩Fedora
  516744192, // 穿三不是穿穿穿
  517893335, // 洛天依的锦依卫1578
  518868196, // 爻狗不咬狗
  518970483, // 隙间少年郎-八云古
  519795342, // Minecraft_enty
  520139927, // sych小孩
  520562672, // 某科学的超万雌王
  520999014, // 绿毛式仰望
  521209706, // 没什么瓜系
  521597622, // 阿梅丽Mary
  521877083, // 斯坦福桥凯公子
  522208739, // Cyrene-昔涟
  522732174, // 蒙德罗斯
  523423693, // __ReGe__
  524748045, // 冬山槿阳
  526705577, // 旅行的心情
  527630206, // 一枝砂糖橘
  535324469, // 开发者比尔
  535362423, // 梦dream4
  572012082, // 星霞晚阳
  586846527, // 我就是小黄鸭吖
  589090919, // 百分百阳光女孩
  589865539, // 曲悠赋鄉_
  592308904, // 原子电锯小子
  597242903, // Kerry_Kaslana
  598397900, // 悠然晓冰
  624532985, // 久侘
  626699149, // 青柠ウア
  628092353, // 菌哥电影
  645769214, // Session小胡
  646061108, // 御田团_辞妤仙女下凡
  646930214, // 爱过想喝烧仙草
  647403484, // 星海_Online
  660766077, // 观澜亭9事GLT
  669183336, // 幽墨染青栀
  676244264, // Startmanch
  678253042, // 失衡HY
  694241611, // 我是小苏酱
  1052481162, // 兰德索尔憨批
  1054922166, // Milkuueeoo
  1064271089, // 找凉要还钱的波奇酱
  1080342041, // Avenzly_Official
  1099742836, // 司晴雪
  1106428666, // 星海_Offical
  1108534014, // 刀月大大吖
  1112058008, // 欧馨雨
  1112494292, // Winner365
  1132879610, // 过期了的油条
  1161346046, // 浮生在呢
  1184097239, // 零次元动漫
  1207133469, // 异次元旅人traveler
  1234694794, // 压舌摩根
  1249357742, // 风铃fh
  1271608370, // 落残霞鹜
  1280281990, // 高槻十四
  1282810721, // 把温柔藏起来给你
  1313926545, // 罗浮大太卜青雀大人
  1359379497, // LUCK仙生
  1372602230, // 秋枫红叶遍叶之秋
  1377882998, // 柚子柚子l
  1432356259, // 名为苏格同学
  1433618226, // Mikuの自作多情君
  1456149763, // 2神吴
  1498694594, // 泷璇风
  1526589324, // 温笛WPTSX
  1529167079, // kk九日
  1550118493, // 绫梦烁少
  1572189367, // 与日落共余生
  1642793153, // 精神拉面边角料奶猫
  1651446751, // Born-for-dreams
  1653845241, // 是一只星歌
  1674015107, // 挚爱高木さん
  1684665013, // Microhard_1724
  1694284021, // 暂时不怎么上线
  1697970104, // MSPaintBeta
  1729378239, // 艾HK416
  1768239812, // 陌玖XG
  1783874124, // RU戏くん
  1831775732, // -Fuhrer-
  1860533762, // 4无名氏4
  1886591057, // 梓漓吖
  1897235551, // 森岛帆高-__-
  1942314298, // N3酱_OwO
  1980000209, // 依灵凌伊
  2060988249, // MSCopilot
  2095498218, // 次元壁小宋
  2112621464, // 如潮汐般逝去
  3461579672652114, // 春杪纪
  3461582277315323, // 橘_Luo
  3493094823561477, // 下北泽の大大大大天使
  3493263004665908, // 林深秋时见鹿
  3493274977306954, // Stard_UST
  3493280641714839, // 和慄薰子
  3494362101057561, // 渐染星辰
  3537113943378720, // Z_罗纳尔多
  3546394180717428, // 进击的千花
  3546572130355891, // 完颜㣟
  3546607672887826, // 小千娜酱
  3546617827298156, // 塔野ing
  3546619593099792, // 璀爱
  3546631146309753, // 刀月你好香
  3546655485856196, // StarDamsel
  3546829132139119, // 牢Henry-3230
  // 已经注销，但曾经和梦春酱存在一定关系的朋友（UID 后面的注释不等同于该用户在注销前最后使用的昵称）
  350611270, // 生日快乐是个呆瓜（新号 UID：406599529）
  354758619, // 暗影孤狼天下第一帅__
  355778940, // 究极阅片大师
  387964674, // 星耀社长-毕业版
  424674753, // SL_拾壹
  433751453, // Henry_3230（新号 UID：3546829132139119）
  475409751, // MC_小高（新号 UID：1768239812）
  479611798, // Hanhan同学
  486081918, // 青岛皓资商贸有限公司（有其他账号：63014959）
  513634638, // tr3n1_
  1110936584, // 宽带山自媒工作室
  1307861343, // 泽哥与你（新号 UID：3546655485856196）
  1721464338, // Succuba-魔女（新号 UID：1642793153）
  1753797776, // 电脑制作_Official
  3461573372807835, // Control_River
  3494355316770879, // 鸿塌山
  // 这些朋友的注销，给梦春酱带来了一定程度的损失。梦春酱希望能有缘再见到 TA 们。
]; // 还有许多与梦春酱关系好的朋友可能不在这个列表里，如果您想加入这个列表，可以联系梦春酱～
