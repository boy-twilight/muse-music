<template>
  <el-carousel
    :height="height"
    :type="type"
    :indicator-position="position"
    class="carousel">
    <el-carousel-item
      v-for="picture in pictures"
      :key="picture">
      <img :src="picture.pic" />
    </el-carousel-item>
  </el-carousel>
</template>

<script lang="ts" setup>
import { Banner } from '@/model';

defineProps<{
  // 图片数组
  pictures: Banner[];
  // 走马灯类型，卡片或者其它
  type: string;
  // 走马灯高度
  height: string;
  // 走马灯显示器的位置
  position?: string;
}>();
</script>

<style lang="less" scoped>
.carousel {
  width: 80vw;
  border-radius: 10px;

  &:deep(.el-carousel__mask) {
    border-radius: 10px;
  }

  img {
    height: v-bind(height);
    object-fit: cover;
    object-position: center top;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  }
}
</style>
