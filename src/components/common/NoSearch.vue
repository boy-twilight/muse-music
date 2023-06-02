<template>
  <div class="no-search">
    <img :src="noSearch" />
  </div>
</template>

<script lang="ts" setup>
import noSearch from '@assets/image/暂无搜索结果.svg';
</script>

<style lang="less" scoped>
.no-search {
  display: flex;
  justify-content: center;
  width: 80vw;
  img {
    width: 600px;
    height: 485px;
  }
}
</style>
