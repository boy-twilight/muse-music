<template>
  <div class="search-area">
    <div
      class="search"
      ref="search">
      <input
        type="text"
        v-model="content"
        @input="searchMusic()" />
      <span
        @mousedown.prevent="closeSearch"
        class="iconfont"
        >&#xeb6a;</span
      >
    </div>

    <div
      class="right"
      :class="{
        hide: hideText,
      }"
      @click="showSearch"
      v-prevent>
      <span class="iconfont">&#xeafe;</span>
      <span> 搜索</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue';
import { throttle } from 'lodash-es';
import useConfigStore from '@/store/config';
import useTheme from '@/hooks/useTheme';

// 搜索结果回传
const emits = defineEmits<{
  (e: 'getContent', param: string): void;
}>();
// 配置主题
const config = useConfigStore();
const { fontColor, themeColor, searchBg, fontGray } = useTheme();

const searchColor = computed(() =>
  config.bgMode == 'color' ? searchBg.value : 'rgba(210,210,210,0.2)'
);

// 设置隐藏滚动条
const hideScroll = inject('hideScroll') as () => void;
// 搜索容器
const search = ref<HTMLDivElement>();
// 隐藏文字
const hideText = ref<boolean>(false);
// 搜索内容
const content = ref<string>('');

// 搜索音乐
const searchMusic = () => {
  throttle(
    () => {
      hideScroll();
      emits('getContent', content.value);
    },
    800,
    {
      leading: true,
      trailing: false,
    }
  )();
};

// 展示搜索框
const showSearch = () => {
  hideText.value = true;
  search.value!.style.zIndex = '3';
  search.value!.style.height = '34px';
  search.value!.style.width = '180px';
  search.value!.style.opacity = '1';
};

// 关闭搜索框
const closeSearch = () => {
  search.value!.style.zIndex = '-1';
  search.value!.style.height = '34px';
  search.value!.style.width = '0';
  search.value!.style.opacity = '0';
  content.value = '';
  emits('getContent', content.value);
  hideText.value = false;
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@search-bg: v-bind(searchColor);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);

.hide {
  opacity: 0;
}

.search-area {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 180px;
  .right {
    height: 30px;
    display: flex;
    border-radius: 5px;
    align-items: center;
    position: absolute;
    border: 0px;
    font-size: 13px;
    transition: 0.5s;
    cursor: pointer;
    span {
      color: @font-color;
    }
    &:hover {
      background-color: @search-bg;
    }
    padding: 0 5px;
    .iconfont {
      font-size: 18px;
      margin-right: 5px;
    }
  }
  .search {
    position: relative;
    opacity: 0;
    z-index: -1;
    width: 0px;
    height: 34px;
    transition: 0.5s;
    border-radius: 19px;
    input {
      width: 100%;
      height: 100%;
      border-radius: 19px;
      border: none;
      outline: none;
      font-size: 13px;
      padding-left: 20px;
      background-color: @search-bg;
      color: @font-color;
      border: 2px solid #ffffff;
    }
    .iconfont {
      position: absolute;
      right: 10px;
      top: 8px;
      font-size: 10px;
      cursor: pointer;
      color: @font-color-gray;
      &:hover {
        color: @theme-color;
      }
    }
  }
}
</style>
