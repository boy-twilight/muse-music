<template>
  <div class="playlist-container scroll-container">
    <!-- 批量操作 -->
    <OnlineBatch
      v-show="showSelect"
      :song-id-mapper="songIdMapper"
      :songs="curList"
      @close-select="closeSelect" />
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
          <DecoratedButton
            :name="playList.isLove ? '取消收藏' : '收藏'"
            :icon="playList.isLove ? '&#xe760;' : '&#xe761;'"
            :icon-style="playList.isLove ? 'color:#ff6a6a;' : ''"
            @click.native="addLove" />
          <!-- 更多 -->
          <MoreButton
            v-if="!showSelect"
            :share-to="sharePlaylist"
            @open-select="openSelect" />
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
          <SongList
            :songs="curList"
            :song-id-mapper="songIdMapper" />
          <Pagination
            v-show="pageSize < total"
            :cur-page="curPage"
            :page-size="pageSize"
            :total="total"
            @page-change="pageChange" />
        </el-tab-pane>
        <el-tab-pane
          :label="`评论 ${
            playlistComments.length < 10
              ? playlistComments.length + 10
              : playlistComments.length
          }`"
          name="comment">
          <Comments
            :comments="playlistComments"
            v-if="!showNo" />
          <NoSearch
            v-else
            :size="280"
            text="暂无评论数据" />
        </el-tab-pane>
      </template>
    </Tab>
  </div>
</template>

<script lang="ts" setup>
import { reactive, Ref, ref, inject, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  elMessage,
  getMusicUrls,
  getMusicInfos,
  getTheme,
  getRequset,
  share,
  getComment,
  getSourceComments,
} from '@/utils/util';
import { elMessageType } from '@/model/enum';
import {
  getPlayListDetail,
  getPlayListSong,
  getPlaylistComment,
  getRadioDetail,
  getRadioSong,
} from '@/api/api';
import { Playlist, Song, Comment } from '@/model';
import useUserStore from '@/store/user';
import OnlineBatch from '@components/batch/OnlineBatch.vue';
import SongList from '@components/table/SongList.vue';
import Tab from '@components/tab/Tab.vue';
import PlayButton from '@components/button/PlayButton.vue';
import DecoratedButton from '@components/button/DecoratedButton.vue';
import MoreButton from '@components/button/MoreButton.vue';
import Comments from '@/components/common/Comment.vue';
import NoSearch from '@/components/common/NoSearch.vue';

//设置主题
const fontColor = getTheme().get('fontColor');
const fontBlack = getTheme().get('fontBlack');
const boxShadow = getTheme().get('shadow');
const fontGray = inject('fontGray');

//是否展示占位图片
const showNo = ref<boolean>(false);

const user = useUserStore();
//路由参数
const route = useRoute();
const id = route.query.id + '';
const type = route.query.type + '';

//歌单详情
const playList = reactive<Playlist>({
  id,
  name: '',
  image: '',
  playCount: '',
  tag: [],
  description: '',
  creator: {
    nickname: '',
    avatarUrl: '',
  },
});
//歌单歌曲
const playListSong = reactive<Song[]>([]);
//歌单评论
const playlistComments = reactive<Comment[]>([]);
//歌曲id与Index对应的map
const songIdMapper = computed(
  () => new Map(playListSong.map((item, index) => [item.id, index]))
);
//用于分页
//当前页数
const curPage = ref<number>(1);
//一页多少数据
const pageSize = ref<number>(30);
//当前展示的歌曲列表
const curList = computed(() =>
  playListSong.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value
  )
);
//总的数据数
const total = computed(() => playListSong.length);
//页数变化
const pageChange = (page: number) => {
  curPage.value = page;
};

//页面进入时的动画
const first = inject('firstLoading') as Ref<boolean>;

//批量操作相关
//是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);
//关闭批量操作
const closeSelect = (close: boolean) => {
  showSelect.value = close;
};
//打开批量操作
const openSelect = (open: boolean) => {
  showSelect.value = open;
};

//分享歌单
const sharePlaylist = () => {
  share(
    '我有一个精品歌单分享给你：' +
      playList.name +
      '，地址：' +
      import.meta.env.VITE_APP_URL +
      route.fullPath
  );
};
//收藏歌单
const addLove = () => {
  if (type == 'playlist') {
    user.addLove(playList, user.lovePlaylist, user.lovePlaylistId);
  } else {
    user.addLove(playList, user.loveRadio, user.loveRadioId);
  }
};

//获取歌曲详情和音乐
getRequset(async () => {
  if (type == 'playlist') {
    //获取歌单详情
    try {
      const pResponse: any = await getPlayListDetail(id);
      const {
        playlist: { name, coverImgUrl, description, tags, creator, playCount },
      } = pResponse;
      playList.name = name;
      playList.image = coverImgUrl;
      playList.description = description;
      playList.tag = tags;
      playList.creator.avatarUrl = creator.avatarUrl;
      playList.creator.nickname = creator.nickname;
      playList.playCount = playCount;
      //初始化歌单喜欢状态
      user.initLoveStatus(playList, user.lovePlaylistId);
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
    //获取歌单下的音乐
    try {
      const response: any = await getPlayListSong(id);
      const { songs } = response;
      const ids: string[] = [];
      songs.forEach((item: any) => {
        //获取音乐的基本信息
        getMusicInfos(ids, playListSong, item);
      });
      user.initLoveMusic(playListSong);
      //获取音乐的url
      getMusicUrls(ids.join(','), playListSong);
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }

    //获取歌单评论
    try {
      const response: any = await getPlaylistComment(id, 100);
      const { comments, hotComments } = response;
      getComment(hotComments, playlistComments);
      getComment(comments, playlistComments);
      showNo.value = playlistComments.length == 0 ? true : false;
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  } else {
    //获取电台详情
    try {
      const response = await getRadioDetail(id);
      const {
        data: {
          name,
          dj: { avatarUrl, nickname },
          picUrl,
          desc,
          subCount,
        },
      } = response;
      playList.name = name;
      playList.id = id;
      playList.description = desc;
      playList.image = picUrl;
      playList.playCount = subCount;
      playList.creator.nickname = nickname;
      playList.creator.avatarUrl = avatarUrl;
      //初始化歌单喜欢状态
      user.initLoveStatus(playList, user.loveRadioId);
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }

    //获取电台歌曲
    try {
      const response: any = await getRadioSong(id, 100);
      const { programs } = response;
      const ids: string[] = [];
      programs.forEach((item: any) => {
        const {
          mainSong: {
            name,
            id,
            fee,
            artists,
            album: { name: albumName, picUrl },
            duration,
          },
        } = item;
        ids.push(id);
        playListSong.push({
          id,
          name,
          singer: artists[0].name,
          songImage: picUrl,
          album: albumName,
          available: fee,
          time: duration,
        });
      });
      user.initLoveMusic(playListSong);
      getMusicUrls(ids.join(','), playListSong);
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }

    //获取电台评论
    getSourceComments(id, '7', playlistComments, () => {
      showNo.value = playlistComments.length == 0;
    });
  }
  first.value = false;
}, first);
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
    margin: 10px 0;
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
