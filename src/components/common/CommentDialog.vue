<template>
  <div class="comment-dialog-container">
    <el-dialog
      v-model="showComments"
      width="61%"
      :modal="false"
      top="5vh"
      draggable
      title="歌曲评论"
      class="comment-dialog">
      <Comments :comments="comments" />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { inject, Ref } from 'vue';
import { Comment } from '@/model';
import Comments from './Comment.vue';
import { getTheme } from '@/utils/util';

//配置主题
const bg = getTheme().get('background');
const fontColor = getTheme().get('fontColor');
const boxShadow = getTheme().get('shadow');

defineProps<{
  comments: Comment[];
}>();

const showComments = inject('showComments') as Ref<boolean>;
</script>

<style lang="less" scoped>
.comment-container {
  width: 61vw;
  height: 75vh;
  align-items: center;
  overflow: auto;
  overflow-x: hidden;
  &:deep(.title) {
    display: none;
  }

  &:deep(.comment) {
    width: 56vw !important;
  }
  &:deep(.more-reply) {
    left: 0;
    transform: translateX(0);
  }

  &:deep(.collapse-reply) {
    width: 95px;
  }
}
</style>

<style lang="less">
@color: v-bind(fontColor);
@shadow: v-bind(boxShadow);

@background: v-bind(bg);
@font-color-green: #1ed2a9;
.comment-dialog {
  box-shadow: @shadow !important;
  border-radius: 10px !important;
  background: @background !important;
  backdrop-filter: blur(10px) brightness(0.8) saturate(120%) contrast(1.2);

  .el-dialog__header {
    .el-dialog__title {
      font-size: 16px !important;
      color: @color;
    }

    .el-dialog__headerbtn {
      &:hover .el-dialog__close {
        color: @font-color-green;
      }
    }
  }
  .el-dialog__body {
    padding: 0;
  }
}
</style>
