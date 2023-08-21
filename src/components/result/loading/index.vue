<template>
  <div
    v-loading="loading"
    v-show="loading"
    :element-loading-background="bg"
    :element-loading-spinner="svg"
    class="loading"></div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { svg } from '@assets/icon';
import useTheme from '@/hooks/useTheme';
// 配置主题
const { loadingBg: bg } = useTheme();

const props = withDefaults(
  defineProps<{
    isLoading: boolean;
  }>(),
  {
    isLoading: false
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
