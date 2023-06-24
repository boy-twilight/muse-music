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
          v-for="(item, index) in mvs"
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
              @click="emits('getDeleteIndex', index)"
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import { MV } from '@/model';
import { getTheme } from '@/utils/util';

//设置主题
const fontColor = getTheme().get('fontColor');
const boxShadow = getTheme().get('shadow');
const themeColor = getTheme().get('themeColor');
const fontGray = inject('fontGray');

withDefaults(
  defineProps<{
    mvs: MV[];
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

const router = useRouter();
//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;

//点击推荐跳转
const toMv = (id: string) => {
  hideScroll();
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

.mv {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  .title {
    font-weight: 520;
    font-size: 20px;
    letter-spacing: 1px;
    width: 81vw;
    color: @font-color;
    padding-left: 6.6px;
  }
  .mv-simi {
    width: 81vw;
    display: flex;
    flex-wrap: wrap;

    .mv-recommend {
      margin: 20px 6.6px 0;
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
        top: 110px;
        right: 12px;
        cursor: pointer;
      }

      .mask {
        transition: 0.4s;
        width: 235px;
        height: 140px;
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
        width: 235px;
        height: 140px;
        object-fit: cover;
        border-radius: 10px;
        box-shadow: @shadow;
        transition: 0.4s;
      }

      .title-name,
      .singer {
        display: block;
        font-size: 13px;
        width: 235px;
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
