<template>
  <el-table
    @cell-dblclick="play"
    @cell-mouse-enter="enter"
    @cell-mouse-leave="leave"
    @selection-change="doSelect"
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
          <div :class="randomClass">
            <!-- 播放音乐 -->
            <span
              @click="play(scope.row)"
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
              :play="play" />
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
import { computed, inject, ref, watch, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { onBeforeRouteLeave } from 'vue-router';
import { ElTable } from 'element-plus';
import {
  transformTime,
  getTheme,
  elMessage,
  getMusicUrls,
  playVideo,
} from '@/utils/util';
import { Song } from '@/model';
import userFooterStore from '@/store/footer';
import useUserStore from '@/store/user';
import { elMessageType } from '@/model/enum';
import MoreDropdown from '@components/button/MoreDropdown.vue';
import useConfigStore from '@/store/config';

//设置主题
const config = useConfigStore();
const { bgMode } = storeToRefs(config);
const fontColor = getTheme().get('fontColor');
const hover = getTheme().get('tableHover');
const bg = getTheme().get('background');
const fontGray = inject('fontGray');

//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;
const footer = userFooterStore();
const { songList, current, isPlay, playProcess, playTime, songListId } =
  storeToRefs(footer);
const user = useUserStore();

//申明接受数据
const props = withDefaults(
  defineProps<{
    //歌曲
    songs: Song[];
    //歌曲id与Index对应的map，方便后续查找
    songIdMapper: Map<string, number>;
    //表格高度
    height?: string;
    //是否展示多选框
    showSelect?: boolean;
    //该字段表明哪些列需要排序，传入顺序为列的顺序
    sort?: boolean[];
    //是否取消排序
    isCancelSort?: boolean;
    // 是否展示表头
    showHeader?: boolean;
  }>(),
  {
    showSelectBox: false,
    sort: undefined,
    isCancelSort: false,
    showHeader: true,
  }
);

const emits = defineEmits<{
  //回传选中项目
  (e: 'getSelectItems', songs: Song[]): void;
}>();

//table容器
const tableContainer = ref<InstanceType<typeof ElTable>>();
//随机类名，避免筛选节点冲突
const randomClass = ref<string>(
  'operation-area operation' +
    Number.parseInt(Math.random() * 1000000000000 + '')
);

//表格多选
//是否展开选择框
const showSelectBox = computed(() => props.showSelect);
//选择框的长度
const selectWidth = computed(() => (props.showSelect ? 55 : 0));
//将选择项回传
const doSelect = (songs: Song[]) => {
  emits('getSelectItems', songs);
};
//关闭选中框的适合清空选项
watch(showSelectBox, (newVal) => {
  if (!newVal) {
    tableContainer.value!.clearSelection();
  }
});

//表格排序
//排序类型
const sortType = computed(() =>
  props.sort ? props.sort : [false, false, false, false]
);
//是否退出排序
const cancelSort = computed(() => props.isCancelSort);
//排序规则
const sortBySong = (a: Song, b: Song) => a.name.localeCompare(b.name);
const sortBySinger = (a: Song, b: Song) => a.singer.localeCompare(b.singer);
const sortByAlbum = (a: Song, b: Song) => a.album.localeCompare(b.album);
const sortByTime = (a: Song, b: Song) =>
  +(a.time as string) - +(b.name as string);
//当退出排序时清空排序内容
watch(cancelSort, (newVal) => {
  if (newVal) {
    tableContainer.value!.clearSort();
  }
});

//鼠标进入移出时隐藏操作区
//获取对应的dom节点
const getNodeList = (): NodeListOf<HTMLDivElement> => {
  return document.querySelectorAll('.' + randomClass.value.split(' ')[1]);
};
//当鼠标进入时
const enter = (row: Song) => {
  getNodeList()[props.songIdMapper.get(row.id) as number].style.opacity = '1';
};
//当鼠标离开时
const leave = (row: Song) => {
  getNodeList()[props.songIdMapper.get(row.id) as number].style.opacity = '0';
};

//播放相关
//播放单曲
const play = async (song: Song) => {
  if (song.available == '0' || song.available == '8') {
    const index = songListId.value.get(song.id);
    if (index == undefined) {
      //添加播放记录
      user.addRecord(song, user.songRecord, user.songRecordId);
      if (current.value == 0) {
        if (isPlay) {
          isPlay.value = false;
        }
        playProcess.value = 0;
        playTime.value = 0;
        songList.value.unshift(song);
        await nextTick();
        isPlay.value = true;
      } else {
        songList.value.unshift(song);
        current.value = 0;
      }
    } else {
      if (current.value != index) {
        current.value = index;
      } else {
        isPlay.value = true;
      }
    }
  } else if ((song.available = '1')) {
    elMessage(elMessageType.INFO, '此歌曲为vip专属');
  } else if ((song.available = '10')) {
    elMessage(elMessageType.INFO, '此歌曲尚未拥有版权，请切换其它歌曲');
  }
};
//播放mv
const playMV = (song: Song) => {
  playVideo(song, () => {
    hideScroll();
  });
};

//定时重新获取musicurl
//计时器
let timeid: any = 0;
const getDataOntime = () => {
  timeid = setInterval(() => {
    if (props.songs.length > 0) {
      const ids = props.songs.map((song) => song.id);
      const exclude = props.songs.findIndex(
        (song) => song.id == songList.value[current.value].id
      );
      if (ids.length > 0) {
        getMusicUrls(ids.join(','), props.songs, '', exclude);
      }
    }
  }, 60 * 1000 * 5);
};
getDataOntime();
onBeforeRouteLeave(() => {
  clearInterval(timeid);
});
</script>

<style lang="less">
@font-color: v-bind(fontColor);
@table-hover: v-bind(hover);
@background: v-bind(bg);
@font-color-gray: v-bind(fontGray);
@font-color-green: #1ed2a9;

.is-active {
  opacity: 1 !important;
}

.is-love {
  color: #ff6a6a !important;
}

.songs-table {
  .iconfont {
    font-size: 16px;
    margin-right: 6px;
    cursor: pointer;
    transition: 0.4s;
    color: @font-color-gray;
    &:hover {
      color: rgba(31, 207, 158, 0.8);
    }
  }
  .playmv {
    font-size: 17.5px;
    margin: 0 0 0 5px;
  }

  .vip {
    color: @font-color-green;
    font-size: 15px;
    margin: 0 0 0 5px;
  }

  tbody tr:hover > td {
    transition: 0.4s;
    background: @table-hover !important;
  }

  .el-table__row > td {
    transition: background 0s !important;
    border: none;
    font-size: 13px;
    color: @font-color;
    padding: 12px 0 12px 1px;
    background: @background !important;
    &:first-child {
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
    }
    &:last-child {
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
    }
    .cell > div {
      display: flex;
      align-items: center;
      position: relative;

      .operation-area {
        color: @font-color-gray;
        position: absolute;
        right: 30px;
        height: 23px;
        opacity: 0;

        span {
          margin: 3.5px 5px 0;
        }
      }
    }
  }
  &::before {
    //去掉最下面的那一条线
    height: 0px;
  }
  &:deep(.is-leaf) {
    border: none !important;
  }
  th.el-table__cell.is-leaf {
    border: none !important;
    font-size: 12px;
    font-weight: 500;
    background-color: @background !important;
  }

  .el-table__inner-wrapper::before {
    height: 0 !important;
  }

  .descending .sort-caret.descending {
    border-top-color: @font-color-green;
  }
  .ascending .sort-caret.ascending {
    border-bottom-color: @font-color-green;
  }
}

/* 表格内背景颜色 */
.skin-table {
  background-color: transparent;
  th,
  tr,
  td,
  .el-table__expanded-cell {
    background-color: transparent;
  }
  .el-table__header th {
    color: @font-color-gray;
  }
}
</style>
