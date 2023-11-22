<template>
  <el-button
    @click="playAllMusic(songs)"
    :color="themeColor"
    round
    ><template #icon> <span class="iconfont">&#xea6e;</span> </template
    >{{ name }}</el-button
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
    name: '播放全部',
  }
);
// 配置主题
const { boxShadow, themeColor } = useTheme();

// 播放音乐
const { playAllMusic } = usePlayMusic();
</script>

<style lang="less" scoped>
@theme-color: v-bind(themeColor);
@box-shadow: v-bind(boxShadow);
.el-button {
  .iconfont {
    font-size: 15px;
  }
  &:hover {
    color: #ffffff;
  }
  color: #ffffff;
  font-size: 14px;
  width: 120px;
  height: 34px;
  box-shadow: @box-shadow;
}
</style>
