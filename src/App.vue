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
          <Aside />
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
            :element-loading-spinner="svg">
            <router-view
              v-slot="{ Component }"
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
    <Modal :comments="soucreComments" />
  </div>
</template>
<script lang="ts" setup>
import { provide, ref, Ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import hotkeys, { HotkeysEvent } from 'hotkeys-js';
import { storeToRefs } from 'pinia';
import { getMusicUrls, ls, message } from '@/utils';
import { Comment } from '@/type';
import { svg } from '@assets/icon';
import { messageType } from '@/constants/common';
import useFooterStore from '@/store/footer';
import useUserStore from '@/store/user';
import { Header, Footer, Aside } from '@components/layout';
import MusicDetail from '@/view/MusicDetail.vue';
import Drawer from '@components/drawer';
import { Modal } from '@components/common';
import useTheme from '@/hooks/useTheme';
import useHeaderStore from './store/header';

// 快捷键列表
// space播放,上进入/退出音乐详情，左前一首，右后一首，f进入/退出全屏
const keys = ['space', 'left', 'right', 'up', 'f'];
const route = useRoute();
const curPath = computed(() => route.fullPath);
const rule = /^\/video/;
// 绑定快捷键
hotkeys(keys.join(','), (event: KeyboardEvent, handler: HotkeysEvent) => {
  event.preventDefault();
  switch (handler.key) {
  case 'space':
    {
      // 在视频播放页面不设置快捷键,避免冲突
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
      // 在视频播放页面不设置快捷键,避免冲突
      if (!rule.test(curPath.value)) {
        if (songNum.value > 0) {
          current.value =
              --current.value < 0 ? songNum.value - 1 : current.value;
        } else {
          message(messageType.INFO, '暂无音乐，请您添加音乐');
        }
      }
    }
    break;
  case 'right':
    {
      // 在视频播放页面不设置快捷键,避免冲突
      if (!rule.test(curPath.value)) {
        if (songNum.value > 0) {
          current.value =
              ++current.value >= songNum.value ? 0 : current.value;
        } else {
          message(messageType.INFO, '暂无音乐，请您添加音乐');
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

// 配置主题
const theme = useTheme();
const {
  menuColor,
  background,
  fontBlack,
  tableHover,
  boxShadow,
  searchBg,
  menuActive,
  themeColor,
  fontGray,
  fontColor,
  loadingBg,
  contentHeight,
  headerHeight,
  skin,
  skinUrl,
  bgMode,
  isFullScreen
} = theme;

// 页面加载动画
const firstLoading = ref<boolean>(true);
provide<Ref<boolean>>('firstLoading', firstLoading);

// 关闭网页之前，缓存相关记录
const footer = useFooterStore();
const {
  songList,
  current,
  isPlay,
  playProcess,
  playTime,
  showDetail,
  songNum,
  playMode
} = storeToRefs(footer);
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
  loveRadio
} = storeToRefs(user);
const header = useHeaderStore();
const { userSearch } = storeToRefs(header);
onMounted(() => {
  window.addEventListener('beforeunload', () => {
    // 主题
    ls.set('theme', {
      fontBlack: fontBlack.value,
      fontColor: fontColor.value,
      backgound: background.value,
      menuColor: menuColor.value,
      tableHover: tableHover.value,
      boxShadow: boxShadow.value,
      searchBg: searchBg.value,
      menuActive: menuActive.value,
      themeColor: themeColor.value,
      fontGray: fontGray.value,
      skin: skin.value,
      bgMode: bgMode.value
    });
    // 用户数据
    ls.set('user', {
      currentPlay: current.value,
      playMode: playMode.value,
      userPlaylist: songList.value,
      userSearch: userSearch.value,
      loveSongs: loveSongs.value,
      loveAlbum: loveAlbum.value,
      loveSinger: loveSinger.value,
      loveVideo: loveVideo.value,
      lovePlaylist: lovePlaylist.value,
      loveRadio: loveRadio.value,
      musicDownload: musicDownload.value,
      mvDownload: mvDownload.value,
      songRecord: songRecord.value,
      videoRecord: videoRecord.value
    });
  });
});

// 是否展示歌曲评论区
const soucreComments = reactive<Comment[]>([]);
const showComments = ref<boolean>(false);
provide<Comment[]>('soucreComments', soucreComments);
provide<Ref<boolean>>('showComments', showComments);

// 定时重新获取musicurl
const getUrlOntime = () => {
  setTimeout(() => {
    if (songList.value.length > 0) {
      getMusicUrls(songList.value, current.value);
    }
    getUrlOntime();
  }, 1000 * 60 * 5);
};
// 第一次请求数据
if (songList.value.length > 0) {
  getMusicUrls(songList.value);
}
getUrlOntime();
</script>

<style lang="less" scoped>
@side-background: v-bind(menuColor);
@other-background: v-bind(background);
@header-height: v-bind(headerHeight);
@main-height: v-bind(contentHeight);
//过渡
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
  height: 100vh;
  width: 100vw;
  overflow: hidden;

  .home-container {
    .side {
      background-color: @side-background;
      display: flex;
      justify-content: center;
    }

    .main {
      background-color: @other-background;

      //头部与底部高度
      .header,
      .footer {
        padding: 0;
      }
      .header-container,
      .footer-container,
      .header,
      .footer {
        height: @header-height;
      }

      // 内容高度
      .content {
        padding: 0;
        height: @main-height;
        width: 87vw;
        overflow: hidden;
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

.popover-skin {
  backdrop-filter: blur(10px) brightness(0.8) saturate(120%) contrast(1.2);
}

.dropdown-skin {
  background-color: transparent !important;
  backdrop-filter: blur(10px) brightness(0.8) saturate(120%) contrast(1.2);
  .el-dropdown-menu__item {
    &:hover {
      background-color: rgba(220, 220, 220, 0.2) !important;
    }
  }
}

.scroll-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 87vw;
  padding-top: 10px;
  overflow: auto;
}
</style>
