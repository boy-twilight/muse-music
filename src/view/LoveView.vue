<template>
  <el-scrollbar :max-height="contentHeight">
    <div class="love-container scroll-container">
      <UserBatch
        page-name="LoveView"
        v-show="showSelect"
        v-model:show-select="showSelect"
        :curPage="curPage"
        :pageSize="pageSize"
        ref="batch" />
      <Tab
        active="song"
        v-show="!showSelect">
        <template #content>
          <el-tab-pane
            :label="`歌曲`"
            name="song">
            <UserMusicTable
              page-name="LoveView"
              @open-select="openSelect"
              ref="table" />
          </el-tab-pane>
          <el-tab-pane
            :label="`视频`"
            name="video">
            <NoResult
              v-show="loveVideo.length == 0"
              text="暂无收藏视频" />
            <ArtistMv
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
            <NoResult
              v-show="lovePlaylist.length == 0"
              text="暂无收藏歌单" />
            <ArtistPlaylist
              :playlists="lovePlaylist"
              transitionName="list"
              :showDelete="true"
              :show-pagination="true"
              @get-delete-id="deleteLovePlaylist"
              v-show="lovePlaylist.length > 0" />
          </el-tab-pane>
          <el-tab-pane
            :label="`电台`"
            name="radio">
            <NoResult
              v-show="loveRadio.length == 0"
              text="暂无收藏电台" />
            <ArtistPlaylist
              :playlists="loveRadio"
              type="radio"
              transitionName="list"
              :show-pagination="true"
              :showDelete="true"
              @get-delete-id="deleteLoveRadio"
              v-show="loveRadio.length > 0" />
          </el-tab-pane>
          <el-tab-pane
            :label="`歌手`"
            name="singer">
            <NoResult
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
            <NoResult
              v-show="loveAlbum.length == 0"
              text="暂无收藏专辑" />
            <ArtistAlbum
              :albums="loveAlbum"
              transitionName="list"
              :showDelete="true"
              :show-pagination="true"
              @get-delete-id="deleteLoveAlbum"
              v-show="loveAlbum.length >= 0" />
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
import {
  ArtistMv,
  Singer,
  ArtistPlaylist,
  ArtistAlbum
} from '@components/datalist';
import { UserBatch } from '@components/batch';
import { UserMusicTable } from '@components/table';
import { NoResult } from '@components/result';
import Tab from '@components/tab';
import useTheme from '@/hooks/useTheme';
import { USER_MUSIC_PAGESIZE } from '@/constants/common';
// 配置主题
const { fontGray, contentHeight } = useTheme();
// 获取用户数据
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
  loveRadioId
} = storeToRefs(user);
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

// 删除收藏的视频
const deleteLoveVideo = (id: string) => {
  const index = loveVideoId.value.get(id) as number;
  loveVideo.value.splice(index, 1);
};

// 删除收藏的专辑
const deleteLoveAlbum = (id: string) => {
  const index = loveAlbumId.value.get(id) as number;
  loveAlbum.value.splice(index, 1);
};

// 删除收藏的歌手
const deleteLoveSinger = (index: number) => {
  loveSinger.value.splice(index, 1);
};

// 删除收藏的歌单
const deleteLovePlaylist = (id: string) => {
  const index = lovePlaylistId.value.get(id) as number;
  lovePlaylist.value.splice(index, 1);
};

// 删除收藏的电台
const deleteLoveRadio = (id: string) => {
  const index = loveRadioId.value.get(id) as number;
  loveRadio.value.splice(index, 1);
};

const getData = async() => {
  first.value = true;
  await getMusicUrls(loveSongs.value);
  // 关闭动画
  first.value = false;
};

getData();
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
    padding-bottom: 15px;
    @common-width: 14.843vw;
    @common-height: 32.239vh;
    &:deep(.singer-list) {
      width: 80vw;
      .singer {
        .image,
        .span {
          width: @common-width;
        }
        .image {
          height: @common-height;
        }
      }
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

  .playlist {
    @common-width: 12.1419vw;
    @common-top: 21.21vh;
    @common-height: 26.3716vh;
    &:deep(.content) {
      width: 80vw;

      .list {
        .mask,
        .el-image {
          width: @common-width;
          height: @common-height;
        }
        .name {
          width: @common-width;
        }
        .playcount {
          top: @common-top;
        }
      }
    }
  }
}
</style>
