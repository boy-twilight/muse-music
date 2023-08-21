<template>
  <el-table
    @cell-dblclick="playMusic"
    @cell-mouse-enter="enter"
    @cell-mouse-leave="leave"
    :data="songs"
    :max-height="height"
    :show-header="showHeader"
    ref="tableContainer"
    style="width: 80vw"
    class="songs-table"
    :class="{
      'skin-table': bgMode == 'skin',
    }">
    <el-table-column
      type="selection"
      v-if="showSelectBox"
      :width="selectWidth" />
    <el-table-column
      :sortable="sortType[0]"
      :sort-method="sortBySong"
      label="歌曲"
      :width="500 - selectWidth">
      <template #default="scope">
        <div>
          <span
            @mousedown.prevent="
              user.addLove<Song>(scope.row, user.loveSongs, user.loveMusicId)
            "
            class="iconfont love"
            :class="{
              'is-love': scope.row.isLove,
            }"
            v-text="scope.row.isLove ? '&#xf0145;' : '&#xe761;'"></span>
          <span> {{ scope.row.name }} </span>
          <span
            class="iconfont vip"
            v-if="scope.row.available == '1' || scope.row.available == '10'"
            >&#xe607;</span
          >
          <span
            class="iconfont playmv"
            v-prevent
            @click="playMV(scope.row)"
            >&#xe611;</span
          >
          <!-- 后面这个showheader用以区别批量操作和正常操作 -->
          <div :class="`operation-area operation${showHeader}`">
            <!-- 播放音乐 -->
            <span
              @click="playMusic(scope.row)"
              v-show="
                !isPlay ||
                current != songList.findIndex((item) => item.id == scope.row.id)
              "
              v-prevent
              class="iconfont"
              >&#xea6e;</span
            >
            <!-- 暂停 -->
            <span
              @click="isPlay = false"
              v-show="
                isPlay &&
                current == songList.findIndex((item) => item.id == scope.row.id)
              "
              v-prevent
              class="iconfont">
              &#xea6d;</span
            >
            <!-- 下载 -->
            <span
              class="iconfont"
              @click="user.addMuiscDownload(scope.row)"
              v-prevent
              >&#xf0304;</span
            >
            <!-- 更多 -->
            <MoreDropdown
              :song="scope.row"
              :play="playMusic" />
          </div>
        </div>
      </template>
    </el-table-column>
    <el-table-column
      :sortable="sortType[1]"
      :sort-method="sortBySinger"
      prop="singer"
      label="歌手"
      width="320" />
    <el-table-column
      :sortable="sortType[2]"
      :sort-method="sortByAlbum"
      prop="album"
      label="专辑"
      width="320" />
    <el-table-column
      :sortable="sortType[3]"
      :sort-method="sortByTime"
      label="时长">
      <template #default="scope">
        <span> {{ transformTime(scope.row.time) }} </span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { onBeforeRouteLeave } from 'vue-router';
import { ElTable } from 'element-plus';
import { transformTime, getMusicUrls, playVideo } from '@/utils';
import { Song } from '@/type';
import userFooterStore from '@/store/footer';
import useUserStore from '@/store/user';
import { MoreDropdown } from '@components/button';
import usePlayMusic from '@/hooks/usePlayMuisc';
import useTheme from '@/hooks/useTheme';

// 申明接受数据
const props = withDefaults(
  defineProps<{
    // 歌曲
    songs: Song[];
    // 歌曲id与Index对应的map，方便后续查找
    songIdMapper: Map<string, number>;
    // 表格高度
    height?: string;
    // 是否展示多选框
    showSelect?: boolean;
    // 该字段表明哪些列需要排序，传入顺序为列的顺序
    sort?: boolean[];
    // 是否取消排序
    isCancelSort?: boolean;
    // 是否展示表头
    showHeader?: boolean;
    // 分页的数据大小,0代表未分页
    pageSize?: number;
  }>(),
  {
    showSelectBox: false,
    sort: undefined,
    isCancelSort: false,
    showHeader: true,
    pageSize: 0
  }
);

const { fontColor, background, fontGray, themeColor, tableHover, bgMode } =
  useTheme();
// 隐藏滚动条
const hideScrollbar = inject('hideScrollbar') as () => void;
const footer = userFooterStore();
const { songList, current, isPlay } = storeToRefs(footer);
const user = useUserStore();
// table容器
const tableContainer = ref<InstanceType<typeof ElTable>>();
// 表格多选
// 是否展开选择框
const showSelectBox = computed(() => props.showSelect);
// 选择框的长度
const selectWidth = computed(() => (props.showSelect ? 55 : 0));
// 获取选中
const getSelectItems = (): Song[] => tableContainer.value?.getSelectionRows();
// 清除选中
const clearSelect = () => {
  tableContainer.value!.clearSelection();
};
// 关闭选中框的适合清空选项
watch(showSelectBox, (newVal) => {
  if (!newVal) clearSelect();
});
// 表格排序
// 排序类型
const sortType = computed(() =>
  props.sort ? props.sort : [false, false, false, false]
);
// 是否退出排序
const cancelSort = computed(() => props.isCancelSort);
// 排序规则
const sortBySong = (a: Song, b: Song) => a.name.localeCompare(b.name);
const sortBySinger = (a: Song, b: Song) => a.singer.localeCompare(b.singer);
const sortByAlbum = (a: Song, b: Song) => a.album.localeCompare(b.album);
const sortByTime = (a: Song, b: Song) =>
  +(a.time as string) - +(b.time as string);
// 当退出排序时清空排序内容
watch(cancelSort, (newVal) => {
  if (newVal) {
    tableContainer.value!.clearSort();
  }
});

// 鼠标进入移出时隐藏操作区
// 获取domlist
const getNodeList = (): NodeListOf<HTMLDivElement> => {
  return document.querySelectorAll(`.operation${props.showHeader}`);
};

// 当鼠标进入时
const enter = (row: Song) => {
  // 根据是否分页来判断当前的操作行的下标
  let index = 0;
  if (props.pageSize > 0) {
    const curPage = Math.floor(
      (props.songIdMapper.get(row.id) as number) / props.pageSize
    );
    index =
      (props.songIdMapper.get(row.id) as number) - curPage * props.pageSize;
  } else {
    index = props.songIdMapper.get(row.id) as number;
  }
  const curOpera = getNodeList()[index];
  if (curOpera) {
    curOpera.style.opacity = '1';
  }
};

// 当鼠标离开时
const leave = (row: Song) => {
  let index = 0;
  if (props.pageSize > 0) {
    const curPage = Math.floor(
      (props.songIdMapper.get(row.id) as number) / props.pageSize
    );
    index =
      (props.songIdMapper.get(row.id) as number) - curPage * props.pageSize;
  } else {
    index = props.songIdMapper.get(row.id) as number;
  }
  const curOpera = getNodeList()[index];
  if (curOpera) {
    curOpera.style.opacity = '0';
  }
};

// 播放单曲
const { playMusic } = usePlayMusic();

// 播放mv
const playMV = (song: Song) => {
  playVideo(song, () => {
    hideScrollbar();
  });
};

// 定时重新获取musicurl
// 计时器id
let timeid: any = 0;
// 路由是否离开的标志
let isLeave = false;
const getUrlOntime = () => {
  if (isLeave) {
    isLeave = false;
    return clearTimeout(timeid);
  }
  timeid = setTimeout(() => {
    if (props.songs.length > 0) {
      const exclude = props.songs.findIndex(
        (song) => song.id == songList.value[current.value].id
      );
      getMusicUrls(props.songs, exclude);
    }
    getUrlOntime();
  }, 60 * 1000 * 5);
};
getUrlOntime();
// 离开路由时销毁
onBeforeRouteLeave(() => {
  isLeave = true;
});

defineExpose({
  clearSelect,
  getSelectItems
});
</script>

<style lang="less">
@font-color: v-bind(fontColor);
@table-hover: v-bind(tableHover);
@background: v-bind(background);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);
@import './index.less';
</style>
