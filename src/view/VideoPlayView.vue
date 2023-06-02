<template>
  <div class="video-container scroll-container">
    <video
      :src="mv.url"
      :poster="mv.image"
      controls
      ref="video"
      class="video-player"></video>
    <div class="detail">
      <p class="title">{{ mv.name }}</p>
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
        <DecoratedButton
          :name="mv.isLove ? '取消收藏' : '收藏'"
          :icon="mv.isLove ? '&#xe760;' : '&#xe761;'"
          :icon-style="mv.isLove ? 'color:#ff6a6a;' : ''"
          @click.native="user.addLove(mv, user.loveVideo, user.loveVideoId)"
          class="operate" />
        <DecoratedButton
          name="下载"
          @click.native="user.addVideoDownload(mv)"
          icon="&#xe61a;"
          class="operate" />
        <DecoratedButton
          name="分享"
          icon="&#xe680;"
          @click.native="shareVideo"
          class="operate" />
        <DecoratedButton
          name="评论"
          icon="&#xe60b;"
          @click.native="showComments = true"
          class="operate" />
      </div>
    </div>
    <Mv
      v-show="!showComments"
      :mvs="mvSimi"
      title="相关推荐" />

    <div
      v-show="showComments"
      class="comment-area">
      <h4 class="title">全部评论{{ `(${videoComments.length})` }}</h4>
      <button
        class="exit"
        @click="showComments = false">
        <span class="iconfont_1">&#xe62c; </span>
        退出
      </button>
      <Comments :comments="videoComments" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, Ref, inject, ref, computed, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { MV, Comment } from '@/model';
import { elMessageType } from '@/model/enum';
import {
  getMvDetail,
  getMvUrl,
  getSimiMv,
  getVideoDetail,
  getVideoUrl,
  getSimiVideo,
  getVideoComment,
  getMvComment,
} from '@/api/api';
import {
  elMessage,
  getTheme,
  getRequset,
  formatTime,
  share,
  getComment,
} from '@/utils/util';
import useUserStore from '@/store/user';
import useConfigStore from '@/store/config';
import useFooterStore from '@/store/footer';
import hotkeys from 'hotkeys-js';
import { storeToRefs } from 'pinia';
import DecoratedButton from '@components/button/DecoratedButton.vue';
import Mv from '@components/datalist/Mv.vue';
import Comments from '@/components/common/Comment.vue';

const footer = useFooterStore();
const { isPlay } = storeToRefs(footer);
// 配置快捷键;
hotkeys('space', () => {
  if (isPlay.value) {
    isPlay.value = false;
  }
  if (video.value?.paused) {
    video.value?.play();
  } else {
    video.value?.pause();
  }
});

//设置主题
const config = useConfigStore();
const fontColor = getTheme().get('fontColor');
const fontBlack = getTheme().get('fontBlack');
const boxShadow = getTheme().get('shadow');
const fontGray = inject('fontGray');
//全屏模式改变播放器高度
const videoHeight = computed(() => (config.isFullScreen ? '650px' : '520px'));

const user = useUserStore();

const video = ref<HTMLVideoElement>();

//获取视频id
const route = useRoute();
const id = route.query.id + '';
//mv信息
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
//相似的mv推荐
const mvSimi = reactive<MV[]>([]);
//页面第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;

//视频评论
const videoComments = reactive<Comment[]>([]);
//是否打开评论区
const showComments = ref<boolean>(false);

//分享
const shareVideo = () => {
  share(
    '我在' +
      import.meta.env.VITE_APP_URL +
      route.fullPath +
      '观看' +
      mv.name +
      ',快来和我一起观看把！'
  );
};

getRequset(async () => {
  //判断地址是否包含字母，有则用视频接口请求地址
  const rule = /.*[A-Z]+.*/;
  if (!rule.test(id)) {
    //获取mv详情
    try {
      const response: any = await getMvDetail(id);
      const {
        data: { name, artistName, cover, playCount, duration, publishTime },
      } = response;
      mv.name = name;
      mv.image = cover;
      mv.artist = artistName;
      mv.playCount = playCount;
      mv.time = duration;
      mv.publishTime = publishTime;
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
    //获取mv播放地址
    try {
      const response: any = await getMvUrl(id);
      const {
        data: { url, fee },
      } = response;
      if (url) {
        mv.url = url;
        mv.available = fee;
      } else {
        elMessage(elMessageType.INFO, '此视频暂无播放资源，请切换下一个。');
      }
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
    //获取相似的Mv
    try {
      const response: any = await getSimiMv(id);
      const { mvs } = response;
      if (mvs) {
        mvs.forEach((item: any) => {
          mvSimi.push({
            id: item.id as string,
            image: item.cover as string,
            name: item.name as string,
            artist: item.artistName as string,
            playCount: item.playCount as string,
          });
        });
      }
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
    //获取mv评论
    try {
      const response: any = await getMvComment(id, 10000);
      const { comments, hotComments } = response;
      getComment(hotComments, videoComments);
      getComment(comments, videoComments);
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  } else {
    //获取视频详情
    try {
      const response: any = await getVideoDetail(id);
      const {
        data: { title, coverUrl, publishTime, playTime, creator },
      } = response;
      mv.name = title;
      mv.image = coverUrl;
      mv.playCount = playTime;
      mv.publishTime = formatTime(publishTime);
      mv.artist = creator.nickname;
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
    //获取视频播放地址
    try {
      const response: any = await getVideoUrl(id);
      const { urls } = response;
      if (urls) {
        mv.url = urls[0].url;
      } else {
        elMessage(elMessageType.INFO, '此视频暂无播放资源，请切换下一个。');
      }
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
    //获取相似视频
    try {
      const response: any = await getSimiVideo(id);
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
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
    //获取视频评论
    try {
      const response: any = await getVideoComment(id, 100);
      const { comments, hotComments } = response;
      getComment(hotComments, videoComments);
      getComment(comments, videoComments);
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  }
  //添加视频播放记录
  user.addRecord<MV>(mv, user.videoRecord, user.videoRecordId);
  //初始化喜欢状态
  user.initLoveStatus(mv, user.loveVideoId);
  //关闭动画
  first.value = false;
}, first);

onBeforeUnmount(() => {
  hotkeys.unbind('space');
});
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);
@video-height: v-bind(videoHeight);
@font-color-green: #1ed2a9;

.video-container {
  .video-player,
  .detail {
    margin-left: 4px;
  }
  .video-player {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 80vw;
    height: @video-height;
    object-fit: cover;
    border-radius: 7px;
    box-shadow: @shadow;
    outline: none;
    &::-webkit-media-controls-timeline {
      height: 3px !important;
      position: absolute;
      bottom: 60px !important;
      width: 95%;
      left: 1vw;
      padding-bottom: 0 !important;
    }
    &::-webkit-media-controls-current-time-display {
      font-size: 13px;
      position: absolute;
      left: 77px;
    }
    //剩余时间
    &::-webkit-media-controls-time-remaining-display {
      font-size: 13px;
      position: absolute;
      left: 103px;
    }
    //播放按钮
    &::-webkit-media-controls-play-button {
      position: absolute;
      color: #ffffff;
      left: 2.2vw;
      background-size: 20px !important;
    }
    &::-webkit-media-controls-volume-control-container {
      position: absolute;
      right: 120px;
    }
    &::-webkit-media-controls-mute-button {
      background-size: 20px;
    }
    &::-webkit-media-controls-fullscreen-button {
      position: absolute;
      right: 60px;
      background-size: 20px !important;
    }
    &::-webkit-media-controls-enclosure {
      padding-right: 10px;
    }
  }

  .detail {
    width: 80vw;
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
      color: #7b7b7b;
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
        color: #1ed2a9;
      }
      &:hover span {
        color: #1ed2a9;
      }
      &:active {
        background-color: rgb(235, 235, 235);
      }
      span {
        display: inline-block;

        font-size: 13px;
        margin-left: 1px;
        color: #7b7b7b;
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
