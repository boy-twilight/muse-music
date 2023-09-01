<template>
  <el-scrollbar :max-height="contentHeight">
    <div class="recent-container scroll-container">
      <UserBatch
        page-name="RecentPlayView"
        v-model:showSelect="showSelect"
        :cur-page="curPage"
        :page-size="pageSize"
        v-show="showSelect"
        ref="batch" />
      <Tab
        v-show="!showSelect"
        active="song">
        <template #content>
          <el-tab-pane
            :label="`歌曲`"
            name="song">
            <UserMusicTable
              @open-select="openSelect"
              page-name="RecentPlayView"
              ref="table" />
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
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { ref, inject, Ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { getMusicUrls } from '@/utils';
import useUserStore from '@/store/user';
import { ArtistMv } from '@components/datalist';
import { UserBatch } from '@components/batch';
import { UserMusicTable } from '@components/table';
import { NoResult } from '@components/result';
import Tab from '@components/tab';
import useTheme from '@/hooks/useTheme';
import { USER_MUSIC_PAGESIZE } from '@/constants/common';

// 配置主题
const { fontColor, fontGray, contentHeight } = useTheme();
// 获取用户播放数据
const user = useUserStore();
const { videoRecord, songRecord } = storeToRefs(user);
// 第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
// 是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);
// 批量操作容器
const batch = ref<InstanceType<typeof UserBatch>>();
// 表格容器
const table = ref<InstanceType<typeof UserMusicTable>>();
// 分页内容
// 分页内容
const curPage = computed(() => {
  const page = table.value?.getPage();
  return page ? page : 1;
});
const pageSize = computed(() => {
  const pageSize = table.value?.getPageSize();
  return pageSize ? pageSize : USER_MUSIC_PAGESIZE;
});

// 打开批量操作
const openSelect = () => {
  batch.value?.openSelectBox();
};

// 删除播放记录的视频
const deleteVideoRecord = (id: string) => {
  const index = videoRecord.value.findIndex((item) => item.id == id);
  videoRecord.value.splice(index, 1);
};

// 获取初始数据
const getData = async () => {
  first.value = true;
  await getMusicUrls(songRecord.value);
  user.initLoveMusic(songRecord.value);
  // 关闭动画
  first.value = false;
};

getData();
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
    @common-width: 15.104vw;
    &:deep(.mv-simi) {
      width: 80vw;
      .mv-recommend {
        .image,
        .mask,
        .title-name,
        .singer {
          width: @common-width;
        }
      }
    }
  }
}
</style>
