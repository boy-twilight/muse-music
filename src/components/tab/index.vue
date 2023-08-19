<template>
  <el-tabs
    v-model="activeDeafault"
    @tab-click="tabClick"
    class="tab">
    <slot name="content"></slot>
  </el-tabs>
</template>

<script lang="ts" setup>
/* eslint-disable */
// eslint-disable-next-line vue/no-setup-props-destructure
import { ref } from 'vue';
import { TabsPaneContext } from 'element-plus';

// 配置主题
const { fontColor, themeColor } = inject('theme') as any;

const props = defineProps<{
  active: string;
}>();

const activeDeafault = ref<string>(props.active);

// 传递按当前获取的菜单项
const emits = defineEmits<{
  (e: 'getActive', param: string): void;
}>();

const tabClick = (tab: TabsPaneContext) => {
  emits('getActive', tab.paneName as string);
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@theme-color: v-bind(themeColor);
.tab {
  width: 80vw;
  &:deep(.el-tabs__item) {
    font-size: 14px;
    color: @font-color;
    font-weight: 520;
    letter-spacing: 2px;
  }
  &:deep(.el-tabs__active-bar) {
    background-color: @theme-color;
    width: 22px !important;
    left: 5px;
    height: 3px;
    border-radius: 1.5px;
  }
  &:deep(.el-tabs__nav-wrap) {
    &::after {
      display: none;
    }
  }
  &:deep(.el-tabs__item.is-active) {
    color: @theme-color;
  }
}
</style>
