import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

import pinia from '@/store';
import useHeaderStore from '@/store/header';

import { storeToRefs } from 'pinia';
import { message } from '@/utils';
import { MessageType } from '@/constants/common';

// 进度条全局配置
NProgress.configure({
  easing: 'ease', // 动画方式
  speed: 1400, // 递增进度条的速度
  showSpinner: false, // 进度环显示隐藏
  trickleSpeed: 400, // 自动递增间隔
  minimum: 0.3, // 更改启动时使用的最小百分比
  parent: 'body' // 指定进度条的父容器
});

// 自定义路由元信息
declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    isAuth?: boolean;
    isAlive?: boolean;
  }
}

// 路由规则
const routes: RouteRecordRaw[] = [
  {
    path: '',
    redirect: '/recommend',
    children: [
      // 推荐页
      {
        path: '/recommend',
        name: 'recommend',
        component: () => import('@/view/RecommendView.vue'),
        meta: {
          title: '推荐'
        }
      },
      // 歌单页
      {
        path: '/playlist',
        name: 'playlist',
        component: () => import('@/view/PlayListView.vue'),
        meta: {
          title: '精品歌单'
        }
      },
      // 搜索页
      {
        path: '/search',
        name: 'search',
        component: () => import('@/view/SearchView.vue'),
        meta: {
          title: '搜索'
        }
      },
      // 视频播放页
      {
        path: '/video',
        name: 'video',
        component: () => import('@/view/VideoPlayView.vue'),
        meta: {
          title: '视频播放'
        }
      },
      // 视频推荐页
      {
        path: '/rvideo',
        name: 'rvideo',
        component: () => import('@/view/VideoView.vue'),
        meta: {
          title: '视频'
        }
      },
      // 音乐管页
      {
        path: '/hall',
        name: 'hall',
        component: () => import('@/view/MusicHall.vue'),
        meta: {
          title: '音乐馆'
        }
      },
      // 歌手榜页
      {
        path: '/artistlist',
        name: 'artistlist',
        component: () => import('@/view/ArtistlistView.vue'),
        meta: {
          title: '热门歌手'
        }
      },
      // 歌手详情页
      {
        path: '/artist',
        name: 'artist',
        component: () => import('@/view/ArtistDetailView.vue'),
        meta: {
          title: '歌手详情'
        }
      },
      // 我喜欢
      {
        path: '/love',
        name: 'love',
        component: () => import('@/view/LoveView.vue'),
        meta: {
          title: '我喜欢'
        }
      },
      {
        path: '/recent',
        name: 'recent',
        component: () => import('@/view/RecentPlayView.vue'),
        meta: {
          title: '最近播放'
        }
      },
      {
        path: '/album',
        name: 'album',
        component: () => import('@/view/AlbumDetailView.vue'),
        meta: {
          title: '专辑详情'
        }
      },
      {
        path: '/station',
        name: 'station',
        component: () => import('@/view/RadioView.vue'),
        meta: {
          title: '精彩电台'
        }
      },
      {
        path: '/download',
        name: 'download',
        component: () => import('@/view/DownloadView.vue'),
        meta: {
          title: '下载记录'
        }
      }
    ]
  }
];
// 创建router
const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0, behavior: 'smooth' };
    }
  }
});

// 需要登陆才可以进入的名单
const authList: string[] = ['///love', '///recent'];

// 全局前置
router.beforeEach((to, from, next) => {
  const header = useHeaderStore(pinia);
  const { showLogin, cookie } = storeToRefs(header);
  if (cookie.value) {
    NProgress.start();
    next();
  } else if (!cookie.value && authList.includes(to.path)) {
    message(MessageType.INFO, '尚未登陆，请登录！');
    showLogin.value = true;
  } else {
    NProgress.start();
    next();
  }
});

// 全局后置
router.afterEach((to) => {
  // 进度条结束
  NProgress.done();
  document.title = to.meta.title;
});

export default router;
