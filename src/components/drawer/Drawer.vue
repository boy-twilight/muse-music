<template>
  <!-- 播放列表 -->
  <div class="drawer-container">
    <el-drawer
      v-model="showList"
      :modal="false"
      :show-close="false"
      :destroy-on-close="true"
      class="playlist-drawer">
      <template #header>
        <div class="playlist-header">
          <h4>播放列表</h4>
          <div class="header-operation">
            <span>{{ songNum }}首歌曲</span>
            <!-- 关闭侧边栏 -->
            <span
              @click="showList = false"
              class="iconfont close-list"
              >&#xea84;</span
            >
            <!-- 删除全部歌曲 -->
            <span
              @click="deleteAll"
              v-prevent
              class="iconfont delete-song"
              >&#xe718;</span
            >
          </div>
        </div>
      </template>
      <ul>
        <li
          v-for="(song, index) in songList"
          :key="song.id"
          class="song">
          <p class="song-name">{{ song.name }}</p>
          <p class="song-singer">{{ handleSingerName(song.singer) }}</p>
          <p class="song-time">
            {{ transformTime(song.time as string) }}
          </p>
          <div class="operate">
            <!-- 播放 -->
            <span
              v-show="!isPlay || current != index"
              @click="listPlay(index)"
              v-prevent
              class="iconfont"
              >&#xea6e;</span
            >
            <!-- 暂停 -->
            <span
              v-show="isPlay && current == index"
              @click="isPlay = false"
              v-prevent
              class="iconfont"
              >&#xea6d;</span
            >
            <!-- 播放mv  -->
            <span
              class="iconfont playmv"
              v-prevent
              @click="playMV(song)"
              >&#xe611;</span
            >
            <!-- 删除 -->
            <span
              @mousedown.prevent="listDelete(index)"
              class="iconfont delete-song"
              >&#xe718;</span
            >

            <!-- 更多 -->
            <MoreDropdown
              :song="song"
              :play="play" />
          </div>
        </li>
      </ul>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, inject, Ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Song } from '@/model';
import useFooterStore from '@/store/footer';
import {
  transformTime,
  getTheme,
  playVideo,
  handleSingerName,
} from '@/utils/util';
import MoreDropdown from '@components/button/MoreDropdown.vue';
import useConfigStore from '@/store/config';

// 配置主题
const config = useConfigStore();
const { skinUrl, bgMode } = storeToRefs(config);
const fontColor = getTheme().get('fontColor');
const fontGray = inject('fontGray');
const boxShadow = getTheme().get('shadow');
const bg = getTheme().get('background') as Ref<string>;
//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;

const footer = useFooterStore();
const {
  isPlay,
  showList,
  songList,
  current,
  songNum,
  playProcess,
  playTime,
  showDetail,
} = storeToRefs(footer);

//在播放列表点击播放
const listPlay = (index: number) => {
  if (current.value != index) {
    current.value = index;
  } else {
    isPlay.value = true;
  }
};
//播放
const play = async (song: Song) => {
  const index = songList.value.findIndex((item) => item.id == song.id);
  if (index != current.value) {
    current.value = index;
  } else {
    isPlay.value = false;
    playProcess.value = 0;
    playTime.value = 0;
    await nextTick();
    isPlay.value = true;
  }
};
//在播放列表删除歌曲
const listDelete = async (index: number) => {
  if (current.value == index) {
    if (isPlay.value) {
      isPlay.value = false;
    }
    playProcess.value = 0;
    playTime.value = 0;
    if (index == songNum.value - 1) {
      current.value = 0;
    }
    songList.value.splice(index, 1);
    await nextTick();
    isPlay.value = true;
  } else if (current.value < index) {
    songList.value.splice(index, 1);
  } else {
    const process = playProcess.value;
    const time = playTime.value;
    songList.value.splice(index, 1);
    current.value -= 1;
    await nextTick();
    isPlay.value = false;
    playProcess.value = process;
    playTime.value = time;
    await nextTick();
    isPlay.value = true;
  }
};
//列表删除全部歌曲
const deleteAll = async () => {
  if (isPlay.value) {
    isPlay.value = false;
  }
  playTime.value = 0;
  playProcess.value = 0;
  songList.value.splice(0);
};
//播放mv
const playMV = (song: Song) => {
  playVideo(song, () => {
    hideScroll();
    if (showDetail.value) {
      playTime.value = 0;
      playProcess.value = 0;
      isPlay.value = false;
      showDetail.value = false;
    }
  });
};

// 动态切换皮肤
watch(
  bgMode,
  async () => {
    await nextTick();
    const drawer = document.querySelector('.playlist-drawer') as HTMLDivElement;
    drawer.style.background = `${bg.value} url(${skinUrl.value}) no-repeat center/cover`;
  },
  {
    immediate: true,
  }
);
</script>

<style lang="less">
@font-color: v-bind(fontColor);
@shadow: v-bind(boxShadow);
@background: v-bind(bg);
@font-color-gray: v-bind(fontGray);
@font-color-green: #1ed2a9;
.drawer-container {
  .playlist-drawer {
    height: 100%;
    width: 23% !important;
    overflow: auto;
    box-shadow: @shadow;

    .iconfont {
      cursor: pointer;
    }

    .playlist-header {
      padding-left: 10px;
      h4 {
        color: @font-color;
        font-size: 20px;
        font-weight: 500;
      }

      .header-operation {
        display: flex;
        align-items: center;
        span {
          font-size: 12px;
          color: @font-color-gray;
        }
        .delete-song {
          font-size: 21px;
        }
        .close-list {
          font-size: 14px;
          margin: 0 10px 0 200px;
        }
      }
    }

    .song {
      margin: 10px;
      position: relative;
      &:hover .song-time {
        opacity: 0;
      }
      &:hover .operate {
        opacity: 1;
      }
      .operate {
        opacity: 0;
        position: absolute;
        display: none;
        top: 0;
        width: 324px;
        height: 44px;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        span {
          font-size: 18px;
          margin: 0 5px;
          color: @font-color;
          &:last-child {
            margin-right: 50px;
          }

          &:hover {
            color: @font-color-green;
          }
        }
        .playmv {
          font-size: 20px;
        }

        .delete-song {
          font-size: 22px;
        }
      }
      .song-name {
        font-size: 14px;
        margin-bottom: 5px;
        color: @font-color;
      }
      .song-singer,
      .song-time {
        font-size: 12px;
        color: @font-color-gray;
      }
      .song-time {
        position: absolute;
        right: 10px;
        bottom: 0;
      }
    }
    .el-drawer__header {
      margin-bottom: 0;
      padding-bottom: 20px;
    }
    .el-drawer__body {
      padding-top: 0;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
