<template>
  <el-button color="#e1e1e1"
    ><span
      v-text="icon"
      :style="iconStyle"
      :class="isIconOne ? 'iconfont_1' : 'iconfont'"></span
    >{{ name }}</el-button
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
    isIconOne: false
  }
);
const { shadow: boxShadow, themeColor } = useTheme();
</script>

<style lang="less" scoped>
@button-font-color: #334155;
.el-button {
  .iconfont,
  .iconfont_1 {
    margin-right: 5px;
  }
  border: none;
  box-shadow: v-bind(boxShadow);
  color: @button-font-color;
  border-radius: 18px;
  font-size: 14px;
  width: 120px;
  height: 34px;
  &:hover {
    color: v-bind(themeColor);
  }
}
</style>
