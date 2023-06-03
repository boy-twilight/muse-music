<template>
  <div class="header-container">
    <!-- 登陆盒子 -->
    <el-dialog
      v-model="showLogin"
      @close="close"
      width="20%"
      :modal="false"
      destroy-on-close
      :close-on-click-modal="false"
      class="dialog-login">
      <div class="login-box">
        <img
          :src="logo"
          class="logo" />
        <span class="title">登陆网易云账号</span>
        <div class="qr-image">
          <img ref="qrcode" />
        </div>
        <span class="detail">打开网易云音乐APP扫码登录</span>
      </div>
    </el-dialog>
    <!-- 左边设置 -->
    <div class="left">
      <span
        class="iconfont"
        @click="back"
        v-prevent
        >&#xe660;</span
      >
      <span
        class="iconfont narrow-right"
        @click="forward"
        v-prevent
        >&#xe65f;
      </span>
      <div class="search-area">
        <!-- 搜索提示框 -->
        <el-popover
          :visible="showHistory"
          :width="460"
          placement="bottom-start"
          :popper-style="{
            color: fontColor,
            background: bg,
          }"
          :popper-class="{
            'search-tip': true,
            'popover-skin': config.bgMode == 'skin',
          }">
          <div class="search-tip-content">
            <div class="content-left">
              <h4 class="title">热门搜索</h4>
              <el-divider class="divider-h" />
              <ul class="keywords">
                <li
                  v-for="item in hotSearch.slice(0, 8)"
                  :key="item.searchWord"
                  @click="goSearchByRe(item.searchWord)">
                  <span> {{ item.searchWord }} </span
                  ><span class="score">{{ item.score }}次</span>
                </li>
              </ul>
            </div>
            <el-divider
              direction="vertical"
              style="height: 300px; margin: 0" />
            <div class="content-right">
              <h2 class="title">
                搜索历史
                <span
                  @mousedown.prevent="userSearch.splice(0)"
                  class="clear"
                  >清空</span
                >
              </h2>
              <el-divider class="divider-h" />
              <ul class="keywords">
                <li
                  v-for="item in userSearch"
                  :key="item"
                  @click="goSearchByRe(item)">
                  <span> {{ item }} </span>
                </li>
              </ul>
            </div>
          </div>
          <template #reference>
            <div>
              <input
                v-model="search"
                @keyup.enter="goSearch"
                @focusin="showHistory = true"
                @focusout="showHistory = false"
                type="text"
                class="search"
                placeholder="请输入你想要搜索的歌曲，歌手" />
              <span
                @click="goSearch"
                v-prevent
                class="iconfont"
                >&#xeafe;</span
              >
            </div>
          </template>
        </el-popover>
      </div>
    </div>
    <!-- 右边头像 -->
    <div class="right">
      <div class="login">
        <el-avatar
          :size="30"
          :src="user.avatar"
          fit="cover" />
        <span
          v-prevent
          @click="showLoginBox"
          style="font-size: 12px"
          >{{ user.userName }}</span
        >
        <span
          @mousedown.prevent="theme.changeDark"
          v-show="fontColor == '#101010' && bgMode == 'color'"
          class="iconfont theme"
          style="font-size: 20px"
          >&#xe635;</span
        >
        <span
          @mousedown.prevent="theme.changeLight"
          v-show="fontColor != '#101010' && bgMode == 'color'"
          class="iconfont theme"
          style="font-size: 12px"
          >&#xe764;</span
        >
        <span
          class="iconfont_1 theme"
          v-show="bgMode == 'skin'"
          @mousedown.prevent="changeSkin"
          style="font-size: 14px">
          &#xe743;
        </span>
      </div>

      <!-- 退出登陆，设置 -->
      <el-dropdown
        trigger="click"
        @command="handleClick"
        :popper-class="`dropdown playmode ${dropDownMode}`">
        <span
          class="iconfont"
          v-prevent
          >&#xe502;
        </span>
        <template #dropdown>
          <el-dropdown-menu
            :style="{
              color: fontColor,
              background: bg,
            }">
            <el-dropdown-item
              v-for="item in dropDownItems"
              :key="item.command"
              :command="item.command">
              <span
                class="iconfont_1"
                :style="item.style"
                v-text="
                  item.command == 'fullScreen' ? fullScreenIcon : item.icon
                "></span>
              {{
                item.command == 'fullScreen' ? fullScreenName : item.name
              }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  reactive,
  ref,
  watch,
  inject,
  computed,
  onMounted,
  nextTick,
  Ref,
} from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  elMessage,
  setStorAge,
  getStorage,
  compressImage,
  getTheme,
} from '@/utils/util';
import { elMessageType, storageType } from '@/model/enum';
import { createKey, createQrCode, checkStatus, getHotSearch } from '@/api/api';
import { DropDownItem, HotSearch } from '@/model';
import useHeaderStore from '@/store/header';
import useConfigStore from '@/store/config';
import useThemeStore from '@/store/theme';
import logo from '@assets/image/网易云.svg';

//配置主题
const theme = useThemeStore();
const fontColor = getTheme().get('fontColor') as Ref<string>;
const fontGray = inject('fontGray');
const bg = getTheme().get('background');
const boxShadow = getTheme().get('shadow');
const searchColor = getTheme().get('searchBg');

//下列框处于哪种模式
const dropDownMode = computed(() => {
  if (config.bgMode == 'color') {
    return fontColor.value == '#ffffff' ? 'dropdown-dark' : 'dropdown-light';
  } else {
    return 'dropdown-skin';
  }
});

//设置隐藏滚动条
const hideScroll = inject('hideScroll') as Function;

//路由器
const router = useRouter();
const header = useHeaderStore();
const { showLogin, cookie, user } = storeToRefs(header);
const config = useConfigStore();
const { isFullScreen, bgMode, skin } = storeToRefs(config);
//路由返回上一级
const back = () => {
  hideScroll();
  router.back();
};

//路由来到下一级
const forward = () => {
  hideScroll();
  router.forward();
};

//用户搜素的内容
const search = ref<string>('');
//热门搜索列表
const hotSearch = reactive<HotSearch[]>(
  getStorage(storageType.SESSION, 'hotSearch') || []
);
//用户的搜索列表
const userSearch = reactive<string[]>(
  getStorage(storageType.LOCAL, 'userSearch') || []
);
//是否展示搜索推荐列表
const showHistory = ref<boolean>(false);
//获取热门搜索列表内容
//缓存列表结果
if (hotSearch.length == 0) {
  getHotSearch().then((response: any) => {
    if (response) {
      const { data } = response;
      data.forEach((item: any) => {
        hotSearch.push({
          searchWord: item.searchWord,
          score: item.score,
        });
      });
    }
  });
}

//以下为登陆的内容与退出登陆的内容
//存放二维码照片的容器
const qrcode = ref<HTMLImageElement>();
//计时器的标志
let timeid: any = 0;
//创建产生二维码
const createKeyCode = (): void => {
  createKey()
    .then((response: any) => {
      const {
        data: { unikey },
      } = response;
      creatQrImage(unikey);
      CheckLoginStatus(unikey);
    })
    .catch((err: any) => {
      elMessage(elMessageType.ERROR, err.message);
    });
};
//产生二维码的base64并挂载到容器上
const creatQrImage = (key: string): void => {
  createQrCode(key)
    .then((response: any) => {
      const {
        data: { qrimg },
      } = response;
      qrcode.value!.src = qrimg;
    })
    .catch((err: any) => {
      elMessage(elMessageType.ERROR, err.message);
    });
};
//监测登陆状态
const CheckLoginStatus = (key: string): void => {
  timeid = setInterval(async () => {
    const response: any = await checkStatus(key).catch((err: any) => {
      elMessage(elMessageType.ERROR, err.message);
    });
    const { code, message } = response;
    //根据code状态判断登陆状态
    if (code == '800') {
      //提醒用户二维码已过期
      elMessage(elMessageType.INFO, message);
      //清除timeid
      clearInterval(timeid);
      //重新刷新二维码
      createKeyCode();
    } else if (code == '803') {
      //关闭登陆盒子
      showLogin.value = false;
      //本地存储cookie
      cookie.value = response.cookie;

      // 获取用户信息
      header.getInfo();
      //提醒用户登陆成功
      elMessage(elMessageType.SUCCESS, message);
      // 清除计时器
      clearInterval(timeid);
    }
  }, 6000);
};
//打开登陆盒子
const showLoginBox = () => {
  if (!cookie.value) {
    showLogin.value = true;
  } else {
    elMessage(elMessageType.SUCCESS, '已成功登陆，切勿重复点击！');
  }
};
//关闭登陆盒子的回调
const close = () => {
  clearInterval(timeid);
};

//检测全屏，变化文字和对应的icon
const fullScreenIcon = computed(() =>
  !isFullScreen.value ? '\ueb99' : '\ueb98'
);
const fullScreenName = computed(() =>
  !isFullScreen.value ? '进入全屏' : '退出全屏'
);

//切换皮肤
const changeSkin = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.style.display = 'none';
  document.body.appendChild(input);
  input.click();
  input.onchange = async () => {
    const files = input.files;
    if (files && files.length > 0) {
      const file = files[0];
      const skinUrl = await compressImage(file, 3840, 2160, 0.6);
      skin.value = skinUrl;
      document.body.removeChild(input);
    }
  };
};

const dropDownItems = reactive<DropDownItem[]>([
  {
    name: '退出登陆',
    icon: '\ue61b',
    command: 'logout',
    style: 'font-size:14px;margin:0 9px 0 2px;',
  },
  {
    name: '',
    icon: '',
    command: 'fullScreen',
    style: 'font-size:18px;margin-right:7px;',
  },
  {
    name: '纯色模式',
    icon: '\ue822',
    command: 'color',
    style: 'font-size:18px;margin-right:7px;',
  },
  {
    name: '皮肤模式',
    icon: '\ue743',
    command: 'skin',
    style: 'font-size:15px;margin:0 7px 0 4px;',
  },
]);
//下拉框选择处理
const handleClick = async (command: string) => {
  if (command == 'logout' && cookie.value) {
    header.logout();
  } else if (command == 'fullScreen') {
    if (isFullScreen.value) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  } else if (command == 'color') {
    theme.changeLight();
    config.changeColor();
  } else if (command == 'skin') {
    if (!skin.value) {
      changeSkin();
    }
    await nextTick();
    config.changeSkin();
    theme.changeSkinMode();
  }
};

//以下为搜索的内容
const goSearch = () => {
  if (!userSearch.includes(search.value)) {
    userSearch.push(search.value);
  }
  hideScroll();
  router.push({
    name: 'search',
    query: {
      keyWord: search.value,
    },
  });
};
//点击推荐列表搜索
const goSearchByRe = (keyWord: string) => {
  if (!userSearch.includes(keyWord)) {
    userSearch.push(keyWord);
  }
  search.value = keyWord;
  hideScroll();
  router.push({
    name: 'search',
    query: {
      keyWord,
    },
  });
};

//检测是否展示登陆二维码
watch(showLogin, (newVal) => {
  if (newVal) {
    //生成二维码
    createKeyCode();
  }
});

//检测屏幕变化改变样式
onMounted(() => {
  //屏幕变化时改变值
  document.addEventListener('fullscreenchange', () => {
    isFullScreen.value = !isFullScreen.value;
  });

  //缓存结果
  window.addEventListener('beforeunload', () => {
    setStorAge(storageType.LOCAL, 'userSearch', userSearch);
    setStorAge(storageType.SESSION, 'hotSearch', hotSearch);
    if (cookie.value) {
      setStorAge(storageType.SESSION, 'cookie', cookie.value);
    }
    setStorAge(storageType.SESSION, 'userInfo', user.value);
  });
});
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@background: v-bind(bg);
@shadow: v-bind(boxShadow);
@search-bg: v-bind(searchColor);
@font-color-gray: v-bind(fontGray);
@font-color-green: #1ed2a9;

.search-tip-content {
  display: flex;
  padding: 0 5px;
  .content-left,
  .content-right {
    width: 230px;
    height: 300px;

    .divider-h {
      margin: 10px 0;
    }
    .title {
      margin: 10px 0 0 15px;
      font-size: 14px;
      letter-spacing: 1px;
      font-weight: 520;
      color: @font-color;
      line-height: 14px;
      .clear {
        font-size: 12px;
        margin-left: 100px;
        display: inline-block;
        height: 12px;
        cursor: pointer;
        color: @font-color-gray;
        &:hover {
          color: @font-color-green;
        }
      }
    }
    .keywords {
      height: 254px;

      span {
        font-size: 13px;
        height: 13px;
        line-height: 13px;
        color: @font-color;
        letter-spacing: 1px;
      }
      li {
        padding: 9px 10px;
        position: relative;
        display: flex;
        align-items: center;
        margin-left: 5px;
        &:hover {
          background-color: rgba(225, 225, 225, 0.6);
        }
        .score {
          font-size: 13px;
          position: absolute;
          right: 5px;
          letter-spacing: 0;
        }
      }

      scroll-behavior: smooth;
      overflow: auto;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
.header-container {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 10;

  .left {
    display: flex;
    align-items: center;
    margin-left: 3.5vw;
    .iconfont {
      display: block;
      color: @font-color-gray;
      font-size: 16px;
      cursor: pointer;
    }
    .narrow-right {
      margin: 0 20px;
    }
    .search-area {
      width: 300px;
      position: relative;

      span {
        position: absolute;
        right: 12px;
        top: 2px;
        font-size: 20px;
        color: @font-color-gray;
        display: block;
      }

      .search {
        width: 300px;
        height: 34px;
        border-radius: 17px;
        outline: none;
        font-size: 13px;
        padding-left: 20px;
        background-color: @search-bg;
        color: @font-color;
        border: 1px solid #ffffff;
        &::placeholder {
          color: @font-color-gray;
        }
      }
    }
  }
  .right {
    position: absolute;
    right: 4vw;
    display: flex;
    align-items: center;
    .login {
      display: flex;
      cursor: pointer;
      align-items: center;
      span {
        margin-left: 10px;
        font-size: 13px;
        color: @font-color-gray;
      }
      .theme {
        margin-left: 5px;
        display: inline-block;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
      }
    }
    .iconfont {
      color: @font-color-gray;
      margin-left: 5px;
      font-size: 14px;
      cursor: pointer;
    }
    .logout {
      margin-left: 5px;
      font-size: 10px;
    }
  }

  .login-box {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: @background;

    .title {
      font-size: 20px;
      font-weight: 550;
      color: @font-color;
      margin: 10px 0;
    }
    .logo {
      width: 40px;
    }
    .detail {
      margin-top: 5px;
      font-size: 14px;
      color: @font-color;
    }
    .qr-image {
      margin-bottom: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>

<style lang="less">
@background: v-bind(bg);
@shadow: v-bind(boxShadow);
.dialog-login {
  background-color: @background !important;
  box-shadow: @shadow !important;
  border-radius: 15px !important;
  backdrop-filter: blur(10px) brightness(0.8) saturate(120%) contrast(1.2);
}
</style>
