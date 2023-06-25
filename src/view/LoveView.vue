<template>
  <div class="love-container scroll-container">
    <UserBatch
      page-name="LoveView"
      v-show="showSelect"
      @close-select="closeSelect" />
    <Tab
      active="song"
      @get-active="getActive"
      v-show="!showSelect">
      <template #content>
        <el-tab-pane
          :label="`歌曲`"
          name="song">
          <UserSongTable
            page-name="LoveView"
            @open-select="openSelect" />
        </el-tab-pane>
        <el-tab-pane
          :label="`视频`"
          name="video">
          <NoSearch
            v-show="loveVideo.length == 0"
            text="暂无收藏视频" />
          <Mv
            :mvs="loveVideo"
            transitionName="list"
            :showDelete="true"
            :show-pagination="true"
            @get-delete-id="deleteLoveVideo"
            v-show="loveVideo.length > 0" />
        </el-tab-pane>
        <el-tab-pane
          :label="`歌单`"
          name="playlist">
          <NoSearch
            v-show="lovePlaylist.length == 0"
            text="暂无收藏歌单" />
          <PlayList
            :playlists="lovePlaylist"
            transitionName="list"
            :showDelete="true"
            :show-pagination="false"
            @get-delete-id="deleteLovePlaylist"
            v-show="lovePlaylist.length > 0" />
        </el-tab-pane>
        <el-tab-pane
          :label="`电台`"
          name="radio">
          <NoSearch
            v-show="loveRadio.length == 0"
            text="暂无收藏电台" />
          <PlayList
            :playlists="loveRadio"
            type="radio"
            transitionName="list"
            :show-pagination="false"
            :showDelete="true"
            @get-delete-id="deleteLoveRadio"
            v-show="loveRadio.length > 0" />
        </el-tab-pane>
        <el-tab-pane
          :label="`歌手`"
          name="singer">
          <NoSearch
            v-show="loveSinger.length == 0"
            text="暂无收藏歌手" />
          <Singer
            :singer-list="loveSinger"
            transitionName="list"
            :showDelete="true"
            @get-delete-index="deleteLoveSinger"
            v-show="loveSinger.length > 0" />
        </el-tab-pane>
        <el-tab-pane
          :label="`专辑`"
          name="album">
          <NoSearch
            v-show="loveAlbum.length == 0"
            text="暂无收藏专辑" />
          <Albums
            :albums="loveAlbum"
            transitionName="list"
            :showDelete="true"
            :show-pagination="false"
            @get-delete-id="deleteLoveAlbum"
            v-show="loveAlbum.length >= 0" />
        </el-tab-pane>
      </template>
    </Tab>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, Ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { getMusicUrls, getRequset } from '@/utils/util';
import useUserStore from '@/store/user';
import Tab from '@components/tab/Tab.vue';
import Mv from '@components/datalist/Mv.vue';
import Singer from '@components/datalist/Singer.vue';
import Albums from '@components/datalist/Albums.vue';
import PlayList from '@components/datalist/PlayList.vue';
import UserBatch from '@components/batch/UserBatch.vue';
import UserSongTable from '@components/table/UserSongTable.vue';
import NoSearch from '@/components/common/NoSearch.vue';

// 配置主题
const fontGray = inject('fontGray');

//获取用户数据
const user = useUserStore();
const {
  loveSongs,
  loveVideo,
  loveSinger,
  lovePlaylist,
  loveAlbum,
  loveRadio,
  loveAlbumId,
  loveVideoId,
  lovePlaylistId,
  loveRadioId,
} = storeToRefs(user);

//第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;
const getActive = () => {
  hideScroll();
};

//是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);

//打开批量操作
const openSelect = (open: boolean) => {
  showSelect.value = open;
};

//关闭批量操作
const closeSelect = (close: boolean) => {
  hideScroll();
  showSelect.value = close;
};

//删除收藏的视频
const deleteLoveVideo = (id: string) => {
  const index = loveVideoId.value.get(id) as number;
  loveVideo.value.splice(index, 1);
};
//删除收藏的专辑
const deleteLoveAlbum = (id: string) => {
  const index = loveAlbumId.value.get(id) as number;
  loveAlbum.value.splice(index, 1);
};
//删除收藏的歌手
const deleteLoveSinger = (index: number) => {
  loveSinger.value.splice(index, 1);
};
//删除收藏的歌单
const deleteLovePlaylist = (id: string) => {
  const index = lovePlaylistId.value.get(id) as number;
  lovePlaylist.value.splice(index, 1);
};
//删除收藏的电台
const deleteLoveRadio = (id: string) => {
  const index = loveRadioId.value.get(id) as number;
  loveRadio.value.splice(index, 1);
};

getRequset(async () => {
  const ids = loveSongs.value.map((item) => item.id).join(',');
  getMusicUrls(ids, loveSongs.value);
  //关闭动画
  first.value = false;
}, first);
</script>

<style lang="less" scoped>
@font-color-gray: v-bind(fontGray);

.love-container {
  .tab {
    &:deep(.el-tabs__item) {
      font-size: 14px;
      letter-spacing: 1px;
    }
    &:deep(.el-tabs__active-bar) {
      left: 5.1px;
      width: 20px !important;
      height: 3px;
      border-radius: 1.5px;
    }
  }

  .singer-container {
    &:deep(.singer-list) {
      width: 80vw;
    }
    padding-bottom: 15px;
    &:deep(.singer .el-image) {
      width: 187.5px;
    }
    &:deep(.singer span) {
      width: 187.5px;
    }
  }

  .mv {
    &:deep(.mv-simi) {
      width: 80vw;
    }
    &:deep(.mv-recommend) {
      width: 232px;
    }
  }

  .playlist {
    @common: 186.5px;
    &:deep(.content) {
      width: 80vw;
    }
    &:deep(.content .list .mask) {
      width: @common;
      height: @common;
    }
    &:deep(.content .list .playcount) {
      top: 155px;
    }
    &:deep(.content .list .el-image) {
      width: @common;
      height: @common;
    }
    &:deep(.content .list .name) {
      width: @common;
    }
  }
}
</style>
