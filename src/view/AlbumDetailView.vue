<template>
  <el-scrollbar :max-height="contentHeight">
    <div class="album-detail-container scroll-container">
      <!-- 批量操作 -->
      <OnlineBatch
        v-show="showSelect"
        v-model:show-select="showSelect"
        :songs="albumSongs"
        ref="batch" />

      <div
        class="header"
        v-show="!showSelect">
        <el-image
          :src="albumInfo.cover"
          loading="lazy"
          class="left" />
        <div class="right">
          <h4>{{ albumInfo.name }}</h4>
          <p class="artist">{{ albumInfo.artist }}</p>
          <p>{{ albumInfo.publishTime }}</p>
          <div class="header-operation">
            <PlayButton :songs="albumSongs" />
            <CommonButton
              :name="albumInfo.isLove ? '取消收藏' : '收藏'"
              :icon="albumInfo.isLove ? '&#xe760;' : '&#xe761;'"
              :icon-style="albumInfo.isLove ? 'color:#ff6a6a;' : ''"
              @click="
                user.addLove(albumInfo, user.loveAlbum, user.loveAlbumId)
              " />
            <MoreButton
              v-if="!showSelect"
              @share="shareAlbum"
              @open-select="batch?.openSelectBox()" />
          </div>
        </div>
      </div>

      <div
        class="content"
        v-show="!showSelect">
        <Tab active="songs">
          <template #content>
            <el-tab-pane
              label="歌曲"
              name="songs">
              <SongTable :songs="albumSongs" />
              <ArtistAlbum
                :albums="otherAlbum"
                title="该歌手的其它专辑" />
            </el-tab-pane>
            <el-tab-pane
              label="详情"
              name="album">
              <div class="info">
                <p>
                  专辑：<span>{{ albumInfo.name }}</span>
                </p>
                <p>
                  歌手：<span>{{ albumInfo.artist }}</span>
                </p>
                <p>
                  唱片公司：<span>{{ albumInfo.company }}</span>
                </p>
                <p>
                  发布时间：<span>{{ albumInfo.publishTime }}</span>
                </p>
                <p>
                  专辑简介：<span class="desc">{{
                    albumInfo.description
                  }}</span>
                </p>
              </div>
            </el-tab-pane>
          </template>
        </Tab>
      </div>
    </div>
  </el-scrollbar>
</template>

<script lang="ts" setup>
import { reactive, inject, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Album, Song } from '@/type';
import { getAlbumDetail, getArtistAlbum } from '@/api';
import {
  formatTime,
  getMusicInfos,
  getMusicUrls,
  message,
  share,
  sleep,
} from '@/utils';
import { MessageType } from '@/constants/common';
import useUserStore from '@/store/user';
import { PlayButton, MoreButton, CommonButton } from '@components/button';
import { OnlineBatch, UserBatch } from '@components/batch';
import { ArtistAlbum } from '@components/datalist';
import { SongTable } from '@components/table';
import Tab from '@components/tab';
import useTheme from '@/hooks/useTheme';

// 获取主题
const { fontColor, fontBlack, boxShadow, fontGray, contentHeight } = useTheme();
const user = useUserStore();
const route = useRoute();
// 获取Id
const id = route.query.id + '';
// 获取歌手其它id
const artistId = route.query.artistId + '';
// 专辑信息
const albumInfo = reactive<Album>({
  id,
  artistId,
  name: '',
  cover: '',
  artist: '',
  publishTime: '',
});
// 歌手其它专辑
const otherAlbum = reactive<Album[]>([]);
// 专辑对应的歌曲
const albumSongs = reactive<Song[]>([]);
// 页面第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
// 是否加载选择框进入批量操作模式
const showSelect = ref<boolean>(false);
// 批量操作容器
const batch = ref<InstanceType<typeof UserBatch>>();

// 分享歌单
const shareAlbum = () => {
  share(
    '我有一个精品专辑分享给你：' +
      albumInfo.name +
      '，地址：' +
      import.meta.env.VITE_APP_SHARE_URL +
      route.fullPath
  );
};

// 请求页面数据
const getData = async () => {
  first.value = true;
  try {
    const responses: any[] = await Promise.all([
      getArtistAlbum(artistId),
      getAlbumDetail(id),
    ]);
    responses.forEach((response, index) => {
      // 获取该艺术家的其它专辑
      if (index == 0) {
        const { hotAlbums } = response;
        for (let item of hotAlbums) {
          const { id: albumId } = item;
          if (albumId != id && otherAlbum.length <= 5) {
            const { picUrl, name, publishTime } = item;
            otherAlbum.push({
              name,
              id: albumId,
              cover: picUrl,
              publishTime: formatTime(publishTime),
              artistId: artistId + '',
            });
          } else if (otherAlbum.length > 5) {
            break;
          }
        }
      }
      // 获取专辑详情
      else if (index == 1) {
        const {
          album: { picUrl, artist, publishTime, name, company, description },
          songs,
        } = response;
        albumInfo.name = name;
        albumInfo.cover = picUrl;
        albumInfo.publishTime = formatTime(publishTime);
        albumInfo.artist = artist.name;
        albumInfo.company = company;
        albumInfo.description = description;
        // 初始化喜欢状态
        user.initLoveStatus(albumInfo, user.loveAlbumId);
        songs.forEach((item: any) => {
          getMusicInfos(albumSongs, item);
        });
        // 初始化歌曲喜欢状态
        user.initLoveMusic(albumSongs);
        getMusicUrls(albumSongs);
      }
    });
  } catch (err: any) {
    message(MessageType.ERROR, err.message);
  }
  await sleep(50);
  // 关闭动画
  first.value = false;
};

// 获取数据
getData();
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@shadow: v-bind(boxShadow);
@font-color-gray: v-bind(fontGray);

.album-detail-container {
  .header {
    display: flex;
    width: 80vw;
    .left {
      height: 170px;
      width: 170px;
      box-shadow: @shadow;
      border-radius: 10px;
      margin-right: 20px;
    }
    .right {
      color: @font-color;
      h4 {
        font-size: 35px;
        margin-top: 2px;
      }

      .artist {
        margin: 14px 0;
      }
      p {
        font-size: 12px;
      }
      .header-operation {
        margin-top: 15px;
        .el-button {
          width: 110px;
          font-size: 13px;
        }
      }
    }
  }

  .content {
    margin-top: 20px;
    .info {
      width: 80vw;
      p {
        font-size: 12px;
        color: @font-color;
        margin-top: 10px;
        letter-spacing: 1px;
        span {
          color: @font-color-gray;
          line-height: 1.5;
        }
      }
    }
  }
}
</style>
