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
        @click="closeSelectBox" />
    </div>
    <SongTable
      :songs="curShow"
      :show-header="false"
      ref="table" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import useUserStore from '@/store/user';
import usePlayMusic from '@/hooks/usePlayMuisc';
import { message } from '@/utils';
import { MessageType } from '@/constants/common';
import { CommonButton } from '@components/button';
import { SongTable } from '@components/table';
import useTheme from '@/hooks/useTheme';

const props = defineProps<{
  // 在哪个页面
  pageName: string;
  // 是否开启多选
  showSelect: boolean;
  // 页码
  curPage: number;
  // 页数
  pageSize: number;
}>();

const emits = defineEmits<{
  (e: 'update:showSelect', isShow: boolean): void;
}>();

// 配置主题
const { themeColor } = useTheme();
// 用户数据
const user = useUserStore();
const {
  songRecord,
  musicDownload,
  loveSongs,
  songRecordId,
  musicDownloadId,
  loveMusicId
} = storeToRefs(user);
// 表格容器
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
// 当前展示的歌曲
const curShow = computed(() =>
  songs.value.slice(
    (props.curPage - 1) * props.pageSize,
    props.curPage * props.pageSize
  )
);
// 选择的歌曲
const selectSongs = computed(() => table.value?.getSelectItems() || []);

// 播放选中的音乐
const { playSelectMusic } = usePlayMusic();

// 打开多选
const openSelectBox = () => {
  emits('update:showSelect', true);
  table.value?.openSelectBox();
};

// 关闭多选
const closeSelectBox = () => {
  emits('update:showSelect', false);
  table.value?.closeSelectBox();
};

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
    selectSongs.value.forEach((item) => {
      if (props.pageName == 'LoveView') {
        loveSongs.value.splice(loveMusicId.value.get(item.id) as number, 1);
      } else if (props.pageName == 'RecentPlayView') {
        songRecord.value.splice(songRecordId.value.get(item.id) as number, 1);
      } else {
        musicDownload.value.splice(
          musicDownloadId.value.get(item.id) as number,
          1
        );
      }
    });
    message(MessageType.SUCCESS, '已清除选中的歌曲！');
  } else {
    message(MessageType.INFO, '请先选择歌曲！');
  }
};

defineExpose({
  openSelectBox,
  closeSelectBox
});
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
