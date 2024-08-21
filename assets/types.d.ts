// 类型定义
// Ⅰ. 快捷类型
type resolveFn<Type> = (returnValue: Type) => void;
type booleanNumber = 0 | 1; // 用数字表示的逻辑值
type numericString = `${number}`; // 仅含有纯数字的字符串
type url = string; /* `http://${string}` | `https://${string}` | `data:${string},${string}` */
type secondLevelTimestamp = number; // 秒级时间戳
type millisecondLevelTimestamp = number; // 毫秒级时间戳
type microsecondLevelTimestamp = number; // 微秒级时间戳
type hexColor = `#${string}`; /* 使用 `#${'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'}${'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'}${'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'}${'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'}${'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'}${'0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'}` 会报“TS2590: Expression produces a union type that is too complex to represent.”错误 */ // 十六进制颜色代码
interface APIResponse<dataType> { // B 站 API 返回的 JSON 数据结构
  code: number;
  message: string;
  data: dataType;
}
interface BangumiAPIResponse<dataType> { // B 站番剧 API 返回的 JSON 数据结构
  code: number;
  message: string;
  result?: dataType;
}
interface InternalAPIResponse<dataType> extends APIResponse<dataType> { // 内部 API 返回的 JSON 数据结构
  extInfo?: object;
}

// Ⅱ. 接口类型
type sex = '男' | '女' | '保密';
type officialType = -1 /* 无认证 */ | 0 /* UP 主认证 */ | 1 /* 机构认证 */;
type level = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type levelNextExp = 1 | 200 | 1500 | 4500 | 10800 | 28800 | -1;
type levelCurrentMin = 0 | 1 | 200 | 1500 | 4500 | 10800 | 28800;

// 1. 用户卡片数据（https://account.bilibili.com/api/member/getCardByMid）
interface UserCardData {
  mid: numericString;
  name: string;
  approve: false;
  sex: sex;
  rank: numericString;
  face: url;
  coins: 0;
  DisplayRank: numericString;
  regtime: 0;
  spacesta: -10 /* 注销（不一定，已经发现一些未注销的账号的此属性为 -10） */ | -2 /* 被封禁 */ | 0 /* 正常 */ | 2 /* （？） */;
  place: '';
  birthday: `${number}-${number}-${number}`;
  sign: string;
  description: '';
  article: 0;
  attentions: number[] | []; // 隐藏关注列表时为空数组
  fans: number;
  friend: number; // 同 attention
  attention: number;
  level_info: { next_exp: levelNextExp; current_level: level; current_min: levelCurrentMin; current_exp: number };
  pendant: { pid: number; name: string; image: url; expire: 0 };
  official_verify: { type: officialType; desc: string };
  nameplate?: { nid: number; name: string; image: url; image_small: url; level: string; condition: string };
}

// 2. 用户信息数据（https://api.bilibili.com/x/space/wbi/acc/info）
interface UserInfoData {
  mid: number;
  name: string;
  sex: sex;
  face: url;
  face_nft: booleanNumber;
  face_nft_type: number;
  sign: string;
  rank: number;
  level: level;
  jointime: 0;
  moral: 0;
  silence: booleanNumber;
  coins: 0;
  fans_badge: boolean;
  fans_medal: {
    show: boolean;
    wear: boolean;
    medal: null | {
      uid: number;
      target_id: number;
      medal_id: number;
      level: number;
      medal_name: string;
      medal_color: number;
      intimacy: number;
      next_intimacy: number;
      day_limit: number;
      medal_color_start: number;
      medal_color_end: number;
      medal_color_border: number;
      is_lighted: booleanNumber;
      light_status: booleanNumber;
      wearing_status: booleanNumber;
      score: number;
    };
  };
  official: { role: number; title: string; desc: string; type: officialType };
  vip: {
    type: 0 | 1 | 2;
    status: booleanNumber;
    due_date: millisecondLevelTimestamp;
    vip_pay_type: 0 | 1;
    theme_type: 0;
    label: {
      path: '';
      text: string;
      label_theme: string;
      text_color: '' | hexColor;
      bg_style: 0 | 1;
      bg_color: '' | hexColor;
      border_color: '' | hexColor;
      use_img_label: true;
      img_label_uri_hans: url;
      img_label_uri_hant: url;
      img_label_uri_hans_static: url;
      img_label_uri_hant_static: url;
    };
    avatar_subscript: 0 | 1 | 2;
    nickname_color: '' | hexColor;
    role: 0 | 1 | 3 | 7 | 15;
    avatar_subscript_url: url;
    tv_vip_status: booleanNumber;
    tv_vip_pay_type: 0 | 1;
    tv_due_date: secondLevelTimestamp;
    avatar_icon: { icon_type?: number; icon_resource: {} };
  };
  pendant: { pid: number; name: string; image: url; expire: 0; image_enhance: url; image_enhance_frame: url; n_pid: number };
  nameplate: { nid: number; name: string; image: url; image_small: url; level: string; condition: string };
  user_honour_info: { mid: 0; colour: null; tags: []; is_latest_100honour: 0 };
  is_followed: false;
  top_photo: url;
  theme: {};
  sys_notice: {} | { id: number; content: string; url: url; notice_type: 1 | 2; icon: url; text_color: '' | hexColor; bg_color: '' | hexColor };
  live_room: null | {
    roomStatus: booleanNumber;
    liveStatus: booleanNumber;
    url: url;
    title: string;
    cover: url;
    roomid: number;
    roundStatus: booleanNumber;
    broadcast_type: 0;
    watched_show: { switch: boolean; num: number; text_small: string; text_large: string; icon: url; icon_location: ''; icon_web: url };
  };
  birthday: '' | `${number}-${number}`; // 生日隐藏时为空文本
  school: null | { name: string };
  profession: { name: string; department: string; title: string; is_show: booleanNumber };
  tags: null | string[];
  series: { user_upgrade_status: 3; show_upgrade_window: false };
  is_senior_member: booleanNumber;
  mcn_info: null;
  gaia_res_type: 0;
  gaia_data: null;
  is_risk: false;
  elec: { show_info: { show: boolean; state: -1 /* 未开通充电功能 */ | 1 /* 已开通自定义充电 */ | 2 /* 已开通包月、自定义充电 */ | 3 /* 已开通高档、自定义充电 */; title: '' | '充电' | '充电中'; icon: url; jump_url: url } };
  contract: { is_display: false; is_follow_display: false };
  certificate_show: false;
  name_render: null | {
    colors_info: { color: { color_day: '' | hexColor; color_night: '' | hexColor }[]; color_ids: numericString[] };
    render_scheme: 'Default' | 'Colorful';
  };
}

// 3. 视频信息数据（https://api.bilibili.com/x/web-interface/wbi/view）
interface VideoInfoData {
  bvid: string;
  aid: number;
  videos: number;
  tid: number;
  tname: string;
  copyright: 1 /* 自制 */ | 2 /* 转载 */;
  pic: url;
  title: string;
  pubdate: secondLevelTimestamp;
  ctime: secondLevelTimestamp;
  desc: string;
  desc_v2: ({ raw_text: string; type: 1; biz_id: 0 } | { raw_text: string; type: 2; biz_id: number })[];
  state: number;
  duration: number;
  mission_id?: number;
  rights: {
    bp: booleanNumber;
    elec: booleanNumber;
    download: booleanNumber;
    movie: booleanNumber;
    pay: booleanNumber;
    hd5: booleanNumber;
    no_reprint: booleanNumber;
    autoplay: booleanNumber;
    ugc_pay: booleanNumber;
    is_cooperation: booleanNumber;
    ugc_pay_preview: booleanNumber;
    no_background: booleanNumber;
    clean_mode: booleanNumber;
    is_stein_gate: booleanNumber;
    is_360: booleanNumber;
    no_share: booleanNumber;
    arc_pay: booleanNumber;
    free_watch: booleanNumber;
  };
  owner: { mid: number; name: string; face: url };
  stat: {
    aid: number;
    view: number;
    danmaku: number;
    reply: number;
    favorite: number;
    coin: number;
    share: number;
    now_rank: number;
    his_rank: number;
    like: number;
    dislike: 0;
    evaluation: '' | `${number}.${number}分`;
    vt: 0;
  };
  argue_info: { argue_msg: string; argue_type: number; argue_link: url };
  dynamic: string;
  cid: number;
  dimension: { width: number; height: number; rotate: booleanNumber };
  premiere: null;
  teenage_mode: booleanNumber;
  is_chargeable_season: boolean;
  is_story: boolean;
  is_upower_exclusive: boolean;
  is_upower_play: boolean;
  is_upower_preview: boolean;
  enable_vt: 0;
  vt_display: '';
  no_cache: boolean;
  pages: ({
    cid: number;
    page: number;
    from: 'vupload';
    part: string;
    duration: number;
    vid: '';
    weblink: '';
    dimension: VideoInfoData['dimension'];
  } | { // 站外视频
    cid: number;
    page: number;
    from: 'hunan' | 'qq';
    part: string;
    duration: number;
    vid: string;
    weblink: url;
    dimension: VideoInfoData['dimension'];
  })[];
  subtitle: {
    allow_submit: boolean;
    list: { id: number; lan: string; lan_doc: string; is_lock: boolean; author_mid: number; subtitle_url: url; author: object /* 待补充 */ }[];
  };
  staff?: { // 仅合作视频
    mid: number;
    title: string;
    name: string;
    face: url;
    vip: UserInfoData['vip'];
    official: UserInfoData['official'];
    follower: number;
    label_style: 0 /* 普通 */ | 1 /* 赞助商 */;
  }[];
  is_season_display: boolean;
  user_garb: { url_image_ani_cut: url };
  honor_reply: {} | {
    honor: ({
      aid: number;
      type: 1 /* 入站必刷收录 */ | 3 /* 全站排行榜最高第?名 */ | 4 /* 热门 */;
      desc: string;
      weekly_recommend_num: 0;
    } | {
      aid: number;
      type: 2 /* 第?期每周必看 */;
      desc: string;
      weekly_recommend_num: number;
    })[];
  };
  like_icon: url;
  need_jump_bv: boolean;
  disable_show_up_info: boolean;
  is_story_play: booleanNumber;
  is_view_self: boolean;
}

// 4. 剧集信息数据（https://api.bilibili.com/pgc/review/user）
interface BangumiMediaData {
  media: {
    areas: { id: number; name: string }[];
    cover: url;
    horizontal_picture: url;
    media_id: number;
    new_ep?: { id: number; index: string; index_show: string }; // 剧集失效时不存在此项
    rating?: { count: number; score: number };
    season_id: number;
    share_url: url;
    title: string;
    type: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    type_name: '番剧' | '电影' | '纪录片' | '国创' | '电视剧' | '漫画' | '综艺';
  };
  review?: { is_coin: booleanNumber; is_open: booleanNumber }; // 仅登录时存在此项
}

// 5. 番剧信息数据（https://api.bilibili.com/pgc/view/web/season）
interface BangumiSeasonData {
  activity: { head_bg_url: ''; id: number; title: string };
  actors: string;
  alias: '';
  areas: BangumiMediaData['media']['areas'];
  bkg_cover: url;
  cover: url;
  delivery_fragment_video: false;
  enable_vt: false;
  episodes: object[]; // 待补充
  evaluate: string;
  freya: { bubble_show_cnt: 0; icon_show: 0 };
  hide_ep_vv_vt_dm: 1;
  icon_font: { name: 'playdata-square-line@500'; text: string };
  jp_title: '';
  link: url;
  media_id: number;
  mode: 2;
  new_ep: { desc: string; id: number; is_new: booleanNumber; title: string };
  payment?: object; // 待补充
  positive: { id: number; title: string };
  publish: {
    is_finish: booleanNumber;
    is_started: booleanNumber;
    pub_time: `${number}-${number}-${number} ${number}:${number}:${number}`; // YYYY-MM-DD hh:mm:ss
    pub_time_show: string;
    unknow_pub_date: booleanNumber;
    weekday: number;
  };
  rating?: BangumiMediaData['media']['rating'];
  record: string;
  rights: {
    allow_bp: booleanNumber;
    allow_bp_rank: booleanNumber;
    allow_download: booleanNumber;
    allow_review: booleanNumber;
    area_limit: number;
    ban_area_show: booleanNumber;
    can_watch: booleanNumber;
    copyright: 'bilibili' | 'dujia';
    forbid_pre: booleanNumber;
    freya_white: booleanNumber;
    is_cover_show: booleanNumber;
    is_preview: booleanNumber;
    only_vip_download: booleanNumber;
    resource: '';
    watch_platform: number;
  };
  season_id: number;
  season_title: string;
  seasons: object[]; // 待补充
  section: object[]; // 待补充
  series: { display_type: number; series_id: number; series_title: string };
  share_copy: string;
  share_sub_title: string;
  share_url: url;
  show: { wide_screen: booleanNumber };
  show_season_type: number;
  square_cover: url;
  staff: string;
  stat: {
    coins: number;
    danmakus: number;
    favorite: number;
    favorites: number;
    follow_text: string;
    likes: number;
    reply: number;
    share: number;
    views: number;
    vt: 0;
  };
  status: number;
  styles: string[];
  subtitle: string;
  title: string;
  total: number;
  type: BangumiMediaData['media']['type'];
  up_info?: {
    avatar: url;
    avatar_subscript_url: url;
    follower: number;
    is_follow: 0;
    mid: number;
    nickname_color: '' | hexColor;
    pendant: { image: url; name: string; pid: number };
    theme_type: 0;
    uname: string;
    verify_type: number;
    vip_label: {
      bg_color: '' | hexColor;
      bg_style: 0 | 1;
      border_color: '' | hexColor;
      text: string;
      text_color: '' | hexColor;
    };
    vip_status: booleanNumber;
    vip_type: 0 | 1 | 2;
  };
  user_status: {
    area_limit: booleanNumber;
    ban_area_show: booleanNumber;
    follow: booleanNumber;
    follow_status: booleanNumber;
    login: booleanNumber;
    pay: booleanNumber;
    pay_pack_paid: booleanNumber;
    progress?: { last_ep_id: number, last_ep_index: string, last_time: number };
    sponsor: number;
    vip_info?: { due_date: millisecondLevelTimestamp; status: booleanNumber; type: 0 | 1 | 2 };
  };
}

// 6. 朋友信息
interface FriendInfo {
  mid: number;
  name: string;
  face: url;
  face_nft: booleanNumber;
  sign: string;
  official: { desc: string; role: number; title: string; type: officialType };
  vip: { type: 0 | 1 | 2; status: booleanNumber };
  is_deleted: booleanNumber;
}

// 7. 图床的回应（https://smms.app/api/v2/upload）
interface SmmsUploadResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    file_id: number;
    width: number;
    height: number;
    filename: string;
    storename: string;
    size: number;
    path: string;
    hash: string;
    url: url;
    delete: url;
    page: url;
  };
  RequestId: string;
}

// 8. 导航栏数据（https://api.bilibili.com/x/web-interface/nav）
interface NavData { // 此处仅定义部分必要字段
  isLogin: boolean;
  wbi_img: {
    img_url: url;
    sub_url: url;
  };
}

// 9. “获取哔哩哔哩用户信息”接口回应数据（/api/getuser）
interface InternalAPIGetUserInfoData {
  mid: number | numericString;
  name: string;
  approve: false;
  sex: sex;
  face: url;
  face_nft: booleanNumber;
  face_nft_type: number;
  sign: string;
  description: '';
  rank: number;
  DisplayRank: numericString;
  level: level;
  jointime: 0;
  regtime: 0;
  spacesta: UserCardData['spacesta'];
  place: '';
  moral: 0;
  silence: booleanNumber;
  coins: 0;
  article: 0;
  attentions: UserCardData['attentions'];
  fans: number;
  friend: number;
  attention: number;
  following: number;
  follower: number;
  level_info: UserCardData['level_info'];
  fans_badge: boolean;
  fans_medal: UserInfoData['fans_medal'];
  official: UserInfoData['official'];
  official_verify: UserCardData['official_verify'];
  vip: UserInfoData['vip'];
  pendant: UserInfoData['pendant'];
  nameplate: UserInfoData['nameplate'];
  user_honour_info: UserInfoData['user_honour_info'];
  is_followed: false;
  top_photo: url;
  theme: UserInfoData['theme'];
  sys_notice: UserInfoData['sys_notice'];
  live_room: UserInfoData['live_room'];
  birthday: secondLevelTimestamp;
  school: UserInfoData['school'];
  profession: UserInfoData['profession'];
  tags: UserInfoData['tags'];
  series: UserInfoData['series'];
  is_senior_member: booleanNumber;
  mcn_info: null;
  gaia_res_type: 0;
  gaia_data: null;
  is_risk: false;
  elec: UserInfoData['elec'];
  contract: UserInfoData['contract'];
  certificate_show: false;
  name_render: UserInfoData['name_render'];
}

export type { resolveFn, booleanNumber, numericString, url, secondLevelTimestamp, millisecondLevelTimestamp, microsecondLevelTimestamp, hexColor, APIResponse, BangumiAPIResponse, InternalAPIResponse, UserCardData, UserInfoData, VideoInfoData, BangumiMediaData, BangumiSeasonData, FriendInfo, SmmsUploadResponse, NavData, InternalAPIGetUserInfoData };
