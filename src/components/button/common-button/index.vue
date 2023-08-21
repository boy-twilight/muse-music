<template>
  <el-button
    color="#e1e1e1"
    round>
    <span
      v-text="icon"
      :style="iconStyle"
      :class="isIconOne ? 'iconfont_1' : 'iconfont'"></span>
    {{ name }}</el-button
  >
</template>

<script lang="ts" setup>
import useTheme from '@/hooks/useTheme';
withDefaults(
  defineProps<{
    // button名字
    name: string;
    // icon
    icon: string;
    // icon样式
    iconStyle?: string;

    isIconOne?: boolean;
  }>(),
  {
    iconStyle: '',
    isIconOne: false,
  }
);
// 配置主题

const { boxShadow, themeColor } = useTheme();
</script>

<style lang="less" scoped>
@button-font-color: #334155;
.el-button {
  .iconfont,
  .iconfont_1 {
    margin-right: 5px;
  }
  font-size: 14px;
  width: 120px;
  height: 34px;
  color: @button-font-color;
  box-shadow: v-bind(boxShadow);
  &:hover {
    color: v-bind(themeColor);
  }
}
</style>
