import { ElNotification } from 'element-plus';
import { Ref, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import axios from 'axios';
import { elMessageType, storageType } from '@/model/enum';
import {
  getMusicUrl,
  getSimiMusic,
  searchMusic,
  getLyrics,
  getHotComments,
  getComments
} from '@/api';
import { Song, Comment } from '@/model';
import useThemeStore from '@/store/theme';
import router from '@/router';

// 创建一个elmessage的提示
export const elMessage = (type: string = 'success', msg: string): void => {
  switch (type) {
  case elMessageType.SUCCESS:
    ElNotification.success({
      title: 'Success',
      message: msg,
      duration: 1000
    });
    break;
  case elMessageType.ERROR:
    ElNotification.error({
      title: 'Error',
      message: msg,
      duration: 1000
    });
    break;
  case elMessageType.INFO:
    ElNotification.info({
      title: 'Infomation',
      message: msg,
      duration: 1000
    });
    break;
  case elMessageType.WARNING:
    ElNotification.info({
      title: 'Warning',
      message: msg,
      duration: 1000
    });
    break;
  }
};

// 设置浏览器本地存储
export const setStorAge = (type: string, key: string, value: any): void => {
  switch (type) {
  case storageType.LOCAL:
    {
      if (typeof value == 'object') {
        localStorage.setItem(key, JSON.stringify(value));
      } else {
        localStorage.setItem(key, value);
      }
    }

    break;
  case storageType.SESSION:
    {
      if (typeof value == 'object') {
        sessionStorage.setItem(key, JSON.stringify(value));
      } else {
        sessionStorage.setItem(key, value);
      }
    }
    break;
  }
};

// 获取浏览器本地存储
export const getStorage = (type: string, key: string): any => {
  switch (type) {
  case storageType.LOCAL: {
    try {
      return JSON.parse(localStorage.getItem(key) as string);
    } catch {
      return localStorage.getItem(key);
    }
  }
  case storageType.SESSION: {
    try {
      return JSON.parse(sessionStorage.getItem(key) as string);
    } catch {
      return sessionStorage.getItem(key);
    }
  }
  }
};

// 删除浏览器本地存储
export const removeStorage = (type: string, key: string): void => {
  switch (type) {
  case storageType.LOCAL:
    {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    }
    break;
  case storageType.SESSION:
    {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
      }
    }
    break;
  }
};

// 获取当前时间的时间戳
export const getTimeStamp = (): number => {
  return new Date().getTime();
};

// 将时间转换为时间戳
export const formatToTimeStap = (time: string): number => {
  if (time.includes('.')) {
    const min = time.split(':')[0];
    const ms = time.split(':')[1];
    return +min * 60 * 1000 + +ms * 1000;
  } else {
    const min = time.split(':')[0];
    const s = time.split(':')[1].split('.')[0];
    return +min * 60 * 1000 + +s * 1000;
  }
};

// 转换时间，将毫秒的时间转为00:00类型的时间
export const transformTime = (time: string): string => {
  const temp: number = Math.floor(+time / 1000);
  const seconds: string = temp % 60 < 10 ? '0' + (temp % 60) : '' + (temp % 60);
  const minutes: string =
    temp / 60 < 10 ? '0' + Math.floor(temp / 60) : '' + Math.floor(temp / 60);
  return minutes + ':' + seconds;
};

// 将字符串毫秒时间进行转化为妙
export const transformTotalTime = (time: string): number => {
  return +time / 1000;
};

// 将时间戳格式化为year-month-day格式
export const formatTime = (time: string): string => {
  const date: Date = new Date(time);
  return (
    date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
  );
};

// 获取音乐的url
// ids是通过，分割的多个id,list是放歌曲的容器,key字段判断要不要做持久化
export const getMusicUrls = async(
  ids: string,
  list: Song[],
  key?: string,
  exclude?: number
) => {
  try {
    // id映射
    const mapper: Map<string, number> = new Map(
      list.map((item, index) => [item.id, index])
    );
    // 当数据量过大时分批请求
    const idArr = list.map((item) => item.id);
    const requestArr: any[] = [];
    for (let i = 0; i < Math.ceil(idArr.length / 100); i++) {
      requestArr.push(
        getMusicUrl(idArr.slice(i * 100, (i + 1) * 100).join(','))
      );
    }
    const responseArr = await Promise.all(requestArr);
    responseArr.forEach((response: any) => {
      const { data } = response;
      data.forEach((item: any) => {
        const index = mapper.get(item.id) as number;
        if (item.url) {
          if (exclude != undefined) {
            if (index != exclude) {
              list[index].url = item.url;
            }
          } else {
            list[index].url = item.url;
          }
        } else {
          list[index].available = '10';
          list[index].url = '';
        }
      });
    });
    // 判断key要不要做持久化
    if (key) {
      setStorAge(storageType.SESSION, key, list);
    }
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }
};

// 从返回数据中获取音乐信息,并放入容器
export const getMusicInfos = (ids: string[], list: Song[], data: any) => {
  const { id, name, ar, al, fee, dt } = data;
  ids.push(id);
  list.push({
    id: id,
    name: name,
    singer: ar.map((item: any) => item.name).join('、'),
    songImage: al.picUrl,
    album: al.name,
    available: fee,
    time: dt,
    url: ''
  });
};

// 获取主题
export const getTheme = (): Map<string, Ref<string>> => {
  const themes = useThemeStore();
  const {
    fontBlack,
    fontColor,
    searchBg,
    background,
    menuColor,
    tableHover,
    shadow,
    active,
    themeColor,
    fontGray
  } = storeToRefs(themes);
  const themeMap: Map<string, Ref<string>> = new Map();
  themeMap.set('fontBlack', fontBlack);
  themeMap.set('fontColor', fontColor);
  themeMap.set('searchBg', searchBg);
  themeMap.set('background', background);
  themeMap.set('menuColor', menuColor);
  themeMap.set('tableHover', tableHover);
  themeMap.set('shadow', shadow);
  themeMap.set('active', active);
  themeMap.set('themeColor', themeColor);
  themeMap.set('fontGray', fontGray);
  return themeMap;
};

export const handleSingerName = (name: string): string => {
  return name.includes('、') ? name.split('、')[0] : name;
};

// 通过url进行下载
export const download = async(url: string, fileName: string) => {
  try {
    const response = await axios({
      method: 'get',
      url,
      // 必须显式指明响应类型是一个Blob对象，这样生成二进制的数据，才能通过window.URL.createObjectURL进行创建成功
      responseType: 'blob'
    });
    if (!response) {
      return;
    }
    // 将lob对象转换为域名结合式的url
    const blobUrl = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    document.body.appendChild(link);
    link.style.display = 'none';
    link.href = blobUrl;
    // 设置a标签的下载属性，设置文件名及格式，后缀名最好让后端在数据格式中返回
    link.download = fileName;
    // 自触发click事件
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    elMessage(elMessageType.SUCCESS, '下载成功！');
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }
};

// 在请求数据的过程中附带加载动画
export const getRequset = (getData: () => void, loading?: Ref<boolean>) => {
  if (loading) {
    loading.value = true;
  }
  getData();
};

// 获取相似音乐,callback找到相似歌曲的回调，用来添加播放记录
export const getSimiSong = (
  id: string,
  current: number,
  songList: Song[],
  callBack: () => void
) => {
  getRequset(async() => {
    try {
      // 当前音乐的数目
      const num = songList.length;
      const response: any = await getSimiMusic(id);
      const { songs } = response;
      for (const song of songs) {
        const { fee, name, id, artists, album } = song;
        // 判断相似歌曲是否存在播放列表中
        const index = songList.findIndex((item) => item.id == id);
        if ((fee == '0' || fee == '8') && index == -1) {
          const muisc: Song = {
            name,
            id,
            singer: artists.map((item: any) => item.name).join('、'),
            songImage: album.blurPicUrl,
            album: album.name,
            available: fee
          };
          // 获取音乐的播放链接
          const musicResponse: any = await getMusicUrl(id);
          const { data } = musicResponse;
          if (data[0].url) {
            muisc.url = data[0].url;
            muisc.time = data[0].time;
            songList.splice(current + 1, 0, muisc);
            callBack();
            elMessage(
              elMessageType.SUCCESS,
              '已找到相似歌曲' + muisc.name + '，将于下一首播放。'
            );
            break;
          }
        }
      }
      if (songList.length == num) {
        elMessage(elMessageType.INFO, '暂无相似歌曲');
      }
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  });
};

// 下载音乐
export const downloadMusic = (song: Song) => {
  if (song.available == '0' || song.available == '8') {
    const fileName = song.name + '-' + handleSingerName(song.singer) + '.mp3';
    const url = song.url as string;
    download(url, fileName);
  } else {
    if (song.available == '10') {
      elMessage(elMessageType.INFO, '该歌曲暂无版权，无法下载！');
    } else {
      elMessage(elMessageType.INFO, '该歌曲为vip歌曲，请您开通vip！');
    }
  }
};

// 前往音乐的Mv
export const playVideo = (song: Song, beforeGo: () => void) => {
  getRequset(async() => {
    // 获取mv
    try {
      const response: any = await searchMusic(
        1014,
        1,
        song.name + '' + handleSingerName(song.singer)
      );
      const {
        result: { videos }
      } = response;
      if (videos && videos.length > 0) {
        beforeGo();
        await nextTick();
        router.push({
          name: 'video',
          query: {
            id: videos[0].vid
          }
        });
      } else {
        elMessage(elMessageType.INFO, '该歌曲暂无mv.');
      }
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  });
};

// 分享
export const share = (content: string, tip?: string) => {
  navigator.clipboard.writeText(content);
  elMessage(
    elMessageType.SUCCESS,
    tip ? tip : '已成功复制到剪切板，快去分享吧！'
  );
};

// 下载歌词
export const downloadLyric = async(song: Song) => {
  try {
    const response: any = await getLyrics(song.id);
    const {
      lrc: { lyric }
    } = response;
    const words: string[] = [song.name];
    const totalTime = +(song.time as string);
    // 获取歌词
    const lyrics = (lyric as string).split('\n').map((item) => item.split(']'));
    lyrics.forEach((item) => {
      if (item.length > 1) {
        // 获取每一句歌词
        const word = item[1] ? item[1].trim() : item[1];
        // 获取歌词的时间戳
        const time = formatToTimeStap(item[0].slice(1));
        if (time < totalTime && word) {
          words.push(word);
        }
      }
    });
    const blob: Blob = new Blob([words.join('\r\n')], {
      type: 'type:text/plain; charset=utf-8'
    });
    const data = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = data;
    link.download = song.name + '-' + handleSingerName(song.name) + '.txt';
    document.body.append(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(data);
  } catch (err: any) {
    elMessage(elMessageType.ERROR, '获取歌词出错！');
  }
};

// 复制歌曲信息
export const shareMuiscInfo = (song: Song) => {
  share(
    '歌名：' +
      song.name +
      '，歌手：' +
      handleSingerName(song.singer) +
      '，专辑：' +
      song.album +
      '，时长：' +
      transformTime(song.time as string),
    '歌曲信息复制成功！'
  );
};

// 从评论的返回值中提取数据
export const getComment = (comments: any, target: Comment[]) => {
  const idMap: Map<string, string> = new Map();
  if (target.length > 0) {
    target.forEach((item) => {
      idMap.set(item.commentId, item.commentId);
    });
  }
  comments.forEach((item: any) => {
    const {
      user: { avatarUrl, nickname },
      content,
      commentId,
      time,
      likedCount,
      ipLocation: { location }
    } = item;
    let { beReplied } = item;
    if (beReplied) {
      beReplied = beReplied.map((item: any) => {
        const {
          user: { avatarUrl, nickname },
          content,
          beRepliedCommentId,
          ipLocation: { location }
        } = item;
        const comment: Comment = {
          commentId: beRepliedCommentId,
          nickname,
          content,
          time: '',
          likeCount: '0',
          avatar: avatarUrl,
          ip: location
        };
        return comment;
      });
    }
    if (!idMap.get(commentId)) {
      target.push({
        nickname,
        avatar: avatarUrl,
        content,
        time,
        likeCount: likedCount,
        commentId,
        reply: beReplied,
        ip: location
      });
    }
  });
};

// 获取资源评论
export const getSourceComments = async(
  id: string,
  type: string,
  target: Comment[],
  callBack?: () => void
) => {
  try {
    const result: any = await Promise.all([
      getHotComments(id, type, 100),
      getComments(id, type, 100, '1'),
      getComments(id, type, 100, '2')
    ]);
    result.forEach((response: any, index: number) => {
      if (index == 0) {
        const { hotComments } = response;
        if (hotComments) {
          getComment(hotComments, target);
        }
      } else {
        const {
          data: { comments }
        } = response;
        if (comments) {
          getComment(comments, target);
        }
      }
    });
    if (callBack) {
      callBack();
    }
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }
};

// 压缩图像
export const compressImage = (
  file: File,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      return reject(new Error('Failed to get canvas 2D context.'));
    }

    const image = new Image();
    image.src = URL.createObjectURL(file);

    image.onload = () => {
      let targetWidth = image.width;
      let targetHeight = image.height;

      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(
          maxWidth / targetWidth,
          maxHeight / targetHeight
        );
        targetWidth *= ratio;
        targetHeight *= ratio;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      context.clearRect(0, 0, targetWidth, targetHeight);

      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      resolve(canvas.toDataURL(file.type, quality));
    };

    image.onerror = (err) => {
      reject(err);
    };
  });
};

// 将rgb,rgba转换成hex格式
export const colorToHex = (color: string): string => {
  const regexHex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

  if (regexHex.test(color)) {
    // 输入的值已经是 Hex 格式
    return color;
  }

  const regexRGB = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
  const regexRGBA =
    /^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d*\.?\d+)\s*\)$/;

  let values: RegExpExecArray | null;

  if (regexRGBA.test(color)) {
    values = regexRGBA.exec(color);
    if (!values || values.length !== 5) {
      // 颜色值不符合 rgba() 格式要求
      return color;
    }
  } else if (regexRGB.test(color)) {
    values = regexRGB.exec(color);
    if (!values || values.length !== 4) {
      // 颜色值不符合 rgb() 格式要求
      return color;
    }
  } else {
    // 不支持的颜色值格式
    return color;
  }

  let red, green, blue;
  let alpha = 255;

  if (values.length === 4) {
    red = parseInt(values[1], 10);
    green = parseInt(values[2], 10);
    blue = parseInt(values[3], 10);
    alpha = parseFloat(values[4]);
    alpha = Math.min(Math.max(alpha, 0), 1);
    alpha = Math.round(alpha * 255);
  } else {
    red = parseInt(values[1], 10);
    green = parseInt(values[2], 10);
    blue = parseInt(values[3], 10);
  }

  red = Math.min(Math.max(red, 0), 255);
  green = Math.min(Math.max(green, 0), 255);
  blue = Math.min(Math.max(blue, 0), 255);

  const hexColor = `#${(
    (1 << 24) |
    (red << 16) |
    (green << 8) |
    blue |
    (alpha << 24)
  )
    .toString(16)
    .slice(1)}`;

  return hexColor;
};
