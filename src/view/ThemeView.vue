<template>
  <div class="theme-container">
    <div class="color-item">
      <span>请选择主题色调：</span>
      <ColorPicker
        :color="themeColor"
        @get-select-color="getThemeColor" />
    </div>
    <div class="color-item">
      <span>请选择字体主色调：</span>
      <ColorPicker
        :color="fontColor"
        @get-select-color="getFontColor" />
    </div>
    <div class="color-item">
      <span>请选择字体副色调：</span>
      <ColorPicker
        :color="fontGray"
        @get-select-color="getFontGray" />
    </div>
    <div
      class="color-item"
      v-show="bgMode == 'color'">
      <span>请选择背景色调：</span>
      <ColorPicker
        :color="background"
        @get-select-color="getBgColor" />
    </div>
    <div
      class="color-item"
      v-show="bgMode == 'color'">
      <span>请选择菜单色调：</span>
      <ColorPicker
        :color="menuColor"
        @get-select-color="getMenuColor" />
    </div>
    <div class="color-item">
      <span>请选择菜单激活时的色调：</span>
      <ColorPicker
        :color="active"
        @get-select-color="getActiveColor" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, Ref } from 'vue';
import ColorPicker from '@/components/button/ColorPicker.vue';
import useThemeStore from '@/store/theme';
import { storeToRefs } from 'pinia';
import useConfigStore from '@/store/config';

const theme = useThemeStore();
const { fontColor, fontGray, background, menuColor, themeColor, active } =
  storeToRefs(theme);

const config = useConfigStore();
const { bgMode } = storeToRefs(config);

const first = inject('firstLoading') as Ref<boolean>;
first.value = false;

const getThemeColor = (color: string) => {
  themeColor.value = color;
};

const getFontColor = (color: string) => {
  fontColor.value = color;
};

const getFontGray = (color: string) => {
  fontGray.value = color;
};

const getBgColor = (color: string) => {
  background.value = color;
};

const getMenuColor = (color: string) => {
  menuColor.value = color;
};

const getActiveColor = (color: string) => {
  active.value = color;
};
</script>

<style lang="less" scoped>
.theme-container {
  width: 87vw;
  display: flex;
  flex-direction: column;

  .color-item {
    margin: 15px 0 15px 3vw;
    span {
      font-size: 13px;
      color: v-bind(fontColor);
      display: inline-block;
      margin-bottom: 5px;
      letter-spacing: 1px;
    }
  }
}
</style>
