// 菜单的数据模型
export interface Menu {
  label: string;
  icon: string;
  index: string;
  spanClass: string;
}

// 用户
export interface User {
  // 用户名
  uid: string;
  // 用户昵称
  userName: string;
  // 用户头像
  avatar: string;
}

// 歌曲
export interface Song {
  // 音乐Id
  id: string;
  // 音乐名字
  name: string;
  // 歌手名字
  singer: string;
  // 音乐照片
  songImage: string;
  // 歌曲专辑
  album: string;
  // 音乐的链接
  url?: string;
  // 音乐的播放时间
  time?: string;
  // 歌曲是否可用，可用为"ok"
  available?: string;
  // 用户是否喜欢这首歌
  isLove?: boolean;
  // 歌词
  lyric?: string[];
}

// 歌单
export interface Playlist {
  // 歌单名字
  name: string;
  // 歌单Id
  id: string;
  // 歌单的封面图
  image: string;
  // 歌单的热度
  playCount: string;
  // 歌单描述
  description: string;
  // 歌单分类
  tag: string[];
  // 歌单的创建者
  creator: Creator;
  // 是否收藏
  isLove?: boolean;
}

// 歌单创建者
export interface Creator {
  nickname: string;
  avatarUrl: string;
}

// Mv
export interface MV {
  // mv的id
  id: string;
  // mv封面
  image: string;
  // mv的名字
  name: string;
  // mv作者的名字
  artist: string;
  // mv的播放量
  playCount: string;
  // mv的链接
  url?: string;
  // mv的发布时间
  publishTime?: string;
  // mv的时长
  time?: string;
  // mv是否可用
  available?: string;
  // 是否收藏mv
  isLove?: boolean;
}

// 热搜列表
export interface HotSearch {
  searchWord: string;
  score: string;
}

// 曲风
export interface MusicStyle {
  name: string;
  id: string;
  cover?: string;
}

// 曲风下的歌单
export interface StylePlayList {
  id: string;
  name: string;
  cover: string;
}

// 歌手
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

// 歌手细节
export interface ArtistDesc {
  title: string;
  content: string;
}

// 歌手专辑
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

// 下拉菜单选项
export interface DropDownItem {
  name: string;
  icon: string;
  command: string;
  style: string;
  isIcon1?: boolean;
  spanClass?: string;
}

// 评论
export interface Comment {
  commentId: string;
  // 昵称
  nickname: string;
  // 头像
  avatar: string;
  // 评论内容
  content: string;
  // 评论时间
  time: string;
  // 点赞个数
  likeCount: string;
  // ip地址
  ip: string;
  // 是否点过赞
  isLove?: boolean;
  // 恢复
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
