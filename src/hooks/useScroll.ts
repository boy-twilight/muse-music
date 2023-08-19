import { ref, computed } from 'vue';
import { throttle } from 'lodash-es';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import useThemeStore from '@/store/theme';

// 让滚动条不滚动时自动显示，滚动时自动消失
export default function useScroll() {
  const route = useRoute();
  const theme = useThemeStore();
  // 计时器判断是否显示进度条
  let timeid: any = 0;
  // 需要滚动的页面地址映射
  const scrollMapper = new Map([
    ['/video', '/video'],
    ['/station', '/station'],
    ['/rvideo', '/rvideo'],
    ['/artistlist', '/artistlist']
  ]);
  // 防止抖动
  // 全局滚动条的可见性和宽度
  const { globalVisible, globalWidth } = storeToRefs(theme);
  // 是否展示滚动条
  const scrollVisible = ref<string>('none');
  // 主页的左内边距，目的是防止数据加载时抖动，用来抵消滚动条的宽度
  const scrollBarWidth = computed(() =>
    scrollVisible.value == 'none' ? '0' : '6px'
  );
  // 设置隐藏滚动条
  const hideScrollbar = () => {
    scrollVisible.value = 'none';
  };
  // 设置显示滚动条
  const showScrollbar = () => {
    scrollVisible.value = 'block';
  };
  // 隐藏全局滚动条
  const hideGscrollbar = () => {
    globalVisible.value = 'none';
  };
  // 设置全局显示滚动条
  const showGscrollbar = () => {
    globalVisible.value = 'block';
  };
  // 自动隐藏滚动条
  const autoHideScrollbar = throttle(
    () => {
      if (timeid) clearTimeout(timeid);
      showScrollbar();
      timeid = setTimeout(() => {
        hideScrollbar();
      }, 3000);
    },
    500,
    { leading: true, trailing: false }
  );
  // 自动隐藏全局滚动条
  const autoHideGscrollbar = throttle(
    () => {
      if (!scrollMapper.get(route.path.split('?')[0])) return;
      if (timeid) clearTimeout(timeid);
      showGscrollbar();
      timeid = setTimeout(() => {
        hideGscrollbar();
      }, 3000);
    },
    500,
    { leading: true, trailing: false }
  );

  return {
    scrollVisible,
    scrollBarWidth,
    hideScrollbar,
    showScrollbar,
    autoHideScrollbar,
    globalWidth,
    globalVisible,
    hideGscrollbar,
    showGscrollbar,
    autoHideGscrollbar
  };
}
