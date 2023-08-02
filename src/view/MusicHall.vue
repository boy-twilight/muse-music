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
            @scroll="autoHide()"
            v-infinite-scroll="loadTopData"
            infinite-scroll-distance="2"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="topDisabled"
            style="overflow: auto">
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
            @scroll="autoHide()"
            v-infinite-scroll="loadRecData"
            infinite-scroll-distance="2"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="recDisabled"
            style="overflow: auto">
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
            @scroll="autoHide()"
            v-infinite-scroll="loadStyleData"
            infinite-scroll-distance="2"
            :infinite-scroll-immediate="false"
            :infinite-scroll-disabled="styleDisabled"
            style="overflow: auto">
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
import { ref, reactive, inject, Ref, computed } from 'vue';
import { throttle } from 'lodash-es';
import { MusicStyle, Playlist } from '@/model';
import { elMessage, getRequset, getTheme } from '@/utils';
import { elMessageType } from '@/model/enum';
import {
  getStyleList,
  getStylePlayList,
  getTopPlaylist,
  getRecPlaylist,
  getRecTags,
  getTopTags
} from '@/api';
import Tab from '@components/tab/Tab.vue';
import { ArtistPlaylist } from '@components/datalist';
import Loading from '@/components/common/Loading.vue';
import useConfigStore from '@/store/config';
// 配置主题
const fontColor = getTheme().get('fontColor');
const boxShadow = getTheme().get('shadow');
const fontGray = inject('fontGray');
// 根据是否全屏改变容器高
const config = useConfigStore();
const containerHeight = computed(() =>
  config.isFullScreen ? '76.3vh' : '73.3vh'
);

// 防止页面抖动
const left = ref<string>('0px');
const showScroll = ref<string>('none');
// 设置隐藏滚动条
const hideScroll = () => {
  showScroll.value = 'none';
  left.value = '0';
};
// 计时器判断是否显示进度条
let timeid: any = 0;
// 自动隐藏进度条
const autoHide = throttle(
  () => {
    if (showScroll.value != 'block') {
      showScroll.value = 'block';
      left.value = '6px';
    }
    if (timeid) {
      clearTimeout(timeid);
    }
    timeid = setTimeout(() => {
      if (showScroll.value != 'none') {
        hideScroll();
      }
    }, 3000);
  },
  600,
  { leading: true, trailing: false }
);

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
const getTopTagPlaylist = async() => {
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
          avatarUrl: ''
        },
        description: '',
        tag: []
      });
    });
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
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
      elMessage(elMessageType.INFO, '已经到底部啦！');
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
const getRecTagPlaylist = async() => {
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
          avatarUrl: ''
        },
        description: '',
        tag: []
      });
    });
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
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
      elMessage(elMessageType.INFO, '已经到底部啦！');
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
    elMessage(elMessageType.SUCCESS, '已经到达底部啦！');
    isLoading.value = false;
  }
};
// 获取曲风分类下的歌单数据
const getStyleTagPlaylist = async() => {
  try {
    const response = await getStylePlayList(styleTags[styleCurIndex.value].id);
    const {
      data: { playlist }
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
          avatarUrl: ''
        }
      });
    });
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
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
  hideScroll();
  if (active == 'rec' && recPlaylist[0].length == 0) {
    first.value = true;
    getRecTagPlaylist();
  } else if (active == 'style' && stylePlaylist[0].length == 0) {
    first.value = true;
    getStyleTagPlaylist();
  }
};

// 请求初始数据
getRequset(async() => {
  // 精品歌单分类
  try {
    const response: any = await getTopTags();
    const { tags } = response;
    // 初始化数据
    topTags.push(...tags.map((item: any) => item.name));
    topTags.forEach(() => {
      topPlaylist.push([]);
      curTopPlaylist.push([]);
    });
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }

  // 网友推荐分类
  try {
    const response: any = await getRecTags();
    const { sub } = response;
    recTags.push(...sub.map((item: any) => item.name));
    recTags.forEach(() => {
      recPlaylist.push([]);
      curRecPlaylist.push([]);
    });
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }

  // 曲风分类
  try {
    const response: any = await getStyleList();
    const { data } = response;
    data.forEach((item: any) => {
      const { tagId, tagName } = item;
      styleTags.push({
        id: tagId,
        name: tagName
      });
      stylePlaylist.push([]);
    });
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }
  // 请求初始数据
  getTopTagPlaylist();
}, first);
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-gray: v-bind(fontGray);
@shadow: v-bind(boxShadow);

.tab {
  width: 87vw;

  &:deep(.el-tabs__active-bar) {
    width: 25px !important;
    left: 19px;
  }
  &:deep(.el-tabs__header) {
    padding-left: 3.5vw !important;
    margin-bottom: 10px;
  }
}

.container {
  padding: 0 0 20px v-bind(left);
  height: v-bind(containerHeight);
  overflow-x: hidden !important;
  &::-webkit-scrollbar {
    display: v-bind(showScroll) !important;
  }
}

.playlist {
  @common: 190px;
  margin-bottom: 20px;
  &:deep(.content) {
    width: 80vw;
  }
  &:deep(.title) {
    width: 80vw;
    padding-left: 7.3px;
  }
  &:deep(.content .list) {
    margin: 20px 7.3px 0;
  }
  &:deep(.content .list .mask) {
    width: @common;
    height: @common;
  }
  &:deep(.content .list .playcount) {
    top: 160px;
  }
  &:deep(.content .list .el-image) {
    width: @common;
    height: @common;
  }
  &:deep(.content .list .name) {
    width: @common;
  }
}
</style>
