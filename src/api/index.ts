import request from '@/utils/request';
import { getTimeStamp } from '@/utils';

// 创造二维码key的接口
export const createKey = () =>
  request.get(`/login/qr/key?timestamp=${getTimeStamp()}`);

// 产生base64地址的接口
export const createQrCode = (key: string) =>
  request.get(
    `/login/qr/create?key=${key}&qrimg=true&timestamp=${getTimeStamp()}`
  );

// 监测登陆状态的接口
export const checkStatus = (key: string) =>
  request.get(`/login/qr/check?key=${key}&timestamp=${getTimeStamp()}`);

// 获取用户的账号信息
export const getUserID = () => request.get('/user/account');

// 获取用户具体信息
export const getUserInfo = (uid: string) =>
  request.get(`/user/detail?uid=${uid}`);

// 退出登陆
export const loginOut = () => request.get('/logout');

// 获取轮播图片
export const getBanner = () => request.get('/banner?type=0');

// 获取获取推荐的歌曲
export const getDeafultSong = (limit: number) =>
  request.get(`/record/recent/song?limit=${limit}`);

// 获取音乐的url
export const getMusicUrl = (id: string) =>
  request.get(`/song/url?id=${id}&br=320000`);

// 获取mv
export const getMv = (
  limit: number,
  area: string,
  type: string,
  order: string
) =>
  request.get(
    `/mv/all?limit=${limit}&area=${area}&type=${type}&order=${order}`
  );

// 获取歌单详情
export const getPlayListDetail = (id: string) =>
  request.get(`/playlist/detail?id=${id}`);

// 获取歌单的所有歌曲
export const getPlayListSong = (id: string) =>
  request.get(`/playlist/track/all?id=${id}`);

// 判断歌曲是否可用
export const getMuiscAccess = (id: string) =>
  request.get(`/check/music?id=${id}`);

// 获取热门搜索列表
export const getHotSearch = () => request.get('/search/hot/detail');

// 根据关键词搜索歌曲
export const searchMusic = (type: number, limit: number, keywords: string) =>
  request.get(`/search?keywords=${keywords}&type=${type}&limit=${limit}`);

// 获取Mv数据
export const getMvDetail = (id: string) => request.get(`/mv/detail?mvid=${id}`);

// 获取mv的地址
export const getMvUrl = (id: string) => request.get(`/mv/url?id=${id}`);

// 获取相关mv
export const getSimiMv = (id: string) => request.get(`/simi/mv?mvid=${id}`);

// 获取曲风列表
export const getStyleList = () => request.get('/style/list');

// 获取曲风详情
export const getStylePlayList = (id: string) =>
  request.get(`/style/playlist?tagId=${id}&size=50`);

// 获取歌手榜
export const getArtistList = (type: number) =>
  request.get(`/toplist/artist?type=${type}`);

// 获取歌手信息
export const getArtistInfo = (id: string) => request.get(`/artists?id=${id}`);

// 获取歌手mv
export const getArtistMv = (id: string) => request.get(`/artist/mv?id=${id}`);

// 获取歌手描述
export const getArtistDesc = (id: string) =>
  request.get(`/artist/desc?id=${id}`);

// 获取歌手专辑
export const getArtistAlbum = (id: string) =>
  request.get(`/artist/album?id=${id}`);

// 获取用户最近播放记录
export const getUserRencent = (uid: string) =>
  request.get(`/user/record?uid=${uid}&type=1`);

// 获取用户最近观看的视频
export const getUserRecentVideo = () => request.get('/playlist/video/recent');

// 获取用户喜欢音乐的列表

export const getUserLikes = (uid: string) =>
  request.get(`/likelist?uid=${uid}`);

// 获取音乐详情
export const getMusicDetail = (id: string) =>
  request.get(`/song/detail?ids=${id}`);

// 获取专辑详情
export const getAlbumDetail = (id: string) => request.get(`/album?id=${id}`);

// 获取歌词
export const getLyrics = (id: string) => request.get(`/lyric?id=${id}`);

// 获取相似音乐
export const getSimiMusic = (id: string) => request.get(`/simi/song?id=${id}`);

// 获取视频详情
export const getVideoDetail = (id: string) =>
  request.get(`/video/detail?id=${id}`);

// 获取视频播放地址
export const getVideoUrl = (id: string) => request.get(`/video/url?id=${id}`);

// 获取相似视频
export const getSimiVideo = (id: string) =>
  request.get(`/related/allvideo?id=${id}`);

// 获取歌手全部音乐
export const getArtistSongs = (id: string, limit: number) =>
  request.get(`/artist/songs?id=${id}&limit=${limit}`);

// 获取歌手列表
export const getArtists = (
  type: number,
  area: number,
  limit: number,
  initial?: string
) => {
  const queryStr = initial
    ? `/artist/list?type=${type}&area=${area}&initial=${initial}&limit=${limit}`
    : `/artist/list?type=${type}&area=${area}&limit=${limit}`;
  return request.get(queryStr);
};

// 获取网友推荐歌单的分类
export const getRecTags = () => request.get('/playlist/catlist');

// 获取精品歌单的分类
export const getTopTags = () => request.get('/playlist/highquality/tags');

// 获取精品歌单
export const getTopPlaylist = (limit: number, cat?: string) => {
  const queryStr = cat
    ? `/top/playlist/highquality?limit=${limit}&cat=${cat}`
    : `/top/playlist/highquality?limit=${limit}`;
  return request.get(queryStr);
};

// 获取网友推荐歌单
export const getRecPlaylist = (limit: number, cat?: string) => {
  const queryStr = cat
    ? `/top/playlist?limit=${limit}&cat=${cat}`
    : `/top/playlist?limit=${limit}`;
  return request.get(queryStr);
};

// 获取评论
export const getComments = (
  id: string,
  type: string,
  limit: number,
  sortType: string = '1'
) =>
  request.get(
    `/comment/new?id=${id}&type=${type}&limit=${limit}&sortType=${sortType}`
  );

// 获取热门评论
export const getHotComments = (id: string, type: string, limit: number) =>
  request.get(`/comment/hot?id=${id}&type=${type}&limit=${limit}`);

// 获取电台banner
export const getRadioBanner = () => request.get('/dj/banner');

// 获取电台详情
export const getRadioDetail = (rid: string) =>
  request.get(`/dj/detail?rid=${rid}`);

// 获取电台对应的歌曲
export const getRadioSong = (rid: string, limit: number) =>
  request.get(`/dj/program?rid=${rid}&limit=${limit}`);

// 获取电台分类
export const getRadioType = () => request.get('/dj/catelist');

// 获取分类下的电台
export const getRadios = (type: string) =>
  request.get(`/dj/recommend/type?type=${type}`);

// 获取搜索建议
export const getSuggest = (keyword: string, signal: AbortSignal) =>
  request.get(`/search/suggest?keywords=${keyword}`, { signal });
