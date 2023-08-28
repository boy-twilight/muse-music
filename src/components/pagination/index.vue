<template>
  <div class="pagination-container">
    <span class="total">一共{{ total }}{{ text }}</span>
    <el-pagination
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="curPage"
      @current-change="changePage" />
    <div class="go">
      <p>
        前往第<input
          type="text"
          v-model="target"
          @focusout="changePage(+target)"
          @input="checkValid" />页
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useTheme from '@/hooks/useTheme';
import { ref } from 'vue';

withDefaults(
  defineProps<{
    text?: string;
    total: number;
    curPage: number;
    pageSize: number;
  }>(),
  {
    text: '首歌曲'
  }
);

const emits = defineEmits<{
  (e: 'update:curPage', page: number): void;
}>();

// 配置主题
const { themeColor, fontColor } = useTheme();
const target = ref<string>('');

const checkValid = () => {
  if (!/^[0-9]+$/.test(target.value)) {
    target.value = '';
  }
};

// 当页数发生改变时
const changePage = async(page: number) => {
  if (page) {
    emits('update:curPage', page);
  }
};
</script>

<style lang="less" scoped>
@theme-color: v-bind(themeColor);
@font-color: v-bind(fontColor);
.pagination-container {
  width: 80vw;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  .total {
    font-size: 13px;
    color: @font-color;
    letter-spacing: 1px;
    position: absolute;
    left: 15px;
  }

  .go {
    position: absolute;
    right: 350px;
    p {
      font-size: 13px;
      color: @font-color;
      letter-spacing: 1px;
    }
    input {
      background: transparent;
      border: none;
      outline: none;
      width: 30px;
      padding: 0;
      border-bottom: 1.5px solid @font-color;
      border-radius: 1px;
      font-size: 13px;
      text-align: center;
      height: 13px;
      color: @font-color;
      margin: 0 2px;
      &:focus {
        border-bottom: 1.5px solid @theme-color;
      }
    }
  }

  .el-pagination {
    &:deep(.el-pagination__total) {
      color: @font-color;
    }

    &:deep(.number) {
      background-color: transparent;
      color: @font-color;
      &:hover {
        color: @theme-color;
      }
    }
    &:deep(.more) {
      background-color: transparent !important;
      color: @font-color !important;
      &:hover {
        color: @theme-color;
      }
    }
    &:deep(.is-active) {
      background-color: transparent !important;
      color: @theme-color!important;
    }
    &:deep(button) {
      background-color: transparent !important;
      color: @font-color !important;
      &:hover {
        color: @theme-color;
      }
    }
  }
}
</style>
