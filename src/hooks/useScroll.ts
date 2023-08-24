import { ref, computed } from 'vue';
import { throttle } from 'lodash-es';

// 让滚动条不滚动时自动显示，滚动时自动消失
export default function useScroll() {
  // 计时器判断是否显示进度条
  let timeid: any = 0;
  // 需要滚动的页面地址映射
  const scrollMapper = new Map([
    ['/video', '/video'],
    ['/station', '/station'],
    ['/rvideo', '/rvideo'],
  ]);
  // 防止抖动
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
  // 自动隐藏滚动条
  const autoHideScrollbar = throttle(
    () => {
      if (timeid) clearTimeout(timeid);
      showScrollbar();
      timeid = setTimeout(() => {}, 3000);
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
  };
}
