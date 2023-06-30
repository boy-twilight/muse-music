<template>
  <div class="color-btn">
    <input
      type="color"
      @change="getColor"
      v-model="selectColor"
      ref="picker" />
    <button
      @click="picker?.click()"
      :style="{
        backgroundColor: selectColor,
      }">
      {{ colorToHex(selectColor)!.toLocaleUpperCase() }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { colorToHex } from '@/utils/util';
import useConfigStore from '@/store/config';

const props = defineProps<{
  color: string;
}>();

const emits = defineEmits<{
  (e: 'update:color', param: string): void;
}>();
//默认绑定即选取的颜色
const selectColor = ref<string>(props.color);
//选色器容器
const picker = ref<HTMLButtonElement>();
//回传选中的颜色
const getColor = () => {
  emits('update:color', selectColor.value);
};
</script>

<style lang="less" scoped>
.color-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  width: 120px;
  height: 35px;

  input {
    position: absolute;
    visibility: hidden;
    bottom: -2px;
    left: -40%;
  }

  button {
    width: 100%;
    height: 100%;
    font-size: 13px;
    border-radius: 17.5px;
    outline: none;
    border: none;
    color: rgba(240, 240, 240);
    letter-spacing: 1px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
      rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
  }
}
</style>
