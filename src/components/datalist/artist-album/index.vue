<template>
  <div class="album-container">
    <h4
      v-if="title"
      class="title">
      {{ title }}
    </h4>
    <div class="content">
      <TransitionGroup :name="transitionName">
        <div
          v-for="item in showPagination ? curShow : albums"
          :key="item.id"
          class="album">
          <el-image
            :src="item.cover"
            loading="lazy"
            class="image" />
          <span
            class="iconfont play"
            @click="toAlbumDetail(item.id, item.artistId as string)"
            >&#xea83;</span
          >
          <span class="album-name">{{ item.name }}</span>
          <span>{{ item.publishTime }}</span>
          <span
            v-prevent
            v-if="showDelete"
            @click="emits('getDeleteId', item.id)"
            class="delete iconfont"
            >&#xe60e;</span
          >
        </div>
      </TransitionGroup>
      <Pagination
        v-if="showPagination && albums.length > pageSize"
        v-model:cur-page="curPage"
        :page-size="pageSize"
        text="个专辑"
        :total="total" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Album } from '@/type';
import Pagination from '@components/pagination';
import useTheme from '@/hooks/useTheme';
import { ALBUM_PAGESIZE } from '@/constants/common';

const props = withDefaults(
  defineProps<{
    // 专辑数组
    albums: Album[];
    // 标题
    title?: string;
    // 是否展示删除按钮
    showDelete?: boolean;
    // 是否展示过渡
    transitionName?: string;
    // 是否展示分页
    showPagination?: boolean;
  }>(),
  {
    title: '',
    showDelete: false,
    transitionName: '',
    showPagination: false,
  }
);

const emits = defineEmits<{
  (e: 'getDeleteId', id: string): void;
}>();
// 配置主题
const { fontColor, fontBlack, boxShadow, themeColor, fontGray } = useTheme();
const router = useRouter();
// 当前页数
const curPage = ref<number>(1);
// 一页多少数据
const pageSize = ref<number>(ALBUM_PAGESIZE);
// 总的数据数
const total = computed(() => props.albums.length);
// 当前展示的专辑
const curShow = computed(() =>
  props.albums.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value
  )
);

// 跳转专辑详情
const toAlbumDetail = (id: string, artistId: string) => {
  router.push({
    name: 'album',
    query: {
      id,
      artistId,
    },
  });
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);
@common-width: 12.369vw;
@common-height: 26.851vh;
@common-margin-left: 0.46875vw;
@common-margin-top: 2.826vh;

.album-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  .pagination-container {
    margin-top: 10px;
  }

  .title {
    font-weight: 520;
    font-size: 20px;
    letter-spacing: 1px;
    width: 80vw;
    color: @font-color;
    padding-left: @common-margin-left;
  }

  .content {
    width: 80vw;
    display: flex;
    flex-wrap: wrap;

    .album {
      display: flex;
      flex-direction: column;
      margin: @common-margin-top @common-margin-left 0;
      position: relative;

      &:hover .image {
        transform: translateY(-5px);
      }

      &:hover:after {
        opacity: 1;
        transform: translateY(-5px);
      }
      &:hover .play {
        opacity: 1;
      }
      &:hover .delete {
        opacity: 1;
      }
      .image {
        width: @common-width;
        height: @common-height;
        object-fit: cover;
        box-shadow: @shadow;
        border-radius: 10px;
        transition: 0.4s;
      }
      &::after {
        content: '';
        top: 0;
        height: @common-height;
        width: @common-width;
        border-radius: 10px;
        z-index: 9;
        background-color: rgba(0, 0, 0, 0.6);
        transition: 0.4s;
        position: absolute;
        opacity: 0;
      }
      .play {
        z-index: 10;
        display: inline-block;
        margin: 0;
        color: rgb(245, 245, 245);
        font-size: 50px;
        position: absolute;
        top: 57.5px;
        left: 70px;
        opacity: 0;
        cursor: pointer;
        &:hover {
          color: @theme-color;
        }
        cursor: pointer;
      }
      .album-name {
        font-size: 13px;
        color: @font-color;
        margin-top: 10px;
      }
      span {
        margin-top: 5px;
        display: inline-block;
        font-size: 12px;
        width: @common-width;
        color: @font-color-gray;
      }

      .delete {
        width: 0;
        margin: 0;
        color: @font-color-gray;
        display: inline-block;
        cursor: pointer;
        z-index: 5px;
        font-size: 17px;
        position: absolute;
        opacity: 0;
        bottom: 0;
        right: 20px;
        &:hover {
          color: @theme-color;
        }
      }
    }
  }
}
</style>
