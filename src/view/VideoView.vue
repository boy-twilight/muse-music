<template>
  <div
    class="rvideo-container scroll-container"
    v-infinite-scroll="loadData"
    infinite-scroll-distance="2"
    :infinite-scroll-immediate="false"
    :infinite-scroll-disabled="disabled"
    style="overflow: scroll">
    <SearchButton v-model="content" />
    <h4 class="title video-choice">视频类型</h4>
    <ButtonGroup
      @getActiveIndex="getActiveIndex"
      title="视频地区"
      :cur-index="0"
      :show-title="false"
      :type="area"
      class="area" />
    <ButtonGroup
      @getActiveIndex="getActiveIndex"
      title="视频来源"
      :cur-index="0"
      :show-title="false"
      :type="type" />
    <ButtonGroup
      @getActiveIndex="getActiveIndex"
      title="视频排序"
      :show-title="false"
      :cur-index="0"
      :type="order" />
    <h4 class="title all">全部视频</h4>
    <ArtistMv :mvs="searchResult" />
    <Loading :is-loading="isLoading" />
    <button
      class="more-video"
      v-show="showMore"
      @click="loadMore">
      更多精彩视频<span class="iconfont">&#xe775;</span>
    </button>
  </div>
</template>

<script lang="ts" setup>
import { inject, nextTick, reactive, ref, Ref, computed } from 'vue';
import { message, getRequset } from '@/utils';
import { messageType } from '@/constants/common';
import { MV } from '@/type';
import { getMv } from '@/api';
import { ArtistMv } from '@components/datalist';
import { ButtonGroup, SearchButton } from '@components/button';
import { Loading } from '@components/result';
import useTheme from '@/hooks/useTheme';
// 配置主题
const { fontColor, boxShadow, fontBlack, themeColor, fontGray, contentHeight } =
  useTheme();
// mv地区分类
const area = reactive<string[]>([
  '全部',
  '韩国',
  '日本',
  '欧美',
  '港台',
  '内地',
]);
// mv来源类型
const type = reactive<string[]>(['全部', '官方版', '现场版', '网易出品']);
// mv排序
const order = reactive<string[]>(['上升最快', '最新', '最热']);
// 当前地区的index
const areaActive = ref<number>(0);
// 当前类型的index
const typeActive = ref<number>(0);
// 当前排序的index
const orderActive = ref<number>(0);
// 缓存之前的结果
const videoMap = reactive<Map<string, MV[]>>(new Map());
// 记录每个页面的limit的值
const limitMap = reactive<Map<string, number>>(new Map());
// 存放mv数据的容器
let mvs = reactive<MV[]>([]);
// 当前展示列表
let currentList = reactive<MV[]>([]);
// 初始请求视频的总数量
const limit = ref<number>(600);
// 初始展示视频的数量
const dataNum = ref<number>(30);
// 是否禁用滚动加载
const disabled = ref<boolean>(false);
// 加载动画
const isLoading = ref<boolean>(false);
// 页面第一次加载动画
const first = inject('firstLoading') as Ref<boolean>;
// 是否展示更多
const showMore = ref<boolean>(false);
// 搜索
const searchResult = computed(() =>
  currentList.filter(
    (video) =>
      video.name.includes(content.value) || video.artist.includes(content.value)
  )
);
// 搜索内容
const content = ref<string>('');

// 根据当前活跃值动态请求数据
const getActiveIndex = async (index: number, type: string) => {
  // 缓存limit的数量
  limitMap.set(
    areaActive.value + '' + typeActive.value + '' + orderActive.value,
    limit.value
  );
  // 清空当前展示
  mvs.splice(0);
  currentList.splice(0);
  // 切换index
  if (type == '视频地区') {
    areaActive.value = index;
  } else if (type == '视频来源') {
    typeActive.value = index;
  } else {
    orderActive.value = index;
  }
  // 切换上一次展示数据的数量
  dataNum.value = 40;
  // 上一次请求的limit数量
  const num = limitMap.get(
    areaActive.value + '' + typeActive.value + '' + orderActive.value
  ) as number;
  limit.value = num ? num : 600;
  await nextTick();
  // 判断是否有缓存
  const cache = videoMap.get(
    areaActive.value + '' + typeActive.value + '' + orderActive.value
  );
  // 有缓存则直接使用缓存，否则请求数据
  if (cache) {
    mvs.push(...cache);
    currentList.push(...cache.slice(0, dataNum.value));
  } else {
    getData();
  }
};

// 加载数据
const loadData = () => {
  if (!content.value) {
    disabled.value = true;
    dataNum.value += 10;
    if (dataNum.value < mvs.length) {
      setTimeout(() => {
        currentList.push(...mvs.slice(currentList.length, dataNum.value));
        disabled.value = false;
      }, 100);
    } else {
      if (limit.value == mvs.length) {
        limit.value *= 2;
        showMore.value = true;
      } else {
        currentList.push(...mvs.slice(currentList.length));
        message(messageType.SUCCESS, '已经到达底部！');
      }
    }
  }
};

// 加载跟多的数据
const loadMore = () => {
  // 关闭再加更多按钮
  showMore.value = false;
  getRequset(async () => {
    // 加载更多数据
    try {
      const response: any = await getMv(
        limit.value,
        area[areaActive.value],
        type[typeActive.value],
        order[orderActive.value]
      );
      const { data } = response;
      data.slice(mvs.length).forEach((item: any) => {
        const { id, name, cover, playCount, artistName } = item;
        mvs.push({
          id: id as string,
          name: name as string,
          image: cover as string,
          playCount: playCount as string,
          artist: artistName as string,
        });
      });
      videoMap.set(
        areaActive.value + '' + typeActive.value + '' + orderActive.value,
        [...mvs]
      );
      currentList.push(...mvs.slice(currentList.length, dataNum.value));
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
    // 关闭动画
    isLoading.value = false;
    // 关闭禁止滚动
    disabled.value = false;
  }, isLoading);
};

// 请求数据
const getData = () => {
  getRequset(async () => {
    // 获取视频信息
    try {
      const response: any = await getMv(
        limit.value,
        area[areaActive.value],
        type[typeActive.value],
        order[orderActive.value]
      );
      const { data } = response;
      data.forEach((item: any) => {
        const { id, name, cover, playCount, artistName } = item;
        mvs.push({
          id: id as string,
          name: name as string,
          image: cover as string,
          playCount: playCount as string,
          artist: artistName as string,
        });
      });
      // 缓存结果
      videoMap.set(
        areaActive.value + '' + typeActive.value + '' + orderActive.value,
        [...mvs]
      );
      currentList.push(...mvs.slice(0, dataNum.value));
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
    // 关闭动画
    first.value = false;
  }, first);
};
getData();
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@font-color-gray: v-bind(fontGray);
@shadow: v-bind(boxShadow);
@theme-color: v-bind(themeColor);
@content-height: v-bind(contentHeight);
@color-gray: #7b7b7b;

.rvideo-container {
  overflow-x: hidden !important;
  position: relative;
  height: @content-height;

  .search-area {
    position: absolute;
    left: 71.5vw;
    top: 161px;
  }
  .title {
    color: @font-color;
    font-size: 18px;
    font-weight: 520;
    width: 81vw;
    padding-left: 6.6px;
    line-height: 27px;
  }
  .area {
    &:deep(.type) {
      margin-top: 15px;
    }
  }
  .all {
    margin-top: 20px;
  }
  .loading {
    height: 50px;
    margin-bottom: 10px;
  }

  .more-video {
    position: relative;
    font-size: 13px;
    letter-spacing: 0.5px;
    margin: 0 0 30px 0;
    color: @color-gray;
    background-color: rgb(240, 240, 245);
    border: none;
    height: 32px;
    width: 124px;
    line-height: 32px;
    text-align: center;
    border-radius: 16px;
    cursor: pointer;
    &:hover {
      color: @theme-color;
    }
    &:hover span {
      color: @theme-color;
    }
    &:active {
      background-color: rgb(235, 235, 235);
    }
    span {
      display: inline-block;
      transform: rotate(90deg);
      font-size: 13px;
      margin-left: 1px;
      color: @color-gray;
    }
  }

  .mv {
    &:deep(.title) {
      font-size: 20px;
    }
  }
}
</style>
