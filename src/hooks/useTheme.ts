import useConfigStore from '@/store/config';
import useThemeStore from '@/store/theme';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

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
    fontGray
  } = storeToRefs(theme);
  const config = useConfigStore();
  const { bgMode } = storeToRefs(config);
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
    config.bgMode == 'skin' ? 'rgba(220,220,220,0.2)' : 'rgb(240,240,240)'
  );
  // 音乐播放器进度条的颜色
  const processColor = computed(() =>
    config.bgMode == 'color' ? 'rgb(217,217,217)' : 'rgba(217,217,217,0.3)'
  );

  const themes = {
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
    dropDownMode
  };

  return themes;
}
