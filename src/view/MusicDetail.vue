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
          ref="content">
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
import { ref, reactive, watch, nextTick, computed, inject } from 'vue';
import { storeToRefs } from 'pinia';
import useFooterStore from '@/store/footer';
import useConfigStore from '@/store/config';
import { getLyrics } from '@/api/api';
import { elMessage, formatToTimeStap, getTheme } from '@/utils/util';
import { elMessageType } from '@/model/enum';
import Footer from '@components/layout/Footer.vue';
import image from '@assets/image/暂无音乐.svg';

//主题配置
const config = useConfigStore();
const { lyricHeight, lyricContentHeight, firstLyricMargin, imageHeight } =
  storeToRefs(config);
const boxShadow = getTheme().get('shadow');
const fontGray = inject('fontGray');
const lHeight = lyricHeight;
const lcHeight = lyricContentHeight;
const lMargin = firstLyricMargin;
const iHeight = imageHeight;

const footer = useFooterStore();
const {
  songList,
  current,
  isPlay,
  playProcess,
  isChanging,
  playTime,
  songNum,
  showDetail,
} = storeToRefs(footer);
//动画持续的时间
const animationTime = ref<string>('0s');
//控制动画是否继续
const animationState = computed(() => (isPlay.value ? 'running' : 'paused'));
//背景图片
const imageUrl = computed(() =>
  songNum.value == 0 ? image : songList.value[current.value].songImage
);

//每一次滚动的距离
const scrollDis = 44;
//歌词
let words = reactive<string[]>(['']);
//歌词对应的时间戳
let timeStaps = reactive<number[]>([]);
//计时器
let timeid: any = 0;
//当前播放时间
const currentTime = ref<number>(0);
//当前对应时间戳的index
const currentIndex = ref<number>(0);
//歌词的容器
const content = ref<HTMLDivElement>();

//返回
const back = () => {
  isPlay.value = false;
  playProcess.value = 0;
  playTime.value = 0;
  showDetail.value = false;
};
//开始播放，设置歌词滚动
const startPlay = () => {
  timeid = setInterval(() => {
    if (currentTime.value >= timeStaps[currentIndex.value]) {
      currentIndex.value++;
      content.value!.scrollTop += scrollDis;
      //计算动画持续时间
      if (currentIndex.value == 0) {
        animationTime.value = '0s';
      } else {
        const dis =
          (timeStaps[currentIndex.value] - timeStaps[currentIndex.value - 1]) /
          1000;
        animationTime.value = dis > 4 ? '4s' : dis + 's';
      }
    }
    currentTime.value += 20;
  }, 20);
};
//计算进度条改变时滚动距离
const calCurrentScroll = (cur: number) => {
  content.value!.scrollTop = scrollDis * cur;
};

//检测播放还是暂停
watch(isPlay, (newVal) => {
  if (newVal) {
    startPlay();
  } else {
    clearInterval(timeid);
  }
});

//当进度改变时，对应歌词滚动
watch(isChanging, async (newVal) => {
  if (newVal) {
    clearInterval(timeid);
    currentTime.value =
      (playProcess.value *
        Number.parseInt(songList.value[current.value].time as string)) /
      100;
    currentIndex.value = timeStaps.findIndex(
      (item) => item > currentTime.value
    );
    calCurrentScroll(currentIndex.value);
    await nextTick();
    startPlay();
    isChanging.value = false;
  }
});

//当歌曲切换时对应切换
watch(current, async () => {
  words = reactive<string[]>(['']);
  timeStaps = reactive<number[]>([]);
  content.value!.scrollTop = 0;
  currentTime.value = 0;
  currentIndex.value = 0;
  await nextTick();
  getLyric();
});

//获取歌词
const getLyric = async () => {
  if (songNum.value > 0) {
    try {
      const response: any = await getLyrics(songList.value[current.value].id);
      const {
        lrc: { lyric },
      } = response;
      //计算歌曲总时间
      const totalTime = Number.parseInt(
        songList.value[current.value].time as string
      );
      //获取歌词
      let lyrics = (lyric as string).split('\n').map((item) => item.split(']'));
      lyrics.forEach((item) => {
        if (item.length > 1) {
          //获取每一句歌词
          const word = item[1] ? item[1].trim() : item[1];
          //获取歌词的时间戳
          const time = formatToTimeStap(item[0].slice(1));
          if (time < totalTime && word) {
            timeStaps.push(time);
            words.push(word);
          }
        }
      });
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  } else {
    elMessage(elMessageType.INFO, '请添加音乐！');
  }
};
//请求歌词

if (songNum.value > 0) {
  getLyric();
}
</script>

<style lang="less" scoped>
@font-color-gray: v-bind(fontGray);
@lyric-height: v-bind(lHeight);
@lyric-content-height: v-bind(lcHeight);
@first-lyric-margin: v-bind(lMargin);
@image-height: v-bind(iHeight);
@font-color-green: #1ed2a9;

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
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  transition: background 0.6s ease;

  .is-current {
    background-size: 100% 100%;
    animation: scan v-bind(animationTime) linear 1 forwards;
    font-size: 20px;
    transition: 0.4s;
  }

  .back {
    font-size: 25px;
    position: absolute;
    top: 10px;
    left: 25px;
    color: rgba(240, 240, 240, 0.8);
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

    .left {
      width: @image-height;
      height: @image-height;
      margin-right: 120px;
      border-radius: 50%;
      box-shadow: v-bind(boxShadow);
      object-fit: cover;
      animation: rotate 10s linear infinite;
      animation-play-state: v-bind(animationState);
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
            color: #ffffff;
            background: #ffffff -webkit-linear-gradient(
                left,
                @font-color-green,
                @font-color-green
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
          color: #ffffff;
          font-size: 25px;
          font-weight: 520;
          margin-bottom: 15px;
          letter-spacing: 1px;
        }
        p {
          color: rgba(240, 240, 240, 0.8);
          font-size: 14px;
          letter-spacing: 1px;
        }
      }
    }
  }
  .footer-container {
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
            color: rgba(240, 240, 240, 0.8);
          }
        }
      }
    }
    &:deep(.middle) {
      span {
        color: rgba(240, 240, 240, 0.8);
      }
      .continue {
        color: @font-color-green;
      }
      .stop {
        color: @font-color-green;
      }
      .play-mode {
        .iconfont {
          color: rgba(240, 240, 240, 0.8);
        }
      }
    }
    &:deep(.right) {
      padding-right: 2vw;
      span {
        &:first-child {
          color: rgba(240, 240, 240, 0.8);
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
