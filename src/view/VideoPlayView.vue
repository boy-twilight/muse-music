<template>
  <div class="video-container scroll-container">
    <div class="players-container">
      <Transition name="show">
        <div
          class="recommend-container"
          v-show="showRecommned">
          <h4 v-show="reMvs.length > 1">相关推荐</h4>
          <div class="content">
            <div
              class="recommend-video"
              v-for="(mv, index) in reMvs"
              :key="mv.id">
              <el-image
                :src="mv.image"
                class="image" />
              <div class="mask">
                <span
                  class="iconfont play"
                  @click="playRe(index, mv.id)"
                  v-prevent
                  >&#xea82;</span
                >
              </div>
            </div>
          </div>
        </div>
      </Transition>
      <div class="players"></div>
    </div>
    <!-- 视频相关信息 -->
    <div class="detail">
      <p class="title">
        {{ mv.name }}
      </p>
      <div class="artist-info">
        <span>{{
          /.*[A-Z]+.*/.test(id) ? '创作者：' + mv.artist : '演唱：' + mv.artist
        }}</span>
        <span>{{ mv.playCount }}次观看</span>
        <span>发布时间：{{ mv.publishTime }}</span>
      </div>
      <div
        class="operation"
        v-show="!showComments">
        <CommonButton
          :name="mv.isLove ? '取消收藏' : '收藏'"
          :icon="mv.isLove ? '&#xe760;' : '&#xe761;'"
          :icon-style="mv.isLove ? 'color:#ff6a6a;' : ''"
          @click="user.addLove(mv, user.loveVideo, user.loveVideoId)"
          class="operate" />
        <CommonButton
          name="下载"
          @click="user.addVideoDownload(mv)"
          icon="&#xe61a;"
          class="operate" />
        <CommonButton
          name="分享"
          icon="&#xe680;"
          @click="shareVideo"
          class="operate" />
        <CommonButton
          name="评论"
          icon="&#xe60b;"
          @click="showComments = true"
          class="operate" />
      </div>
    </div>
    <!-- 相关视频推荐 -->
    <ArtistMv
      v-show="!showComments && mvSimi.length > 0"
      :mvs="mvSimi"
      title="相关推荐" />
    <!-- 评论 -->
    <div
      v-show="showComments"
      class="comment-area">
      <h4 class="title">全部评论</h4>
      <button
        class="exit"
        @click="showComments = false">
        <span class="iconfont_1">&#xe62c; </span>
        退出
      </button>
      <SourceComment :comments="videoComments" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  reactive,
  Ref,
  inject,
  ref,
  computed,
  nextTick,
  onBeforeUnmount,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { MV, Comment } from '@/type';
import { messageType } from '@/constants/common';
import {
  getMvDetail,
  getMvUrl,
  getSimiMv,
  getVideoDetail,
  getVideoUrl,
  getSimiVideo,
  getVideoComment,
  getMvComment,
} from '@/api';
import { message, getRequset, formatTime, share, getComment } from '@/utils';
import DPlayer from 'dplayer';
import useUserStore from '@/store/user';
import useConfigStore from '@/store/config';
import { CommonButton } from '@components/button';
import { ArtistMv } from '@components/datalist';
import { SourceComment } from '@components/common';
import useTheme from '@/hooks/useTheme';

// 设置主题
const config = useConfigStore();
const { fontColor, fontBlack, boxShadow, themeColor, fontGray } = useTheme();
// 全屏模式改变播放器高度
const videoHeight = computed(() => (config.isFullScreen ? '695px' : '555px'));
const user = useUserStore();
// dplayer实例
const dplayer = ref<DPlayer>();
// 获取视频id
const route = useRoute();
const router = useRouter();
const id = route.query.id + '';
// mv信息
const mv = reactive<MV>({
  id,
  name: '',
  image: '',
  artist: '',
  playCount: '',
  url: '',
  time: '',
  publishTime: '',
  available: '',
});
// 相似的mv推荐
const mvSimi = reactive<MV[]>([]);
// 视频结束后的推荐
const reMvs = computed(() => [mv, ...mvSimi]);
// 页面第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
// 是否展示推荐
const showRecommned = ref<boolean>(false);
// 视频评论
const videoComments = reactive<Comment[]>([]);
// 是否打开评论区
const showComments = ref<boolean>(false);

// 分享
const shareVideo = () => {
  share(
    '我在' +
      import.meta.env.VITE_APP_SHARE_URL +
      route.fullPath +
      '观看' +
      mv.name +
      ',快来和我一起观看把！'
  );
};

// 初始化播放器
const init = async () => {
  await nextTick();
  dplayer.value = new DPlayer({
    container: document.querySelector('.players'),
    video: {
      url: mv.url as string,
      thumbnails: mv.image,
      type: 'video/mp4',
      pic: mv.image,
    },
    autoplay: false,
    loop: false,
    hotkey: true,
    theme: themeColor?.value,
    chromecast: true,
    lang: 'zh-cn',
    screenshot: true,
    preload: 'auto',
    volume: 0.9,
    playbackSpeed: [0.75, 1, 1.25, 1.5, 1.75, 2.0],
    contextmenu: [
      {
        text: '下载',
        click: () => {
          user.addVideoDownload(mv);
        },
      },
      {
        text: '收藏',
        click: () => {
          user.addLove(mv, user.loveVideo, user.loveVideoId);
        },
      },
      {
        text: '分享',
        click: () => {
          shareVideo();
        },
      },
    ],
  });
  // 视频结束时推荐其他视频
  const video = document.querySelector('.dplayer-video') as HTMLVideoElement;
  video.onended = () => {
    showRecommned.value = true;
  };
};

// 播放推荐
const playRe = (index: number, id: string) => {
  if (index == 0) {
    showRecommned.value = false;
    const video = document.querySelector('.dplayer-video') as HTMLVideoElement;
    video.play();
  } else {
    router.push({
      name: 'video',
      query: {
        id,
      },
    });
  }
};

getRequset(async () => {
  // 判断地址是否包含字母，有则用视频接口请求地址
  const rule = /.*[A-Z]+.*/;
  if (!rule.test(id)) {
    try {
      const responses: any[] = await Promise.all([
        getMvDetail(id),
        getMvUrl(id),
        getSimiMv(id),
        getMvComment(id, 1000),
      ]);
      responses.forEach((response, index) => {
        // 获取mv详情
        if (index == 0) {
          const {
            data: { name, artistName, cover, playCount, duration, publishTime },
          } = response;
          mv.name = name;
          mv.playCount = playCount;
          mv.image = cover;
          mv.artist = artistName;
          mv.time = duration;
          mv.publishTime = formatTime(publishTime);
        }
        // 获取mv播放地址
        else if (index == 1) {
          const {
            data: { url, fee },
          } = response;
          if (url) {
            mv.url = url;
            mv.available = fee;
          } else {
            message(messageType.INFO, '此视频暂无播放资源，请切换下一个。');
          }
        }
        // 获取相似的Mv
        else if (index == 2) {
          const { mvs } = response;
          if (mvs) {
            mvs.forEach((item: any) => {
              const { id, cover, name, artistName, playCount } = item;
              mvSimi.push({
                id,
                image: cover,
                name,
                artist: artistName,
                playCount,
              });
            });
          }
        }
        // 获取mv评论
        else if (index == 3) {
          const { comments, hotComments } = response;
          getComment(hotComments, videoComments);
          getComment(comments, videoComments);
        }
      });
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
  } else {
    try {
      const responses: any[] = await Promise.all([
        getVideoDetail(id),
        getVideoUrl(id),
        getSimiVideo(id),
        getVideoComment(id, 1000),
      ]);
      responses.forEach((response, index) => {
        // 获取视频详情
        if (index == 0) {
          const {
            data: { title, coverUrl, publishTime, playTime, creator },
          } = response;
          mv.name = title;
          mv.image = coverUrl;
          mv.playCount = playTime;
          mv.publishTime = formatTime(publishTime);
          mv.artist = creator.nickname;
        }
        // 获取视频播放地址
        else if (index == 1) {
          const { urls } = response;
          if (urls) {
            mv.url = urls[0].url;
          } else {
            message(messageType.INFO, '此视频暂无播放资源，请切换下一个。');
          }
        }
        // 获取相似的视频
        else if (index == 2) {
          const { data } = response;
          data.forEach((item: any) => {
            const { title, coverUrl, vid, playTime, creator } = item;
            mvSimi.push({
              id: vid,
              name: title,
              image: coverUrl,
              playCount: playTime,
              artist: creator[0].userName,
            });
          });
        }
        // 获取视频评论
        else if (index == 3) {
          const { comments, hotComments } = response;
          getComment(hotComments, videoComments);
          getComment(comments, videoComments);
        }
      });
    } catch (err: any) {
      message(messageType.ERROR, err.message);
    }
  }
  // 添加视频播放记录
  user.addRecord<MV>(mv, user.videoRecord, user.videoRecordId);
  // 初始化喜欢状态
  user.initLoveStatus(mv, user.loveVideoId);
  init();
  // 关闭动画
  first.value = false;
}, first);

// 卸载播放器，取消事件监听
onBeforeUnmount(() => {
  const video = document.querySelector('.dplayer-video') as HTMLVideoElement;
  video.onended = null;
  dplayer.value?.destroy();
});
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@font-color-gray: v-bind(fontGray);
@video-height: v-bind(videoHeight);
@shadow: v-bind(boxShadow);
@theme-color: v-bind(themeColor);
@color-gray: #7b7b7b;
@font-color-white: #ffffff;

.show-enter-from,
.show-leave-to {
  opacity: 0;
}
.show-enter-to,
.show-leave-from {
  opacity: 1;
}

.show-enter-active,
.show-leave-active {
  transition: all 0.5s ease-out;
}

.recommend-container {
  height: @video-height;
  width: 80vw;
  position: absolute;
  top: 0;
  z-index: 1000;
  border-radius: 7px;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  h4 {
    color: rgba(235, 235, 235, 0.5);
    font-size: 23px;
    font-weight: 520;
    align-self: flex-start;
    margin: -20px 0 -15px 13.5vw;
  }

  .content {
    width: 54vw;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    .recommend-video {
      display: flex;
      flex-direction: column;
      position: relative;
      margin: 30px 10px 0 10px;

      &:hover .image {
        transform: translateY(-5px);
      }
      &:hover .mask {
        transform: translateY(-5px);
      }

      .mask,
      .image {
        width: 255px;
        height: 180px;
        border-radius: 10px;
        transition: 0.4s;
      }
      .mask {
        position: absolute;
        background-color: transparent;
        top: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        span {
          display: inline-block;
          font-size: 50px;
          transition: 0.4s;
          cursor: pointer;
          color: rgba(230, 230, 230, 0.9);
          &:hover {
            color: @theme-color;
          }
        }
      }
      .image {
        object-fit: cover;
        border: 1px solid rgba(230, 230, 230, 0.2);
      }
    }
  }
}
//视频播放完结束部分
.video-container {
  padding-top: 0 !important;
  .players-container {
    height: @video-height;
    width: 80vw;
    margin-left: 4px;
    position: relative;

    .players {
      border-radius: 7px;
      box-shadow: @shadow;
      height: 100%;
      &:deep(.dplayer-video) {
        object-fit: cover;
      }
      &:deep(.dplayer-setting-box) {
        border-radius: 5px;
        padding: 0;
        background-color: rgba(20, 20, 20, 0.8);
        box-shadow: @shadow;
      }

      &:deep(.dplayer-menu) {
        border-radius: 5px;
        padding: 0;
        background-color: rgba(20, 20, 20, 0.8);
        box-shadow: @shadow;
      }
      &:deep(.dplayer-menu-item) {
        padding-left: 10px;
        letter-spacing: 1px;
        &:nth-child(n + 5) {
          display: none;
        }
      }
      &:deep(.dplayer-menu-item a) {
        text-decoration: none;
      }
    }
  }
  .detail {
    width: 80vw;
    margin-left: 4px;
    .title {
      font-size: 14px;
      color: @font-color;
      margin: 15px 0;
      letter-spacing: 1px;
    }
    .artist-info {
      span {
        display: inline-block;
        font-size: 12px;
        color: @font-color-gray;
        &:nth-child(2) {
          margin: 0 15px;
        }
      }
    }
    .operation {
      margin: 20px 0;
      display: flex;
      .operate {
        width: 110px;
      }
    }
  }

  .comment-area {
    position: relative;
    .exit {
      position: absolute;
      right: 20px;
      top: 30px;
      font-size: 13px;
      letter-spacing: 0.5px;
      color: @color-gray;
      background-color: rgb(240, 240, 245);
      box-shadow: @shadow;
      border: none;
      height: 30px;
      width: 84px;
      line-height: 30px;
      text-align: center;
      border-radius: 15px;
      cursor: pointer;
      &:hover {
        color: @theme-color;
      }
      &:hover span {
        color: @theme-color;
      }
      &:active {
        background-color: rgb(235, 235, 235);
      }
      span {
        display: inline-block;
        font-size: 13px;
        margin-left: 1px;
        color: @color-gray;
      }
    }
    .title {
      margin-top: 20px;
      font-weight: 520;
      font-size: 14px;
      letter-spacing: 1px;
      color: @font-color;
      padding-left: 2px;
    }
    .comment-container {
      &:deep(.title) {
        display: none;
      }
    }
  }
}
</style>
