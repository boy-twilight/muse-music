<template>
  <el-button @click="playAll"
    ><span class="iconfont">&#xea6e;</span>{{ name }}</el-button
  >
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import userFooterStore from '@/store/footer';
import { Song } from '@/model';
import { elMessage, getTheme } from '@/utils/util';
import { elMessageType } from '@/model/enum';

//配置主题
const boxShadow = getTheme().get('shadow');
const themeColor = getTheme().get('themeColor');

const props = withDefaults(
  defineProps<{
    songs: Song[];
    name?: string;
  }>(),
  {
    name: '播放全部',
  }
);

const footer = userFooterStore();
const { songList, current, songNum, songListId } = storeToRefs(footer);

//播放全部
const playAll = () => {
  if (props.songs.length > 0) {
    const temp: number = songNum.value;
    props.songs.forEach((item) => {
      const notInList = songListId.value.get(item.id);
      if (
        notInList == undefined &&
        (item.available == '0' || item.available == '8')
      ) {
        songList.value.push(item);
      }
    });
    current.value = temp;
    elMessage(elMessageType.SUCCESS, '已经添加到播放列表');
  } else {
    elMessage(elMessageType.INFO, '请添加歌曲');
  }
};
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
  background-color: @theme-color;
  border-radius: 18px;
  font-size: 14px;
  width: 120px;
  height: 34px;
  &:active {
    opacity: 0.7;
    border: none;
  }
}
</style>
