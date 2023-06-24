import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getStorage } from '@/utils/util';
import { storageType } from '@/model/enum';
const useThemeStore = defineStore('theme', () => {
  const light_font_color = '#101010';
  const light_font_black = '#334155';
  const light_menu_color = '#f0f0f0';
  const light_background = '#ffffff';
  const light_table_hover = '#F7F7F7';
  const light_search_bg = '#E0E0E0';
  const light_box_shadow =
    'rgba(9, 30, 66, 0.25) 0px 4px 8px -2px, rgba(9, 30, 66, 0.08) 0px 0px 0px 1px';
  const light_active_color = '#1ed2a9';
  const dark_background = '#101010';
  const dark_menu_color = '#1B1B1B';
  const dark_font_color = '#ffffff';
  const dark_font_black = '#ffffff';
  const dark_table_hover = '#434343';
  const dark_search_bg = '#1b1b1b';
  const drak_box_shadow =
    'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px';
  const drak_active_color = 'rgba(0,0,0,0.5)';
  //字体颜色
  const fontColor = ref<string>(
    getStorage(storageType.LOCAL, 'theme')?.fontColor || light_font_color
  );
  //字体黑色
  const fontBlack = ref<string>(
    getStorage(storageType.LOCAL, 'theme')?.fontBlack || light_font_black
  );
  //菜单背景颜色
  const menuColor = ref<string>(
    getStorage(storageType.LOCAL, 'theme')?.menuColor || light_menu_color
  );
  //主背景颜色
  const background = ref<string>(
    getStorage(storageType.LOCAL, 'theme')?.backgound || light_background
  );
  //table hover背景色
  const tableHover = ref<string>(
    getStorage(storageType.LOCAL, 'theme')?.tableHover || light_table_hover
  );
  //boxshadow
  const shadow = ref<string>(
    getStorage(storageType.LOCAL, 'theme')?.shadow || light_box_shadow
  );
  //搜索框的背景色
  const searchBg = ref<string>(
    getStorage(storageType.LOCAL, 'theme')?.searchBg || light_search_bg
  );
  //菜单在活跃时的背景色
  const active = ref<string>(
    getStorage(storageType.LOCAL, 'theme')?.active || light_active_color
  );
  //主题色
  const themeColor = ref<string>(
    getStorage(storageType.LOCAL, 'themeColor') || '#1ed2a9'
  );
  //白昼模式
  function changeLight(): void {
    fontColor.value = light_font_color;
    menuColor.value = light_menu_color;
    background.value = light_background;
    fontBlack.value = light_font_black;
    tableHover.value = light_table_hover;
    shadow.value = light_box_shadow;
    searchBg.value = light_search_bg;
    active.value = light_active_color;
  }
  //黑夜模式
  function changeDark(): void {
    fontColor.value = dark_font_color;
    menuColor.value = dark_menu_color;
    background.value = dark_background;
    fontBlack.value = dark_font_black;
    tableHover.value = dark_table_hover;
    shadow.value = drak_box_shadow;
    searchBg.value = dark_search_bg;
    active.value = drak_active_color;
  }
  // 切换皮肤模式
  function changeSkinMode(): void {
    fontColor.value = dark_font_color;
    fontBlack.value = dark_font_black;
    shadow.value =
      'rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px';
    background.value = 'transparent';
    menuColor.value = 'transparent';
    searchBg.value = 'transparent';
    active.value = 'rgba(210,210,210,0.5)';
    tableHover.value = 'rgba(210,210,210,0.3)';
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
    changeLight,
    changeDark,
    changeSkinMode,
  };
});

export default useThemeStore;
