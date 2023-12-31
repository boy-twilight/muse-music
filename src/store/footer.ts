import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { Song } from '@/type';
import { ls } from '@/utils';

const useFooterStore = defineStore('footer', () => {
  // 是否播放
  const isPlay = ref<boolean>(false);
  // 播放列表
  const songList = reactive<Song[]>(ls.get('user')?.userPlaylist || []);
  // 播放列表对应的id
  const songListId = computed(() => {
    return new Map(songList.map((item, index) => [item.id, index]));
  });
  // 播放模式
  const playMode = ref<string>(ls.get('user')?.playMode || '2');
  // 歌曲数目
  const songNum = computed<number>(() => songList.length);
  // 当前播放的索引
  const current = ref<number>(ls.get('user')?.currentPlay || 0);
  // 当前播放的进度
  const playProcess = ref<number>(0);
  // 用户是否改变进度
  const isChanging = ref<boolean>(false);
  // 当前播放的时间
  const playTime = ref<number>(0);
  // 是否展示播放列表
  const showList = ref<boolean>(false);
  // 是否展示歌曲详情
  const showDetail = ref<boolean>(false);

  return {
    isPlay,
    current,
    songList,
    playMode,
    songNum,
    playProcess,
    playTime,
    showList,
    isChanging,
    showDetail,
    songListId,
  };
});

export default useFooterStore;
