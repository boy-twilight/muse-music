<template>
  <div
    class="radio-container scroll-container"
    v-infinite-scroll="loadData"
    infinite-scroll-distance="2"
    :infinite-scroll-immediate="false"
    :infinite-scroll-disabled="disabled"
    style="overflow: auto">
    <h4 class="r-title">精彩推荐</h4>
    <div class="banner">
      <el-image
        v-for="item in banner"
        :key="item.id"
        :src="item.pic"
        @click="go(item.id)" />
    </div>
    <div
      class="radio"
      v-for="(radio, index) in radios"
      :key="radioType[index].id">
      <ArtistPlaylist
        :title="radioType[index].name"
        :playlists="radio"
        type="radio" />
    </div>
    <Loading :is-loading="isLoading" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, inject, Ref } from 'vue';
import { useRouter } from 'vue-router';
import { elMessage, getRequset, getTheme } from '@/utils';
import { getRadioBanner, getRadios, getRadioType } from '@/api';
import { elMessageType } from '@/model/enum';
import { Banner, Playlist, RadioType } from '@/model';
import { ArtistPlaylist } from '@components/datalist';
import { Loading } from '@components/result';

// 配置主题
const boxShadow = getTheme().get('shadow');
const fontColor = getTheme().get('fontColor');
// 路由器
const router = useRouter();
// 电台banner
const banner = reactive<Banner[]>([]);
// 电台分类
const radioType = reactive<RadioType[]>([]);
// 电台分类下的电台
const radios = reactive<Playlist[][]>([]);
// 当前展示的分类电台数目
const curIndex = ref<number>(0);
// 第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;
// 隐藏滚动条
const hideScroll = inject('hideScroll') as () => void;
// 是否禁用滚动
const disabled = ref<boolean>(false);
// 是否正在加载
const isLoading = ref<boolean>(false);

// 获取电台下的分类
const getRadioData = async() => {
  const response: any = await getRadios(radioType[curIndex.value].id);
  const { djRadios } = response;
  radios.push([]);
  djRadios.forEach((item: any) => {
    const { picUrl, name, id, playCount } = item;
    radios[curIndex.value].push({
      name,
      id,
      image: picUrl,
      playCount,
      creator: { nickname: '', avatarUrl: '' },
      tag: [],
      description: ''
    });
  });
  disabled.value = false;
  isLoading.value = false;
};
const loadData = () => {
  disabled.value = true;
  isLoading.value = true;
  curIndex.value++;
  if (curIndex.value < radioType.length) {
    setTimeout(() => {
      getRadioData();
    }, 1000);
  } else {
    isLoading.value = false;
    elMessage(elMessageType.SUCCESS, '已经到达底部！');
  }
};
// 前往banner对应的电台
const go = (id: string) => {
  hideScroll();
  router.push({
    name: 'playlist',
    query: {
      id: id,
      type: 'radio'
    }
  });
};

getRequset(async() => {
  // 获取电台banner
  try {
    const response: any = await getRadioBanner();
    const { data } = response;
    data.forEach((item: any) => {
      const { targetId, pic } = item;
      banner.push({
        id: targetId,
        pic
      });
    });
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }

  // 获取电台分类
  try {
    const response: any = await getRadioType();
    const { categories } = response;
    categories.forEach((item: any) => {
      const { id, name } = item;
      radioType.push({
        id,
        name
      });
    });
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }

  try {
    getRadioData();
  } catch (err: any) {
    elMessage(elMessageType.ERROR, err.message);
  }
  first.value = false;
}, first);
</script>

<style lang="less" scoped>
@shadow: v-bind(boxShadow);
@font-color: v-bind(fontColor);
.radio-container {
  padding-bottom: 20px;
  .loading {
    height: 50px;
    margin: 20px 0;
  }
  .playlist {
    @common: 186px;
    &:deep(.content) {
      width: 80vw;
    }
    &:deep(.content .list .mask) {
      width: @common;
      height: @common;
    }
    &:deep(.content .list .playcount) {
      top: 155px;
    }
    &:deep(.content .list .el-image) {
      width: @common;
      height: @common;
    }
    &:deep(.content .list .name) {
      width: @common;
    }
  }

  .r-title {
    font-weight: 520;
    font-size: 20px;
    letter-spacing: 1px;
    width: 80vw;
    color: @font-color;
    margin-bottom: 20px;
  }
  .banner {
    width: 80vw;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    .el-image {
      border-radius: 9px;
      width: 380px;
      height: 200px;
      box-shadow: @shadow;
      object-fit: cover;
      cursor: pointer;
    }
  }
}
</style>
