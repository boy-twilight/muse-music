import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { ls } from '@/utils';

const useConfigStore = defineStore('config', () => {
  // 防止抖动
  // 是否展示滚动条
  const showScroll = ref<string>('none');
  // 主页的左内边距，目的是防止数据加载时抖动
  const left = computed(() => (showScroll.value == 'none' ? '0px' : '6px'));
  // 此部分用来设置全屏部分的宽高比例
  // 是否全屏
  const isFullScreen = ref<boolean>(false);
  // 主题内容的高度,全屏模式下动态改变
  const contentHeight = computed(() => (isFullScreen.value ? '82vh' : '80vh'));
  // 头部底部高度
  const headerHeight = computed(() => (isFullScreen.value ? '9vh' : '10vh'));
  // 音乐详情页面的高度
  const musicContentHeight = computed(() =>
    isFullScreen.value ? '92vh' : '90vh'
  );
  // 音乐详情页面底部高度
  const musicFooterHeight = computed(() =>
    isFullScreen.value ? '8vh' : '10vh'
  );
  // 音乐详情页面歌词与图片方面的变化
  const lyricHeight = computed(() => (isFullScreen.value ? '530px' : '450px'));
  const imageHeight = computed(() => (isFullScreen.value ? '400px' : '370px'));
  const lyricContentHeight = computed(() =>
    isFullScreen.value ? '410px' : '330px'
  );
  const firstLyricMargin = computed(() =>
    isFullScreen.value ? '205px' : '165px'
  );
  // 配置背景模式
  // 背景模式，纯色模式或者皮肤模式
  const bgMode = ref<string>(ls.get('bgMode') || 'color');
  // 皮肤
  const skin = ref<string>(ls.get('skin') || '');
  // 皮肤地址
  const skinUrl = computed(() => (bgMode.value == 'color' ? '' : skin.value));
  // 抽屉模式
  const drawerMode = ref<string>('playlist');
  // 设置背景模式
  function changeColor() {
    bgMode.value = 'color';
  }
  // 设置皮肤模式
  function changeSkin() {
    bgMode.value = 'skin';
  }

  return {
    showScroll,
    left,
    isFullScreen,
    contentHeight,
    headerHeight,
    musicFooterHeight,
    musicContentHeight,
    lyricContentHeight,
    imageHeight,
    lyricHeight,
    firstLyricMargin,
    bgMode,
    skin,
    skinUrl,
    drawerMode,
    changeColor,
    changeSkin
  };
});

export default useConfigStore;
