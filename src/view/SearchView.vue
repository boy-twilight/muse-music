<template>
  <div class="search-container scroll-container">
    <!-- 批量操作 -->
    <OnlineBatch
      v-show="showSelect"
      :songs="musicResult"
      :song-id-mapper="songIdMapper"
      @close-select="closeSelect" />
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
              <PlayButton :songs="musicResult" />
              <DecoratedButton
                icon="&#xe761;"
                @click.native="loveAll"
                name="全部收藏" />
              <DecoratedButton
                icon="&#xe617;"
                name="批量操作"
                @click.native="showSelect = !showSelect" />
            </div>
            <SongList
              :songs="musicResult"
              :song-id-mapper="songIdMapper"
              :height="tableHeight" />
          </div>
        </el-tab-pane>
        <el-tab-pane
          label="视频"
          name="video">
          <Loading :is-loading="isLoading" />
          <NoSearch
            v-show="needNoSearch[0]"
            text="暂无搜索结果" />
          <Mv
            :mvs="videoResult"
            v-show="!needNoSearch[0]" />
        </el-tab-pane>
        <el-tab-pane
          label="MV"
          name="mv">
          <Loading :is-loading="isLoading" />
          <NoSearch
            v-show="needNoSearch[1]"
            text="暂无搜索结果" />
          <Mv
            :mvs="mvResult"
            v-show="!needNoSearch[1]" />
        </el-tab-pane>
        <el-tab-pane
          label="专辑"
          name="album">
          <Loading :is-loading="isLoading" />
          <NoSearch
            v-show="needNoSearch[2]"
            text="暂无搜索结果" />
          <Albums
            :albums="albumResult"
            v-show="!needNoSearch[2]" />
        </el-tab-pane>
        <el-tab-pane
          label="歌单"
          name="playList">
          <Loading :is-loading="isLoading" />
          <NoSearch
            v-show="needNoSearch[3]"
            text="暂无搜索结果" />
          <PlayList
            :playlists="playlistResult"
            v-show="!needNoSearch[3]" />
        </el-tab-pane>
        <el-tab-pane
          label="歌手"
          name="singer">
          <Loading :is-loading="isLoading" />
          <NoSearch
            v-show="needNoSearch[4]"
            text="暂无搜索结果" />
          <div
            v-show="!needNoSearch[4]"
            class="singers">
            <Singer
              :singer-list="singerResult"
              :show-all-avatar="false" />
          </div>
        </el-tab-pane>
      </template>
    </Tab>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, inject, Ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { MV, Song, Album, Playlist, Artist } from '@/model';
import { elMessageType } from '@/model/enum';
import {
  elMessage,
  getMusicUrls,
  formatTime,
  getRequset,
  getMusicInfos,
} from '@/utils/util';
import { searchMusic, getMusicDetail } from '@/api/api';
import useUserStore from '@/store/user';
import SongList from '@components/table/SongList.vue';
import Tab from '@components/tab/Tab.vue';
import OnlineBatch from '@components/batch/OnlineBatch.vue';
import PlayButton from '@components/button/PlayButton.vue';
import DecoratedButton from '@components/button/DecoratedButton.vue';
import Mv from '@components/datalist/Mv.vue';
import Albums from '@components/datalist/Albums.vue';
import PlayList from '@components/datalist/PlayList.vue';
import Singer from '@components/datalist/Singer.vue';
import Loading from '@components/common/Loading.vue';
import NoSearch from '@components/common/NoSearch.vue';
import useConfigStore from '@/store/config';

//配置主题
//全屏模式改变table的高
const config = useConfigStore();
const { isFullScreen } = storeToRefs(config);
const tableHeight = computed(() => (isFullScreen.value ? '580px' : '440px'));
const fontGray = inject('fontGray');

//获取用户喜欢数据
const user = useUserStore();
const { loveMusicId, loveSongs } = storeToRefs(user);
//是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);
//关闭批量操作
const closeSelect = (close: boolean) => {
  showSelect.value = close;
};
//喜欢歌曲
const loveAll = () => {
  musicResult.forEach((item) => {
    item.isLove = true;
    const index = loveMusicId.value.get(item.id);
    if (index == undefined) {
      loveSongs.value.push(item);
    }
  });
};

//获取搜索关键词
const route = useRoute();
const keyWord = route.query.keyWord + '';
//音乐搜索的结果
const musicResult = reactive<Song[]>([]);
//歌曲id与Index对应的map
const songIdMapper = computed(
  () => new Map(musicResult.map((item, index) => [item.id, index]))
);
//视频搜索结果
const videoResult = reactive<MV[]>([]);
//mv搜索结果
const mvResult = reactive<MV[]>([]);
//专辑搜索结果
const albumResult = reactive<Album[]>([]);
//歌单搜索结果
const playlistResult = reactive<Playlist[]>([]);
//歌手的搜索结果
const singerResult = reactive<Artist[]>([]);
//加载数据的动画
const isLoading = ref<boolean>(false);
//页面第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;
//是否展示占位图片
const needNoSearch = reactive<boolean[]>([false, false, false, false, false]);

//根据当前的活跃请求搜索结果
const getActive = (active: string) => {
  hideScroll();
  if (active == 'video' && videoResult.length == 0) {
    getRequset(async () => {
      try {
        const response: any = await searchMusic(1014, 60, keyWord);
        const {
          result: { videos },
        } = response;
        if (videos && videos.length > 0) {
          videos.forEach((item: any) => {
            const { vid, title, coverUrl, creator, playTime } = item;
            videoResult.push({
              id: vid,
              name: title,
              image: coverUrl,
              artist: creator[0].userName,
              playCount: playTime,
            });
          });
        }
      } catch (err: any) {
        elMessage(elMessageType.ERROR, err.message);
      }
      //关闭动画
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
      //判断是否需要占位图片
      needNoSearch[0] = videoResult.length == 0;
    }, isLoading);
  } else if (active == 'mv' && mvResult.length == 0) {
    getRequset(async () => {
      try {
        const response: any = await searchMusic(1004, 60, keyWord);
        const {
          result: { mvs },
        } = response;
        if (mvs && mvs.length != 0) {
          mvs.forEach((item: any) => {
            const { id, name, cover, artistName, playCount } = item;
            mvResult.push({
              id,
              name,
              image: cover,
              artist: artistName,
              playCount,
            });
          });
        }
      } catch (err: any) {
        elMessage(elMessageType.ERROR, err.message);
      }
      //关闭动画
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
      //判断是否需要占位图片
      needNoSearch[1] = mvResult.length == 0;
    }, isLoading);
  } else if (active == 'album' && albumResult.length == 0) {
    getRequset(async () => {
      try {
        const response: any = await searchMusic(10, 60, keyWord);
        const {
          result: { albums },
        } = response;
        if (albums && albums.length > 0) {
          albums.forEach((item: any) => {
            const { id, name, picUrl, publishTime, artist } = item;
            albumResult.push({
              id,
              name,
              cover: picUrl,
              publishTime: formatTime(publishTime),
              artistId: artist.id,
            });
          });
        }
      } catch (err: any) {
        elMessage(elMessageType.ERROR, err.message);
      }
      //关闭动画
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
      //判断是否需要占位图片
      needNoSearch[2] = mvResult.length == 0;
    }, isLoading);
  } else if (active == 'playList' && playlistResult.length == 0) {
    getRequset(async () => {
      try {
        const response: any = await searchMusic(1000, 60, keyWord);
        const {
          result: { playlists },
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
              creator: { nickname: '', avatarUrl: '' },
            });
          });
        }
      } catch (err: any) {
        elMessage(elMessageType.ERROR, err.message);
      }
      //关闭动画
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
      //判断是否需要占位图片
      needNoSearch[3] = mvResult.length == 0;
    }, isLoading);
  } else if (active == 'singer' && singerResult.length == 0) {
    getRequset(async () => {
      try {
        const response: any = await searchMusic(100, 60, keyWord);
        const {
          result: { artists },
        } = response;
        if (artists && artists.length > 0) {
          artists.forEach((item: any) => {
            const { id, name, picUrl, accountId } = item;
            singerResult.push({
              id,
              name,
              avatar: picUrl,
              score: accountId,
            });
          });
        }
      } catch (err: any) {
        elMessage(elMessageType.ERROR, err.message);
      }
      //关闭动画
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
      //判断是否需要占位图片
      needNoSearch[4] = mvResult.length == 0;
    }, isLoading);
  }
};
//获取音乐搜索结果
getRequset(async () => {
  try {
    const response: any = await searchMusic(1, 100, keyWord);
    const {
      result: { songs },
    } = response;
    //获取搜索歌曲
    if (songs && songs.length > 0) {
      //获取id
      const ids = songs.map((item: any) => item.id).join(',');
      //重新获取图片
      const dResponse: any = await getMusicDetail(ids);
      const { songs: muiscs } = dResponse;
      muiscs.forEach((item: any) => {
        getMusicInfos([] as string[], musicResult, item);
      });
      //获取搜索歌曲的urls
      getMusicUrls(ids, musicResult);
      //初始化歌曲喜欢状态
      user.initLoveMusic(musicResult);
    }
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }
  //关闭动画
  first.value = false;
}, first);
</script>

<style lang="less" scoped>
@font-color-gray: v-bind(fontGray);
@font-color-green: #1ed2a9;
.search-container {
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

  .singers {
    display: flex;
    width: 80vw;
    flex-wrap: wrap;
    &:deep(.singer .el-image) {
      width: 187.5px;
    }
    &:deep(.singer span) {
      width: 187.5px;
    }
  }

  .playlist {
    @common: 186px;
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
      background-color: @font-color-green;
      color: white;
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
