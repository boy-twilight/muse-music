<template>
  <el-scrollbar
    :max-height="contentHeight"
    noresize>
    <div class="main-container scroll-container">
      <Carousel
        :pictures="banners.slice(0, 5)"
        type="card"
        height="230px" />
      <!-- 推荐歌单 -->
      <ArtistPlaylist
        title="你的歌单补给站"
        :playlists="playLists" />
      <!-- 推荐音乐 -->
      <div class="musiclist">
        <h4 class="title">推荐新音乐</h4>
        <div class="content">
          <div
            v-for="song in songLists"
            :key="song.id"
            class="song-recommend">
            <div
              @click="playMusic(song)"
              class="mask">
              <span class="iconfont">&#xea82;</span>
            </div>
            <el-image
              :src="song.songImage"
              loading="lazy"
              class="left" />
            <div class="right">
              <p>{{ song.name }}</p>
              <p>{{ song.singer }}</p>
            </div>
          </div>
        </div>
      </div>
      <ArtistMv
        title="最新mv"
        :mvs="mvLists"
        class="mv-list" />
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { reactive, inject, Ref } from 'vue';
import { getBanner, getRecPlaylist, getDeafultSong, getMv } from '@/api';
import { message, getMusicUrls, getMusicInfos, getRequset } from '@/utils';
import { messageType } from '@/constants/common';
import { Playlist, Song, MV, Banner } from '@/type';
import { ArtistMv, ArtistPlaylist } from '@components/datalist';
import usePlayMusic from '@/hooks/usePlayMuisc';
import Carousel from '@components/carousel';
import useTheme from '@/hooks/useTheme';

// 获取主题
const { fontColor, fontBlack, boxShadow, themeColor, fontGray, contentHeight } =
  useTheme();
// 轮播图片
const banners = reactive<Banner[]>([]);
// 推荐歌单
const playLists = reactive<Playlist[]>([]);
// 推荐歌曲
const songLists = reactive<Song[]>([]);
// 推荐mv
const mvLists = reactive<MV[]>([]);
// 第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;

// 播放音乐
const { playMusic } = usePlayMusic();

// 获取初始数据
getRequset(async() => {
  try {
    const responses: any[] = await Promise.all([
      getBanner(),
      getRecPlaylist(10),
      getDeafultSong(40),
      getMv(10, '内地', '全部', '最新')
    ]);
    responses.forEach((response, index) => {
      // 获取banner
      if (index == 0) {
        const { banners: banner } = response;
        banner.forEach((item: any) => {
          const { imageUrl, targetId } = item;
          banners.push({
            id: targetId,
            pic: imageUrl
          });
        });
      }
      // 获取推荐歌单
      else if (index == 1) {
        const { playlists } = response;
        playlists.forEach((item: any) => {
          if (playLists.length < 10) {
            const {
              name,
              id,
              coverImgUrl,
              playCount,
              description,
              tags,
              creator
            } = item;
            playLists.push({
              name,
              id,
              playCount,
              description,
              image: coverImgUrl,
              tag: tags,
              creator: {
                avatarUrl: creator.avatarUrl,
                nickname: creator.nickname
              }
            });
          }
        });
      }
      // 获取推荐歌曲
      else if (index == 2) {
        const {
          data: { list }
        } = response;
        // 获取歌曲的基本信息
        for (let item of list) {
          const { fee } = item.data;
          if (songLists.length < 10) {
            if (fee == '0' || fee == '8') {
              getMusicInfos(songLists, item.data);
            }
          } else {
            break;
          }
        }
        getMusicUrls(songLists);
      }
      // 获取推荐视频
      else {
        const { data } = response;
        data.forEach((item: any) => {
          const { id, name, cover, playCount, artistName } = item;
          mvLists.push({
            id: id as string,
            name: name as string,
            image: cover as string,
            playCount: playCount as string,
            artist: artistName as string
          });
        });
      }
    });
  } catch (err: any) {
    message(messageType.ERROR, err.message);
  }
  // 关闭动画
  first.value = false;
}, first);
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);

.main-container {
  .carousel {
    margin-bottom: 15px;
  }

  .musiclist {
    width: 80vw;
    margin-bottom: 20px;
    .title {
      font-weight: 520;
      font-size: 20px;
      letter-spacing: 1px;
      width: 80vw;
      color: @font-color;
      margin-bottom: 10px;
    }
    .content {
      display: flex;
      flex-wrap: wrap;

      .song-recommend {
        display: flex;
        margin: 10px 0 0;
        width: 40vw;
        position: relative;

        .mask {
          position: absolute;
          height: 50px;
          width: 50px;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 10px;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
          transition: 0.5s;
          opacity: 0;
          &:hover {
            opacity: 1;
            transform: translateY(-5px);
          }
          &:hover + .left {
            transform: translateY(-5px);
          }

          span {
            color: rgba(255, 255, 255, 0.4);
            transition: 0.4s;
            &:hover {
              color: @theme-color;
              cursor: pointer;
            }
          }
        }
        .left {
          cursor: pointer;
          width: 50px;
          height: 50px;
          object-fit: cover;
          border-radius: 10px;
          box-shadow: @shadow;
          transition: 0.5s;
        }
        .right {
          p {
            font-size: 12px;
            color: @font-color;
            margin-left: 10px;
            &:first-child {
              margin: 7px 0 2px 10px;
            }
            &:last-child {
              font-size: 10px;
              color: @font-color-gray;
            }
          }
        }
      }
    }
  }
}
</style>
