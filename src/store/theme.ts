import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { ls } from '@/utils';
import {
  light_font_color,
  light_active_color,
  light_background,
  light_box_shadow,
  light_font_black,
  light_menu_color,
  light_search_bg,
  light_table_hover,
  light_font_gray,
  theme_color
} from '@/constants/theme';
const useThemeStore = defineStore('theme', () => {
  // 字体主色调颜色
  const fontColor = ref<string>(ls.get('theme')?.fontColor || light_font_color);
  // 字体黑色
  const fontBlack = ref<string>(ls.get('theme')?.fontBlack || light_font_black);
  // 字体副色调
  const fontGray = ref<string>(ls.get('theme')?.fontGray || light_font_gray);
  // 菜单背景颜色
  const menuColor = ref<string>(ls.get('theme')?.menuColor || light_menu_color);
  // 菜单在活跃时的背景色
  const menuActive = ref<string>(
    ls.get('theme')?.menuActive || light_active_color
  );
  // 主背景颜色
  const background = ref<string>(
    ls.get('theme')?.backgound || light_background
  );
  // 播放列表激活时背景色
  const tableHover = ref<string>(
    ls.get('theme')?.tableHover || light_table_hover
  );
  // 盒子阴影
  const boxShadow = ref<string>(ls.get('theme')?.boxShadow || light_box_shadow);
  // 搜索框的背景色
  const searchBg = ref<string>(ls.get('theme')?.searchBg || light_search_bg);
  // 主题色
  const themeColor = ref<string>(ls.get('theme')?.themeColor || theme_color);
  // 这部分用来控制全局滚动条的显示和宽度
  const globalVisible = ref<string>('none');
  // 全局滚动条的宽度
  const globalWidth = computed(() =>
    globalVisible.value == 'block' ? '6px' : '0'
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
  // 此部分用来设置全屏部分的宽高比例
  // 是否全屏
  const isFullScreen = ref<boolean>(false);

  return {
    fontColor,
    menuColor,
    background,
    fontBlack,
    tableHover,
    boxShadow,
    searchBg,
    menuActive,
    themeColor,
    fontGray,
    globalVisible,
    globalWidth,
    isFullScreen,
    bgMode,
    skin,
    skinUrl,
    drawerMode
  };
});

export default useThemeStore;
