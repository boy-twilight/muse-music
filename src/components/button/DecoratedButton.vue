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
.el-button {
  .iconfont {
    margin-right: 5px;
  }
  border: none;
  box-shadow: v-bind(boxShadow);
  background-color: #e1e1e1;
  color: #334155;
  border-radius: 18px;
  font-size: 14px;
  width: 120px;
  height: 34px;
  &:active {
    background-color: rgba(200, 200, 200, 0.8);
  }
}
</style>
