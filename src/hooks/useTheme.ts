import useConfigStore from '@/store/config';
import useThemeStore from '@/store/theme';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

export default function useTheme() {
  const theme = useThemeStore();
  const config = useConfigStore();
  const {
    fontBlack,
    fontColor,
    searchBg,
    background,
    menuColor,
    tableHover,
    shadow,
    active,
    themeColor,
    fontGray,
  } = storeToRefs(theme);
  const { bgMode } = storeToRefs(config);
  //加载背景
  const loadingBg = computed(() =>
    bgMode.value == 'color' ? background.value : 'rgb(0,0,0,0.9)'
  );
  //搜索页面歌手的背景
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
  //搜索页面按钮的背景
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

  return {
    fontBlack,
    fontColor,
    searchBg,
    background,
    menuColor,
    tableHover,
    shadow,
    active,
    themeColor,
    fontGray,
    loadingBg,
    singerBg,
    buttonBg,
  };
}
