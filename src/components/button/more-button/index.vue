<template>
  <el-dropdown
    trigger="click"
    @command="handleClick"
    :popper-class="`dropdown more-drop ${dropDownMode}`">
    <button class="more-btn">•••</button>
    <template #dropdown>
      <el-dropdown-menu
        :style="{
          color: fontColor,
          background,
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
import { reactive } from 'vue';
import { DropDownItem } from '@/type';
import useTheme from '@/hooks/useTheme';

const emits = defineEmits<{
  (e: 'openSelect'): void;
  (e: 'share'): void;
}>();

// 配置主题
const { background, fontColor, boxShadow, dropDownMode } = useTheme();
// 下拉选项
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

const handleClick = (command: string) => {
  if (command == '批量操作') {
    emits('openSelect');
  } else if (command == '分享') {
    emits('share');
  }
};
</script>

<style lang="less" scoped>
@button-color: #e1e1e1;
@button-font-color: #334155;
@box-shadow: v-bind(boxShadow);
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
  box-shadow: @box-shadow;
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
