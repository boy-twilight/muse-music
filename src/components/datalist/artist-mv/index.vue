<template>
  <div class="mv">
    <h4
      class="title"
      v-show="title">
      {{ title }}
    </h4>
    <div class="mv-simi">
      <TransitionGroup :name="transitionName">
        <div
          class="mv-recommend"
          v-for="item in showPagination ? curShow : mvs"
          :key="item.id">
          <el-image
            :src="item.image"
            loading="lazy"
            class="image" />
          <div class="mask">
            <span
              @click="toMv(item.id)"
              class="iconfont play"
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
          <span
            class="playcount iconfont"
            v-if="item.playCount"
            >&#xe662; {{ (+item.playCount / 10000).toFixed(1) }}万</span
          >
          <span class="title-name">{{ item.name }}</span>
          <span class="singer">{{ item.artist }}</span>
        </div>
      </TransitionGroup>
      <Pagination
        v-if="showPagination && mvs.length > pageSize"
        text="个视频"
        v-model:curPage="curPage"
        :pageSize="pageSize"
        :total="total" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { MV } from '@/type';
import Pagination from '@components/pagination';
import useTheme from '@/hooks/useTheme';
import { VIDEO_PAGESIZE } from '@/constants/common';

const props = withDefaults(
  defineProps<{
    mvs: MV[];
    title?: string;
    showDelete?: boolean;
    transitionName?: string;
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
const { fontColor, boxShadow, themeColor, fontGray } = useTheme();
const router = useRouter();
// 当前页数
const curPage = ref<number>(1);
// 一页多少数据
const pageSize = ref<number>(VIDEO_PAGESIZE);
// 总的数据数
const total = computed(() => props.mvs.length);
// 当前展示的专辑
const curShow = computed(() =>
  props.mvs.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value
  )
);

// 点击推荐跳转
const toMv = (id: string) => {
  router.push({
    name: 'video',
    query: {
      id,
    },
  });
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);
@font-color-green: v-bind(themeColor);
@font-color-white: #ffffff;
@common-width: 15.299vw;
@common-height: 19.785vh;
@common-top: 15.545vh;
@common-margin-top: 2.826vh;
@common-margin-left: 0.42968vw;
.mv {
  display: flex;
  flex-direction: column;
  margin-bottom: @common-margin-top;

  .pagination-container {
    margin-top: 10px;
  }

  .title {
    font-weight: 520;
    font-size: 20px;
    letter-spacing: 1px;
    width: 81vw;
    color: @font-color;
    padding-left: @common-margin-left;
  }
  .mv-simi {
    width: 81vw;
    display: flex;
    flex-wrap: wrap;

    .mv-recommend {
      margin: @common-margin-top @common-margin-left 0;
      display: flex;
      flex-direction: column;
      position: relative;
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
      &:hover .delete {
        opacity: 1;
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
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 10px;
        position: absolute;
        top: @common-top;
        right: 12px;
        cursor: pointer;
      }

      .mask {
        transition: 0.4s;
        width: @common-width;
        height: @common-height;
        background-color: rgba(0, 0, 0, 0.5);
        position: absolute;
        top: 0;
        border-radius: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        color: rgba(255, 255, 255, 0.4);
        opacity: 0;
        z-index: 5;
        .delete {
          cursor: pointer;
          font-size: 17px;
          position: absolute;
          top: 6px;
          right: 10px;
        }

        span {
          display: inline-block;
          font-size: 40px;
          transition: 0.4s;
          cursor: pointer;
          &:hover {
            color: @font-color-green;
          }
        }
      }
      .image {
        width: @common-width;
        height: @common-height;
        object-fit: cover;
        border-radius: 10px;
        box-shadow: @shadow;
        transition: 0.4s;
      }

      .title-name,
      .singer {
        display: block;
        font-size: 13px;
        width: @common-width;
        margin-top: 10px;
        white-space: wrap;
        color: @font-color;
      }
      .singer {
        color: @font-color-gray;
        font-size: 12px;
        margin-top: 5px;
      }
    }
  }
}
</style>
