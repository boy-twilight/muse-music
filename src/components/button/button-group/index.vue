<template>
  <div class="button-group-container">
    <h4
      class="title"
      v-if="showTitle">
      {{ title }}
    </h4>
    <div class="type">
      <button
        v-for="(item, index) in type"
        :key="item"
        @click="changeActive(index)"
        :class="{
          'is-active': index == active,
        }">
        {{ item }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable */
// eslint-disable-next-line vue/no-setup-props-destructure
import useTheme from '@/hooks/useTheme';
import { ref, inject } from 'vue';

const props = withDefaults(
  defineProps<{
    title: string;
    activeValue: number;
    type: string[];
    showTitle?: boolean;
  }>(),
  {
    showTitle: true,
  }
);

const emits = defineEmits<{
  (e: 'getActive', value: number, type: string): void;
}>();

// 配置主题

const { fontColor, boxShadow, themeColor } = useTheme();
const active = ref<number>(props.activeValue);

// 改变active时，回传active
const changeActive = (index: number) => {
  active.value = index;
  emits('getActive', index, props.title);
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@shadow: v-bind(boxShadow);
@theme-color: v-bind(themeColor);
@font-color-gray: #7b7b7b;
.is-active {
  background-color: @theme-color !important;
  color: #ffffff !important;
}

.type {
  width: 81vw;
  margin-top: 20px;
  padding-left: 6.6px;
  button {
    cursor: pointer;
    margin-right: 10px;
    font-size: 13px;
    letter-spacing: 1px;
    outline: none;
    border: none;
    width: 85px;
    height: 30px;
    border-radius: 15px;
    box-shadow: @shadow;
    &:hover {
      color: @theme-color;
      background: rgba(220, 220, 220, 0.6);
    }
  }
}
.title {
  color: @font-color;
  font-size: 18px;
  font-weight: 520;
  width: 81vw;
  padding-left: 6.6px;
}
</style>
