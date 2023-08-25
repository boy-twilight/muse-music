<template>
  <div class="user-container">
    <div class="top-operation">
      <PlayButton :songs="songs" />
      <CommonButton
        icon="&#xe60e;"
        :name="buttonName"
        @click="clearAll" />
      <CommonButton
        icon="&#xe617;"
        name="批量操作"
        @click="emits('openSelect', true)" />
      <SearchButton v-model="content" />
      <SortButton @get-sort-choice="getSortChoice" />
    </div>
    <SongTable
      :songs="songs"
      :song-id-mapper="songIdMapper"
      :sort="sortChoice"
      :page-size="pageSize"
      :is-cancel-sort="cancelSort" />
    <Pagination
      v-show="pageSize < total"
      :cur-page="curPage"
      :page-size="pageSize"
      :total="total"
      @page-change="pageChange" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import useUserStore from '@/store/user';
import { messageType } from '@/constants/common';
import { message } from '@/utils';
import { Song } from '@/type';
import { SongTable } from '@components/table';
import {
  SearchButton,
  SortButton,
  PlayButton,
  CommonButton
} from '@components/button';
import Pagination from '@components/pagination';

// 获取用户播放数据
const user = useUserStore();
const { musicDownload, loveSongs, songRecord } = storeToRefs(user);

const props = defineProps<{
  pageName: string;
}>();

const emits = defineEmits<{
  (e: 'openSelect', showSelect: boolean): void;
}>();

// 根据页面传递的参数加载歌曲
const target = computed(() => {
  let songs = reactive<Song[]>([]);
  if (props.pageName == 'LoveView') {
    songs = loveSongs.value;
  } else if (props.pageName == 'RecentPlayView') {
    songs = songRecord.value;
  } else {
    songs = musicDownload.value;
  }
  return songs;
});
// 歌曲id与Index的映射
const songIdMapper = computed(
  () => new Map(target.value.map((item, index) => [item.id, index]))
);
// 用于分页
// 当前页数
const curPage = ref<number>(1);
// 一页多少数据
const pageSize = ref<number>(40);
// 歌曲
const songs = computed(() => {
  return target.value
    .slice((curPage.value - 1) * pageSize.value, curPage.value * pageSize.value)
    .filter(
      (song) =>
        song.name.includes(content.value) ||
        song.album.includes(content.value) ||
        song.singer.includes(content.value)
    );
});
// 总的数据数
const total = computed(() => target.value.length);
// 页数变化
const pageChange = (page: number) => {
  curPage.value = page;
};
// 按钮名字
const buttonName = computed(() => {
  if (props.pageName == 'LoveView') {
    return '清空全部收藏';
  } else if (props.pageName == 'RecentPlayView') {
    return '清空播放记录';
  } else {
    return '清空下载记录';
  }
});
// 搜索的内容
const content = ref<string>('');
// 展示歌曲，歌手，专辑，时长是否排序
const sortChoice = reactive<boolean[]>([false, false, false, false]);
// 是否取消排序
const cancelSort = ref<boolean>(false);

// 得到用户选择的排序类型
const getSortChoice = (sortType: boolean[], isCancelSort: boolean) => {
  for (let i = 0; i < sortChoice.length; i++) {
    sortChoice[i] = sortType[i];
  }
  if (isCancelSort) {
    cancelSort.value = isCancelSort;
  }
};

// 清除全部播放
const clearAll = () => {
  if (props.pageName == 'LoveView') {
    loveSongs.value.splice(0);
  } else if (props.pageName == 'RecentPlayView') {
    songRecord.value.splice(0);
  } else {
    musicDownload.value.splice(0);
  }
  message(messageType.SUCCESS, '已清空全部下载记录！');
};
</script>

<style lang="less" scoped>
.user-container {
  .pagination-container {
    margin: 10px 0;
  }
  .top-operation {
    margin: 15px 0 15px 10px;
    position: relative;
    .el-button {
      font-size: 13px;
      width: 125px !important;
    }

    .search-area,
    .sort-btn {
      position: absolute;
      top: 0;
    }

    .search-area {
      right: 110px;
    }
    .sort-btn {
      right: 40px;
      top: 2px;
    }
  }
}
</style>
