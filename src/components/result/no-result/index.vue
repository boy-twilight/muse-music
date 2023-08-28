<template>
  <div class="no-search">
    <img
      :src="noSearch"
      class="image" />
    <h4 class="no-data">{{ text }}</h4>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

import noSearch from '@assets/image/暂无搜索结果.svg';
import useTheme from '@/hooks/useTheme';

const { fontGray } = useTheme();

const props = withDefaults(
  defineProps<{
    size?: number;
    text?: string;
  }>(),
  {
    size: 420,
    text: '暂无用户数据'
  }
);

const imageSize = computed(() => props.size + 'px');
</script>

<style lang="less" scoped>
@image-size: v-bind(imageSize);
@font-color-gray: v-bind(fontGray);
.no-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80vw;
  position: relative;
  .image {
    width: @image-size;
    height: @image-size;
  }

  .no-data {
    letter-spacing: 2px;
    display: inline-block;
    position: absolute;
    bottom: 0;
    font-size: 18px;
    font-weight: 520;
    color: @font-color-gray;
  }
}
</style>
