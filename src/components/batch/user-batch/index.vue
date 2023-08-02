<template>
  <div class="batch-container">
    <div class="operation-select">
      <CommonButton
        icon="&#xea6e;"
        name="播放"
        class="play"
        @click="playSelect" />
      <CommonButton
        icon="&#xe60e;"
        @click="deleteSelect"
        name="删除" />
      <CommonButton
        icon="&#xf0304;"
        @click="downloadSelect"
        name="下载" />
      <CommonButton
        icon="&#xe617;"
        name="取消操作"
        @click="close" />
    </div>
    <SongTable
      :songs="songs"
      :song-id-mapper="songIdMapper"
      :showSelect="true"
      :show-header="false"
      @get-select-items="getSelectItems" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, computed, nextTick, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { Song } from '@/model';
import useFooterStore from '@/store/footer';
import useUserStore from '@/store/user';
import { elMessage, getTheme } from '@/utils';
import { elMessageType } from '@/model/enum';
import { CommonButton } from '@components/button';
import { SongTable } from '@components/table';

// 配置主题
const themeColor = getTheme().get('themeColor');

const footer = useFooterStore();
const { isPlay, songList, songListId, playProcess, playTime, current } =
  storeToRefs(footer);
const user = useUserStore();
const { songRecord, musicDownload, loveSongs } = storeToRefs(user);
// 设置隐藏滚动条
const hideScroll = inject('hideScroll') as () => void;

const props = defineProps<{
  // 在哪个页面
  pageName: string;
}>();

const emits = defineEmits<{
  (e: 'closeSelect', showSelect: boolean): void;
}>();

// 歌曲
const songs = computed(() => {
  if (props.pageName == 'LoveView') {
    return loveSongs.value;
  } else if (props.pageName == 'RecentPlayView') {
    return songRecord.value;
  } else {
    return musicDownload.value;
  }
});
// 歌曲id与Index对应的map
const songIdMapper = computed(
  () => new Map(songs.value.map((item, index) => [item.id, index]))
);

// 选择的歌曲
const selectSongs = reactive<Song[]>([]);

// 获取选择的歌曲
const getSelectItems = (songs: Song[]) => {
  if (selectSongs.length != 0) {
    selectSongs.splice(0);
  }
  selectSongs.push(...songs);
};

// 播放选中的歌曲
const playSelect = async() => {
  if (selectSongs.length > 0) {
    isPlay.value = false;
    playProcess.value = 0;
    playTime.value = 0;
    await nextTick();
    selectSongs.forEach((item) => {
      const index = songListId.value.get(item.id);
      if (index == undefined) {
        songList.value.unshift(item);
      }
    });
    current.value = songListId.value.get(selectSongs[0].id) as number;
    isPlay.value = true;
    elMessage(elMessageType.SUCCESS, '已添加到播放列表！');
  } else {
    elMessage(elMessageType.INFO, '请添加歌曲！');
  }
};

// 批量下载歌曲
const downloadSelect = () => {
  selectSongs.forEach((item) => {
    user.addMuiscDownload(item);
  });
};

// 删除选择的歌曲
const deleteSelect = () => {
  if (selectSongs.length > 0) {
    // 得到要删除的Id
    const ids = selectSongs.map((item) => item.id);
    // 找出不删除的歌曲
    const temp = songs.value.filter((item) => !ids.includes(item.id));
    // 清空播放列表
    songs.value.splice(0);
    // 添加
    songs.value.push(...temp);
    elMessage(elMessageType.SUCCESS, '已清除选中的歌曲！');
  } else {
    elMessage(elMessageType.INFO, '请添加歌曲！');
  }
};

const close = () => {
  hideScroll();
  emits('closeSelect', false);
};
</script>

<style lang="less" scoped>
@theme-color: v-bind(themeColor);
@font-color-white: #ffffff;
.operation-select {
  margin: 15px 0 15px 10px;
  width: 80vw;
  .el-button {
    font-size: 13px;
    width: 100px !important;
  }
  .play {
    background-color: @theme-color;
    color: @font-color-white;
  }
}
</style>
