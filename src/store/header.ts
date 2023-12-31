import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { message, ss, ls } from '@/utils';
import { MessageType } from '@/constants/common';
import { User } from '@/type';
import { getUserInfo, getUserID, loginOut } from '@/api';
import avatar from '@assets/image/暂无头像.svg';
import router from '@/router';

const useHeaderStore = defineStore('header', () => {
  // 登陆框的展开状态
  const showLogin = ref<boolean>(false);
  // cookie用来判断用户是否登陆
  const cookie = ref<string>(ss.get('cookie') || '');
  // 用户基本信息
  const user = reactive<User>(
    ss.get('userInfo') || {
      uid: '',
      userName: '点击登陆',
      avatar: avatar,
    }
  );
  // 用户的搜索历史
  const userSearch = reactive<Set<string>>(
    new Set(ls.get('user')?.userSearch || [])
  );

  // 获取用户信息
  async function getInfo() {
    const response: any = await getUserID().catch((err: any) => {
      message(MessageType.ERROR, err.message);
    });
    const {
      account: { id },
    } = response;
    user.uid = id;
    const userInfo: any = await getUserInfo(id);
    const {
      profile: { avatarUrl, nickname },
    } = userInfo;
    user.avatar = avatarUrl;
    user.userName = nickname;
  }

  // 退出登录
  async function logout() {
    const response: any = await loginOut().catch((err: any) => {
      message(MessageType.ERROR, err.message);
    });
    if (response.code == '200') {
      message(MessageType.SUCCESS, '成功退出登陆');
      ss.remove('cookie');
      ss.remove('userInfo');
      user.avatar = avatar;
      user.userName = '点击登陆';
      user.uid = '';
      router.push({
        name: 'recommend',
      });
    }
  }

  return { cookie, showLogin, user, userSearch, getInfo, logout };
});

export default useHeaderStore;
