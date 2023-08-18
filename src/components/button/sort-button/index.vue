<template>
  <div class="sort-btn">
    <el-dropdown
      trigger="click"
      @command="chooseSortType"
      :popper-class="`dropdown sort-drop ${dropDownMode}`">
      <div
        class="sort"
        @click="getDeafultSort"
        v-prevent>
        <span class="iconfont">&#xe7e9;</span>
        <span> 排序</span>
      </div>
      <template #dropdown>
        <el-dropdown-menu
          :style="{
            color: fontColor,
            background: bg,
          }">
          <el-dropdown-item
            v-for="(item, index) in sortName"
            :key="item"
            :command="item"
            ><span
              :class="{
                'is-choose': sortAfter[index],
              }"
              >{{ item }}</span
            ></el-dropdown-item
          >
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import useTheme from '@/hooks/useTheme';

const emits = defineEmits<{
  (e: 'getSortChoice', sortType: boolean[], isCancelSort: boolean): void;
}>();
// 配置主题
const {
  fontColor,
  background: bg,
  themeColor,
  searchColor,
  dropDownMode
} = useTheme();

// 排序的名字
const sortName = reactive<string[]>([
  '歌曲排序',
  '歌手排序',
  '专辑排序',
  '时长排序'
]);
// 排序的类型
const sortType = reactive<boolean[]>([false, false, false, false]);
// 当前选择的项
const currentChoose = ref<number>(-1);
// 排序
const sortAfter = computed(() =>
  sortType.map((item, index) => (index == currentChoose.value ? true : false))
);

// 选中排序类型
const chooseSortType = (command: string) => {
  if (command == '歌曲排序') {
    currentChoose.value = sortAfter.value[0] ? -1 : 0;
  } else if (command == '歌手排序') {
    currentChoose.value = sortAfter.value[1] ? -1 : 1;
  } else if (command == '专辑排序') {
    currentChoose.value = sortAfter.value[2] ? -1 : 2;
  } else if (command == '时长排序') {
    currentChoose.value = sortAfter.value[3] ? -1 : 3;
  }
  if (currentChoose.value == -1) {
    emits('getSortChoice', sortAfter.value, true);
  } else {
    emits('getSortChoice', sortAfter.value, false);
  }
};

// 获取默认排序
const getDeafultSort = () => {
  if (currentChoose.value == -1) {
    currentChoose.value = 0;
    emits('getSortChoice', sortAfter.value, false);
  }
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@search-bg: v-bind(searchColor);
@font-color-gray: #7b7b7b;
@theme-color: v-bind(themeColor);

.is-choose {
  color: @theme-color;
}

.sort {
  height: 30px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  border: 0px;
  font-size: 13px;
  cursor: pointer;
  span {
    color: @font-color;
  }
  &:hover {
    background-color: @search-bg;
  }
  padding: 0 5px;
  .iconfont {
    font-size: 16px;
    margin-right: 5px;
  }
}
</style>

<style lang="less">
.sort-drop {
  border-radius: 5px !important;
  .el-dropdown-menu {
    padding: 0;
    border-radius: 5px !important;
    .el-dropdown-menu__item {
      padding: 8px 25px !important;
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
