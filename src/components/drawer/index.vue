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
        <div
          v-show="drawerMode == 'playlist'"
          class="playlist-header">
          <h4>播放列表</h4>
          <div
            v-show="drawerMode == 'playlist'"
            class="header-operation">
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
      <ul v-show="drawerMode == 'playlist'">
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
            <MoreDropdown :song="song" />
          </div>
        </li>
      </ul>
      <div
        v-show="drawerMode == 'theme'"
        class="theme-container">
        <h4>主题设置</h4>
        <div
          class="color-item"
          v-for="(item, index) in titleArr"
          v-show="valueArr[index].value != 'transparent'"
          :key="item">
          <span>{{ item }}</span>
          <ColorPicker v-model:color="valueArr[index].value" />
        </div>
        <div class="theme-operation">
          <CommonButton
            @click="cancel"
            name="取消"
            icon="&#xe647;"
            :is-icon-one="true" />
          <CommonButton
            @click="changeTheme"
            name="保存"
            class="save"
            icon="&#xe606;"
            :is-icon-one="true" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, Ref, watch, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Song } from '@/type';
import useFooterStore from '@/store/footer';
import { transformTime, playVideo, handleSingerName, message } from '@/utils';
import { CommonButton, MoreDropdown } from '@components/button';
import { messageType } from '@/constants/common';
import useTheme from '@/hooks/useTheme';

// 配置主题
const {
  fontColor,
  fontGray,
  background,
  menuColor,
  themeColor,
  menuActive,
  boxShadow,
  skinUrl,
  drawerMode,
  bgMode,
  setTheme
} = useTheme();
const footer = useFooterStore();
const {
  isPlay,
  showList,
  songList,
  current,
  songNum,
  playProcess,
  playTime,
  showDetail
} = storeToRefs(footer);
// 设置主题相关
// 标题数组
const titleArr = reactive<string[]>([
  '请选择主题色调：',
  '请选择字体主题色调：',
  '请选择字体副色调：',
  '请选择背景色调：',
  '请选择菜单色调：',
  '请选择菜单激活时的色调：'
]);
// 值数组
let valueArr = reactive<Ref<string>[]>([
  ref<string>(themeColor.value),
  ref<string>(fontColor.value),
  ref<string>(fontGray.value),
  ref<string>(background.value),
  ref<string>(menuColor.value),
  ref<string>(menuActive.value)
]);

// 在播放列表点击播放
const listPlay = (index: number) => {
  if (current.value != index) {
    current.value = index;
  } else {
    isPlay.value = true;
  }
};

// 在播放列表删除歌曲
const listDelete = async(index: number) => {
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

// 列表删除全部歌曲
const deleteAll = async() => {
  if (isPlay.value) {
    isPlay.value = false;
  }
  playTime.value = 0;
  playProcess.value = 0;
  songList.value.splice(0);
};

// 播放mv
const playMV = (song: Song) => {
  playVideo(song, () => {
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
  async() => {
    await nextTick();
    const drawer = document.querySelector('.playlist-drawer') as HTMLDivElement;
    drawer.style.background = `${background.value} url(${skinUrl.value}) no-repeat center/cover`;
  },
  {
    immediate: true
  }
);

// 设置主题
const changeTheme = () => {
  setTheme(valueArr.map((item) => item.value));
  showList.value = false;
  message(messageType.SUCCESS, '主题保存成功！');
};

// 取消设置
const cancel = () => {
  showList.value = false;
  valueArr = reactive<Ref<string>[]>([
    ref<string>(themeColor.value),
    ref<string>(fontColor.value),
    ref<string>(fontGray.value),
    ref<string>(background.value),
    ref<string>(menuColor.value),
    ref<string>(menuActive.value)
  ]);
  message(messageType.SUCCESS, '主题取消保存成功！');
};
</script>

<style lang="less">
@font-color: v-bind(fontColor);
@shadow: v-bind(boxShadow);
@background: v-bind(background);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);
.drawer-container {
  .playlist-drawer {
    height: 100%;
    width: 23% !important;
    overflow: auto;
    box-shadow: @shadow;

    .iconfont {
      cursor: pointer;
    }

    h4 {
      color: @font-color;
      font-size: 20px;
      font-weight: 500;
    }
    .playlist-header {
      padding-left: 10px;
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
    .theme-container {
      .color-item {
        margin: 15px 0 15px 30px;
        span {
          font-size: 13px;
          display: inline-block;
          letter-spacing: 1px;
          color: v-bind(fontColor);
        }
        .color-btn {
          margin-top: 7px;
        }
      }
    }
    .theme-operation {
      display: flex;
      justify-content: flex-end;
      margin-top: 50px;
      .el-button {
        width: 90px;
        height: 30px;
        font-size: 12px;
      }
      .save {
        background-color: #1ed2a9;
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
            color: @theme-color;
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
