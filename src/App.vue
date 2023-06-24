<template>
  <div class="app-container">
    <Transition
      name="slide"
      appear>
      <el-container
        class="home-container"
        :style="{
          background: `url(${skinUrl}) no-repeat center/cover`,
        }"
        v-show="!footer.showDetail">
        <el-aside
          width="200px"
          class="side"
          :class="{
            'side-skin': bgMode == 'skin',
          }">
          <Menu />
        </el-aside>
        <el-container
          class="main"
          :class="{
            'main-skin': bgMode == 'skin',
          }">
          <el-header class="header">
            <Header />
          </el-header>
          <el-main
            class="content"
            v-loading="firstLoading"
            :element-loading-background="loadingBg"
            :element-loading-spinner="Svg">
            <router-view
              v-slot="{ Component }"
              @scroll="autoHide()"
              class="view">
              <KeepAlive
                :max="8"
                :exclude="[
                  'AlbumDetailView',
                  'ArtistDetailView',
                  'PlayListView',
                ]">
                <component
                  :is="Component"
                  :key="$route.fullPath" />
              </KeepAlive>
            </router-view>
          </el-main>
          <el-footer
            class="footer"
            v-if="!footer.showDetail"
            ><Footer
          /></el-footer>
        </el-container>
      </el-container>
    </Transition>
    <Transition name="slide">
      <MusicDetail v-if="footer.showDetail" />
    </Transition>
    <!-- 播放列表 -->
    <Drawer />
    <!-- 评论 -->
    <CommentDialog :comments="soucreComments" />
  </div>
</template>
<script lang="ts" setup>
import {
  provide,
  ref,
  Ref,
  reactive,
  computed,
  ComputedRef,
  onMounted,
} from 'vue';
import hotkeys, { HotkeysEvent } from 'hotkeys-js';
import { throttle } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { getTheme, getMusicUrls, setStorAge, elMessage } from '@/utils/util';
import { Svg, Comment } from '@/model';
import { elMessageType, storageType } from './model/enum';
import useThemeStore from './store/theme';
import useConfigStore from '@/store/config';
import useFooterStore from '@/store/footer';
import MusicDetail from '@/view/MusicDetail.vue';
import Menu from '@components/layout/SideMenu.vue';
import Header from '@components/layout/Header.vue';
import Footer from '@components/layout/Footer.vue';
import Drawer from '@components/drawer/Drawer.vue';
import CommentDialog from './components/common/CommentDialog.vue';
import useUserStore from './store/user';
import { useRoute } from 'vue-router';

//快捷键列表
//space播放,上进入/退出音乐详情，左前一首，右后一首，f进入/退出全屏
const keys = ['space', 'left', 'right', 'up', 'f'];
const route = useRoute();
const curPath = computed(() => route.fullPath);
const rule = /^\/video/;
//绑定快捷键
hotkeys(keys.join(','), (event: KeyboardEvent, handler: HotkeysEvent) => {
  event.preventDefault();
  switch (handler.key) {
    case 'space':
      {
        //在视频播放页面不设置快捷键,避免冲突
        if (!rule.test(curPath.value)) {
          isPlay.value = !isPlay.value;
        }
      }
      break;
    case 'up':
      {
        if (!rule.test(curPath.value)) {
          isPlay.value = false;
          playProcess.value = 0;
          playTime.value = 0;
          showDetail.value = !showDetail.value;
        }
      }
      break;
    case 'left':
      {
        //在视频播放页面不设置快捷键,避免冲突
        if (!rule.test(curPath.value)) {
          if (songNum.value > 0) {
            current.value =
              --current.value < 0 ? songNum.value - 1 : current.value;
          } else {
            elMessage(elMessageType.INFO, '暂无音乐，请您添加音乐');
          }
        }
      }
      break;
    case 'right':
      {
        //在视频播放页面不设置快捷键,避免冲突
        if (!rule.test(curPath.value)) {
          if (songNum.value > 0) {
            current.value =
              ++current.value >= songNum.value ? 0 : current.value;
          } else {
            elMessage(elMessageType.INFO, '暂无音乐，请您添加音乐');
          }
        }
      }
      break;
    case 'f':
      {
        if (isFullScreen.value) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
      }
      break;
  }
});

//配置主题
const config = useConfigStore();
const {
  showScroll,
  left,
  contentHeight,
  headerHeight,
  musicFooterHeight,
  musicContentHeight,
  skinUrl,
  skin,
  bgMode,
  isFullScreen,
} = storeToRefs(config);
const menu = getTheme().get('menuColor');
const bg = getTheme().get('background') as Ref<string>;
const loadingBg = computed(() =>
  bgMode.value == 'color' ? bg.value : 'rgb(0,0,0,0.9)'
);
//配合皮肤让字体颜色变亮一点
const fontGray = computed(() =>
  bgMode.value == 'skin' ? 'rgb(215,215,215)' : '#7b7b7b'
);
provide<ComputedRef<string>>('fontGray', fontGray);
provide<ComputedRef<string>>('loadingBg', loadingBg);
//在全屏模式改变屏占比,看起来更加合理
const mHeight = contentHeight;
const hHeight = headerHeight;
const dHeight = musicContentHeight;
const dmHeight = musicFooterHeight;

//页面加载动画
const firstLoading = ref<boolean>(true);
//设置隐藏滚动条
const hideScroll = () => {
  if (showScroll.value != 'none') {
    showScroll.value = 'none';
    left.value = '0';
  }
};

provide<Ref<boolean>>('firstLoading', firstLoading);
provide<Function>('hideScroll', hideScroll);

//计时器判断是否显示进度条
let timeid: any = 0;
//自动隐藏进度条
const autoHide = throttle(
  () => {
    if (showScroll.value != 'block') {
      showScroll.value = 'block';
      left.value = '6px';
    }
    if (timeid) {
      clearTimeout(timeid);
    }
    timeid = setTimeout(() => {
      hideScroll();
    }, 3000);
  },
  600,
  { leading: true, trailing: false }
);
//歌曲评论
const footer = useFooterStore();
const {
  songList,
  current,
  isPlay,
  playProcess,
  playTime,
  showDetail,
  songNum,
  playMode,
} = storeToRefs(footer);
const soucreComments = reactive<Comment[]>([]);
//是否展示歌曲评论区
const showComments = ref<boolean>(false);
provide<Comment[]>('soucreComments', soucreComments);
provide<Ref<boolean>>('showComments', showComments);

//定时重新获取musicurl
const getUrlOntime = () => {
  const ids = songList.value.map((song) => song.id);
  if (ids.length > 0) {
    getMusicUrls(ids.join(','), songList.value);
  }
  setInterval(() => {
    const ids = songList.value.map((song) => song.id);
    if (ids.length > 0) {
      getMusicUrls(ids.join(','), songList.value, '', current.value);
    }
  }, 1000 * 60 * 10);
};
getUrlOntime();

//关闭网页之前，缓存相关记录
const theme = useThemeStore();
const {
  fontColor,
  background,
  menuColor,
  fontBlack,
  tableHover,
  shadow,
  searchBg,
  active,
  themeColor,
} = storeToRefs(theme);
const user = useUserStore();
const {
  loveSongs,
  loveAlbum,
  loveSinger,
  lovePlaylist,
  loveVideo,
  musicDownload,
  mvDownload,
  songRecord,
  videoRecord,
  loveRadio,
} = storeToRefs(user);
onMounted(() => {
  window.addEventListener('beforeunload', () => {
    //主题
    setStorAge(storageType.LOCAL, 'theme', {
      fontBlack: fontBlack.value,
      fontColor: fontColor.value,
      backgound: background.value,
      menuColor: menuColor.value,
      tableHover: tableHover.value,
      shadow: shadow.value,
      searchBg: searchBg.value,
      active: active.value,
      themeColor: themeColor.value,
    });
    //背景模式
    setStorAge(storageType.LOCAL, 'skin', skin.value);
    setStorAge(storageType.LOCAL, 'bgMode', bgMode.value);
    //全屏模式
    setStorAge(storageType.LOCAL, 'isFullScreen', isFullScreen.value);
    //用户数据
    //记录当前播放的歌曲
    setStorAge(storageType.LOCAL, 'currentPlay', current.value);
    //记录当前播放的模式
    setStorAge(storageType.LOCAL, 'playMode', playMode.value);
    setStorAge(storageType.LOCAL, 'userPlaylist', songList.value);
    setStorAge(storageType.LOCAL, 'loveSongs', loveSongs.value);
    setStorAge(storageType.LOCAL, 'loveAlbum', loveAlbum.value);
    setStorAge(storageType.LOCAL, 'loveSinger', loveSinger.value);
    setStorAge(storageType.LOCAL, 'lovePlaylist', lovePlaylist.value);
    setStorAge(storageType.LOCAL, 'loveVideo', loveVideo.value);
    setStorAge(storageType.LOCAL, 'musicDownload', musicDownload.value);
    setStorAge(storageType.LOCAL, 'mvDownload', mvDownload.value);
    setStorAge(storageType.LOCAL, 'songRecord', songRecord.value);
    setStorAge(storageType.LOCAL, 'videoRecord', videoRecord.value);
    setStorAge(storageType.LOCAL, 'loveRadio', loveRadio.value);
  });
});
</script>

<style lang="less" scoped>
@side-background: v-bind(menu);
@other-background: v-bind(bg);
.slide-enter-active,
.slide-leave-active {
  transition: all 0.75s ease !important;
}

.slide-enter-to {
  position: absolute;
  transform: translateY(0);
}

.slide-enter-from {
  position: absolute;
  transform: translateY(100%);
}

.slide-leave-to {
  position: absolute;
  transform: translateY(-100%);
}

.slide-leave-from {
  position: absolute;
  transform: translateY(0);
}

// 添加皮肤时添加的一些样式
.main-skin {
  backdrop-filter: brightness(80%);
  border-left: 1px solid rgba(220, 220, 220, 0.2);
}

.side-skin {
  backdrop-filter: brightness(80%);
}

.loading-skin {
  backdrop-filter: blur(15px) brightness(0.8) saturate(120%) contrast(1.2);
  background: @other-background;
}

.app-container {
  .song-detail-container {
    &:deep(.footer-container) {
      height: v-bind(dmHeight);
    }
    &:deep(.main) {
      height: v-bind(dHeight);
    }
  }
  .home-container {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    .side {
      background-color: @side-background;
      display: flex;
      justify-content: center;
    }

    .main {
      background-color: @other-background;

      .header,
      .footer {
        height: v-bind(hHeight);
        padding: 0;
      }

      .header-container,
      .footer-container {
        height: v-bind(hHeight);
      }

      .content {
        padding: 0;
        height: v-bind(mHeight);
        width: 87vw;
        overflow: auto;

        &::-webkit-scrollbar {
          display: none;
        }
        .view {
          padding-left: v-bind(left);
          &::-webkit-scrollbar {
            display: v-bind(showScroll);
          }
        }
      }
    }
  }
}
</style>

<style lang="less">
.el-popover {
  min-width: 60px !important;
}
.el-popper__arrow::before {
  display: none !important;
}
.search-tip {
  padding: 0px !important;
  border-radius: 6px !important;
  inset: 8vh auto auto 21.5vw !important;
}

//搜索提示和音量再皮肤模式下的毛玻璃效果
.popover-skin {
  backdrop-filter: blur(10px) brightness(0.8) saturate(120%) contrast(1.2);
}

//下拉框处于皮肤模式下的效果
.dropdown-skin {
  background-color: transparent !important;
  backdrop-filter: blur(10px) brightness(0.8) saturate(120%) contrast(1.2);
  .el-dropdown-menu__item {
    &:hover {
      background-color: rgba(220, 220, 220, 0.2) !important;
    }
  }
}

//动态改变主容器高度
.scroll-container {
  height: v-bind(mHeight);
}
</style>
