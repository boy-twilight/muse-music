import useThemeStore from '@/store/theme';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
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
} from '@/constants/theme';

// 配置全局的一些样式
export default function useTheme() {
  const theme = useThemeStore();
  const {
    fontBlack,
    fontColor,
    searchBg,
    background,
    menuColor,
    tableHover,
    boxShadow,
    menuActive,
    themeColor,
    fontGray,
    bgMode,
    skin,
    skinUrl,
    drawerMode,
    isFullScreen,
  } = storeToRefs(theme);
  // 加载背景
  const loadingBg = computed(() =>
    bgMode.value == 'color' ? background.value : 'rgb(0,0,0,0.9)'
  );
  // 搜索页面歌手的背景
  const singerBg = computed(() => {
    if (bgMode.value == 'skin') {
      return 'rgba(220, 220, 220, 0.1)';
    } else {
      if (fontColor.value == '#ffffff') {
        return 'rgba(30, 30, 30, 0.2)';
      } else {
        return 'rgba(220, 220, 220, 0.25)';
      }
    }
  });
  // 搜索页面按钮的背景
  const buttonBg = computed(() => {
    if (bgMode.value == 'skin') {
      return 'rgba(230, 230, 230, 0.25)';
    } else {
      if (fontColor.value == '#ffffff') {
        return 'rgba(30, 30, 30, 1)';
      } else {
        return 'rgba(220, 220, 220, 0.8)';
      }
    }
  });
  // 搜索按钮的背景色
  const searchColor = computed(() =>
    bgMode.value == 'color' ? searchBg.value : 'rgba(210,210,210,0.2)'
  );
  // 下列框处于哪种主题模式
  const dropDownMode = computed(() => {
    if (bgMode.value == 'color') {
      return fontColor.value == '#ffffff' ? 'dropdown-dark' : 'dropdown-light';
    } else {
      return 'dropdown-skin';
    }
  });
  // 评论区回复的背景
  const replyBg = computed(() =>
    bgMode.value == 'skin' ? 'rgba(220,220,220,0.2)' : 'rgb(240,240,240)'
  );
  // 音乐播放器进度条的颜色
  const processColor = computed(() =>
    bgMode.value == 'color' ? 'rgb(217,217,217)' : 'rgba(217,217,217,0.3)'
  );
  // 全屏模式改变播放器高度
  const videoHeight = computed(() => (isFullScreen.value ? '695px' : '555px'));
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
  // 音乐详情容器高度
  const containerHeight = computed(() =>
    isFullScreen.value ? '76.3vh' : '73.3vh'
  );
  // 音乐详情歌词高度
  const lyricHeight = computed(() => (isFullScreen.value ? '530px' : '450px'));
  // 音乐详情全屏模式歌曲图片的高度
  const imageHeight = computed(() => (isFullScreen.value ? '400px' : '370px'));
  // 音乐详情主题内容高度
  const lyricContentHeight = computed(() =>
    isFullScreen.value ? '410px' : '330px'
  );
  // 音乐详情第一句歌词的margin
  const firstLyricMargin = computed(() =>
    isFullScreen.value ? '205px' : '165px'
  );
  // 白昼模式
  function changeLight(): void {
    fontColor.value = light_font_color;
    menuColor.value = light_menu_color;
    background.value = light_background;
    fontBlack.value = light_font_black;
    tableHover.value = light_table_hover;
    boxShadow.value = light_box_shadow;
    searchBg.value = light_search_bg;
    menuActive.value = light_active_color;
    fontGray.value = light_font_gray;
  }
  // 黑夜模式
  function changeDark(): void {
    fontColor.value = dark_font_color;
    menuColor.value = dark_menu_color;
    background.value = dark_background;
    fontBlack.value = dark_font_black;
    tableHover.value = dark_table_hover;
    boxShadow.value = drak_box_shadow;
    searchBg.value = dark_search_bg;
    menuActive.value = drak_active_color;
    fontGray.value = dark_font_gray;
  }
  // 切换皮肤模式
  function changeSkinMode(): void {
    fontColor.value = skin_font_color;
    fontBlack.value = skin_font_black;
    boxShadow.value = skin_box_shadow;
    background.value = skin_background;
    menuColor.value = skin_menu_color;
    searchBg.value = skin_search_bg;
    menuActive.value = skin_active_color;
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
    menuActive.value = themes[5];
  }
  return {
    fontBlack,
    fontColor,
    searchBg,
    background,
    menuColor,
    tableHover,
    boxShadow,
    menuActive,
    themeColor,
    fontGray,
    loadingBg,
    singerBg,
    buttonBg,
    searchColor,
    replyBg,
    processColor,
    dropDownMode,
    lyricContentHeight,
    lyricHeight,
    firstLyricMargin,
    imageHeight,
    videoHeight,
    contentHeight,
    headerHeight,
    musicContentHeight,
    musicFooterHeight,
    skin,
    skinUrl,
    bgMode,
    isFullScreen,
    drawerMode,
    containerHeight,
    changeLight,
    changeDark,
    changeSkinMode,
    setTheme,
  };
}
