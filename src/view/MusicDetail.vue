<template>
  <div
    class="song-detail-container"
    :style="{ background: `url(${imageUrl}) no-repeat center/cover` }">
    <div class="main">
      <!-- 返回按钮 -->
      <span
        class="iconfont back"
        @click="back"
        >&#xe775;</span
      >
      <el-image
        :src="imageUrl"
        class="left" />
      <div class="right">
        <div class="header">
          <h4 class="title">
            {{ songNum == 0 ? '暮色音乐' : songList[current].name }}
          </h4>
          <p>歌手：{{ songNum == 0 ? '潇潇' : songList[current].singer }}</p>
          <p>专辑：{{ songNum == 0 ? '潇潇' : songList[current].album }}</p>
        </div>
        <div
          class="content"
          ref="lyricContent">
          <p
            v-for="(item, index) in words"
            :key="item">
            <span
              :class="{
                'is-current': currentIndex == index,
              }">
              {{ item }}</span
            >
          </p>
        </div>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import useFooterStore from '@/store/footer';
import { getLyrics } from '@/api';
import { message, formatToTimeStap, getTimeStamp } from '@/utils';
import { MessageType } from '@/constants/common';
import image from '@assets/image/暂无音乐.svg';
import { Footer } from '@components/layout';
import useTheme from '@/hooks/useTheme';

// 配置主题
const {
  boxShadow,
  themeColor,
  fontGray,
  lyricHeight,
  firstLyricMargin,
  lyricContentHeight,
  imageHeight,
  musicContentHeight,
  musicFooterHeight
} = useTheme();
const footer = useFooterStore();
// 音乐播放器相关的设置
const {
  songList,
  current,
  isPlay,
  playProcess,
  isChanging,
  playTime,
  songNum,
  showDetail
} = storeToRefs(footer);
// 每一次滚动的距离
const scrollDis = 44;
// 歌词
const words = ref<string[]>(['']);
// 歌词对应的时间戳
const timeStaps = ref<number[]>([]);
// 计时器
let timeid: any = 0;
// 当前播放时间
const currentTime = ref<number>(0);
// 当前对应时间戳的index
const currentIndex = ref<number>(0);
// 歌词的容器
const lyricContent = ref<HTMLDivElement>();
// 动画持续的时间
const animationTime = ref<string>('0s');
// 控制动画是否继续
const animationState = computed(() => (isPlay.value ? 'running' : 'paused'));
// 背景图片
const imageUrl = computed(() =>
  songNum.value == 0 ? image : songList.value[current.value].songImage
);
// 页面失活的时间
let hiddenTime = 0;

// 返回
const back = () => {
  isPlay.value = false;
  playProcess.value = 0;
  playTime.value = 0;
  showDetail.value = false;
};

// 计算进度条改变时滚动距离
const calCurrentScroll = (cur: number) => {
  lyricContent.value!.scrollTop = scrollDis * cur;
};

// 检测播放还是暂停
watch(isPlay, (newVal) => {
  if (newVal) {
    timeid = setInterval(() => {
      if (currentTime.value >= timeStaps.value[currentIndex.value]) {
        currentIndex.value++;
        lyricContent.value!.scrollTop += scrollDis;
        // 计算动画持续时间
        if (currentIndex.value == 0) {
          animationTime.value = '0s';
        } else {
          const dis =
            (timeStaps.value[currentIndex.value] -
              timeStaps.value[currentIndex.value - 1]) /
            1000;
          animationTime.value = dis > 4 ? '4s' : dis + 's';
        }
      }
      currentTime.value += 17;
    }, 17);
  } else {
    clearInterval(timeid);
  }
});

// 当进度改变时，对应歌词滚动
watch(isChanging, async(newVal) => {
  if (newVal) {
    isPlay.value = false;
    currentTime.value =
      (playProcess.value *
        Number.parseInt(songList.value[current.value].time as string)) /
      100;
    currentIndex.value = timeStaps.value.findIndex(
      (item) => item > currentTime.value
    );
    calCurrentScroll(currentIndex.value);
    await nextTick();
    isPlay.value = true;
    isChanging.value = false;
  }
});

// 当歌曲切换时对应切换
watch(current, async() => {
  words.value = reactive<string[]>(['']);
  timeStaps.value = reactive<number[]>([]);
  lyricContent.value!.scrollTop = 0;
  currentTime.value = 0;
  currentIndex.value = 0;
  await nextTick();
  getLyric();
});

// 获取歌词
const getLyric = async() => {
  if (songNum.value <= 0) return message(MessageType.INFO, '请添加音乐！');
  try {
    const response: any = await getLyrics(songList.value[current.value].id);
    const {
      lrc: { lyric }
    } = response;
    // 计算歌曲总时间
    const totalTime = Number.parseInt(
      songList.value[current.value].time as string
    );
    // 获取歌词
    let lyrics = (lyric as string).split('\n').map((item) => item.split(']'));
    lyrics.forEach((item) => {
      if (item.length > 1) {
        // 获取每一句歌词
        const word = item[1] ? item[1].trim() : item[1];
        // 获取歌词的时间戳
        const time = formatToTimeStap(item[0].slice(1));
        if (time < totalTime && word) {
          timeStaps.value.push(time);
          words.value.push(word);
        }
      }
    });
  } catch (err: any) {
    message(MessageType.ERROR, err.message);
  }
};

onMounted(() => {
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState == 'visible') {
      const cur = getTimeStamp();
      if (cur - hiddenTime > 1000) {
        currentTime.value =
          (playProcess.value *
            Number.parseInt(songList.value[current.value].time as string)) /
          100;
        currentIndex.value = timeStaps.value.findIndex(
          (item) => item > currentTime.value
        );
        calCurrentScroll(currentIndex.value);
      }
    } else {
      hiddenTime = getTimeStamp();
    }
  });
});

// 请求歌词
getLyric();
</script>

<style lang="less" scoped>
@font-color-gray: v-bind(fontGray);
@lyric-height: v-bind(lyricHeight);
@lyric-content-height: v-bind(lyricContentHeight);
@first-lyric-margin: v-bind(firstLyricMargin);
@image-height: v-bind(imageHeight);
@theme-color: v-bind(themeColor);
@main-height: v-bind(musicContentHeight);
@footer-height: v-bind(musicFooterHeight);
@animation-time: v-bind(animationTime);
@animatiom-state: v-bind(animationState);
@box-shadow: v-bind(boxShadow);
@color-white: #ffffff;
@light-white: rgba(240, 240, 240, 0.8);

// 背景填充动画
@keyframes scan {
  0% {
    background-size: 0 100%;
  }
  100% {
    background-size: 100% 100%;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

.song-detail-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  transition: background 0.6s ease;

  .is-current {
    background-size: 100% 100%;
    animation: scan @animation-time linear 1 forwards;
    font-size: 20px;
    transition: 0.4s;
  }

  .back {
    font-size: 25px;
    position: absolute;
    top: 10px;
    left: 25px;
    color: @light-white;
    z-index: 2;
    transform: rotate(90deg);
    transition: 0.4s;
    cursor: pointer;
    &:hover {
      transform: rotate(270deg);
    }
  }

  .main,
  .footer-container {
    backdrop-filter: blur(10px) brightness(90%) contrast(80%) saturate(120%);
  }
  .main {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: @main-height;

    .left {
      width: @image-height;
      height: @image-height;
      margin-right: 120px;
      border-radius: 50%;
      box-shadow: @box-shadow;
      object-fit: cover;
      animation: rotate 10s linear infinite;
      animation-play-state: @animatiom-state;
    }
    .right {
      width: @lyric-height;
      height: @lyric-height;
      .content {
        overflow: auto;
        height: @lyric-content-height;
        text-align: center;
        scroll-behavior: smooth;

        p {
          &:first-child {
            margin-top: @first-lyric-margin;
          }
          margin-top: 20px;
          text-align: center;
          span {
            letter-spacing: 1px;
            color: @color-white;
            background: @color-white -webkit-linear-gradient(
                left,
                @theme-color,
                @theme-color
              ) no-repeat 0 0;
            -webkit-text-fill-color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            background-size: 0 100%;
          }
        }
        &::-webkit-scrollbar {
          display: none;
        }
      }
      .header {
        height: 120px;
        text-align: center;
        h4 {
          color: @color-white;
          font-size: 25px;
          font-weight: 520;
          margin-bottom: 15px;
          letter-spacing: 1px;
        }
        p {
          color: @light-white;
          font-size: 14px;
          letter-spacing: 1px;
        }
      }
    }
  }
  .footer-container {
    height: @footer-height;
    &:deep(.left) {
      padding-left: 2vw;
      .music-image,
      .music-info p {
        display: none;
      }
      .music-info {
        justify-content: center;
        margin-left: 0px !important;
        .operation {
          .iconfont {
            color: @light-white;
          }
        }
      }
    }
    &:deep(.middle) {
      span {
        color: @light-white;
      }
      .continue {
        color: @theme-color;
      }
      .stop {
        color: @theme-color;
      }
      .play-mode {
        .iconfont {
          color: @light-white;
        }
      }
    }
    &:deep(.right) {
      padding-right: 2vw;
      span {
        &:first-child {
          color: @light-white;
        }
      }
    }
  }
}
</style>

<style lang="less">
.song-detail-container {
  .music-process {
    width: 96% !important;
    left: 2vw;
    .el-slider__runway {
      background-color: rgba(217, 217, 217, 0.2) !important;
    }
  }
  .run_way {
    display: none !important;
  }
}
</style>
