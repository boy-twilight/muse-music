<template>
  <div class="singer-container">
    <div class="singer-list">
      <TransitionGroup :name="transitionName">
        <div
          v-for="(singer, index) in singerWithAvatar"
          :key="singer.id"
          class="singer">
          <el-image
            @click="toArtist(singer.id, singer.score as string)"
            :src="singer.avatar"
            loading="lazy"
            class="image" />
          <span
            @click="toArtist(singer.id, singer.score as string)"
            v-prevent
            class="singer-name"
            >{{ singer.name }}</span
          >
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
    <div class="singer-list">
      <TransitionGroup :name="transitionName">
        <div
          v-for="(singer, index) in singerWithNo"
          :key="singer.id"
          class="singer">
          <span
            @click="toArtist(singer.id, singer.score as string)"
            v-prevent
            class="singer-name"
            >{{ singer.name }}</span
          >
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
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Artist } from '@/type';
import useTheme from '@/hooks/useTheme';

const props = withDefaults(
  defineProps<{
    singerList: Artist[];
    showDelete?: boolean;
    transitionName?: string;
    avatarNum?: number;
  }>(),
  {
    showDelete: false,
    transitionName: '',
    avatarNum: 10
  }
);

const emits = defineEmits<{
  (e: 'getDeleteIndex', index: number): void;
}>();

// 配置主题
const { fontColor, boxShadow, themeColor, fontGray } = useTheme();
// 有头像的歌手
const singerWithAvatar = computed(() =>
  props.singerList.slice(0, props.avatarNum)
);
// 无头像的歌手
const singerWithNo = computed(() => props.singerList.slice(props.avatarNum));
// 路由
const router = useRouter();

// 点击跳转歌手详情
const toArtist = (id: string, score: string) => {
  router.push({
    name: 'artist',
    query: {
      id,
      score
    }
  });
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);
@common-width: 12.369vw;
@common-height: 26.851vh;
@common-margin-top: 2.826vh;
@common-mrgin-left: 0.55338vw;
.singer-container {
  .singer-list {
    display: flex;
    width: 81vw;
    flex-wrap: wrap;
    .singer {
      margin: @common-margin-top @common-mrgin-left 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      &:hover .delete {
        opacity: 1;
      }

      .image {
        width: @common-width;
        height: @common-height;
        object-fit: cover;
        border-radius: 50%;
        box-shadow: @shadow;
        cursor: pointer;
      }

      span {
        width: @common-width;
        cursor: pointer;
        &:hover {
          color: @theme-color;
        }
        letter-spacing: 1px;
        display: inline-block;
      }
      .singer-name {
        text-align: center;
        font-size: 15px;
        color: @font-color;
        word-wrap: wrap;
        padding: 15px 0;
      }
      .delete {
        width: 25px !important;
        color: @font-color-gray;
        text-align: center;
        z-index: 5;
        font-size: 17px;
        position: absolute;
        bottom: 14px;
        right: 2px;
        opacity: 0;
      }
    }
  }
}
</style>
