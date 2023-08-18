<template>
  <div class="header-container">
    <!-- 登陆盒子 -->
    <el-dialog
      v-model="showLogin"
      @close="close"
      width="20%"
      :modal="false"
      destroy-on-close
      :close-on-click-modal="false"
      class="dialog-login">
      <div class="login-box">
        <img
          :src="logo"
          class="logo" />
        <span class="title">登陆网易云账号</span>
        <div class="qr-image">
          <img ref="qrcode" />
        </div>
        <span class="detail">打开网易云音乐APP扫码登录</span>
      </div>
    </el-dialog>
    <!-- 左边设置 -->
    <div class="left">
      <span
        class="iconfont"
        @click="back"
        v-prevent
        >&#xe660;</span
      >
      <span
        class="iconfont narrow-right"
        @click="forward"
        v-prevent
        >&#xe65f;
      </span>
      <div class="search-area">
        <!-- 搜索提示框 -->
        <el-popover
          :visible="showSuggest"
          :width="460"
          placement="bottom-start"
          :popper-style="{
            color: fontColor,
            background: bg,
          }"
          :popper-class="{
            'search-tip': true,
            'popover-skin': config.bgMode == 'skin',
          }">
          <div
            class="search-tip-content"
            v-show="!isSearching">
            <div class="content-left">
              <h4 class="title">热门搜索</h4>
              <el-divider class="divider-h" />
              <ul class="keywords">
                <li
                  v-for="item in hotSearch.slice(0, 8)"
                  :key="item.searchWord"
                  @click="goSearchByRe(item.searchWord)">
                  <span> {{ item.searchWord }} </span
                  ><span class="score">{{ item.score }}次</span>
                </li>
              </ul>
            </div>
            <el-divider
              direction="vertical"
              style="height: 300px; margin: 0" />
            <div class="content-right">
              <h2 class="title">
                搜索历史
                <span
                  @mousedown.prevent="userSearch.splice(0)"
                  class="clear"
                  >清空</span
                >
              </h2>
              <el-divider class="divider-h" />
              <div
                v-show="userSearch.length == 0"
                class="no-history">
                <img :src="history" />
                <span>暂无搜索历史</span>
              </div>
              <ul
                class="keywords"
                v-show="userSearch.length != 0">
                <li
                  v-for="item in userSearch"
                  :key="item"
                  @click="goSearchByRe(item)">
                  <span> {{ item }} </span>
                </li>
              </ul>
            </div>
          </div>
          <div
            class="search-suggest"
            v-show="isSearching">
            <span class="title">在线音乐</span>
            <el-divider />
            <div
              v-for="[key, value] of suggestMap"
              :key="key"
              v-show="value.length > 0"
              class="suggest-item">
              <div
                class="suggest-item-left"
                :class="{
                  'suggest-with-image': key != '单曲',
                }">
                <span
                  :class="{
                    'is-song': key == '单曲',
                  }">
                  {{ key }}</span
                >
              </div>
              <div class="suggest-item-right">
                <div
                  v-for="(item, index) in value"
                  :key="index"
                  class="item"
                  @click="goSuggest(item)">
                  <el-image
                    v-if="key != '单曲'"
                    :src="item.pic"
                    fix="cover"
                    :class="{
                      'is-singer': item.type == 'artist',
                    }" />
                  <span>
                    {{ item.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <template #reference>
            <div>
              <input
                v-model="search"
                @keyup.enter="goSearch"
                @focusin="showSuggest = true"
                @focusout="showSuggest = false"
                @input="getSearchSuggest"
                type="text"
                placeholder="请输入你想要搜索的歌曲，歌手"
                class="search" />
              <span
                @click="goSearch"
                v-prevent
                class="iconfont"
                >&#xeafe;</span
              >
            </div>
          </template>
        </el-popover>
      </div>
    </div>
    <!-- 右边头像 -->
    <div class="right">
      <div class="login">
        <el-avatar
          :size="30"
          :src="userInfo.avatar"
          fit="cover" />
        <span
          v-prevent
          @click="showLoginBox"
          style="font-size: 12px"
          >{{ userInfo.userName }}</span
        >
        <span
          @mousedown.prevent="theme.changeDark"
          v-show="fontColor == '#101010' && bgMode == 'color'"
          class="iconfont theme"
          style="font-size: 20px"
          >&#xe635;</span
        >
        <span
          @mousedown.prevent="theme.changeLight"
          v-show="fontColor != '#101010' && bgMode == 'color'"
          class="iconfont theme"
          style="font-size: 12px"
          >&#xe764;</span
        >
        <span
          class="iconfont_1 theme"
          v-show="bgMode == 'skin'"
          @mousedown.prevent="changeSkin"
          style="font-size: 14px">
          &#xe743;
        </span>
      </div>

      <!-- 退出登陆，设置 -->
      <el-dropdown
        trigger="click"
        @command="handleClick"
        :popper-class="`dropdown ${dropDownMode} setting-drop`">
        <span
          class="iconfont"
          v-prevent
          >&#xe502;
        </span>
        <template #dropdown>
          <el-dropdown-menu
            :style="{
              color: fontColor,
              background: bg,
            }">
            <el-dropdown-item
              v-for="item in dropDownItems"
              :key="item.command"
              :command="item.command">
              <span
                :class="item.spanClass"
                :style="item.style"
                v-text="item.icon"></span>
              {{ item.name }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  reactive,
  ref,
  watch,
  inject,
  computed,
  onMounted,
  nextTick,
  Ref,
} from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  elMessage,
  setStorAge,
  getStorage,
  compressImage,
  downloadFile,
  throttle,
  getMusicUrls,
} from '@/utils';
import { elMessageType, storageType } from '@/model/enum';
import {
  createKey,
  createQrCode,
  checkStatus,
  getHotSearch,
  getSuggest,
  getMusicDetail,
} from '@/api';
import {
  DropDownItem,
  HotSearch,
  MV,
  Playlist,
  Song,
  Artist,
  Album,
  SearchSuggest,
} from '@/model';
import useHeaderStore from '@/store/header';
import useConfigStore from '@/store/config';
import useThemeStore from '@/store/theme';
import logo from '@assets/image/网易云.svg';
import history from '@assets/image/暂无搜索结果.svg';
import useFooterStore from '@/store/footer';
import useUserStore from '@/store/user';
import usePlayMusic from '@/hooks/usePlayMuisc';
import useTheme from '@/hooks/useTheme';
// 配置主题

const {
  fontColor,
  background: bg,
  shadow: boxShadow,
  themeColor,
  searchBg: searchColor,
  fontGray,
} = useTheme();
// 下列框处于哪种模式
const dropDownMode = computed(() => {
  if (config.bgMode == 'color') {
    return fontColor.value == '#ffffff' ? 'dropdown-dark' : 'dropdown-light';
  } else {
    return 'dropdown-skin';
  }
});
// 设置隐藏滚动条
const hideScroll = inject('hideScroll') as () => void;
// 路由器
const router = useRouter();
const header = useHeaderStore();
const { showLogin, cookie, user: userInfo } = storeToRefs(header);
const config = useConfigStore();
const { isFullScreen, bgMode, skin, drawerMode } = storeToRefs(config);
const footer = useFooterStore();
const { songList, songListId } = storeToRefs(footer);
const user = useUserStore();
const {
  loveSongs,
  loveVideo,
  lovePlaylist,
  loveRadio,
  loveSinger,
  loveAlbum,
  musicDownload,
  mvDownload,
  videoRecord,
  songRecord,
  loveMusicId,
  loveAlbumId,
  lovePlaylistId,
  loveSingerId,
  loveRadioId,
  loveVideoId,
  musicDownloadId,
  mvDownloadId,
  songRecordId,
  videoRecordId,
} = storeToRefs(user);
const theme = useThemeStore();

// 用户搜素的内容
const search = ref<string>('');
// 判断用户是否正在搜索
const isSearching = computed(() => {
  const isEmpty = Array.from(suggestMap.values()).every(
    (item) => item.length > 0
  );
  return search.value.length > 0 && isEmpty;
});
// 热门搜索列表
const hotSearch = reactive<HotSearch[]>(
  getStorage(storageType.SESSION, 'hotSearch') || []
);
// 用户的搜索列表
const userSearch = reactive<string[]>(
  getStorage(storageType.LOCAL, 'userSearch') || []
);
// 搜索建议
const suggestMap = reactive<Map<string, SearchSuggest[]>>(
  new Map([
    ['单曲', []],
    ['歌手', []],
    ['专辑', []],
    ['歌单', []],
  ])
);
// 是否展示搜索推荐列表
const showSuggest = ref<boolean>(false);
// 下拉列表
const dropDownItems = reactive<DropDownItem[]>([
  {
    name: '退出登陆',
    icon: '\ue61b',
    command: 'logout',
    style: 'font-size:14px;margin:0 9px 0 2px;',
    spanClass: 'iconfont_1',
  },
  {
    name: '纯色模式',
    icon: '\ue822',
    command: 'color',
    style: 'font-size:18px;margin-right:7px;',
    spanClass: 'iconfont_1',
  },
  {
    name: '皮肤模式',
    icon: '\ue743',
    command: 'skin',
    style: 'font-size:15px;margin:0 7px 0 4px;',
    spanClass: 'iconfont_1',
  },
  {
    name: '主题设置',
    icon: '\ueb6f',
    command: 'theme',
    style: 'font-size:18px;margin:0 7px 0 1.8px;',
    spanClass: 'iconfont_1',
  },
  {
    name: '导入数据',
    icon: '\ue610',
    command: 'import',
    style: 'font-size: 15px;margin: 0.5px 8.5px 0 2.8px;display: inline-block;',
    spanClass: 'iconfont_2',
  },
  {
    name: '导出数据',
    icon: '\ue635',
    command: 'export',
    style: 'font-size: 15px;margin: 0.5px 8.5px 0 2.8px;display: inline-block;',
    spanClass: 'iconfont_2',
  },
]);
// 存放二维码照片的容器
const qrcode = ref<HTMLImageElement>();
// 计时器的标志
let timeid: any = 0;

// 路由返回上一级
const back = () => {
  hideScroll();
  router.back();
};

// 路由来到下一级
const forward = () => {
  hideScroll();
  router.forward();
};

// 登陆相关的处理函数
// 创建产生二维码
const createKeyCode = (): void => {
  createKey()
    .then((response: any) => {
      const {
        data: { unikey },
      } = response;
      creatQrImage(unikey);
      CheckLoginStatus(unikey);
    })
    .catch((err: any) => {
      elMessage(elMessageType.ERROR, err.message);
    });
};

// 产生二维码的base64并挂载到容器上
const creatQrImage = (key: string): void => {
  createQrCode(key)
    .then((response: any) => {
      const {
        data: { qrimg },
      } = response;
      qrcode.value!.src = qrimg;
    })
    .catch((err: any) => {
      elMessage(elMessageType.ERROR, err.message);
    });
};

// 监测登陆状态
const CheckLoginStatus = (key: string): void => {
  timeid = setInterval(async () => {
    const response: any = await checkStatus(key).catch((err: any) => {
      elMessage(elMessageType.ERROR, err.message);
    });
    const { code, message } = response;
    // 根据code状态判断登陆状态
    if (code == '800') {
      // 提醒用户二维码已过期
      elMessage(elMessageType.INFO, message);
      // 清除timeid
      clearInterval(timeid);
      // 重新刷新二维码
      createKeyCode();
    } else if (code == '803') {
      // 关闭登陆盒子
      showLogin.value = false;
      // 本地存储cookie
      cookie.value = response.cookie;
      // 获取用户信息
      header.getInfo();
      // 提醒用户登陆成功
      elMessage(elMessageType.SUCCESS, message);
      // 清除计时器
      clearInterval(timeid);
    }
  }, 6000);
};

// 打开登陆盒子
const showLoginBox = () => {
  if (!cookie.value) {
    showLogin.value = true;
  } else {
    elMessage(elMessageType.SUCCESS, '已成功登陆，切勿重复点击！');
  }
};

// 关闭登陆盒子的回调
const close = () => {
  clearInterval(timeid);
};

// 下拉框相应的点击处理
// 切换皮肤
const changeSkin = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.click();
  input.onchange = async () => {
    const files = input.files;
    if (files && files.length > 0) {
      const file = files[0];
      const skinUrl = await compressImage(file, 3840, 2160, 0.6);
      skin.value = skinUrl;
      document.body.removeChild(input);
    }
  };
};

// 导出用户数据文件
const exportConfig = () => {
  const userInfo = `loveMusic-o-(*)-${JSON.stringify(
    loveSongs.value
  )}\nloveVideo-o-(*)-${JSON.stringify(
    loveVideo.value
  )}\nlovePlaylist-o-(*)-${JSON.stringify(
    lovePlaylist.value
  )}\nloveRadio-o-(*)-${JSON.stringify(
    loveRadio.value
  )}\nloveSinger-o-(*)-${JSON.stringify(
    loveSinger.value
  )}\nloveAlbum-o-(*)-${JSON.stringify(
    loveAlbum.value
  )}\nmusicDownload-o-(*)-${JSON.stringify(
    musicDownload.value
  )}\nmvDownload-o-(*)-${JSON.stringify(
    mvDownload.value
  )}\nsongRecord-o-(*)-${JSON.stringify(
    songRecord.value
  )}\nvideoRecord-o-(*)-${JSON.stringify(
    videoRecord.value
  )}\nuserPlaylist-o-(*)-${JSON.stringify(songList.value)}\nbgmode-p-(*)-${
    bgMode.value
  }\nskin-p-(*)-${skin.value}`;
  const blob = new Blob([userInfo], {
    type: 'text/plain; charset=utf-8',
  });
  downloadFile(blob, 'config.txt');
};

// 读取用户数据文件
const parseConfig = () => {
  const upload = document.createElement('input');
  upload.style.display = 'none';
  upload.type = 'file';
  upload.accept = '.txt';
  upload.onchange = async (event: any) => {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      if (!/\.txt$/.test(file.name) && file.name == 'config') {
        return elMessage(elMessageType.ERROR, '请上传配置文件！');
      }
      const reader = new FileReader();
      reader.readAsText(file, 'utf-8');
      reader.onload = (e: any) => {
        let res = e.target.result;
        const userMap: Map<string, any> = new Map(
          res.split('\n').map((item: string) => {
            const key = item.split('-(*)-')[0].split('-')[0];
            const flag = item.split('-(*)-')[0].split('-')[1];
            const value = item.split('-(*)-')[1];
            return flag == 'o' ? [key, JSON.parse(value)] : [key, value];
          })
        );
        // 切换皮肤模式
        bgMode.value = userMap.get('bgmode');
        skin.value = userMap.get('skin');
        if (bgMode.value == 'skin') {
          theme.changeSkinMode();
          config.changeSkin();
        }
        const loveMusicData = (userMap.get('loveMusic') as Song[]).filter(
          (song) => loveMusicId.value.get(song.id) == undefined
        );
        loveSongs.value.push(...loveMusicData);
        const loveVideoData = (userMap.get('loveVideo') as MV[]).filter(
          (video) => loveVideoId.value.get(video.id) == undefined
        );
        loveVideo.value.push(...loveVideoData);
        const lovePlaylistData = (
          userMap.get('lovePlaylist') as Playlist[]
        ).filter(
          (playlist) => lovePlaylistId.value.get(playlist.id) == undefined
        );
        lovePlaylist.value.push(...lovePlaylistData);
        const loveRadioData = (userMap.get('loveRadio') as Playlist[]).filter(
          (radio) => loveRadioId.value.get(radio.id) == undefined
        );
        loveRadio.value.push(...loveRadioData);
        const loveSingerData = (userMap.get('loveSinger') as Artist[]).filter(
          (artist) => loveSingerId.value.get(artist.id) == undefined
        );
        loveSinger.value.push(...loveSingerData);
        const loveAlbumData = (userMap.get('loveAlbum') as Album[]).filter(
          (album) => loveAlbumId.value.get(album.id) == undefined
        );
        loveAlbum.value.push(...loveAlbumData);
        const musicDownloadData = (
          userMap.get('musicDownload') as Song[]
        ).filter((song) => musicDownloadId.value.get(song.id) == undefined);
        musicDownload.value.push(...musicDownloadData);
        const mvDownloadData = (userMap.get('mvDownload') as MV[]).filter(
          (mv) => mvDownloadId.value.get(mv.id) == undefined
        );
        mvDownload.value.push(...mvDownloadData);
        const songRecordData = (userMap.get('songRecord') as Song[]).filter(
          (song) => songRecordId.value.get(song.id) == undefined
        );
        songRecord.value.push(...songRecordData);
        const videoRecordData = (userMap.get('videoRecord') as MV[]).filter(
          (mv) => videoRecordId.value.get(mv.id) == undefined
        );
        videoRecord.value.push(...videoRecordData);
        const playData = (userMap.get('userPlaylist') as Song[]).filter(
          (song) => songListId.value.get(song.id) == undefined
        );
        songList.value.push(...playData);
        elMessage(elMessageType.SUCCESS, '个人数据导入成功');
      };
      reader.onerror = () => {
        elMessage(elMessageType.ERROR, '读取配置文件失败！');
      };
    }
  };
  document.body.appendChild(upload);
  upload.click();
  document.body.removeChild(upload);
};

// 下拉框选择处理
const handleClick = async (command: string) => {
  if (command == 'logout' && cookie.value) {
    header.logout();
  } else if (command == 'fullScreen') {
    if (isFullScreen.value) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  } else if (command == 'color') {
    theme.changeLight();
    config.changeColor();
  } else if (command == 'skin') {
    if (!skin.value) {
      changeSkin();
    }
    await nextTick();
    config.changeSkin();
    theme.changeSkinMode();
  } else if (command == 'theme') {
    drawerMode.value = 'theme';
    footer.showList = true;
  } else if (command == 'export') {
    exportConfig();
  } else if (command == 'import') {
    parseConfig();
  }
};

// 搜索相关的事件
// 得到推荐的搜索列表
const getSearchData = async () => {
  if (hotSearch.length == 0) {
    try {
      const response: any = await getHotSearch();
      const { data } = response;
      data.forEach((item: any) => {
        hotSearch.push({
          searchWord: item.searchWord,
          score: item.score,
        });
      });
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  }
};

// 前往搜索的页面
const goSearch = () => {
  if (!userSearch.includes(search.value)) {
    userSearch.push(search.value);
  }
  hideScroll();
  router.push({
    name: 'search',
    query: {
      keyWord: search.value,
    },
  });
};

// 点击推荐列表搜索
const goSearchByRe = (keyWord: string) => {
  if (!userSearch.includes(keyWord)) {
    userSearch.push(keyWord);
  }
  search.value = keyWord;
  hideScroll();
  router.push({
    name: 'search',
    query: {
      keyWord,
    },
  });
};

// 获取搜索建议
const getSearchSuggest = throttle(async () => {
  if (!search.value) return;
  try {
    const response: any = await getSuggest(search.value);
    const {
      result: { albums, artists, songs, playlists },
    } = response;
    if (songs) {
      const target = suggestMap.get('单曲') as SearchSuggest[];
      if (target.length > songs.length) target.splice(songs.length);
      (songs as any[]).forEach((item, index) => {
        const { id, name, artists } = item;
        if (index < target.length) {
          target[index] = {
            type: 'song',
            id,
            name: name + '-' + artists[0].name,
            pic: artists[0].img1v1Url,
          };
        } else {
          target.push({
            type: 'song',
            id,
            name: name + '-' + artists[0].name,
            pic: artists[0].img1v1Url,
          });
        }
      });
    }
    if (artists) {
      const target = suggestMap.get('歌手') as SearchSuggest[];
      if (target.length > artists.length) target.splice(artists.length);
      (artists as any[]).forEach((item, index) => {
        const { id, name, picUrl } = item;
        if (index < target.length) {
          target[index] = {
            type: 'artist',
            id,
            name,
            pic: picUrl,
          };
        } else {
          target?.push({
            type: 'artist',
            id,
            name,
            pic: picUrl,
          });
        }
      });
    }
    if (albums) {
      const target = suggestMap.get('专辑') as SearchSuggest[];
      if (target.length > albums.length) target.splice(albums.length);
      (albums as any[]).forEach((item, index) => {
        const { id, name, artist } = item;
        if (index < target.length) {
          target[index] = {
            type: 'album',
            id,
            pic: artist.picUrl,
            name: name + '-' + artist.name,
            artistId: artist.id,
          };
        } else {
          target?.push({
            type: 'album',
            id,
            pic: artist.picUrl,
            name: name + '-' + artist.name,
            artistId: artist.id,
          });
        }
      });
    }
    if (playlists) {
      const target = suggestMap.get('歌单') as SearchSuggest[];
      if (target.length > playlists.length) target.splice(playlists.length);
      (playlists as any[]).forEach((item, index) => {
        const { id, name, coverImgUrl } = item;
        if (index < target.length) {
          target[index] = {
            type: 'playlist',
            id,
            name,
            pic: coverImgUrl,
          };
        } else {
          target.push({
            type: 'playlist',
            id,
            name,
            pic: coverImgUrl,
          });
        }
      });
    }
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }
}, 300);

const { playMusic } = usePlayMusic();
// 前往搜索建议
const goSuggest = async (item: SearchSuggest) => {
  if (item.type != 'song') {
    hideScroll();
    if (item.type == 'artist') {
      router.push({
        name: item.type,
        query: {
          type: 'playlist',
          id: item.id,
        },
      });
    } else if (item.type == 'album') {
      router.push({
        name: item.type,
        query: {
          id: item.id,
          artistId: item.artistId,
        },
      });
    } else {
      router.push({
        name: item.type,
        query: {
          id: item.id,
          score: Math.floor(+item.id / 100),
        },
      });
    }
  } else {
    try {
      const response: any = await getMusicDetail(item.id);
      const { songs } = response;
      const temp: Song[] = (songs as any[]).map((item) => {
        const { id, name, ar, al, fee, dt } = item;
        return {
          id: id,
          name: name,
          singer: ar[0].name,
          songImage: al.picUrl,
          album: al.name,
          available: fee,
          time: dt,
          url: '',
        };
      });
      await getMusicUrls(temp);
      playMusic(temp[0]);
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  }
};

// 检测是否展示登陆二维码
watch(showLogin, (newVal) => {
  if (newVal) {
    // 生成二维码
    createKeyCode();
  }
});

// 检测屏幕变化改变样式
onMounted(() => {
  // 获取热门推荐数据
  getSearchData();
  // 屏幕变化时改变值
  document.addEventListener('fullscreenchange', () => {
    isFullScreen.value = !isFullScreen.value;
  });
  // 缓存结果
  window.addEventListener('beforeunload', () => {
    setStorAge(storageType.LOCAL, 'userSearch', userSearch);
  });
});
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@background: v-bind(bg);
@shadow: v-bind(boxShadow);
@search-bg: v-bind(searchColor);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);
@color-white: #ffffff;

.search-tip-content {
  display: flex;
  padding: 0 5px;
  .content-left,
  .content-right {
    width: 230px;
    height: 300px;

    .divider-h {
      margin: 10px 0;
    }
    .title {
      margin: 10px 0 0 15px;
      font-size: 14px;
      letter-spacing: 1px;
      font-weight: 520;
      color: @font-color;
      line-height: 14px;
      .clear {
        font-size: 12px;
        margin-left: 100px;
        display: inline-block;
        height: 12px;
        cursor: pointer;
        color: @font-color-gray;
        &:hover {
          color: @theme-color;
        }
      }
    }
    .keywords {
      height: 254px;

      span {
        font-size: 13px;
        height: 13px;
        line-height: 13px;
        color: @font-color;
        letter-spacing: 1px;
      }
      li {
        padding: 9px 10px;
        position: relative;
        display: flex;
        align-items: center;
        margin-left: 5px;
        &:hover {
          background-color: rgba(225, 225, 225, 0.2);
        }
        .score {
          font-size: 13px;
          position: absolute;
          right: 5px;
          letter-spacing: 0;
        }
      }

      scroll-behavior: smooth;
      overflow: auto;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}

.search-suggest {
  max-height: 500px;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  display: flex;
  flex-direction: column;
  padding: 15px 10px;
  .title {
    color: @font-color;
    font-size: 14px;
  }
  .el-divider {
    margin: 10px 0;
  }
  .is-singer {
    border-radius: 50% !important;
  }

  .suggest-item {
    display: flex;
    margin: 2px 10px;
    cursor: pointer;

    span {
      color: @font-color;
      font-size: 13px;
    }
    .suggest-item-left {
      .is-song {
        padding-top: 10px !important;
      }
      span {
        padding-top: 15px;
        display: inline-block;
      }
    }
    .suggest-item-right {
      width: 390px;
      .item {
        display: flex;
        align-items: center;
        border-radius: 5px;
        padding: 7px 0 7px 15px;
        &:hover {
          background-color: rgba(225, 225, 225, 0.2);
        }
        .el-image {
          margin-right: 8px;
          height: 35px;
          width: 35px;
          border-radius: 5px;
        }
      }
    }
  }
}

.content-right {
  .no-history {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-left: 5px;
    img {
      width: 200px;
      height: 200px;
    }
    span {
      font-size: 14px;
      letter-spacing: 1px;
      color: @font-color-gray;
    }
  }
}

.header-container {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;

  .left {
    display: flex;
    align-items: center;
    margin-left: 3.5vw;
    .iconfont {
      display: block;
      color: @font-color-gray;
      font-size: 16px;
      cursor: pointer;
    }
    .narrow-right {
      margin: 0 20px;
    }
    .search-area {
      width: 300px;
      position: relative;

      span {
        position: absolute;
        right: 12px;
        top: 2px;
        font-size: 20px;
        color: @font-color-gray;
        display: block;
      }

      .search {
        width: 300px;
        height: 34px;
        border-radius: 17px;
        outline: none;
        font-size: 13px;
        padding-left: 20px;
        background-color: @search-bg;
        color: @font-color;
        border: 1px solid @color-white;
        &::placeholder {
          color: @font-color-gray;
        }
      }
    }
  }
  .right {
    position: absolute;
    right: 4vw;
    display: flex;
    align-items: center;
    .login {
      display: flex;
      cursor: pointer;
      align-items: center;
      span {
        margin-left: 10px;
        font-size: 13px;
        color: @font-color-gray;
      }
      .theme {
        margin-left: 5px;
        display: inline-block;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
      }
    }
    .iconfont {
      color: @font-color-gray;
      margin-left: 5px;
      font-size: 14px;
      cursor: pointer;
    }
    .logout {
      margin-left: 5px;
      font-size: 10px;
    }
  }

  .login-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: @background;

    .title {
      font-size: 20px;
      font-weight: 550;
      color: @font-color;
      margin: 10px 0;
    }
    .logo {
      width: 40px;
    }
    .detail {
      margin-top: 5px;
      font-size: 14px;
      color: @font-color;
    }
    .qr-image {
      margin-bottom: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>

<style lang="less">
@background: v-bind(bg);
@shadow: v-bind(boxShadow);
@import './index.less';
</style>
