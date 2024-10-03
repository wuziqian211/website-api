// 类型定义
// 1. 通用类型
export type resolveFn<Type> = (returnValue: Type) => void;
export type booleanNumber = 0 | 1; // 用数字表示的逻辑值
export type numericString = `${number}`; // 仅含有纯数字的字符串
export type url = string;
export type secondLevelTimestamp = number; // 秒级时间戳
export type millisecondLevelTimestamp = number; // 毫秒级时间戳
export type microsecondLevelTimestamp = number; // 微秒级时间戳
export type hexColor = `#${string}`; // 十六进制颜色代码
export interface InternalAPIResponse<dataType> { // 内部 API 返回的 JSON 数据结构
  code: number;
  message: string;
  data: dataType;
  extInfo?: Record<string, unknown>;
}
export interface APIResponse<dataType> { // B 站 API 返回的 JSON 数据结构
  code: number;
  message: string;
  ttl: number;
  data: dataType;
}

// 2. 用户信息相关
type sex = '男' | '女' | '保密';
type officialType = -1 /* 无认证 */ | 0 /* UP 主认证 */ | 1 /* 机构认证 */;
type officialRole = 0 /* 无 */ | 1 /* 知名 UP 主 */ | 2 /* 身份认证（大 V 达人） */ | 3 /* 企业 */ | 4 /* 组织 */ | 5 /* 媒体 */ | 6 /* 政府 */ | 7 /* 专业（领域）认证 */ | 8 /* 职业资质信息认证 */ | 9 /* 社会知名人士 */;
type VIPType = 0 /* 无大会员 */ | 1 /* 月度大会员 */ | 2 /* 年度及以上大会员 */;
type VIPRole = 0 /* 无 */ | 1 /* 月度 */ | 3 /* 年度 */ | 7 /* 十年 */ | 15 /* 百年 */;
type level = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type levelNextExp = 1 | 200 | 1500 | 4500 | 10800 | 28800 | -1;
type levelCurrentMin = 0 | 1 | 200 | 1500 | 4500 | 10800 | 28800;
interface OfficialVerifyInfo {
  role: officialRole;
  title: string;
  desc: string;
  type: officialType;
}
interface VIPInfo {
  type: VIPType;
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
  role: VIPRole;
  avatar_subscript_url: url;
  tv_vip_status: booleanNumber;
  tv_vip_pay_type: 0 | 1;
  tv_due_date: secondLevelTimestamp;
  avatar_icon: { icon_type?: number; icon_resource: {} };
}

// a. 用户卡片数据（https://account.bilibili.com/api/member/getCardByMid）
export interface UserCardData {
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

// b. 用户信息数据（https://api.bilibili.com/x/space/wbi/acc/info）
export interface UserInfoData {
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
  official: OfficialVerifyInfo;
  vip: VIPInfo;
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

// c. “获取哔哩哔哩用户信息”接口回应数据（/api/getuser）
export interface InternalAPIGetUserInfoData {
  mid: number | numericString;
  name: string;
  approve: false;
  sex: '' | sex;
  face: url;
  face_nft: booleanNumber;
  face_nft_type: number;
  sign: string;
  description: '';
  rank: number;
  DisplayRank: numericString;
  level: null | level;
  jointime: 0;
  regtime: 0;
  spacesta: UserCardData['spacesta'];
  place: '';
  moral: 0;
  silence: booleanNumber;
  coins: 0;
  article: 0;
  attentions: UserCardData['attentions'];
  fans: null | number;
  friend: null | number;
  attention: null | number;
  following: null | number;
  follower: null | number;
  level_info: { next_exp: null | levelNextExp; current_level: null | level; current_min: null | levelCurrentMin; current_exp: null | number };
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

// 3. 视频信息相关
// eslint-disable-next-line @stylistic/semi-spacing
export type quality = 6 /* 240P */ | 16 /* 360P */ | 32 /* 480P */ | 64 /* 720P */ | 74 /* 720P60 */ | 80 /* 1080P */ | 112 /* 1080P+ */ | 116 /* 1080P60 */ | 120 /* 4K */ | 125 /* HDR */ | 126 /* 杜比视界 */ | 127 /* 8K */;
type copyright = 1 /* 自制 */ | 2 /* 转载 */;
interface Dimension { // 视频分辨率信息
  width: number;
  height: number;
  rotate: booleanNumber;
}
type PageInfo = ({
  cid: number;
  page: number;
  from: 'vupload';
  part: string;
  duration: number;
  vid: '';
  weblink: '';
  dimension: Dimension;
  first_frame?: url;
} | { // 站外视频
  cid: number;
  page: number;
  from: 'hunan' | 'qq';
  part: string;
  duration: number;
  vid: string;
  weblink: url;
  dimension: Dimension;
  first_frame?: url;
});

// a. 历史记录数据（https://api.bilibili.com/x/v2/history）
interface HistoryItem { // 此处仅定义视频信息数据结构
  aid: number;
  videos: number;
  tid: number;
  tname: string;
  copyright: copyright;
  pic: url;
  title: string;
  pubdate: secondLevelTimestamp;
  ctime: secondLevelTimestamp;
  desc: string;
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
    arc_pay: booleanNumber;
    pay_free_watch: booleanNumber;
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
    vt: -1;
    vv: number; // 同 view
  };
  dynamic: string;
  cid?: number;
  dimension: Dimension;
  short_link_v2: url;
  first_frame?: url;
  up_from_v2?: number;
  pub_location?: string;
  cover43: '';
  favorite: false;
  type: 3 /* 视频 */;
  sub_type: 0;
  device: number;
  page?: PageInfo;
  count?: number;
  progress: 0;
  view_at: secondLevelTimestamp;
  kid: number;
  business: 'archive';
  redirect_link: url;
  bvid: string;
}
export type HistoryData = HistoryItem[];

// b. 视频信息数据（https://api.bilibili.com/x/web-interface/wbi/view）
export interface VideoInfoData {
  bvid: string;
  aid: number;
  videos: number;
  tid: number;
  tname: string;
  copyright: copyright;
  pic: url;
  title: string;
  pubdate: secondLevelTimestamp;
  ctime: secondLevelTimestamp;
  desc: string;
  desc_v2: ({ raw_text: string; type: 1; biz_id: 0 } | { raw_text: string; type: 2; biz_id: number })[];
  state: number;
  duration: number;
  forward?: number; // 仅视频撞车时有此项
  mission_id?: number; // 仅参加活动时有此项
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
  dimension: Dimension;
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
  pages: PageInfo[];
  subtitle: {
    allow_submit: boolean;
    list: {
      id: number;
      lan: string;
      lan_doc: string;
      is_lock: boolean;
      subtitle_url: '';
      type: number;
      id_str: numericString;
      ai_type: number;
      ai_status: number;
      author: { mid: 0; name: ''; sex: ''; face: ''; sign: ''; rank: 0; birthday: 0; is_fake_account: 0; is_deleted: 0; in_reg_audit: 0; is_senior_member: 0; name_render: null };
    }[];
  };
  staff?: { // 仅合作视频
    mid: number;
    title: string;
    name: string;
    face: url;
    vip: VIPInfo;
    official: OfficialVerifyInfo;
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

// c. 视频播放地址数据（https://api.bilibili.com/x/player/wbi/playurl）
export interface VideoPlayUrlData {
  from: 'local';
  result: 'suee';
  message: '';
  quality: quality;
  format: 'mp4' | 'flv';
  timelength: number;
  accept_format: string;
  accept_description: string[];
  accept_quality: quality[];
  video_codecid: 7 /* AVC */ | 12 /* HEVC */ | 13 /* AV1 */;
  seek_param: 'start';
  seek_type: 'second';
  durl: {
    order: number;
    length: number; // 单位为毫秒
    size: number; // 单位为字节
    ahead: '';
    vhead: '';
    url: url;
    backup_url: url[];
  }[];
  support_formats: { quality: quality; format: 'mp4' | 'flv'; new_description: string; display_desc: string; superscript: ''; codecs: null | string[] }[];
  high_format: null;
  last_play_time: 0;
  last_play_cid: 0;
  view_info: null;
}

// d. “获取哔哩哔哩用户信息”接口回应数据（/api/getuser）
export interface InternalAPIGetVideoInfoData {
  bvid: string;
  aid: number | numericString;
  videos: null | number;
  tid: null | number;
  tname: string;
  copyright: null | copyright;
  pic: url;
  title: string;
  pubdate: secondLevelTimestamp;
  ctime: secondLevelTimestamp;
  desc: string;
  desc_v2: VideoInfoData['desc_v2'];
  state: null | number;
  duration: null | number;
  forward?: undefined | number;
  mission_id?: undefined | number;
  rights: null | HistoryItem['rights'] | VideoInfoData['rights'];
  owner: VideoInfoData['owner'];
  stat: {
    aid: number | numericString;
    view: null | number;
    danmaku: null | number;
    reply: null | number;
    favorite: null | number;
    coin: null | number;
    share: null | number;
    now_rank: number;
    his_rank: number;
    like: null | number;
    dislike: 0;
    evaluation: '' | `${number}.${number}分`;
    vt: 0;
    vv?: undefined;
  };
  argue_info: VideoInfoData['argue_info'];
  dynamic: string;
  cid: number;
  dimension: Dimension;
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
  pages: {
    cid: number;
    page: number;
    from: 'vupload' | 'hunan' | 'qq';
    part: string;
    duration: null | number;
    vid: string;
    weblink: url;
    dimension: Dimension;
    first_frame?: undefined | url;
  }[];
  subtitle: null | VideoInfoData['subtitle'];
  staff?: VideoInfoData['staff'];
  is_season_display: boolean;
  user_garb: VideoInfoData['user_garb'];
  honor_reply: VideoInfoData['honor_reply'];
  like_icon: url;
  need_jump_bv: boolean;
  disable_show_up_info: boolean;
  is_story_play: booleanNumber;
  cover43?: undefined;
  favorite?: undefined;
  type?: undefined;
  sub_type?: undefined;
  device?: undefined;
  page?: undefined;
  count?: undefined;
  progress?: undefined;
  view_at?: undefined;
  kid?: undefined;
  business?: undefined;
  redirect_link?: undefined;
}

// 4. 番剧信息相关
type mediaType = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type mediaTypeName = '番剧' | '电影' | '纪录片' | '国创' | '电视剧' | '漫画' | '综艺';
export interface BangumiAPIResponse<dataType> { // B 站番剧 API 返回的 JSON 数据结构
  code: number;
  message: string;
  result?: dataType;
}
interface AreaInfo {
  id: number;
  name: string;
}
interface RatingInfo {
  count: number;
  score: number;
}
interface EpisodeInfo {
  aid: number;
  badge: string;
  badge_info: { bg_color: '' | hexColor; bg_color_night: '' | hexColor; text: string };
  badge_type: number;
  bvid: string;
  cid: number;
  cover: url;
  dimension: { height: number; rotate: booleanNumber; width: number };
  duration: number;
  enable_vt: false;
  ep_id: number;
  from: string;
  id: number;
  is_view_hide: boolean;
  link: url;
  long_title: string;
  pub_time: secondLevelTimestamp;
  pv: 0;
  release_date: '';
  rights: { allow_demand: booleanNumber; allow_dm: booleanNumber; allow_download: booleanNumber; area_limit: booleanNumber };
  share_copy: string;
  share_url: url;
  short_link: url;
  showDrmLoginDialog: boolean;
  skip?: { ed: { end: number; start: number }; op: { end: number; start: number } };
  status: number;
  subtitle: string;
  title: string;
  vid: '';
}
interface SeasonInfo {
  badge: string;
  badge_info: { bg_color: '' | hexColor; bg_color_night: '' | hexColor; text: string };
  badge_type: number;
  cover: url;
  enable_vt: false;
  horizontal_cover_1610: url;
  horizontal_cover_169: url;
  icon_font: { name: 'playdata-square-line@500'; text: string };
  media_id: number;
  new_ep: { cover: url; id: number; index_show: string };
  season_id: number;
  season_title: string;
  season_type: number;
  stat: { favorites: number; series_follow: number; views: number; vt: 0 };
}
interface SectionInfo {
  attr: number;
  episode_id: 0;
  episode_ids?: [] | number[];
  episodes: [] | EpisodeInfo[];
  id: number;
  report?: { season_id: numericString; season_type: numericString; sec_title: string; section_id: numericString; section_type: numericString };
  title: string;
  type: number;
  type2: 0;
}

// a. 剧集信息数据（https://api.bilibili.com/pgc/review/user）
export interface BangumiMediaData {
  media: {
    areas: AreaInfo[];
    cover: url;
    horizontal_picture: url;
    media_id: number;
    new_ep?: { id: number; index: string; index_show: string }; // 剧集失效时不存在此项
    rating?: RatingInfo;
    season_id: number;
    share_url: url;
    title: string;
    type: mediaType;
    type_name: mediaTypeName;
  };
  review?: { is_coin: booleanNumber; is_open: booleanNumber }; // 仅登录时存在此项
}

// b. 番剧信息数据（https://api.bilibili.com/pgc/view/web/season）
export interface BangumiSeasonData {
  activity: { head_bg_url: ''; id: number; title: string };
  actors: string;
  alias: '';
  areas: AreaInfo[];
  bkg_cover: url;
  cover: url;
  delivery_fragment_video: false;
  enable_vt: false;
  episodes: EpisodeInfo[];
  evaluate: string;
  freya: { bubble_desc?: string; bubble_show_cnt: number; icon_show: booleanNumber };
  hide_ep_vv_vt_dm: 1;
  icon_font: { name: 'playdata-square-line@500'; text: string };
  jp_title: '';
  link: url;
  media_id: number;
  mode: 2;
  new_ep: { desc: string; id: number; is_new: booleanNumber; title: string };
  payment?: { // 仅付费番剧
    discount: number;
    pay_type: { allow_discount: booleanNumber; allow_pack: booleanNumber; allow_ticket: booleanNumber; allow_time_limit: booleanNumber; allow_vip_discount: booleanNumber; forbid_bb: booleanNumber };
    price: numericString;
    promotion: string;
    tip: string;
    view_start_time: number;
    vip_discount: number;
    vip_first_promotion: string;
    vip_price: numericString;
    vip_promotion: string;
  };
  play_strategy?: { strategies: string[] };
  positive: { id: number; title: string };
  publish: {
    is_finish: booleanNumber;
    is_started: booleanNumber;
    pub_time: `${number}-${number}-${number} ${number}:${number}:${number}`; // YYYY-MM-DD hh:mm:ss
    pub_time_show: string;
    unknow_pub_date: booleanNumber;
    weekday: number;
  };
  rating?: RatingInfo;
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
  seasons: SeasonInfo[];
  section: SectionInfo[];
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
  type: mediaType;
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
    verify_type: officialRole;
    vip_label: { bg_color: '' | hexColor; bg_style: 0 | 1; border_color: '' | hexColor; text: string; text_color: '' | hexColor };
    vip_status: booleanNumber;
    vip_type: VIPType;
  };
  user_status: {
    area_limit: booleanNumber;
    ban_area_show: booleanNumber;
    follow: booleanNumber;
    follow_status: booleanNumber;
    login: booleanNumber;
    pay: booleanNumber;
    pay_pack_paid: booleanNumber;
    progress?: { last_ep_id: number; last_ep_index: string; last_time: number };
    sponsor: number;
    vip_info?: { due_date: millisecondLevelTimestamp; status: booleanNumber; type: VIPType };
  };
}

// c. 番剧播放地址数据（https://api.bilibili.com/pgc/player/web/playurl）
export interface BangumiPlayUrlData {
  accept_format: string;
  code: 0;
  seek_param: 'start';
  is_preview: booleanNumber;
  fnval: 0 | 1;
  video_project: true;
  fnver: 0;
  type: 'MP4' | 'FLV';
  bp: booleanNumber;
  result: 'suee';
  seek_type: 'second';
  vip_type: VIPType;
  from: 'local';
  video_codecid: 7 /* AVC */ | 12 /* HEVC */ | 13 /* AV1 */;
  record_info: { record_icon: ''; record: string };
  durl: {
    size: number; // 单位为字节
    ahead: '';
    length: number; // 单位为毫秒
    vhead: '';
    backup_url: url[];
    url: url;
    order: number;
    md5: '';
  }[];
  is_drm: false;
  no_rexcode: 0;
  format: 'mp4' | 'flv';
  support_formats: {
    display_desc: string;
    has_preview: boolean;
    sub_description: '';
    superscript: '';
    need_login?: true;
    codecs: null | string[];
    format: 'mp4' | 'flv';
    description: string;
    quality: quality;
    new_description: string;
  }[];
  message: '';
  accept_quality: quality[];
  quality: quality;
  timelength: number;
  durls: [];
  has_paid: boolean;
  vip_status: booleanNumber;
  clip_info_list: { materialNo: 0; start: number; end: number; toastText: '即将跳过片头' | '即将跳过片尾'; clipType: 'CLIP_TYPE_OP' | 'CLIP_TYPE_ED' }[];
  accept_description: string[];
  status: number;
}

// 5. 其他
// a. 朋友信息
export interface FriendInfo {
  mid: number;
  name: string;
  face: url;
  face_nft: booleanNumber;
  sign: string;
  official: { desc: string; role: officialRole; title: string; type: officialType };
  vip: { type: VIPType; status: booleanNumber };
  is_deleted: booleanNumber;
}

// b. 图床接口的回应（https://smms.app/api/v2/upload）
export interface SmmsUploadResponse {
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

// c. 导航栏数据（https://api.bilibili.com/x/web-interface/nav）
export interface NavData { // 此处仅定义部分必要字段
  isLogin: boolean;
  wbi_img: { img_url: url; sub_url: url };
}
