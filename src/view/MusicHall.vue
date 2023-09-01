<template>
  <div class="music-hall-container">
    <Tab
      active="top"
      @get-active="getActive">
      <template #content>
        <el-tab-pane
          label="精选歌单"
          name="top">
          <div
            class="container scroll-container"
            v-infinite-scroll="loadTopData"
            infinite-scroll-distance="2"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="topDisabled"
            style="overflow: scroll">
            <ArtistPlaylist
              v-for="(playlist, index) in curTopPlaylist"
              v-show="playlist.length > 0"
              :key="topTags[index]"
              :title="topTags[index]"
              :playlists="playlist" />
            <Loading :is-loading="isLoading" />
          </div>
        </el-tab-pane>
        <el-tab-pane
          label="网友推荐"
          name="rec">
          <div
            class="container scroll-container"
            v-infinite-scroll="loadRecData"
            infinite-scroll-distance="2"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="recDisabled"
            style="overflow: scroll">
            <ArtistPlaylist
              v-for="(playlist, index) in curRecPlaylist"
              v-show="playlist.length > 0"
              :key="recTags[index]"
              :title="recTags[index]"
              :playlists="playlist" />
            <Loading :is-loading="isLoading" />
          </div>
        </el-tab-pane>
        <el-tab-pane
          label="浪漫曲风"
          name="style">
          <div
            class="container scroll-container"
            v-infinite-scroll="loadStyleData"
            infinite-scroll-distance="2"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="styleDisabled"
            style="overflow: scroll">
            <ArtistPlaylist
              v-for="(playlist, index) in stylePlaylist"
              v-show="playlist.length > 0"
              :key="styleTags[index].id"
              :title="styleTags[index].name"
              :playlists="playlist" />
            <Loading :is-loading="isLoading" />
          </div>
        </el-tab-pane>
      </template>
    </Tab>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, inject, Ref } from 'vue';
import { MusicStyle, Playlist } from '@/type';
import { message } from '@/utils';
import { MessageType } from '@/constants/common';
import {
  getStyleList,
  getStylePlayList,
  getTopPlaylist,
  getRecPlaylist,
  getRecTags,
  getTopTags,
} from '@/api';
import { ArtistPlaylist } from '@components/datalist';
import { Loading } from '@components/result';
import Tab from '@components/tab';
import useTheme from '@/hooks/useTheme';
// 配置主题
const { fontColor, boxShadow, fontGray, containerHeight } = useTheme();
// 页面进入时的动画
const first = inject('firstLoading') as Ref<boolean>;
// 加载动画
const isLoading = ref<boolean>(false);
// 精选歌单
// 总的歌单数据
const topPlaylist = reactive<Playlist[][]>([]);
// 当前显示的精品歌单
const curTopPlaylist = reactive<Playlist[][]>([]);
// 精选歌单分类
const topTags = reactive<string[]>([]);
// 默认显示数据的长度
const topNum = ref<number>(18);
// 当前Index
const topCurIndex = ref<number>(0);
// 是否禁用滚动
const topDisabled = ref<boolean>(false);
// 获取精品歌单分类学的数据
const getTopTagPlaylist = async () => {
  try {
    // 请求数据
    const response: any = await getTopPlaylist(100, topTags[topCurIndex.value]);
    const { playlists } = response;
    playlists.forEach((playlist: any) => {
      const { name, id, coverImgUrl, playCount } = playlist;
      topPlaylist[topCurIndex.value].push({
        name,
        id,
        image: coverImgUrl,
        playCount,
        creator: {
          nickname: '',
          avatarUrl: '',
        },
        description: '',
        tag: [],
      });
    });
  } catch (err: any) {
    message(MessageType.ERROR, err.message);
  }
  // 初始化当前显示歌单
  if (topCurIndex.value == 0) {
    curTopPlaylist[topCurIndex.value].push(
      ...topPlaylist[topCurIndex.value].slice(0, topNum.value)
    );
    first.value = false;
  }
  if (isLoading.value) {
    isLoading.value = false;
  }
};
// 滚动加载精品歌单
const loadTopData = () => {
  topDisabled.value = true;
  // 每一次都加载12个数据
  topNum.value += 12;
  // 判断当前分类歌单数目是否已满
  if (topNum.value < topPlaylist[topCurIndex.value].length) {
    // 未满则添加数据
    setTimeout(() => {
      curTopPlaylist[topCurIndex.value].push(
        ...topPlaylist[topCurIndex.value].slice(topNum.value - 12, topNum.value)
      );
      topDisabled.value = false;
    }, 100);
  } else {
    isLoading.value = true;
    // 判断当前的Index是否小于总的分类长度
    // 小于则请求数据
    if (topCurIndex.value < topTags.length) {
      topNum.value = 0;
      curTopPlaylist[topCurIndex.value].push(
        ...topPlaylist[topCurIndex.value].slice(
          curTopPlaylist[topCurIndex.value].length
        )
      );
      topCurIndex.value++;
      getTopTagPlaylist();
      topDisabled.value = false;
    } else {
      // 大于则进禁止滚动并提示用户已经加载完数据
      isLoading.value = false;
      message(MessageType.INFO, '已经到底部啦！');
    }
  }
};
// 网友推荐
// 总的歌单数据
const recPlaylist = reactive<Playlist[][]>([]);
// 当前显示的推荐歌单
const curRecPlaylist = reactive<Playlist[][]>([]);
// 推荐歌单分类
const recTags = reactive<string[]>([]);
// 显示歌单的数目
const recNum = ref<number>(18);
// 当前Index
const recCurIndex = ref<number>(0);
// 是否禁用滚动
const recDisabled = ref<boolean>(false);
// 获取网友推荐歌单
const getRecTagPlaylist = async () => {
  try {
    // 请求数据
    const response: any = await getRecPlaylist(100, recTags[recCurIndex.value]);
    const { playlists } = response;
    playlists.forEach((playlist: any) => {
      const { name, id, coverImgUrl, playCount } = playlist;
      recPlaylist[recCurIndex.value].push({
        name,
        id,
        image: coverImgUrl,
        playCount,
        creator: {
          nickname: '',
          avatarUrl: '',
        },
        description: '',
        tag: [],
      });
    });
  } catch (err: any) {
    message(MessageType.ERROR, err.message);
  }
  if (recCurIndex.value == 0) {
    // 初始化显示的数据
    curRecPlaylist[recCurIndex.value].push(
      ...recPlaylist[recCurIndex.value].slice(0, recNum.value)
    );
    first.value = false;
  }
  if (isLoading.value) {
    isLoading.value = false;
  }
};
// 滚动加载更多推荐歌单
const loadRecData = () => {
  recDisabled.value = true;
  recNum.value += 12;
  if (recNum.value < recPlaylist[topCurIndex.value].length) {
    setTimeout(() => {
      curRecPlaylist[recCurIndex.value].push(
        ...recPlaylist[recCurIndex.value].slice(recNum.value - 12, recNum.value)
      );
      recDisabled.value = false;
    }, 100);
  } else {
    isLoading.value = true;
    if (recCurIndex.value < recTags.length) {
      recNum.value = 0;
      curRecPlaylist[recCurIndex.value].push(
        ...recPlaylist[recCurIndex.value].slice(
          curRecPlaylist[recCurIndex.value].length
        )
      );
      recCurIndex.value++;
      getRecTagPlaylist();
      recDisabled.value = false;
    } else {
      isLoading.value = false;
      message(MessageType.INFO, '已经到底部啦！');
    }
  }
};
// 精品曲风
// 总的歌单数据
const stylePlaylist = reactive<Playlist[][]>([]);
// 曲风分类
const styleTags = reactive<MusicStyle[]>([]);
// 当前的index
const styleCurIndex = ref<number>(0);
// 是否禁用滚动
const styleDisabled = ref<boolean>(false);
// 滚动加载更多曲风
const loadStyleData = () => {
  styleDisabled.value = true;
  isLoading.value = true;
  styleCurIndex.value++;
  if (styleCurIndex.value < styleTags.length) {
    getStyleTagPlaylist();
    styleDisabled.value = false;
  } else {
    message(MessageType.SUCCESS, '已经到达底部啦！');
    isLoading.value = false;
  }
};
// 获取曲风分类下的歌单数据
const getStyleTagPlaylist = async () => {
  try {
    const response = await getStylePlayList(styleTags[styleCurIndex.value].id);
    const {
      data: { playlist },
    } = response;
    playlist.forEach((item: any) => {
      const { id, name, cover, playCount } = item;
      stylePlaylist[styleCurIndex.value].push({
        id,
        name,
        image: cover,
        playCount,
        description: '',
        tag: [],
        creator: {
          nickname: '',
          avatarUrl: '',
        },
      });
    });
  } catch (err: any) {
    message(MessageType.ERROR, err.message);
  }
  if (styleCurIndex.value == 0) {
    first.value = false;
  }
  if (isLoading.value) {
    isLoading.value = false;
  }
};
// 根据当前的活跃项动态请求数据
const getActive = (active: string) => {
  if (active == 'rec') {
    if (recPlaylist[0].length != 0) return;
    first.value = true;
    getRecTagPlaylist();
  } else if (active == 'style') {
    if (stylePlaylist[0].length != 0) return;
    first.value = true;
    getStyleTagPlaylist();
  }
};
// 请求初始数据
const getData = async () => {
  first.value = true;
  try {
    const responses: any[] = await Promise.all([
      getTopTags(),
      getRecTags(),
      getStyleList(),
    ]);
    responses.forEach((response, index) => {
      // 精品歌单分类
      if (index == 0) {
        const { tags } = response;
        // 初始化数据
        topTags.push(...tags.map((item: any) => item.name));
        topTags.forEach(() => {
          topPlaylist.push([]);
          curTopPlaylist.push([]);
        });
      }
      // 网友推荐分类
      else if (index == 1) {
        const { sub } = response;
        recTags.push(...sub.map((item: any) => item.name));
        recTags.forEach(() => {
          recPlaylist.push([]);
          curRecPlaylist.push([]);
        });
      }
      // 曲风分类
      else if (index == 2) {
        const { data } = response;
        data.forEach((item: any) => {
          const { tagId, tagName } = item;
          styleTags.push({
            id: tagId,
            name: tagName,
          });
          stylePlaylist.push([]);
        });
      }
    });
  } catch (err: any) {
    message(MessageType.ERROR, err.message);
  }
  // 请求初始数据
  await getTopTagPlaylist();
  first.value = false;
};

getData();
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-gray: v-bind(fontGray);
@shadow: v-bind(boxShadow);
@container-height: v-bind(containerHeight);
.music-hall-container {
  .container {
    padding-bottom: 20px;
    height: @container-height;
    overflow-x: hidden !important;
    padding-left: 7.5px;
  }

  .tab {
    width: 100%;

    &:deep(.el-tabs__active-bar) {
      width: 25px !important;
      left: 19px;
    }
    &:deep(.el-tabs__header) {
      padding-left: 3.5vw !important;
      margin-bottom: 10px;
    }
  }

  .playlist {
    @common-width: 12.3697vw;
    @common-height: 26.8665vh;
    @common-top: 22.6244vh;
    @common-margin-top: 2.826vh;
    @common-margin-left: 0.4752vw;
    margin-bottom: 20px;
    &:deep(.content) {
      width: 80vw;
      .title {
        width: 80vw;
        padding-left: @common-margin-left;
      }
      .list {
        margin: @common-margin-top @common-margin-left 0;
        .mask,
        .el-image {
          width: @common-width;
          height: @common-height;
        }
        .name {
          width: @common-width;
        }
        .playcount {
          top: @common-top;
        }
      }
    }
  }
}
</style>
