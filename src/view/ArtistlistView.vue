<template>
  <div class="artistlist-container scroll-container">
    <SearchButton v-model="content" />
    <h4 class="title">歌手类型</h4>
    <ButtonGroup
      @get-active-index="getActiveIndex"
      :type="area"
      :cur-index="0"
      :show-title="false"
      title="歌手地区"
      class="area" />
    <ButtonGroup
      @get-active-index="getActiveIndex"
      :type="type"
      :cur-index="0"
      :show-title="false"
      title="歌手类型" />
    <!-- 姓名筛选 -->
    <ul class="name-ch">
      <li
        v-for="(item, index) in nameCh"
        :key="item"
        @click="getActiveIndex(index, '歌手姓名')"
        v-prevent
        :class="{
          'is-active': nameActive == item,
        }">
        {{ item }}
      </li>
    </ul>
    <h4 class="title">全部歌手</h4>
    <Singer :singer-list="searchResult" />
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, Ref, inject, computed, nextTick } from 'vue';
import { Artist } from '@/type';
import { getArtists } from '@/api';
import { message } from '@/utils';
import { messageType } from '@/constants/common';
import { Singer } from '@components/datalist';
import { ButtonGroup, SearchButton } from '@components/button';
import useTheme from '@/hooks/useTheme';

// 配置主题
const { fontColor, fontBlack, boxShadow, themeColor, fontGray } = useTheme();
// 隐藏滚动条
const hideScrollbar = inject('hideScrollbar') as () => void;
// 歌手榜单
const artistlist = reactive<Artist[]>([]);
// 搜索
const searchResult = computed(() =>
  artistlist.filter((artist) => artist.name.includes(content.value))
);
// 搜索内容
const content = ref<string>('');
// 缓存已经加载的结果
const resultCache = reactive<Map<string, Artist[]>>(new Map());
// 类型默认活跃的Index
const typeActive = ref<number>(0);
const artistType = computed(
  () => typeMapper.get(type[typeActive.value]) as number
);
// 歌手榜类型
const type = reactive<string[]>(['全部', '男歌手', '女歌手', '组合']);
// 类型到接口参数的映射
const typeMapper = new Map([
  ['全部', -1],
  ['男歌手', 1],
  ['女歌手', 2],
  ['组合', 3]
]);
// 歌手地区默认活跃的Index
const areaActive = ref<number>(0);
// 映射请求参数
const artistArea = computed(
  () => areaMapper.get(area[areaActive.value]) as number
);
// 歌手地区
const area = ['全部', '华语', '欧美', '日本', '韩国', '其他'];
// 地区到接口参数的映射
const areaMapper = new Map([
  ['全部', -1],
  ['华语', 7],
  ['欧美', 96],
  ['日本', 8],
  ['韩国', 16],
  ['其他', 0]
]);
// 姓名首字母，用于筛选
const nameCh = reactive<string[]>(
  '全部,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,#'.split(',')
);
// 姓名首字母的活跃
const nameActive = ref<string>('全部');
// 页面第一次加载的动画
const first = inject('firstLoading') as Ref<boolean>;

// 获取到当前活跃的按钮切换并加载对应数据
const getActiveIndex = async(index: number, type: string) => {
  hideScrollbar();
  artistlist.splice(0);
  // 切换index
  if (type == '歌手地区') {
    areaActive.value = index;
  } else if (type == '歌手类型') {
    typeActive.value = index;
  } else {
    nameActive.value = nameCh[index];
  }
  await nextTick();
  // 判断缓存是否存在
  const cache = resultCache.get(
    artistType.value + '' + artistArea.value + '' + nameActive.value
  );
  // 存在使用缓存，不存在直接请求数据
  if (cache) {
    artistlist.push(...cache);
  } else {
    getData();
  }
};
// 请求初始数据
const getData = async() => {
  // 第一次请求开启动画
  first.value = true;
  try {
    const response: any = await getArtists(
      artistType.value,
      artistArea.value,
      100,
      nameActive.value == '全部' ? undefined : nameActive.value.toLowerCase()
    );
    const { artists } = response;
    artists.forEach((item: any) => {
      const { img1v1Url, id, name, fansCount } = item;
      artistlist.push({
        id,
        name,
        avatar: img1v1Url,
        score: fansCount
      });
    });
    // 缓存请求结果
    resultCache.set(
      artistType.value + '' + artistArea.value + '' + nameActive.value,
      [...artistlist]
    );
  } catch (err: any) {
    message(messageType.ERROR, err.message);
  }
  first.value = false;
};
getData();
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@font-color-gray: v-bind(fontGray);
@shadow: v-bind(boxShadow);
@theme-color: v-bind(themeColor);

.loading {
  height: 50px;
  margin-bottom: 10px;
}

.is-active {
  color: @theme-color!important;
}
.artistlist-container {
  padding-bottom: 20px;
  position: relative;

  .search-area {
    position: absolute;
    left: 70vw;
    top: 148px;
  }

  .title {
    font-size: 20px;
    font-weight: 520;
    width: 81vw;
    color: @font-color;
    padding-left: 8.5px;
  }

  .area {
    &:deep(.type) {
      margin-top: 15px;
    }
  }

  .name-ch {
    display: flex;
    width: 81vw;
    padding-left: 10px;
    margin: 20px 0 15px;
    li {
      margin-right: 20px;
      color: @font-color-gray;
      font-size: 14px;
      &:hover {
        color: @theme-color;
        cursor: pointer;
      }
    }
  }
}
</style>
