<template>
  <div
    v-loading="loading"
    v-show="loading"
    :element-loading-background="bg"
    :element-loading-spinner="Svg"
    class="loading"></div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue';
import { Svg } from '@/model';

//配置主题
const bg = inject('loadingBg');

const props = withDefaults(
  defineProps<{
    isLoading: boolean;
  }>(),
  {
    isLoading: false,
  }
);

const loading = computed(() => props.isLoading);
</script>

<style lang="less" scoped>
.loading {
  width: 80vw;
  height: 485px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
