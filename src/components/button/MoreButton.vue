<template>
  <el-dropdown
    trigger="click"
    @command="operateMore"
    :popper-class="`dropdown more-drop ${dropDownMode}`">
    <button class="more-btn">•••</button>
    <template #dropdown>
      <el-dropdown-menu
        :style="{
          color: fontColor,
          background: bg,
        }">
        <el-dropdown-item
          v-for="item in more"
          :key="item.command"
          :command="item.command"
          ><span
            class="iconfont"
            :style="item.style"
            >{{ item.icon }}</span
          >
          {{ item.name }}</el-dropdown-item
        >
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script lang="ts" setup>
import { reactive, Ref, computed } from 'vue';
import { getTheme } from '@/utils/util';
import { DropDownItem } from '@/model';
import useConfigStore from '@/store/config';

//配置主题
const config = useConfigStore();
const bg = getTheme().get('background');
const fontColor = getTheme().get('fontColor') as Ref<string>;
const boxShadow = getTheme().get('shadow');
//下列框处于哪种模式
const dropDownMode = computed(() => {
  if (config.bgMode == 'color') {
    return fontColor.value == '#ffffff' ? 'dropdown-dark' : 'dropdown-light';
  } else {
    return 'dropdown-skin';
  }
});

const props = defineProps<{
  shareTo: Function;
}>();

const emits = defineEmits<{
  (e: 'openSelect', showSelect: boolean): void;
}>();

const more = reactive<DropDownItem[]>([
  {
    name: '批量操作',
    icon: '\ue617',
    command: '批量操作',
    style: 'font-size:17px;margin:0 5px 0 0;',
  },
  {
    name: '分享',
    icon: '\ue680',
    command: '分享',
    style: 'font-size:14px;margin:0.5px 7px 0 2px;',
  },
]);

const operateMore = (command: string) => {
  if (command == '批量操作') {
    emits('openSelect', true);
  } else if (command == '分享') {
    props.shareTo();
  }
};
</script>

<style lang="less" scoped>
@button-color: #e1e1e1;
@button-font-color: #334155;
.more-btn {
  height: 34px;
  width: 34px;
  line-height: 34px;
  text-align: center;
  border-radius: 50%;
  background-color: @button-color;
  border: none;
  transition: 0.2s;
  color: @button-font-color;
  box-shadow: v-bind(boxShadow);
  &:active {
    opacity: 0.7;
  }
  margin-left: 10px;
}
</style>

<style lang="less">
.more-drop {
  border-radius: 5px !important;
  .el-dropdown-menu {
    padding: 0;
    border-radius: 5px !important;
    .el-dropdown-menu__item {
      padding: 8px 30px 8px 20px !important;
      font-size: 12px;
      &:first-child {
        border-top-right-radius: 5px;
        border-top-left-radius: 5px;
      }
      &:last-child {
        border-bottom-right-radius: 5px;
        border-bottom-left-radius: 5px;
      }
    }
  }
}
</style>
