<template>
  <div class="download-container scroll-container">
    <UserBatch
      v-show="showSelect"
      page-name="DownloadView"
      @close-select="closeSelect" />
    <Tab
      v-show="!showSelect"
      active="song">
      <template #content>
        <el-tab-pane
          :label="`下载歌曲`"
          name="song">
          <UserMusicTable
            @open-select="openSelect"
            page-name="DownloadView" />
        </el-tab-pane>
        <el-tab-pane
          :label="`下载视频`"
          name="video ">
          <NoResult
            v-show="mvDownload.length == 0"
            text="暂无视频下载记录" />
          <ArtistMv
            :mvs="mvDownload"
            :show-delete="true"
            transitionName="list"
            :show-pagination="true"
            @get-delete-id="deleteDownLoad"
            v-show="mvDownload.length > 0" />
        </el-tab-pane>
      </template>
    </Tab>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { getMusicUrls, getRequset, getTheme } from '@/utils';
import useUserStore from '@/store/user';
import { ArtistMv } from '@components/datalist';
import { UserBatch } from '@components/batch';
import { UserMusicTable } from '@components/table';
import { NoResult } from '@components/result';
import Tab from '@components/tab';
// 配置主题
const fontColor = getTheme().get('fontColor');
const fontGray = inject('fontGray');
// 获取用户播放数据
const user = useUserStore();
const { mvDownload, musicDownload } = storeToRefs(user);
// 第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
// 是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);

// 打开批量操作
const openSelect = (open: boolean) => {
  showSelect.value = open;
};
// 关闭批量操作
const closeSelect = (close: boolean) => {
  showSelect.value = close;
};
// 删除播放的视频记录
const deleteDownLoad = (id: string) => {
  const index = mvDownload.value.findIndex((item) => item.id == id);
  mvDownload.value.splice(index, 1);
};
// 获取初始数据
getRequset(async() => {
  getMusicUrls(musicDownload.value);
  user.initLoveMusic(musicDownload.value);
  // 关闭动画
  first.value = false;
}, first);
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-gray: v-bind(fontGray);

.download-container {
  .tab {
    &:deep(.el-tabs__item) {
      font-size: 14px;
      letter-spacing: 1px;
    }
    &:deep(.el-tabs__active-bar) {
      left: 20px;
      width: 20px !important;
      height: 3px;
      border-radius: 1.5px;
    }
  }

  .mv {
    width: 80vw;
    &:deep(.mv-simi) {
      width: 80vw;
    }
    &:deep(.mv-recommend) {
      width: 232px;
    }
  }
}
</style>
