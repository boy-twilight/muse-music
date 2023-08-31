<template>
  <el-scrollbar :max-height="contentHeight">
    <div class="playlist-container scroll-container">
      <!-- 批量操作 -->
      <OnlineBatch
        v-show="showSelect"
        :songs="curList"
        v-model:show-select="showSelect"
        ref="batch" />
      <!-- 歌单头部 -->
      <div
        class="header"
        v-show="!showSelect">
        <img
          :src="playList.image"
          class="left-image" />
        <div class="right">
          <p class="title">{{ playList.name }}</p>
          <div class="creator">
            <el-image :src="playList.creator.avatarUrl" />
            <span class="creator-name">{{ playList.creator.nickname }}</span>
            <div class="tag">
              <span
                v-for="item in playList.tag"
                :key="item"
                >#{{ item }}</span
              >
            </div>
          </div>

          <p class="description">
            {{ playList.description }}
          </p>
          <div class="header-operation">
            <PlayButton :songs="curList" />
            <CommonButton
              :name="playList.isLove ? '取消收藏' : '收藏'"
              :icon="playList.isLove ? '&#xe760;' : '&#xe761;'"
              :icon-style="playList.isLove ? 'color:#ff6a6a;' : ''"
              @click="addLove" />
            <!-- 更多 -->
            <MoreButton
              v-if="!showSelect"
              @share="sharePlaylist"
              @open-select="batch?.openSelectBox()" />
          </div>
        </div>
      </div>
      <!-- 歌单主题 -->
      <Tab
        v-show="!showSelect"
        active="song"
        class="playlist-tab">
        <template #content>
          <el-tab-pane
            :label="`歌曲 ${playListSong.length}`"
            name="song">
            <SongTable
              :songs="curList"
              :page-size="pageSize" />
            <Pagination
              v-show="pageSize < total"
              v-model:cur-page="curPage"
              :page-size="pageSize"
              :total="total" />
          </el-tab-pane>
          <el-tab-pane
            :label="`评论 ${
              playlistComments.length < 10
                ? playlistComments.length + 10
                : playlistComments.length
            }`"
            name="comment">
            <SourceComment
              :comments="playlistComments"
              v-show="!noResult" />
            <NoResult
              v-show="noResult"
              :size="280"
              text="暂无评论数据" />
          </el-tab-pane>
        </template>
      </Tab>
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { reactive, Ref, ref, inject, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  message,
  getMusicUrls,
  getMusicInfos,
  share,
  getSourceComments,
  sleep
} from '@/utils';
import {
  ONLINE_MUISC_PAGESIZE,
  MessageType,
  SLEEP_TIME
} from '@/constants/common';
import {
  getPlayListDetail,
  getPlayListSong,
  getRadioDetail,
  getRadioSong
} from '@/api';
import { Playlist, Song, Comment } from '@/type';
import useUserStore from '@/store/user';
import { OnlineBatch } from '@components/batch';
import { SongTable } from '@components/table';
import { PlayButton, CommonButton, MoreButton } from '@components/button';
import { NoResult } from '@components/result';
import Pagination from '@components/pagination';
import Tab from '@components/tab';
import { SourceComment } from '@components/common';
import useTheme from '@/hooks/useTheme';

// 设置主题
const { fontColor, fontBlack, boxShadow, fontGray, contentHeight } = useTheme();
const user = useUserStore();
// 路由参数
const route = useRoute();
const id = route.query.id + '';
const type = route.query.type + '';
// 歌单详情
const playList = reactive<Playlist>({
  id,
  name: '',
  image: '',
  playCount: '',
  tag: [],
  description: '',
  creator: {
    nickname: '',
    avatarUrl: ''
  }
});
// 歌单歌曲
const playListSong = reactive<Song[]>([]);
// 歌单评论
const playlistComments = reactive<Comment[]>([]);
// 用于分页
// 当前页数
const curPage = ref<number>(1);
// 一页多少数据
const pageSize = ref<number>(ONLINE_MUISC_PAGESIZE);
// 当前展示的歌曲列表
const curList = computed(() =>
  playListSong.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value
  )
);
// 总的数据数
const total = computed(() => playListSong.length);
// 页面进入时的动画
const first = inject('firstLoading') as Ref<boolean>;
// 是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);
// 批量操作容器
const batch = ref<InstanceType<typeof OnlineBatch>>();
// 是否展示占位图片
const noResult = ref<boolean>(true);

// 分享歌单
const sharePlaylist = () => {
  share(
    '我有一个精品歌单分享给你：' +
      playList.name +
      '，地址：' +
      import.meta.env.VITE_APP_SHARE_URL +
      route.fullPath
  );
};

// 收藏歌单
const addLove = () => {
  if (type == 'playlist') {
    user.addLove(playList, user.lovePlaylist, user.lovePlaylistId);
  } else {
    user.addLove(playList, user.loveRadio, user.loveRadioId);
  }
};

// 获取歌曲详情和音乐
const getData = async() => {
  first.value = true;
  if (type == 'playlist') {
    try {
      const responses: any[] = await Promise.all([
        getPlayListDetail(id),
        getPlayListSong(id)
      ]);
      responses.forEach((response, index) => {
        // 获取歌单详情
        if (index == 0) {
          const {
            playlist: {
              name,
              coverImgUrl,
              description,
              tags,
              creator,
              playCount
            }
          } = response;
          playList.name = name;
          playList.image = coverImgUrl;
          playList.description = description;
          playList.tag = tags;
          playList.creator.avatarUrl = creator.avatarUrl;
          playList.creator.nickname = creator.nickname;
          playList.playCount = playCount;
          // 初始化歌单喜欢状态
          user.initLoveStatus(playList, user.lovePlaylistId);
        }
        // 获取歌单下的音乐
        else if (index == 1) {
          const { songs } = response;
          songs.forEach((item: any) => {
            // 获取音乐的基本信息
            getMusicInfos(playListSong, item);
          });
          user.initLoveMusic(playListSong);
          // 获取音乐的url
          getMusicUrls(playListSong);
        }
      });
    } catch (err: any) {
      message(MessageType.ERROR, err.message);
    }
  } else {
    try {
      const responses: any[] = await Promise.all([
        getRadioDetail(id),
        getRadioSong(id, 100)
      ]);
      responses.forEach((response, index) => {
        // 获取电台详情
        if (index == 0) {
          const {
            data: {
              name,
              dj: { avatarUrl, nickname },
              picUrl,
              desc,
              subCount
            }
          } = response;
          playList.name = name;
          playList.id = id;
          playList.description = desc;
          playList.image = picUrl;
          playList.playCount = subCount;
          playList.creator.nickname = nickname;
          playList.creator.avatarUrl = avatarUrl;
          // 初始化歌单喜欢状态
          user.initLoveStatus(playList, user.loveRadioId);
        }
        // 获取电台歌曲
        else if (index == 1) {
          const { programs } = response;
          programs.forEach((item: any) => {
            const {
              mainSong: {
                name,
                id,
                fee,
                artists,
                album: { name: albumName, picUrl },
                duration
              }
            } = item;
            playListSong.push({
              id,
              name,
              singer: artists[0].name,
              songImage: picUrl,
              album: albumName,
              available: fee,
              time: duration
            });
          });
          user.initLoveMusic(playListSong);
          getMusicUrls(playListSong);
        }
      });
    } catch (err: any) {
      message(MessageType.ERROR, err.message);
    }
  }
  await sleep(SLEEP_TIME);
  first.value = false;
  // 获取电台或者歌单评论
  const flag = type == 'playlist' ? '2' : '4';
  await getSourceComments(id, flag, playlistComments);
  noResult.value = playlistComments.length == 0;
};

getData();
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);

.no-search {
  &:deep(.no-data) {
    font-size: 15px;
  }
}
.playlist-container {
  .pagination-container {
    margin: 15px 0;
  }

  .header {
    width: 80vw;
    display: flex;
    margin-bottom: 15px;
    .left-image {
      width: 168px;
      height: 168px;
      border-radius: 10px;
      box-shadow: @shadow;
      margin-right: 20px;
      object-fit: cover;
    }
    .right {
      display: flex;
      flex-direction: column;
      .title {
        font-size: 25px;
        font-weight: bold;
        color: @font-color-light-black;
        letter-spacing: 1px;
        margin-left: 2px;
      }

      .creator {
        margin: 12px 0 10px 0;
        display: flex;
        align-items: center;
        font-size: 12px;
        color: @font-color-gray;
        .el-image {
          width: 30px;
          height: 30px;
          object-fit: cover;
          border-radius: 50%;
          box-shadow: @shadow;
        }
        span {
          display: inline-block;
          margin: 0 5px;
        }
        .creator-name {
          margin: 0 40px 0 10px;
        }
      }
      .description {
        font-size: 12px;
        color: @font-color-gray;
        text-indent: 0.5em;
        height: 33px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .header-operation {
        margin-top: 13px;
      }
    }
  }

  .playlist-tab {
    &:deep(.el-tabs__item) {
      font-size: 13px;
      letter-spacing: 0;
    }
    &:deep(.el-tabs__active-bar) {
      left: 14px;
    }
  }
}
</style>
