<template>
  <el-button
    @click="playAllMusic(songs)"
    :color="themeColor"
    ><span class="iconfont">&#xea6e;</span>{{ name }}</el-button
  >
</template>

<script lang="ts" setup>
import { Song } from '@/type';
import usePlayMusic from '@/hooks/usePlayMuisc';
import useTheme from '@/hooks/useTheme';
withDefaults(
  defineProps<{
    songs: Song[];
    name?: string;
  }>(),
  {
    name: '播放全部'
  }
);
// 配置主题
const { boxShadow, themeColor } = useTheme();
// 播放音乐
const { playAllMusic } = usePlayMusic();
</script>

<style lang="less" scoped>
@theme-color: v-bind(themeColor);
.el-button {
  .iconfont {
    margin-right: 5px;
  }
  border: none;
  box-shadow: v-bind(boxShadow);
  color: #ffffff;
  border-radius: 18px;
  font-size: 14px;
  width: 120px;
  height: 34px;
}
</style>
