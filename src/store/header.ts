import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { getStorage, elMessage, removeStorage } from '@/utils/util';
import { storageType, elMessageType } from '@/model/enum';
import { User } from '@/model';
import { getUserInfo, getUserID, loginOut } from '@/api/api';
import avatar from '@assets/image/暂无头像.svg';
import router from '@/router';

const useHeaderStore = defineStore('header', () => {
  //登陆框的展开状态
  const showLogin = ref<boolean>(false);
  //cookie用来判断用户是否登陆
  const cookie = ref<string>(getStorage(storageType.SESSION, 'cookie') || '');
  //用户基本信息
  const user = reactive<User>(
    getStorage(storageType.SESSION, 'userInfo') || {
      uid: '',
      userName: '点击登陆',
      avatar: avatar,
    }
  );

  //获取用户信息
  async function getInfo() {
    const response: any = await getUserID().catch((err: any) => {
      elMessage(elMessageType.ERROR, err.message);
    });
    const {
      account: { id },
    } = response;
    user.uid = id;
    const userInfo: any = await getUserInfo(id);
    console.log(userInfo);
    const {
      profile: { avatarUrl, nickname },
    } = userInfo;
    user.avatar = avatarUrl;
    user.userName = nickname;
  }

  //退出登录
  async function logout() {
    const response: any = await loginOut().catch((err: any) => {
      elMessage(elMessageType.ERROR, err.message);
    });
    if (response.code == '200') {
      elMessage(elMessageType.SUCCESS, '成功退出登陆');
      removeStorage(storageType.SESSION, 'cookie');
      removeStorage(storageType.SESSION, 'userInfo');
      user.avatar = avatar;
      user.userName = '点击登陆';
      user.uid = '';
      router.push({
        name: 'recommend',
      });
    }
  }

  return { cookie, showLogin, user, getInfo, logout };
});

export default useHeaderStore;
