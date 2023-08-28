<template>
  <el-scrollbar :max-height="contentHeight">
    <div class="search-container scroll-container">
      <!-- 批量操作 -->
      <OnlineBatch
        v-show="showSelect"
        :songs="curList"
        v-model:show-select="showSelect"
        ref="batch" />
      <!-- 顶部歌手搜索结果展示 -->
      <div
        class="result-singer"
        v-show="firstSinger.name && !showSelect"
        @click="
          router.push({
            name: 'artist',
            query: {
              id: firstSinger.id,
              score: firstSinger.score,
            },
          })
        ">
        <img
          :src="firstSinger.avatar"
          class="left-singer" />
        <div class="right-singer">
          <h4 class="singer-name">歌手：{{ firstSinger.name }}</h4>
          <p class="singer-info">
            <span>专辑：{{ firstSinger.albumSize }}</span>
            <span>视频：{{ firstSinger.mvSize }}</span>
          </p>
        </div>
        <CommonButton
          :name="firstSinger.isLove ? '取消关注' : '关注歌手'"
          :icon="firstSinger.isLove ? '&#xe760;' : '&#xe761;'"
          :icon-style="firstSinger.isLove ? 'color:#ff6a6a;' : ''"
          @click.stop="
            user.addLove(firstSinger, user.loveSinger, user.loveSingerId)
          " />
      </div>
      <Tab
        v-show="!showSelect"
        @getActive="getActive"
        active="song"
        class="search-tab">
        <template #content>
          <el-tab-pane
            label="歌曲"
            name="song">
            <div class="song">
              <div class="header-operation">
                <PlayButton :songs="curList" />
                <CommonButton
                  icon="&#xe761;"
                  @click="loveAll"
                  name="全部收藏" />
                <CommonButton
                  icon="&#xe617;"
                  name="批量操作"
                  @click="batch?.openSelectBox()" />
              </div>
              <SongTable
                :songs="curList"
                :page-size="pageSize" />
              <Pagination
                v-show="pageSize < total"
                v-model:cur-page="curPage"
                :page-size="pageSize"
                :total="total" />
            </div>
          </el-tab-pane>
          <el-tab-pane
            label="视频"
            name="video">
            <Loading :is-loading="isLoading" />
            <NoResult
              v-show="noResult.get('video')"
              text="暂无搜索结果" />
            <ArtistMv
              :mvs="videoResult"
              :show-pagination="true"
              v-show="!noResult.get('video')" />
          </el-tab-pane>
          <el-tab-pane
            label="MV"
            name="mv">
            <Loading :is-loading="isLoading" />
            <No
              v-show="noResult.get('mv')"
              text="暂无搜索结果" />
            <ArtistMv
              :mvs="mvResult"
              :show-pagination="true"
              v-show="!noResult.get('mv')" />
          </el-tab-pane>
          <el-tab-pane
            label="专辑"
            name="album">
            <Loading :is-loading="isLoading" />
            <NoResult
              v-show="noResult.get('album')"
              text="暂无搜索结果" />
            <ArtistAlbum
              :albums="albumResult"
              :show-pagination="true"
              v-show="!noResult.get('album')" />
          </el-tab-pane>
          <el-tab-pane
            label="电台"
            name="radio">
            <Loading :is-loading="isLoading" />
            <NoResult
              v-show="noResult.get('radio')"
              text="暂无搜索结果" />
            <ArtistPlaylist
              :playlists="radioResult"
              :show-pagination="true"
              type="radio"
              v-show="!noResult.get('radio')" />
          </el-tab-pane>
          <el-tab-pane
            label="歌单"
            name="playList">
            <Loading :is-loading="isLoading" />
            <NoResult
              v-show="noResult.get('playList')"
              text="暂无搜索结果" />
            <ArtistPlaylist
              :playlists="playlistResult"
              :show-pagination="true"
              v-show="!noResult.get('playList')" />
          </el-tab-pane>
          <el-tab-pane
            label="歌手"
            name="singer">
            <Loading :is-loading="isLoading" />
            <NoResult
              v-show="noResult.get('singer')"
              text="暂无搜索结果" />
            <Singer
              v-show="!noResult.get('singer')"
              :singer-list="singerResult" />
          </el-tab-pane>
          <el-tab-pane
            label="歌词"
            name="lyric">
            <Loading :is-loading="isLoading" />
            <NoResult
              v-show="noResult.get('lyric')"
              text="暂无搜索结果" />
            <div
              v-show="!noResult.get('lyric')"
              class="lyric-container">
              <div
                class="lyric"
                v-for="song in curList"
                :key="song.id">
                <div class="lyric-operation">
                  <span
                    class="iconfont play-music"
                    @click="playMusic(song)"
                    v-prevent
                    >&#xea6e;</span
                  >
                  <span
                    class="iconfont music-info"
                    @click="shareMuiscInfo(song)"
                    v-prevent
                    >&#xe63b;</span
                  >
                  <span
                    class="iconfont"
                    @click="downloadLyric(song)"
                    v-prevent
                    >&#xe61a;</span
                  >
                  <span
                    class="open-lyric"
                    @click="openLyric(lyricMapper.get(song.id) as number)"
                    v-prevent
                    >{{
                      lyricLen[lyricMapper.get(song.id) as number] ==
                      song.lyric?.length
                        ? '收起歌词'
                        : '展开歌词'
                    }}</span
                  >
                  <span
                    class="copy-lyric"
                    @click="
                      share(
                        song.name + '\r\n' + song.lyric!.join('\r\n'),
                        '歌词复制成功！'
                      )
                    "
                    v-prevent
                    >复制歌词</span
                  >
                </div>
                <div class="lyric-left">
                  <p class="song-name">
                    <span>{{ song.name }}</span
                    ><span
                      class="is-vip iconfont"
                      v-show="song.available == '10' || song.available == '1'"
                      >&#xe607;</span
                    >
                  </p>
                  <p
                    v-for="(item, index1) in song.lyric"
                    :key="index1"
                    v-show="index1 < lyricLen[lyricMapper.get(song.id) as number]">
                    {{ item.trim() }}
                  </p>
                </div>
                <div class="lyric-center">
                  <span>{{ song.singer }}</span>
                </div>
                <div class="lyric-right">
                  <span>{{ song.album }}</span>
                  <span>{{ transformTime(song.time as string) }}</span>
                </div>
              </div>
              <Pagination
                v-show="pageSize < total"
                class="lyric-pagination"
                v-model:cur-page="curPage"
                :page-size="pageSize"
                :total="total" />
            </div>
          </el-tab-pane>
        </template>
      </Tab>
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { ref, reactive, inject, Ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { MV, Song, Album, Playlist, Artist } from '@/type';
import { ONLINE_MUISC_PAGESIZE, messageType } from '@/constants/common';
import {
  message,
  getMusicUrls,
  formatTime,
  getMusicInfos,
  transformTime,
  downloadLyric,
  share,
  shareMuiscInfo
} from '@/utils';
import { searchMusic, getMusicDetail } from '@/api';
import useUserStore from '@/store/user';
import { SongTable } from '@components/table';
import { OnlineBatch } from '@components/batch';
import { PlayButton, CommonButton } from '@components/button';
import {
  ArtistAlbum,
  ArtistMv,
  ArtistPlaylist,
  Singer
} from '@components/datalist';
import { Loading, NoResult } from '@components/result';
import Tab from '@components/tab';
import Pagination from '@components/pagination';
import usePlayMusic from '@/hooks/usePlayMuisc';
import useTheme from '@/hooks/useTheme';

// 配置主题
const {
  fontGray,
  fontColor,
  boxShadow,
  themeColor,
  singerBg,
  buttonBg,
  contentHeight
} = useTheme();
// 路由器
const router = useRouter();
// 获取用户喜欢数据
const user = useUserStore();
const { loveMusicId, loveSongs } = storeToRefs(user);
// 获取搜索关键词
const route = useRoute();
const keyWord = route.query.keyWord + '';
// 当前活跃的tab选型
const activeTab = ref<string>('song');
// 音乐搜索的结果
const musicResult = reactive<Song[]>([]);
// 视频搜索结果
const videoResult = reactive<MV[]>([]);
// mv搜索结果
const mvResult = reactive<MV[]>([]);
// 专辑搜索结果
const albumResult = reactive<Album[]>([]);
// 歌单搜索结果
const playlistResult = reactive<Playlist[]>([]);
// 电台的搜索结果
const radioResult = reactive<Playlist[]>([]);
// 歌手的搜索结果
const singerResult = reactive<Artist[]>([]);
// 第一位歌手，用以页面顶部展示
const firstSinger = computed(() =>
  singerResult.length > 0
    ? singerResult[0]
    : ({
      name: '',
      avatar: '',
      id: '',
      score: '',
      albumSize: '',
      mvSize: ''
    } as Artist)
);
// 歌词的搜索结果
const lyricResult = reactive<Song[]>([]);
// 歌词顺序的隐射
const lyricMapper = computed(
  () => new Map(lyricResult.map((item, index) => [item.id, index]))
);
// 加载数据的动画
const isLoading = ref<boolean>(false);
// 页面第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
// 是否展示占位图片
const noResult = reactive<Map<string, boolean>>(
  new Map([
    ['video', true],
    ['mv', true],
    ['album', true],
    ['radio', true],
    ['playList', true],
    ['lyric', true],
    ['singer', true]
  ])
);
// 当前展示歌词的长度
const lyricLen = reactive<number[]>([]);
// 展开或者关闭歌词
const openLyric = (index: number) => {
  lyricLen[index] =
    lyricLen[index] == lyricResult[index].lyric!.length
      ? 3
      : lyricResult[index].lyric!.length;
};
// 是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);
// 批量加载容器
const batch = ref<InstanceType<typeof OnlineBatch>>();
// 用于分页,复用歌曲与歌词的分页
// 当前页数
const curPage = ref<number>(1);
// 一页多少数据
const pageSize = computed(() =>
  activeTab.value == 'song' ? ONLINE_MUISC_PAGESIZE : 10
);
// 当前的结果
const curResult = computed(() =>
  activeTab.value == 'song' ? musicResult : lyricResult
);
// 当前展示的歌曲列表
const curList = computed(() =>
  curResult.value.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value
  )
);
// 总的数据数
const total = computed(() =>
  activeTab.value == 'song' ? musicResult.length : lyricResult.length
);

// 喜欢歌曲
const loveAll = () => {
  musicResult.forEach((item) => {
    item.isLove = true;
    const index = loveMusicId.value.get(item.id);
    if (index == undefined) {
      loveSongs.value.push(item);
    }
  });
};

// 播放音乐
const { playMusic } = usePlayMusic();

// 根据当前的活跃请求搜索结果
const getActive = async(active: string) => {
  activeTab.value = active;
  if (active == 'video') {
    if (videoResult.length != 0) return;
    isLoading.value = true;
    try {
      const response: any = await searchMusic(1014, 100, keyWord);
      const {
        result: { videos }
      } = response;
      if (videos && videos.length > 0) {
        videos.forEach((item: any) => {
          const { vid, title, coverUrl, creator, playTime } = item;
          videoResult.push({
            id: vid,
            name: title,
            image: coverUrl,
            artist: creator[0].userName,
            playCount: playTime
          });
        });
      }
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
    // 判断是否需要占位图片
    noResult.set('video', videoResult.length == 0);
  } else if (active == 'mv') {
    if (mvResult.length != 0) return;
    isLoading.value = true;
    try {
      const response: any = await searchMusic(1004, 100, keyWord);
      const {
        result: { mvs }
      } = response;
      if (mvs && mvs.length != 0) {
        mvs.forEach((item: any) => {
          const { id, name, cover, artistName, playCount } = item;
          mvResult.push({
            id,
            name,
            image: cover,
            artist: artistName,
            playCount
          });
        });
      }
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
    // 判断是否需要占位图片
    noResult.set('mv', mvResult.length == 0);
  } else if (active == 'album') {
    if (albumResult.length != 0) return;
    isLoading.value = true;
    try {
      const response: any = await searchMusic(10, 60, keyWord);
      const {
        result: { albums }
      } = response;
      if (albums && albums.length > 0) {
        albums.forEach((item: any) => {
          const { id, name, picUrl, publishTime, artist } = item;
          albumResult.push({
            id,
            name,
            cover: picUrl,
            publishTime: formatTime(publishTime),
            artistId: artist.id
          });
        });
      }
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
    // 判断是否需要占位图片
    noResult.set('mv', albumResult.length == 0);
  } else if (active == 'radio') {
    if (radioResult.length != 0) return;
    isLoading.value = true;
    try {
      const response: any = await searchMusic(1009, 100, keyWord);
      const {
        result: { djRadios }
      } = response;
      if (djRadios && djRadios.length > 0) {
        djRadios.forEach((item: any) => {
          const { id, name, picUrl, playCount } = item;
          radioResult.push({
            name,
            id,
            image: picUrl,
            playCount,
            creator: { nickname: '', avatarUrl: '' },
            tag: [],
            description: ''
          });
        });
      }
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
    // 判断是否需要占位图片
    noResult.set('radio', radioResult.length == 0);
  } else if (active == 'playList' && playlistResult.length == 0) {
    if (playlistResult.length != 0) return;
    isLoading.value = true;
    try {
      const response: any = await searchMusic(1000, 100, keyWord);
      const {
        result: { playlists }
      } = response;
      if (playlists && playlists.length > 0) {
        playlists.forEach((item: any) => {
          const { id, name, coverImgUrl, playCount } = item;
          playlistResult.push({
            id,
            name,
            image: coverImgUrl,
            playCount,
            description: '',
            tag: [],
            creator: { nickname: '', avatarUrl: '' }
          });
        });
      }
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
    // 判断是否需要占位图片
    noResult.set('radio', playlistResult.length == 0);
  } else if (active == 'lyric') {
    if (lyricResult.length != 0) return;
    isLoading.value = true;
    // 获取歌词的搜索结果并进行处理
    try {
      const response: any = await searchMusic(1006, 100, keyWord);
      const {
        result: { songs }
      } = response;
      if (songs && songs.length > 0) {
        // 获取id
        const ids = songs.map((item: any) => item.id).join(',');
        // 重新获取图片
        const dResponse: any = await getMusicDetail(ids);
        const { songs: muiscs } = dResponse;
        muiscs.forEach((item: any) => {
          lyricLen.push(3);
          getMusicInfos(lyricResult, item);
        });
        // 获取歌词
        songs.forEach((item: any, index: number) => {
          const {
            lyrics: { txt }
          } = item;
          lyricResult[index].lyric = txt.split('\n');
        });
        // 获取搜索歌曲的urls
        getMusicUrls(lyricResult);
        // 初始化歌曲喜欢状态
        user.initLoveMusic(musicResult);
      }
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
    // 判断是否需要占位图片
    noResult.set('lyric', lyricResult.length == 0);
  }
  // 关闭动画
  isLoading.value = false;
};

// 获取初始数据
const getData = async() => {
  first.value = true;
  try {
    const responses: any[] = await Promise.all([
      searchMusic(1, 100, keyWord),
      searchMusic(100, 100, keyWord)
    ]);
    responses.forEach(async(response, index) => {
      // 获取音乐搜索结果
      if (index == 0) {
        const {
          result: { songs }
        } = response;
        // 获取搜索歌曲
        if (songs && songs.length > 0) {
          // 获取id
          const ids = songs.map((item: any) => item.id).join(',');
          // 重新获取图片
          const dResponse: any = await getMusicDetail(ids);
          const { songs: muiscs } = dResponse;
          muiscs.forEach((item: any) => {
            getMusicInfos(musicResult, item);
          });
          // 获取搜索歌曲的urls
          getMusicUrls(musicResult);
          // 初始化歌曲喜欢状态
          user.initLoveMusic(musicResult);
        }
      }
      // 获取搜索歌手
      else if (index == 1) {
        const {
          result: { artists }
        } = response;
        if (artists && artists.length > 0) {
          const temp = (artists as any[]).map((item) => {
            const { id, name, picUrl, accountId, albumSize, mvSize } = item;
            return {
              id,
              name,
              avatar: picUrl,
              score: accountId,
              albumSize,
              mvSize
            };
          });
          singerResult.push(...temp);
        }
        noResult.set('singer', singerResult.length == 0);
      }
    });
  } catch (err: any) {
    message(messageType.ERROR, err.message);
  }
  // 关闭动画
  first.value = false;
};

getData();
</script>

<style lang="less" scoped>
@font-color-gray: v-bind(fontGray);
@font-color-green: v-bind(themeColor);
@font-color: v-bind(fontColor);
@box-shadow: v-bind(boxShadow);
@color-white: #ffffff;
@theme-color: v-bind(themeColor);
@singer-background: v-bind(singerBg);
@btn-background: v-bind(buttonBg);
.pagination-container {
  margin: 10px 0;
}
.lyric-pagination {
  margin-bottom: 20px;
}
.search-container {
  padding-top: 0 !important;
  padding-bottom: 0 !important;

  .result-singer {
    cursor: pointer;
    width: 82vw;
    margin: 5px 0;
    display: flex;
    padding: 15px 0 20px 1vw;
    background-color: @singer-background;
    align-items: center;
    border-radius: 5px;
    position: relative;
    .left-singer {
      height: 70px;
      width: 70px;
      border-radius: 50%;
      box-shadow: @box-shadow;
    }

    .el-button {
      height: 30px;
      width: 100px;
      font-size: 12px;
      border-radius: 15px;
      position: absolute;
      right: 30px;
      background-color: @btn-background;
      &:deep(span) {
        color: @font-color;
      }
      box-shadow: none;
      &:deep(.iconfont) {
        font-size: 15px;
      }
      &:active {
        background-color: rgba(230, 230, 230, 0.4);
      }
    }
    .right-singer {
      margin-left: 20px;
      .singer-name {
        font-size: 17px;
        letter-spacing: 1px;
        color: @font-color;
        font-weight: 530;
        &:hover {
          color: @theme-color;
        }
      }
      .singer-info {
        margin-top: 5px;
        font-size: 13px;
        color: @font-color-gray;
        span {
          &:last-child {
            margin-left: 15px;
          }
          &:hover {
            color: @theme-color;
          }
        }
      }
    }
  }
  .lyric-container {
    display: flex;
    flex-direction: column;
    width: 80vw;
    .lyric {
      width: 80vw;
      position: relative;

      display: flex;
      margin: 10px 0;
      .lyric-operation {
        height: 100px;
        width: 80vw;
        position: absolute;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        span {
          cursor: pointer;
          color: @font-color-gray;
          &:hover {
            color: @theme-color;
          }
        }
        .copy-lyric,
        .open-lyric {
          font-size: 12px;
          position: absolute;
          bottom: 0;
          right: 0;
          letter-spacing: 1px;
          z-index: 10;
        }
        .open-lyric {
          right: 80px;
        }
        &:hover .iconfont {
          opacity: 1;
        }

        .iconfont {
          opacity: 0;
          &:first-child {
            margin-left: 100px;
          }
          margin-right: 10px;
        }

        .music-info {
          padding-top: 1px;
          font-size: 15px;
        }
        .play-music {
          padding-top: 2px;
          font-size: 14px;
        }
      }
      .lyric-left {
        flex: 3;
        display: flex;
        flex-direction: column;
        p {
          height: 26px;
          display: flex;
          align-items: center;
          font-size: 12px;
          color: @font-color-gray;
        }
        .song-name {
          span {
            letter-spacing: 1px;
            color: @font-color;
            &:not(.iconfont) {
              font-size: 12px;
            }
          }
          .is-vip {
            padding-top: 0.5px;
            display: inline-block;
            font-size: 12px;
            color: @theme-color;
            margin-left: 4px;
          }
        }
      }
      .lyric-center,
      .lyric-right {
        flex: 1;
        display: flex;
        span {
          height: 26px;
          display: inline-block;
          line-height: 26px;
          letter-spacing: 1px;
          font-size: 12px;
          color: @font-color;
        }
      }
      .lyric-right {
        position: relative;
        span {
          &:last-child {
            position: absolute;
            right: 0;
            color: @font-color-gray;
            font-size: 11px !important;
          }
        }
      }
    }
  }

  .loading {
    position: absolute;
    top: 0;
    z-index: 100;
  }
  .mv {
    width: 80vw;
    &:deep(.mv-simi) {
      width: 80vw;
    }

    &:deep(.mv-recommend .mask) {
      width: 232px;
    }
    &:deep(.mv-recommend .image) {
      width: 232px;
    }
    &:deep(.mv-recommend .singer) {
      width: 232px;
    }
    &:deep(.mv-recommend .title-name) {
      width: 232px;
    }
  }

  .singer-container {
    &:deep(.singer-list) {
      width: 80vw;
    }

    &:deep(.singer .el-image) {
      width: 187.5px;
    }
    &:deep(.singer span) {
      width: 187.5px;
    }
  }

  .playlist {
    @common: 186.5px;
    &:deep(.content) {
      width: 80vw;
    }
    &:deep(.content .list .mask) {
      width: @common;
      height: @common;
    }
    &:deep(.content .list .playcount) {
      top: 155px;
    }
    &:deep(.content .list .el-image) {
      width: @common;
      height: @common;
    }
    &:deep(.content .list .name) {
      width: @common;
    }
  }

  .header-operation {
    margin: 15px 0;
    .el-button {
      font-size: 13px;
      width: 125px !important;
    }
    .play {
      background-color: @theme-color;
      color: @color-white;
    }
  }

  .search-tab {
    &:deep(.el-tab-pane) {
      position: relative;
    }
    &:deep(.el-tabs__active-bar) {
      left: 5.5px;
    }
  }
}
</style>
