import { defineStore } from 'pinia';
import { ref } from 'vue';
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
  dark_font_gray,
  dark_background,
  dark_font_black,
  dark_font_color,
  dark_menu_color,
  dark_search_bg,
  dark_table_hover,
  drak_box_shadow,
  drak_active_color,
  skin_box_shadow,
  skin_background,
  skin_menu_color,
  skin_search_bg,
  skin_active_color,
  skin_font_gray,
  skin_table_hover,
  skin_font_black,
  skin_font_color,
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
  // 主背景颜色
  const background = ref<string>(
    ls.get('theme')?.backgound || light_background
  );
  // 播放列表激活时背景色
  const tableHover = ref<string>(
    ls.get('theme')?.tableHover || light_table_hover
  );
  // 盒子阴影
  const shadow = ref<string>(ls.get('theme')?.shadow || light_box_shadow);
  // 搜索框的背景色
  const searchBg = ref<string>(ls.get('theme')?.searchBg || light_search_bg);
  // 菜单在活跃时的背景色
  const active = ref<string>(ls.get('theme')?.active || light_active_color);
  // 主题色
  const themeColor = ref<string>(ls.get('theme')?.themeColor || theme_color);

  // 白昼模式
  function changeLight(): void {
    fontColor.value = light_font_color;
    menuColor.value = light_menu_color;
    background.value = light_background;
    fontBlack.value = light_font_black;
    tableHover.value = light_table_hover;
    shadow.value = light_box_shadow;
    searchBg.value = light_search_bg;
    active.value = light_active_color;
    fontGray.value = light_font_gray;
  }

  // 黑夜模式
  function changeDark(): void {
    fontColor.value = dark_font_color;
    menuColor.value = dark_menu_color;
    background.value = dark_background;
    fontBlack.value = dark_font_black;
    tableHover.value = dark_table_hover;
    shadow.value = drak_box_shadow;
    searchBg.value = dark_search_bg;
    active.value = drak_active_color;
    fontGray.value = dark_font_gray;
  }

  // 切换皮肤模式
  function changeSkinMode(): void {
    fontColor.value = skin_font_color;
    fontBlack.value = skin_font_black;
    shadow.value = skin_box_shadow;
    background.value = skin_background;
    menuColor.value = skin_menu_color;
    searchBg.value = skin_search_bg;
    active.value = skin_active_color;
    tableHover.value = skin_table_hover;
    fontGray.value = skin_font_gray;
  }

  // 设置主题
  function setTheme(themes: string[]): void {
    themeColor.value = themes[0];
    fontColor.value = themes[1];
    fontGray.value = themes[2];
    background.value = themes[3];
    menuColor.value = themes[4];
    active.value = themes[5];
  }

  return {
    fontColor,
    menuColor,
    background,
    fontBlack,
    tableHover,
    shadow,
    searchBg,
    active,
    themeColor,
    fontGray,
    changeLight,
    changeDark,
    changeSkinMode,
    setTheme
  };
});

export default useThemeStore;
