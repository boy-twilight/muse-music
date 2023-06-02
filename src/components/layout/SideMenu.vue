<template>
  <el-menu
    class="menu"
    @select="changeActive"
    router
    :default-active="active">
    <div class="logo">
      <img :src="logo" />
      <h3>暮色音乐</h3>
    </div>
    <h4
      v-prevent
      class="title">
      在线音乐
    </h4>
    <el-menu-item
      v-for="menu in menuData[0]"
      :key="menu.index"
      :index="menu.index"
      :class="{
        'is-active': active == menu.index,
      }"
      v-prevent>
      <span :class="`iconfont ${menu.spanClass}`">{{ menu.icon }}</span>
      {{ menu.label }}
      <PlayAnimation :show-animation="active == menu.index" />
    </el-menu-item>
    <h4 v-prevent>我的音乐</h4>
    <el-menu-item
      v-for="menu in menuData[1]"
      :key="menu.index"
      :index="menu.index"
      :class="{
        'is-active': active == menu.index,
      }"
      v-prevent>
      <span :class="`iconfont ${menu.spanClass}`">{{ menu.icon }}</span>
      {{ menu.label }}
      <PlayAnimation :show-animation="active == menu.index" />
    </el-menu-item>
  </el-menu>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue';
import { Menu } from '@/model';
import { getStorage, setStorAge, getTheme } from '@/utils/util';
import { storageType } from '@/model/enum';
import logo from '@/assets/image/logo.svg';
import PlayAnimation from '@components/common/PlayAnimation.vue';
//设置主题
const fontColor = getTheme().get('fontColor');
const menuColor = getTheme().get('menuColor');
const activeColor = getTheme().get('active');
const fontGray = inject('fontGray');

//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;
// 在线音乐
const menuData: Menu[][] = [
  [
    {
      label: '推荐',
      icon: '\ue73d',
      index: '/recommend',
      spanClass: '',
    },
    {
      label: '音乐馆',
      icon: '\ue62d',
      index: '/hall',
      spanClass: 'hall',
    },
    {
      label: '视频',
      icon: '\ue622',
      index: '/rvideo',
      spanClass: 'video',
    },
    {
      label: '歌手榜',
      icon: '\ue8b3',
      index: '/artistlist',
      spanClass: 'artist',
    },
  ],
  // 用户个人中心
  [
    {
      label: '我喜欢',
      icon: '\ue760',
      index: '/love',
      spanClass: 'love',
    },
    {
      label: '下载记录',
      icon: '\ue629',
      index: '/download',
      spanClass: 'download',
    },
    {
      label: '最近播放',
      icon: '\ue6d7',
      index: '/recent',
      spanClass: 'recent',
    },
  ],
];

//默认活跃的菜单路径
const active = ref<string>(
  getStorage(storageType.SESSION, 'activeMenu') || '/recommend'
);
//改变活跃的菜单
const changeActive = (index: string) => {
  hideScroll();
  active.value = index;
  setStorAge(storageType.SESSION, 'activeMenu', active.value);
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@menu-background: v-bind(menuColor);
@font-color-gray: v-bind(fontGray);
@active-menu-background: v-bind(activeColor);
@font-color-green: #1ed2a9;
@font-color-white: #ffffff;
@actvie-menu-color: #ffffff;

.logo {
  top: 0;
  left: -15px;
  padding: 0;
  position: absolute;
  display: flex;
  align-items: center;
  width: 200px;
  height: 92px;
  img {
    width: 30px;
    height: 30px;
    margin-left: 30px;
  }
  h3 {
    font-size: 16px;
    margin-left: 8px;
    color: @font-color;
    letter-spacing: 1px;
    font-weight: 550;
  }
}

.show {
  opacity: 0;
}
.menu {
  position: relative;
  background-color: @menu-background;
  height: 100%;
  width: 85%;
  border: none;
  .el-menu-item:hover {
    outline: 0 !important;
    background-color: rgba(220, 220, 220, 0.6);
  }
  .el-menu-item {
    padding: 0 0 0 14px;
    height: 30px;
    margin: 10px;
    font-size: 13px;
    color: @font-color;
    border-radius: 6px;
    position: relative;

    .iconfont {
      margin: 0 6px;
    }
    .hall {
      font-size: 20px;
      margin-left: 4px;
    }
    .video {
      font-size: 14px;
      margin: 0 10px 0 7px;
    }

    .artist {
      font-size: 17px;
      margin: 0 8px 0 5px;
    }

    .love {
      font-size: 16px;
      margin: 0 8px 0 5px;
    }
    .recent {
      font-size: 18px;
      margin: 0 7px 0 4px;
    }
    .local {
      font-size: 15px;
      margin: 0 8px 0 6px;
    }

    .download {
      font-size: 16px;
      margin: 0 8px 0 5px;
    }
  }

  .is-active {
    background-color: @active-menu-background !important;
    color: @actvie-menu-color;
  }

  .title {
    margin-top: 90px;
  }
  h4 {
    margin: 30px 0 15px 30px;
    color: @font-color-gray;
    font-size: 12px;
    font-weight: 500;
  }
}
</style>
