<template>
  <div class="radio-container scroll-container">
    <h1>这是电台页</h1>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, inject, Ref } from 'vue';

const first = inject('firstLoading') as Ref<boolean>;
first.value = false;
</script>

<style lang="less" scoped></style>
