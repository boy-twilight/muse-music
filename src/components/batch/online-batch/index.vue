<template>
  <div class="online-batch">
    <!-- 批量操作选择 -->
    <div class="operation-select">
      <CommonButton
        icon="&#xea6e;"
        name="播放"
        class="play"
        @click="playSelect" />
      <CommonButton
        icon="&#xe761;"
        name="收藏"
        @click="loveSelect" />
      <CommonButton
        icon="&#xf0304;"
        @click="downloadSelect"
        name="下载" />
      <CommonButton
        icon="&#xe617;"
        name="取消操作"
        @click="emits('closeSelect', false)"
        class="cancel" />
    </div>
    <SongTable
      :songs="songs"
      :song-id-mapper="songIdMapper"
      :show-select="true"
      :show-header="false"
      @get-select-items="getSelectItems" />
  </div>
</template>

<script lang="ts" setup>
import { reactive, nextTick } from 'vue';
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
const { loveMusicId, loveSongs } = storeToRefs(user);

defineProps<{
  // 歌曲
  songs: Song[];
  // 歌曲id与Index对应的map
  songIdMapper: Map<string, number>;
}>();

// 选择的歌曲
const selectSongs = reactive<Song[]>([]);
// 获取选择的歌曲
const getSelectItems = (songs: Song[]) => {
  if (selectSongs.length != 0) {
    selectSongs.splice(0);
  }
  selectSongs.push(...songs);
};

const emits = defineEmits<{
  (e: 'closeSelect', showSelect: boolean): void;
}>();

// 播放选择的歌曲
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
// 喜欢选中的歌曲
const loveSelect = () => {
  selectSongs.forEach((item) => {
    item.isLove = true;
    const index = loveMusicId.value.get(item.id);
    if (index == undefined) {
      loveSongs.value.push(item);
    }
  });
};
</script>

<style lang="less" scoped>
@theme-color: v-bind(themeColor);
@color-white: #ffffff;
.operation-select {
  margin: 15px 10px;
  width: 80vw;

  .el-button {
    font-size: 13px;
    width: 100px !important;
  }
  .play {
    background-color: @theme-color;
    color: @color-white;
  }
}
</style>
