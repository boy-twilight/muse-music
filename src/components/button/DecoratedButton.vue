<template>
  <el-button
    ><span
      v-text="icon"
      :style="iconStyle"
      :class="isIconOne ? 'iconfont_1' : 'iconfont'"></span
    >{{ name }}</el-button
  >
</template>

<script lang="ts" setup>
import { getTheme } from '@/utils/util';

//配主题
const boxShadow = getTheme().get('shadow');

withDefaults(
  defineProps<{
    //button名字
    name: string;
    //icon
    icon: string;
    //icon样式
    iconStyle?: string;

    isIconOne?: boolean;
  }>(),
  {
    iconStyle: '',
    isIconOne: false,
  }
);
</script>

<style lang="less" scoped>
@button-color: #e1e1e1;
@button-font-color: #334155;
.el-button {
  .iconfont {
    margin-right: 5px;
  }
  border: none;
  box-shadow: v-bind(boxShadow);
  background-color: @button-color;
  color: @button-font-color;
  border-radius: 18px;
  font-size: 14px;
  width: 120px;
  height: 34px;
  &:active {
    opacity: 0.7;
  }
}
</style>
