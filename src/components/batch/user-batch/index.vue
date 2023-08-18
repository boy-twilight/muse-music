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
      ref="table" />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue';
import { storeToRefs } from 'pinia';
import useUserStore from '@/store/user';
import { elMessage } from '@/utils';
import { elMessageType } from '@/model/enum';
import { CommonButton } from '@components/button';
import { SongTable } from '@components/table';
import usePlayMusic from '@/hooks/usePlayMuisc';
import useTheme from '@/hooks/useTheme';

const props = defineProps<{
  // 在哪个页面
  pageName: string;
}>();
const emits = defineEmits<{
  (e: 'closeSelect', showSelect: boolean): void;
}>();
// 配置主题
const { themeColor } = useTheme();
const user = useUserStore();
const { songRecord, musicDownload, loveSongs } = storeToRefs(user);
// 设置隐藏滚动条
const hideScroll = inject('hideScroll') as () => void;
//表格容器
const table = ref<InstanceType<typeof SongTable>>();
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
const selectSongs = computed(() => table.value?.getSelectItems() || []);
const { playSelectMusic } = usePlayMusic();

// 播放选中的歌曲
const playSelect = () => {
  playSelectMusic(selectSongs.value);
  table.value?.clearSelect();
};

// 批量下载歌曲
const downloadSelect = () => {
  selectSongs.value.forEach((item) => {
    user.addMuiscDownload(item);
  });
  table.value?.clearSelect();
};

// 删除选择的歌曲
const deleteSelect = () => {
  if (selectSongs.value.length > 0) {
    // 得到要删除的Id
    const ids = selectSongs.value.map((item) => item.id);
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

// 处理关闭
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
