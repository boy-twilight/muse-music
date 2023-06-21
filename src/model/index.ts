//svg图标
export const Svg = `
<svg t="1682236319648" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3017" width="50" height="50"><path d="M546.462897 266.292966c-73.410207 0-133.15531-59.727448-133.155311-133.137656C413.307586 59.762759 473.05269 0 546.462897 0c73.410207 0 133.12 59.727448 133.12 133.15531 0 73.410207-59.709793 133.137655-133.12 133.137656z m-283.453794 105.736827c-67.054345 0-121.626483-54.554483-121.626482-121.644138s54.572138-121.644138 121.626482-121.644138a121.767724 121.767724 0 0 1 121.608828 121.644138c0 67.054345-54.554483 121.644138-121.608828 121.644138zM142.547862 647.185655A107.343448 107.343448 0 0 1 35.310345 539.895172a107.343448 107.343448 0 0 1 107.237517-107.237517 107.343448 107.343448 0 0 1 107.219862 107.237517 107.343448 107.343448 0 0 1-107.219862 107.272828z m120.461241 272.595862a91.047724 91.047724 0 0 1-90.941793-90.959448 91.065379 91.065379 0 0 1 90.924138-90.941793 91.065379 91.065379 0 0 1 90.941793 90.941793c0 50.14069-40.783448 90.959448-90.924138 90.959448zM546.462897 1024a79.518897 79.518897 0 0 1-79.448276-79.448276c0-43.820138 35.645793-79.448276 79.448276-79.448276a79.518897 79.518897 0 0 1 79.43062 79.448276c0 43.820138-35.628138 79.448276-79.448276 79.448276z m287.744-134.285241a64.194207 64.194207 0 0 1-64.123587-64.123587 64.194207 64.194207 0 0 1 64.123587-64.123586 64.194207 64.194207 0 0 1 64.123586 64.123586 64.194207 64.194207 0 0 1-64.123586 64.123587z m117.848275-296.695173a52.683034 52.683034 0 0 1-52.612413-52.612414 52.683034 52.683034 0 0 1 52.612413-52.630069 52.70069 52.70069 0 0 1 52.630069 52.612414 52.718345 52.718345 0 0 1-52.630069 52.630069z m-158.667034-338.696827a40.818759 40.818759 0 1 0 81.655172 0.017655 40.818759 40.818759 0 0 0-81.655172 0z" fill="#389BFF" p-id="3018"></path></svg>
`;

//菜单的数据模型
export interface Menu {
  label: string;
  icon: string;
  index: string;
  spanClass: string;
}

//用户
export interface User {
  //用户名
  uid: string;
  //用户昵称
  userName: string;
  //用户头像
  avatar: string;
}

//歌曲
export interface Song {
  // 音乐Id
  id: string;
  //音乐名字
  name: string;
  //歌手名字
  singer: string;
  //音乐照片
  songImage: string;
  //歌曲专辑
  album: string;
  //音乐的链接
  url?: string;
  //音乐的播放时间
  time?: string;
  //歌曲是否可用，可用为"ok"
  available?: string;
  //用户是否喜欢这首歌
  isLove?: boolean;
}

//歌单
export interface Playlist {
  //歌单名字
  name: string;
  //歌单Id
  id: string;
  //歌单的封面图
  image: string;
  //歌单的热度
  playCount: string;
  //歌单描述
  description: string;
  //歌单分类
  tag: string[];
  //歌单的创建者
  creator: Creator;
  //是否收藏
  isLove?: boolean;
}

//歌单创建者
export interface Creator {
  nickname: string;
  avatarUrl: string;
}

//Mv
export interface MV {
  //mv的id
  id: string;
  //mv封面
  image: string;
  //mv的名字
  name: string;
  //mv作者的名字
  artist: string;
  //mv的播放量
  playCount: string;
  //mv的链接
  url?: string;
  //mv的发布时间
  publishTime?: string;
  //mv的时长
  time?: string;
  //mv是否可用
  available?: string;
  //是否收藏mv
  isLove?: boolean;
}

//热搜列表
export interface HotSearch {
  searchWord: string;
  score: string;
}

//曲风
export interface MusicStyle {
  name: string;
  id: string;
  cover?: string;
}

//曲风下的歌单
export interface StylePlayList {
  id: string;
  name: string;
  cover: string;
}

//歌手
export interface Artist {
  id: string;
  name: string;
  avatar: string;
  score?: string;
  alias?: string[];
  briefDesc?: string;
  isLove?: boolean;
  mvSize?: string;
  albumSize?: string;
}

//歌手细节
export interface ArtistDesc {
  title: string;
  content: string;
}

//歌手专辑
export interface Album {
  name: string;
  cover: string;
  id: string;
  publishTime: string;
  artist?: string;
  company?: string;
  description?: string;
  artistId?: string;
  isLove?: boolean;
}

//下拉菜单选项
export interface DropDownItem {
  name: string;
  icon: string;
  command: string;
  style: string;
  isIcon1?: boolean;
}

//评论
export interface Comment {
  commentId: string;
  //昵称
  nickname: string;
  //头像
  avatar: string;
  //评论内容
  content: string;
  //评论时间
  time: string;
  //点赞个数
  likeCount: string;
  //ip地址
  ip: string;
  //是否点过赞
  isLove?: boolean;
  //恢复
  reply?: Comment[];
}

export interface Banner {
  id: string;
  pic: string;
}

export interface RadioType {
  id: string;
  name: string;
}
