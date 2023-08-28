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
      :show-select="true"
      :show-header="false"
      ref="table" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Song } from '@/type';
import useUserStore from '@/store/user';
import usePlayMusic from '@/hooks/usePlayMuisc';
import { CommonButton } from '@components/button';
import { SongTable } from '@components/table';
import useTheme from '@/hooks/useTheme';

defineProps<{
  // 歌曲
  songs: Song[];
}>();
const emits = defineEmits<{
  (e: 'closeSelect', showSelect: boolean): void;
}>();
// 配置主题
const { themeColor } = useTheme();
// 用户数据
const user = useUserStore();
const { loveMusicId, loveSongs } = storeToRefs(user);
// 选择的歌曲
const selectSongs = computed(() => table.value?.getSelectItems() || []);
// 表格容器
const table = ref<InstanceType<typeof SongTable>>();

// 播放选中音乐
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

// 喜欢选中的歌曲
const loveSelect = () => {
  selectSongs.value.forEach((item) => {
    item.isLove = true;
    const index = loveMusicId.value.get(item.id);
    if (index == undefined) loveSongs.value.push(item);
  });
  table.value?.clearSelect();
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
