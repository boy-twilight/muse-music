<template>
  <div class="recent-container scroll-container">
    <UserBatch
      page-name="RecentPlayView"
      v-show="showSelect"
      @close-select="closeSelect" />
    <Tab
      v-show="!showSelect"
      active="song">
      <template #content>
        <el-tab-pane
          :label="`歌曲`"
          name="song">
          <UserMusicTable
            @open-select="openSelect"
            page-name="RecentPlayView" />
        </el-tab-pane>
        <el-tab-pane
          :label="`视频`"
          name="video ">
          <NoResult
            v-show="videoRecord.length == 0"
            text="暂无视频播放记录" />
          <ArtistMv
            :mvs="videoRecord"
            :show-delete="true"
            transitionName="list"
            :show-pagination="true"
            @get-delete-id="deleteVideoRecord"
            v-show="videoRecord.length > 0" />
        </el-tab-pane>
      </template>
    </Tab>
  </div>
</template>

<script lang="ts" setup>
import { ref, inject, Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { getMusicUrls, getRequset } from '@/utils';
import useUserStore from '@/store/user';
import { ArtistMv } from '@components/datalist';
import { UserBatch } from '@components/batch';
import { UserMusicTable } from '@components/table';
import { NoResult } from '@components/result';
import Tab from '@components/tab';
import useTheme from '@/hooks/useTheme';

// 配置主题
const { fontColor, fontGray } = useTheme();

// 获取用户播放数据
const user = useUserStore();
const { videoRecord, songRecord } = storeToRefs(user);

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

// 删除播放记录的视频
const deleteVideoRecord = (id: string) => {
  const index = videoRecord.value.findIndex((item) => item.id == id);
  videoRecord.value.splice(index, 1);
};

// 获取初始数据
getRequset(async() => {
  getMusicUrls(songRecord.value);
  user.initLoveMusic(songRecord.value);
  // 关闭动画
  first.value = false;
}, first);
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-gray: v-bind(fontGray);

.recent-container {
  .tab {
    &:deep(.el-tabs__item) {
      font-size: 14px;
      letter-spacing: 1px;
    }
    &:deep(.el-tabs__active-bar) {
      left: 6px;
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
