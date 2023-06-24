<template>
  <div class="user-container">
    <div class="top-operation">
      <PlayButton :songs="songs" />
      <DecoratedButton
        icon="&#xe60e;"
        :name="buttonName"
        @click.native="clearAll" />
      <DecoratedButton
        icon="&#xe617;"
        name="批量操作"
        @click.native="emits('openSelect', true)" />
      <SearchButton @getContent="getContent" />
      <SortButton @get-sort-choice="getSortChoice" />
    </div>
    <SongList
      :songs="songs"
      :song-id-mapper="songIdMapper"
      :sort="sortChoice"
      :is-cancel-sort="cancelSort" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, reactive } from 'vue';
import { storeToRefs } from 'pinia';
import useUserStore from '@/store/user';
import { elMessageType } from '@/model/enum';
import { elMessage } from '@/utils/util';
import { Song } from '@/model';
import SongList from '@components/table/SongList.vue';
import PlayButton from '@components/button/PlayButton.vue';
import DecoratedButton from '@components/button/DecoratedButton.vue';
import SearchButton from '@components/button/SearchButton.vue';
import SortButton from '@components/button/SortButton.vue';

//获取用户播放数据
const user = useUserStore();
const { musicDownload, loveSongs, songRecord } = storeToRefs(user);

const props = defineProps<{
  pageName: string;
}>();

const emits = defineEmits<{
  (e: 'openSelect', showSelect: boolean): void;
}>();

//歌曲
const songs = computed(() => {
  let songs = reactive<Song[]>([]);
  if (props.pageName == 'LoveView') {
    songs = loveSongs.value;
  } else if (props.pageName == 'RecentPlayView') {
    songs = songRecord.value;
  } else {
    songs = musicDownload.value;
  }
  return songs.filter(
    (song) =>
      song.name.includes(content.value) ||
      song.album.includes(content.value) ||
      song.singer.includes(content.value)
  );
});
//歌曲id与Index的映射
const songIdMapper = computed(
  () => new Map(songs.value.map((item, index) => [item.id, index]))
);

//按钮名字
const buttonName = computed(() => {
  if (props.pageName == 'LoveView') {
    return '清空全部收藏';
  } else if (props.pageName == 'RecentPlayView') {
    return '清空播放记录';
  } else {
    return '清空下载记录';
  }
});

//搜索的内容
const content = ref<string>('');
//搜索
const getContent = (search: string) => {
  content.value = search;
};
//展示歌曲，歌手，专辑，时长是否排序
const sortChoice = reactive<boolean[]>([false, false, false, false]);
//是否取消排序
const cancelSort = ref<boolean>(false);
//得到用户选择的排序类型
const getSortChoice = (sortType: boolean[], isCancelSort: boolean) => {
  for (let i = 0; i < sortChoice.length; i++) {
    sortChoice[i] = sortType[i];
  }
  if (isCancelSort) {
    cancelSort.value = isCancelSort;
  }
};

//清除全部播放
const clearAll = () => {
  if (props.pageName == 'LoveView') {
    loveSongs.value.splice(0);
  } else if (props.pageName == 'RecentPlayView') {
    songRecord.value.splice(0);
  } else {
    musicDownload.value.splice(0);
  }
  elMessage(elMessageType.SUCCESS, '已清空全部下载记录！');
};
</script>

<style lang="less" scoped>
.user-container {
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
