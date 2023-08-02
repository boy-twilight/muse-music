<template>
  <div class="playlist">
    <h4
      class="title"
      v-if="title">
      {{ title }}
    </h4>
    <div class="content">
      <TransitionGroup :name="transitionName">
        <div
          v-for="item in showPagination ? curShow : playlists"
          :key="item.id"
          class="list">
          <div class="mask">
            <span
              class="iconfont"
              @click="toPlayList(item)"
              v-prevent
              >&#xea82;</span
            >
            <span
              v-prevent
              v-if="showDelete"
              @click="emits('getDeleteId', item.id)"
              class="delete iconfont"
              >&#xe60e;</span
            >
          </div>
          <el-image
            :src="item.image"
            loading="lazy"
            class="image" />
          <span class="name">{{ item.name }}</span>

          <span class="playcount iconfont"
            >&#xe6b1; {{ (+item.playCount / 10000).toFixed(1) }}万</span
          >
        </div>
      </TransitionGroup>
      <Pagination
        v-if="showPagination && playlists.length > pageSize"
        :cur-page="curPage"
        :page-size="pageSize"
        text="个歌单"
        @page-change="pageChange"
        :total="total" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Playlist } from '@/model';
import { getTheme } from '@/utils';
import Pagination from '@components/pagination';

// 设置主题
const boxShadow = getTheme().get('shadow');
const fontColor = getTheme().get('fontColor');
const themeColor = getTheme().get('themeColor');
const fontGray = inject('fontGray');

const router = useRouter();
// 设置隐藏滚动条
const hideScroll = inject('hideScroll') as () => void;

const props = withDefaults(
  defineProps<{
    playlists: Playlist[];
    title?: string;
    showDelete?: boolean;
    transitionName?: string;
    showPagination?: boolean;
    type?: string;
  }>(),
  {
    title: '',
    showDelete: false,
    transitionName: '',
    showPagination: false,
    type: 'playlist'
  }
);

const emits = defineEmits<{
  (e: 'getDeleteId', id: string): void;
}>();

// 当前页数
const curPage = ref<number>(1);
// 一页多少数据
const pageSize = ref<number>(18);
// 总的数据数
const total = computed(() => props.playlists.length);
// 当前展示的专辑
const curShow = computed(() =>
  props.playlists.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value
  )
);
// 页数变化
const pageChange = async(page: number) => {
  curPage.value = page;
};

const toPlayList = (list: Playlist) => {
  hideScroll();
  router.push({
    name: 'playlist',
    query: {
      id: list.id,
      type: props.type
    }
  });
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);
@font-color-white: #ffffff;
@common-width: 230px;
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-leave-from {
  opacity: 1;
}
.list-leave-to {
  opacity: 0;
}
.list-leave-active {
  position: absolute !important;
}

.playlist {
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
    width: 81vw;
    color: @font-color;
    padding-left: 9px;
  }
  .content {
    width: 81vw;
    display: flex;
    flex-wrap: wrap;

    .list {
      display: flex;
      flex-direction: column;
      margin: 20px 9px 0;
      position: relative;
      cursor: pointer;
      .mask {
        width: @common-width;
        height: @common-width;
        background-color: rgba(0, 0, 0, 0.5);
        position: absolute;
        top: 0;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: rgba(255, 255, 255, 0.4);
        opacity: 0;
        transition: 0.5s;
        z-index: 10;
        .delete {
          display: inline-block;
          font-size: 17px;
          position: absolute;
          top: 8px;
          right: 10px;
        }
        span {
          font-size: 50px;
          cursor: pointer;
          &:hover {
            color: @theme-color;
          }
        }
      }
      &:hover .image {
        transform: translateY(-5px);
      }
      &:hover .mask {
        opacity: 1;
        transform: translateY(-5px);
      }
      &:hover .playcount {
        opacity: 0;
      }
      transition: 0.5s;
      .image {
        width: @common-width;
        height: @common-width;
        border-radius: 10px;
        object-fit: cover;
        box-shadow: @shadow;
        transition: 0.5s;
      }

      .playcount {
        font-size: 12px;
        display: inline-block;
        text-align: center;
        line-height: 20px;
        height: 20px;
        min-width: 70px;
        padding: 0 5px;
        color: @font-color-white;
        background-color: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        position: absolute;
        top: 200px;
        right: 12px;
      }
      .name {
        width: @common-width;
        white-space: wrap;
        font-size: 12px;
        display: inline-block;
        margin-top: 5px;
        color: @font-color;
      }
    }
  }
}
</style>
