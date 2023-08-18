<template>
  <div class="footer-container">
    <!-- 播放器  -->
    <audio
      ref="player"
      :src="songNum > 0 ? songList[current].url : ''"></audio>

    <!-- 进度条 -->
    <el-slider
      v-model="playProcess"
      @input="changeProcess()"
      :show-tooltip="false"
      class="music-process" />
    <!-- 进度条宽度为100%会撑开容器，这个容器用来替换进度条防止容器被撑开 -->
    <div class="run_way">
      <div class="run_body"></div>
    </div>
    <!-- 左边边歌曲展示部分 -->
    <div class="left">
      <div
        @click="toSongDetail"
        v-prevent
        class="music-image">
        <img
          :src="songNum > 0 ? songList[current].songImage : image"
          :class="{
            'has-border': songNum == 0,
          }" />
        <span class="iconfont go">&#xe775;</span>
        <span class="iconfont go">&#xe775;</span>
      </div>
      <div class="music-info">
        <!-- 提供默认占位参数 -->
        <p>
          {{ songNum > 0 ? songList[current].name : '暮色音乐' }} -
          <span>{{
            handleSingerName(songNum > 0 ? songList[current].singer : '潇潇')
          }}</span>
        </p>
        <div class="operation">
          <!-- 喜欢音乐 -->
          <span
            v-if="songNum > 0"
            @click="
              user.addLove<Song>(
                songList[current],
                user.loveSongs,
                user.loveMusicId
              )
            "
            v-prevent
            v-text="songList[current].isLove ? '&#xf0145;' : '&#xe761;'"
            class="iconfont"
            :class="{
              'is-love': songList[current].isLove,
            }"></span>
          <span
            v-else
            class="iconfont"
            >&#xe761;</span
          >
          <!-- 播放mv -->
          <span
            v-prevent
            class="iconfont playmv"
            @click="playMv"
            >&#xe611;</span
          >
          <!-- 下载音乐 -->
          <span
            class="iconfont"
            @click="downloadCurrent"
            v-prevent
            >&#xe61a;</span
          >
          <!-- 更多操作 -->
          <el-dropdown
            :popper-class="`dropdown ${dropDownMode}`"
            trigger="click"
            @command="handleClick">
            <span
              v-prevent
              class="iconfont"
              >&#xe605;</span
            >
            <template #dropdown>
              <el-dropdown-menu
                :style="{
                  color: fontColor,
                  background: bg,
                }">
                <el-dropdown-item
                  v-for="dropItem in dropItems"
                  :key="dropItem.command"
                  :command="dropItem.command">
                  <span
                    v-text="
                      dropItem.command == 'love' && songNum > 0
                        ? loveIcon
                        : dropItem.icon
                    "
                    :style="
                      dropItem.command == 'love' && songNum > 0
                        ? lovetyle
                        : dropItem.style
                    "
                    :class="
                      dropItem.isIcon1 ? 'iconfont_1' : 'iconfont'
                    "></span>
                  {{ dropItem.name }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!--  -->
        </div>
      </div>
    </div>
    <!-- 中间播放模式设置 -->
    <div class="middle">
      <!-- 播放模式的选择 -->
      <el-dropdown
        @command="changeMode"
        trigger="click"
        placement="top"
        :popper-class="`dropdown ${dropDownMode} playmode`"
        class="play-mode-menu">
        <!-- 播放模式的选择 -->
        <div class="play-mode">
          <span
            v-show="playMode == '0'"
            class="iconfont"
            >&#xe604;</span
          >
          <span
            v-show="playMode == '1'"
            class="iconfont"
            >&#xe603;</span
          >
          <span
            v-show="playMode == '2'"
            class="iconfont"
            >&#xe871;</span
          >
        </div>
        <template #dropdown>
          <el-dropdown-menu
            :style="{
              color: fontColor,
              background: bg,
            }">
            <el-dropdown-item
              v-for="dropItem in modeDropItems"
              :key="dropItem.command"
              :command="dropItem.command">
              <span
                v-text="dropItem.icon"
                :style="dropItem.style"
                class="iconfont"></span>
              {{ dropItem.name }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>

      <!-- 播放前进后退 -->
      <span
        @mousedown.prevent="pre"
        class="iconfont pre"
        >&#xe63d;</span
      >
      <span
        v-show="isPlay"
        @mousedown.prevent="isPlay = false"
        class="iconfont stop"
        >&#xea81;
      </span>
      <span
        v-show="!isPlay"
        @mousedown.prevent="isPlay = true"
        class="iconfont continue"
        >&#xea83;</span
      >
      <span
        @mousedown.prevent="next"
        class="iconfont next"
        >&#xe63e;</span
      >
      <!-- 音量 -->
      <el-popover
        placement="top"
        trigger="click"
        :width="60"
        :popper-style="{
          color: fontColor,
          background: bg,
        }"
        :popper-class="{
          'popover-skin': config.bgMode == 'skin',
        }">
        <template #reference>
          <div>
            <span
              v-show="!isMuted"
              v-prevent
              class="iconfont volume"
              >&#xe60d;</span
            >
            <span
              v-show="isMuted"
              v-prevent
              class="iconfont volume"
              >&#xf1f4;</span
            >
          </div>
        </template>
        <div class="volume-setting-container">
          <el-slider
            v-model="volume"
            @change="setVolume"
            vertical
            height="130px"
            class="volume-setting" />
          <span>{{ volume }}%</span>
          <el-divider />
          <!-- 非静音 -->
          <span
            v-show="!isMuted"
            @mousedown.prevent="setMuted"
            class="iconfont volume"
            >&#xe60d;</span
          >
          <!-- 静音 -->
          <span
            v-show="isMuted"
            @mousedown.prevent="setMuted"
            class="iconfont volume"
            >&#xf1f4;</span
          >
        </div>
      </el-popover>
    </div>

    <!-- 右边播放设置 -->
    <div class="right">
      <!-- 提供默认占位参数 -->
      <span v-prevent
        >{{ transformTime(playTime * 1000 + '') }} /
        {{
          transformTime(songNum > 0 ? (songList[current].time as string) : '0')
        }}</span
      >
      <span
        @click="openDrawer"
        v-prevent
        class="iconfont"
        >&#xe86a;</span
      >
      <span>
        {{ songNum }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
/* eslint-disable */
// eslint-disable-next-line vue/no-setup-props-destructure
import { ref, nextTick, watch, onMounted, inject, Ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { throttle } from 'lodash-es';
import useFooterStore from '@/store/footer';
import useUserStore from '@/store/user';
import useConfigStore from '@/store/config';
import {
  transformTime,
  message,
  transformTotalTime,
  handleSingerName,
  playVideo,
  shareMuiscInfo,
  getSourceComments,
  downloadLyric,
} from '@/utils';
import { messageType } from '@/constants/common';
import { DropDownItem, Song, Comment } from '@/type';
import image from '@assets/image/暂无音乐.svg';
import usePlayMusic from '@/hooks/usePlayMuisc';
import useTheme from '@/hooks/useTheme';

// 设置主题
const config = useConfigStore();
const {
  fontColor,
  boxShadow,
  themeColor,
  background: bg,
  fontGray,
  processColor,
  dropDownMode,
} = useTheme();
// 设置隐藏滚动条
const hideScroll = inject('hideScroll') as () => void;
// 评论
const soucreComments = inject('soucreComments') as Comment[];
// 是否展开评论区
const showComments = inject('showComments') as Ref<boolean>;
// 喜欢图标的图标及样式的改变
const loveIcon = computed<string>(() =>
  songList.value[current.value].isLove ? '\ue760' : '\ue761'
);
const lovetyle = computed<string>(() =>
  songList.value[current.value].isLove
    ? 'margin: 0 7px 0 2px;color:#ff6a6a;'
    : 'margin: 0 7px 0 2px;'
);
// 播放相关的设置
const footer = useFooterStore();
const {
  isPlay,
  songList,
  current,
  playMode,
  songNum,
  playProcess,
  playTime,
  showList,
  isChanging,
  showDetail,
} = storeToRefs(footer);
// 用户记录相关的设置
const user = useUserStore();
// 更多的下拉选择
const dropItems: DropDownItem[] = [
  {
    name: '播放相似单曲',
    icon: '\ue602',
    style: 'margin: 0 7px 0 2px',
    command: 'playSimi',
    isIcon1: true,
  },
  {
    name: '复制歌曲信息',
    icon: '\ue63b',
    style: 'margin: 1px 7px 0 2px;',
    command: 'copyMusicInfo',
  },
  {
    name: '下载歌词',
    icon: '\ue602',
    style: 'margin: 0 7px 0 2px;',
    command: 'downloadLyric',
  },

  {
    name: '我喜欢',
    icon: '\ue761',
    style: 'margin: 0 7px 0 2px;',
    command: 'love',
  },

  {
    name: '查看评论',
    icon: '\ue60b',
    style: 'margin: 1px 7px 0 3px;',
    command: 'comment',
  },

  {
    name: '从播放列表删除',
    icon: '\ue60e',
    style: 'margin: 0 7px 0 2px; font-size: 16px;',
    command: 'deleteMuisc',
  },
];
// 播放模式的下拉框
const modeDropItems: DropDownItem[] = [
  {
    name: '单曲循环',
    icon: '\ue604',
    command: '0',
    style: 'font-size: 16px; margin-right: 7px;',
  },

  {
    name: '随机循环',
    icon: '\ue603',
    command: '1',
    style: 'font-size: 15px; margin-right: 7px;',
  },
  {
    name: '顺序播放',
    icon: '\ue871',
    command: '2',
    style: 'font-size: 15px; margin-right: 7px;',
  },
];
// 播放容器
const player = ref<HTMLAudioElement>();
// 当前音量
const volume = ref<number>(80);
// 判断当前是否静音
const isMuted = ref<boolean>(false);
// 计时器
let timeId: any = 0;

//播放相似音乐
const { playSimiMusic } = usePlayMusic();

// 进入歌曲详情页
const toSongDetail = () => {
  isPlay.value = false;
  playProcess.value = 0;
  playTime.value = 0;
  showDetail.value = true;
};

// 下载歌曲
const downloadCurrent = () => {
  if (songNum.value > 0) {
    user.addMuiscDownload(songList.value[current.value]);
  }
};

// 播放mv
const playMv = () => {
  if (songNum.value > 0) {
    playVideo(songList.value[current.value], () => {
      hideScroll();
      if (showDetail.value) {
        playTime.value = 0;
        playProcess.value = 0;
        isPlay.value = false;
        showDetail.value = false;
      }
    });
  }
};

// 点击更多的操作
const handleClick = async (command: string) => {
  if (songNum.value > 0) {
    if (command == 'playSimi') {
      playSimiMusic(songList.value[current.value].id);
    } else if (command == 'deleteMuisc') {
      isPlay.value = false;
      playTime.value = 0;
      playProcess.value = 0;
      songList.value.splice(current.value, 1);
      await nextTick();
      if (current.value == songNum.value && songNum.value > 0) {
        current.value--;
      } else if (current.value != songNum.value && songNum.value > 0) {
        isPlay.value = true;
      }
    } else if (command == 'love') {
      user.addLove<Song>(
        songList.value[current.value],
        user.loveSongs,
        user.loveMusicId
      );
    } else if (command == 'downloadLyric') {
      downloadLyric(songList.value[current.value]);
    } else if (command == 'copyMusicInfo') {
      shareMuiscInfo(songList.value[current.value]);
    } else if (command == 'comment') {
      if (soucreComments.length > 0) {
        soucreComments.splice(0);
      }
      getSourceComments(
        songList.value[current.value].id,
        '0',
        soucreComments,
        () => {
          showComments.value = true;
        }
      );
    }
  } else {
    message(messageType.INFO, '暂无音乐，请添加音乐');
  }
};

// 打开播放列表
const openDrawer = () => {
  showList.value = true;
  config.drawerMode = 'playlist';
};

// 切换播放模式
const changeMode = (command: string) => {
  playMode.value = command;
};

// 设置音量
const setVolume = () => {
  // 设置音量
  player.value!.volume = volume.value / 100;
  isMuted.value = volume.value == 0 || player.value!.muted;
};

// 改变进度;
const changeProcess = throttle(
  () => {
    if (songNum.value > 0) {
      player.value!.currentTime =
        (playProcess.value *
          transformTotalTime(songList.value[current.value].time as string)) /
        100;
      isChanging.value = true;
    } else {
      message(messageType.INFO, '请添加音乐！');
    }
  },
  100,
  {
    leading: true,
    trailing: false,
  }
);

// 设置静音
const setMuted = () => {
  player.value!.muted = !player.value!.muted;
  isMuted.value = volume.value == 0 || player.value!.muted;
};

// 下一首
const next = () => {
  if (songNum.value > 0) {
    current.value = ++current.value >= songNum.value ? 0 : current.value;
  } else {
    message(messageType.INFO, '暂无音乐，请您添加音乐');
  }
};

// 上一首
const pre = () => {
  // 切换歌曲
  if (songNum.value > 0) {
    current.value = --current.value < 0 ? songNum.value - 1 : current.value;
  } else {
    message(messageType.INFO, '暂无音乐，请您添加音乐');
  }
};

// 监测current的变化实现歌曲的切换
watch(current, async () => {
  if (isPlay.value) {
    isPlay.value = false;
  }
  // 清空进度条
  playProcess.value = 0;
  // 清空播放时间
  playTime.value = 0;
  await nextTick();
  isPlay.value = true;
});

// 监测isPlay实现播放
watch(isPlay, async (newVal) => {
  if (newVal) {
    // 无音乐则不播放
    if (songNum.value > 0) {
      // 判断是否具有版权
      player.value?.play();
      timeId = setInterval(() => {
        // 转化时间
        playTime.value = player.value!.currentTime;
        // 计算总进度
        playProcess.value =
          (playTime.value /
            transformTotalTime(songList.value[current.value].time as string)) *
          100;
      }, 1000);
    } else {
      message(messageType.INFO, '暂无音乐，请您添加音乐');
      isPlay.value = false;
    }
  } else {
    clearInterval(timeId);
    player.value?.pause();
  }
});

// 一首歌曲下载完毕过后播放另外一首
onMounted(() => {
  player.value!.onended = async () => {
    if (playMode.value == '1') {
      const temp = current.value;
      current.value = Math.floor(Math.random() * songNum.value);
      if (temp == current.value) {
        isPlay.value = false;
        // 清空进度条
        playProcess.value = 0;
        // 清空播放时间
        playTime.value = 0;
        await nextTick();
        isPlay.value = true;
      }
    } else if (playMode.value == '2') {
      current.value = ++current.value >= songNum.value ? 0 : current.value;
    } else {
      isPlay.value = false;
      // 清空进度条
      playProcess.value = 0;
      // 清空播放时间
      playTime.value = 0;
      await nextTick();
      isPlay.value = true;
    }
  };
});
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@shadow: v-bind(boxShadow);
@background: v-bind(bg);
@process-bg: v-bind(processColor);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);

.is-love {
  color: #ff6a6a !important;
}
.iconfont {
  cursor: pointer;
}

.has-border {
  border: 2px solid rgba(230, 230, 230, 0.3);
}

.footer-container {
  display: flex;
  position: relative;
  align-items: center;

  .run_way {
    height: 32px;
    position: absolute;
    top: -16px;
    right: 0px;
    display: flex;
    align-items: center;
    width: 2%;
    z-index: 101;
    .run_body {
      width: 100%;
      height: 3px;
      background-color: @process-bg;
      border-bottom-right-radius: 1.5px;
      border-top-right-radius: 1.5px;
    }
  }

  .music-process {
    z-index: 100;
    position: absolute;
    top: -16px;
    width: 98%;

    &:deep(.el-slider__button) {
      height: 12px;
      width: 12px;
      border: none;
      background-color: @theme-color;
      display: none;
    }
    &:deep(.el-slider__bar) {
      height: 3px;
      background-color: @theme-color;
    }
    &:deep(.el-slider__runway) {
      height: 3px;
      background-color: @process-bg;
      border-radius: 0;
      border-bottom-left-radius: 1.5px;
      border-top-left-radius: 1.5px;
    }
  }
  .left,
  .middle,
  .right {
    flex: 1;
    padding-top: 4px;
    height: 10vh;
  }

  .left {
    display: flex;
    align-items: center;
    padding: 4px 0 0 50px;
    .music-image {
      width: 50px;
      height: 50px;
      position: relative;

      &::after {
        content: '';
        height: 50px;
        width: 50px;
        background-color: rgba(0, 0, 0, 0.3);
        z-index: 2;
        position: absolute;
        top: 0;
        border-radius: 10px;
        opacity: 0;
        transition: 0.4s;
      }
      &:hover:after {
        opacity: 1;
      }

      &:hover .go {
        opacity: 1;
      }

      .go {
        z-index: 3;
        display: inline-block;
        position: absolute;
        opacity: 0;
        top: 10px;
        font-size: 18px;
        color: rgba(240, 240, 240, 0.7);
        transform: rotate(-90deg);
        left: 16.5px;
        transition: 0.4s;
        &:last-child {
          top: 20px;
        }
      }

      img {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 8px;
        box-shadow: @shadow;
        cursor: pointer;
      }
    }
    .music-info {
      display: flex;
      flex-direction: column;
      height: 50px;
      margin-left: 12px;
      p {
        color: @font-color;
        font-size: 12px;
        padding: 4px 0 3px 0;
        width: 380px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        letter-spacing: 1px;
        span {
          color: @font-color-gray;
        }
      }
      .operation {
        display: flex;
        align-items: center;
        height: 27px;

        .iconfont {
          font-size: 17px;
          margin-right: 10px;
          color: @font-color;
          &:hover {
            color: @theme-color;
          }
        }
        .playmv {
          font-size: 18px;
          margin-top: 1.5px;
        }
      }
    }
  }
  .middle {
    display: flex;
    align-items: center;
    justify-content: center;

    .play-mode-menu {
      .play-mode {
        display: flex;
        align-items: center;
        width: 24px;
        cursor: pointer;
        span {
          color: @font-color;
          font-size: 15px;
          &:nth-child(1) {
            font-size: 20px;
          }
        }
      }
    }

    .stop,
    .continue {
      font-size: 38px;
      color: @theme-color;
      margin: 0 5px;
    }
    .pre,
    .next {
      font-size: 30px;
      color: @font-color;
    }
    //声音设置
    .volume {
      margin-left: 10px;
      color: @font-color;
      font-size: 18px;
      &:last-child {
        color: red;
      }
    }
  }
  .right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 50px;
    span {
      font-size: 12px;
      color: @font-color-gray;
      &:last-child {
        font-size: 12px;
        color: @theme-color;
      }
    }
    .iconfont {
      font-size: 18px;
      color: @theme-color;
      margin: 0 2px 0 10px;
    }
  }
}
</style>

<style lang="less">
@font-color: v-bind(fontColor);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);
@background: v-bind(bg);
@theme-color: v-bind(themeColor);
@import './index.less';
</style>
