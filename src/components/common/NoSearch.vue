<template>
  <div class="no-search">
    <img
      :src="noSearch"
      class="image" />
    <h4 class="no-data">{{ text }}</h4>
  </div>
</template>

<script lang="ts" setup>
import noSearch from '@assets/image/暂无搜索结果.svg';
import { computed, inject } from 'vue';

const fontGray = inject('fontGray');

const props = withDefaults(
  defineProps<{
    size?: number;
    text?: string;
  }>(),
  {
    size: 420,
    text: '暂无用户数据',
  }
);

const imageSize = computed(() => props.size + 'px');
</script>

<style lang="less" scoped>
.no-search {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80vw;
  position: relative;
  .image {
    width: v-bind(imageSize);
    height: v-bind(imageSize);
  }

  .no-data {
    letter-spacing: 2px;
    display: inline-block;
    position: absolute;
    bottom: 0;
    font-size: 18px;
    font-weight: 520;
    color: v-bind(fontGray);
  }
}
</style>
