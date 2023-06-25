<template>
  <div class="artist-detail-container scroll-container">
    <!-- 批量操作 -->

    <OnlineBatch
      v-show="showSelect"
      :songs="curList"
      :song-id-mapper="songIdMapper"
      @close-select="closeSelect" />

    <div
      v-show="!showSelect"
      class="header">
      <img
        :src="singer.avatar"
        class="left" />
      <div class="right">
        <h4 class="name">{{ singer.name }}</h4>
        <div class="info">
          <p v-if="singer.alias?.length != 0">
            英文名：{{ singer.alias?.join('、') }}
          </p>
          <p class="job">职业：歌手、词曲创作者</p>
        </div>
        <span class="fans">粉丝数：{{ singer.score }}</span>
        <div class="header-operation">
          <PlayButton :songs="curList" />
          <DecoratedButton
            :name="singer.isLove ? '取消关注' : '关注'"
            :icon="singer.isLove ? '&#xe760;' : '&#xe761;'"
            :icon-style="singer.isLove ? 'color:#ff6a6a;' : ''"
            @click.native="
              user.addLove(singer, user.loveSinger, user.loveSingerId)
            " />
          <MoreButton
            v-if="!showSelect"
            :share-to="shareSinger"
            @open-select="openSelect" />
        </div>
      </div>
    </div>

    <div
      class="content"
      v-show="!showSelect">
      <Tab
        active="hot"
        @getActive="getActive">
        <template #content>
          <el-tab-pane
            label="精选"
            name="hot">
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
            label="专辑"
            name="album">
            <NoSearch
              v-show="needNoSearch[0]"
              text="歌手暂无专辑"
              :size="280" />
            <Loading :isLoading="isLoading" />
            <Albums
              :albums="artistAlbum"
              v-show="!needNoSearch[0]" />
          </el-tab-pane>
          <el-tab-pane
            label="视频"
            name="mv">
            <NoSearch
              v-show="needNoSearch[1]"
              text="歌手暂无视频"
              :size="280" />
            <Loading :isLoading="isLoading" />
            <Mv
              :mvs="artistMv"
              v-show="!needNoSearch[1]" />
          </el-tab-pane>
          <el-tab-pane
            label="详情"
            name="detail">
            <Loading :isLoading="isLoading" />
            <div class="detail">
              <p class="desc">
                {{ singer.briefDesc }}
              </p>
              <template
                v-for="item in introduce"
                :key="item.title"
                v-show="introduce.length > 0">
                <h4>{{ item.title }}</h4>
                <p>{{ item.content }}</p>
              </template>
            </div>
          </el-tab-pane>
        </template>
      </Tab>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, inject, Ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  getArtistInfo,
  getArtistMv,
  getArtistDesc,
  getArtistAlbum,
  getArtistSongs,
  getMusicDetail,
} from '@/api/api';
import { Artist, Song, MV, ArtistDesc, Album } from '@/model';
import { elMessageType } from '@/model/enum';
import {
  getMusicUrls,
  getMusicInfos,
  getTheme,
  formatTime,
  getRequset,
  elMessage,
  share,
} from '@/utils/util';
import useUserStore from '@/store/user';
import Mv from '@components/datalist/Mv.vue';
import Albums from '@components/datalist/Albums.vue';
import DecoratedButton from '@components/button/DecoratedButton.vue';
import MoreButton from '@components/button/MoreButton.vue';
import Tab from '@components/tab/Tab.vue';
import SongList from '@components/table/SongList.vue';
import OnlineBatch from '@components/batch/OnlineBatch.vue';
import Loading from '@components/common/Loading.vue';
import NoSearch from '@/components/common/NoSearch.vue';
import PlayButton from '@/components/button/PlayButton.vue';

//主题设置
const fontColor = getTheme().get('fontColor');
const fontBlack = getTheme().get('fontBlack');
const boxShadow = getTheme().get('shadow');
const themeColor = getTheme().get('themeColor');
const fontGray = inject('fontGray');

const user = useUserStore();

//路由参数获取
const route = useRoute();
const id = route.query.id + '';
const score = route.query.score + '';
//加载数据的动画
const isLoading = ref<boolean>(false);
//页面第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;
//是否需要占位图片
const needNoSearch = reactive<boolean[]>([false, false]);

//歌手基本信息
const singer = reactive<Artist>({
  name: '',
  score,
  id: id,
  avatar: '',
  alias: [],
});
//歌手基本简介
const introduce = reactive<ArtistDesc[]>([]);
//热门歌曲列表
const hotSongList = reactive<Song[]>([]);
//歌曲id与Index对应的map
const songIdMapper = computed(
  () => new Map(hotSongList.map((item, index) => [item.id, index]))
);
//用于分页
//当前页数
const curPage = ref<number>(1);
//一页多少数据
const pageSize = ref<number>(50);
//当前展示的歌曲列表
const curList = computed(() =>
  hotSongList.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value
  )
);
//总的数据数
const total = computed(() => hotSongList.length);
//页数变化
const pageChange = (page: number) => {
  curPage.value = page;
};

//歌手mv
const artistMv = reactive<MV[]>([]);
//歌手专辑
const artistAlbum = reactive<Album[]>([]);

//批量操作相关
//是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);
//关闭批量操作
const closeSelect = (close: boolean) => {
  hideScroll();
  showSelect.value = close;
};
//打开批量操作
const openSelect = (open: boolean) => {
  hideScroll();
  showSelect.value = open;
};
//分享歌手
const shareSinger = () => {
  share(
    '我有一个宝藏歌手推荐给你：' +
      singer.name +
      '，地址：' +
      import.meta.env.VITE_APP_URL +
      route.fullPath
  );
};
//获取当前活跃的选项，并根据选项加载数据
const getActive = (active: string) => {
  hideScroll();
  //点击加载数据
  if (active == 'album' && artistAlbum.length == 0) {
    //获取歌手专辑
    getRequset(async () => {
      try {
        const response: any = await getArtistAlbum(id);
        const { hotAlbums } = response;
        hotAlbums.forEach((item: any) => {
          const { picUrl, name, publishTime } = item;
          artistAlbum.push({
            name,
            id: item.id,
            cover: picUrl,
            publishTime: formatTime(publishTime),
            artistId: id + '',
          });
        });
      } catch (err: any) {
        elMessage(elMessageType.ERROR, err.message);
      }
      setTimeout(() => {
        needNoSearch[0] = artistAlbum.length == 0;
        isLoading.value = false;
      }, 500);
    }, isLoading);
  } else if (active == 'mv' && artistMv.length == 0) {
    //获取歌手的Mv
    getRequset(async () => {
      try {
        const response: any = await getArtistMv(id);
        const { mvs } = response;
        mvs.forEach((mv: any) => {
          const { id, name, artistName, imgurl16v9, playCount } = mv;
          artistMv.push({
            id,
            name,
            artist: artistName,
            image: imgurl16v9,
            playCount,
          });
        });
      } catch (err: any) {
        elMessage(elMessageType.ERROR, err.message);
      }

      setTimeout(() => {
        needNoSearch[1] = artistMv.length == 0;
        isLoading.value = false;
      }, 500);
    }, isLoading);
  } else if (active == 'detail' && introduce.length == 0) {
    getRequset(async () => {
      try {
        const response: any = await getArtistDesc(id);
        const { introduction } = response;
        introduction.forEach((item: any) => {
          introduce.push({
            title: item.ti,
            content: item.txt,
          });
        });
      } catch (err: any) {
        elMessage(elMessageType.ERROR, err.message);
      }
      setTimeout(() => {
        isLoading.value = false;
      }, 500);
    }, isLoading);
  }
};
//获取初始数据
getRequset(async () => {
  try {
    const response: any = await getArtistInfo(id);
    const { artist } = response;
    const { name, alias, picUrl, briefDesc } = artist;
    singer.name = name;
    singer.alias = alias;
    singer.avatar = picUrl;
    singer.briefDesc = briefDesc;
    //初始化Singer的喜欢状态
    user.initLoveStatus(singer, user.loveSingerId);
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }

  //获取歌手全部歌曲
  try {
    const response: any = await getArtistSongs(id, 1000);
    const { songs } = response;
    const ids = songs.map((item: any) => item.id).join(',');
    //重新获取图片
    const dResponse: any = await getMusicDetail(ids);
    const { songs: muiscs } = dResponse;
    muiscs.forEach((item: any) => {
      getMusicInfos([] as string[], hotSongList, item);
    });
    //初始化歌曲喜欢状态
    user.initLoveMusic(hotSongList);
    //批量获取音乐链接
    getMusicUrls(ids, hotSongList);
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }
  //关闭动画
  first.value = false;
}, first);
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@font-color-gray: v-bind(fontGray);
@shadow: v-bind(boxShadow);
@themeColor: v-bind(themeColor);
@color-white: #ffffff;

.no-search {
  &:deep(.no-data) {
    font-size: 15px;
  }
}

.artist-detail-container {
  .pagination-container {
    margin: 10px 0;
  }

  .loading {
    position: absolute;
    z-index: 100;
    top: 0;
  }
  .header {
    width: 80vw;
    display: flex;
    .left {
      width: 180px;
      height: 180px;
      border-radius: 50%;
      object-fit: cover;
      box-shadow: @shadow;
    }
    .right {
      margin-left: 30px;
      h4 {
        font-size: 26px;
        font-weight: 550;
        color: @font-color;
        margin-top: 5px;
        letter-spacing: 1px;
      }
      .info {
        display: flex;
        p {
          font-size: 12px;
          margin: 20px 0;
          color: @font-color;
          letter-spacing: 0.5px;
          span {
            margin-right: 10px;
          }
          margin-right: 20px;
        }
      }
      .fans {
        display: inline-block;
        font-size: 12px;
        color: @font-color-gray;
      }

      .header-operation {
        margin-top: 15px;
        .el-button {
          width: 110px;
          font-size: 13px;
          letter-spacing: 1px;
          color: #000;

          &:first-child {
            background-color: @themeColor;
            color: @color-white;
            &:deep(.iconfont) {
              font-size: 15px;
            }
          }
        }
      }
    }
  }

  .content {
    margin-top: 15px;
    .tab {
      &:deep(.el-tabs__item) {
        font-size: 14px;
        letter-spacing: 1px;
      }
      &:deep(.el-tab-pane) {
        position: relative;
      }

      // 专辑
      .album-container {
        width: 80vw;
      }
      .mv {
        width: 80vw;
        &:deep(.mv-simi) {
          width: 80vw;
        }
        &:deep(.mv-recommend) {
          width: 232px;
        }
      }
      //个人详情
      .detail {
        padding-top: 10px;
        letter-spacing: 1px;
        width: 80vw;
        .desc {
          margin: 10px 0 20px 0;
        }
        p {
          font-size: 12px;
          color: @font-color-gray;
          letter-spacing: 0.5px;
          line-height: 1.5;
        }
        h4 {
          font-size: 14px;
          color: @font-color;
          font-weight: 500;
          margin: 15px 0;
        }
      }
    }
  }
}
</style>
