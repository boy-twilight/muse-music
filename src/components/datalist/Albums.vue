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
          v-for="(item, index) in albums"
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
            @click="emits('getDeleteIndex', index)"
            class="delete iconfont"
            >&#xe60e;</span
          >
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { Album } from '@/model';
import { getTheme } from '@/utils/util';

//主题配置
const fontColor = getTheme().get('fontColor');
const fontBlack = getTheme().get('fontBlack');
const boxShadow = getTheme().get('shadow');
const fontGray = inject('fontGray');

const router = useRouter();

//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;
//声明组件接受值

withDefaults(
  defineProps<{
    //专辑数组
    albums: Album[];
    //标题
    title?: string;
    showDelete?: boolean;
    transitionName?: string;
  }>(),
  {
    title: '',
    showDelete: false,
    transitionName: '',
  }
);

const emits = defineEmits<{
  (e: 'getDeleteIndex', index: number): void;
}>();

//跳转专辑详情
const toAlbumDetail = (id: string, artistId: string) => {
  hideScroll();
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
@font-color-green: #1ed2a9;

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

.album-container {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  .title {
    font-weight: 520;
    font-size: 20px;
    letter-spacing: 1px;
    width: 80vw;
    color: @font-color;
    padding-left: 7.2px;
  }

  .content {
    width: 80vw;
    display: flex;
    flex-wrap: wrap;

    .album {
      display: flex;
      flex-direction: column;
      margin: 20px 7.2px 0;
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
        width: 190px;
        height: 190px;
        object-fit: cover;
        box-shadow: @shadow;
        border-radius: 10px;
        transition: 0.4s;
      }
      &::after {
        content: '';
        top: 0;
        height: 190px;
        width: 190px;
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
          color: @font-color-green;
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
        width: 190px;
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
          color: @font-color-green;
        }
      }
    }
  }
}
</style>
