import { defineStore, storeToRefs } from 'pinia';
import { computed, reactive } from 'vue';
import { Album, Artist, MV, Playlist, Song } from '@/model';
import { download, downloadMusic, elMessage, getStorage } from '@/utils';
import { elMessageType, storageType } from '@/model/enum';
import useFooterStore from './footer';

const useUserStore = defineStore('user', () => {
  interface Source {
    id: string;
    isLove?: boolean;
    [key: string]: any;
  }

  const footer = useFooterStore();
  const { songList, songListId } = storeToRefs(footer);

  // 收藏的歌曲,实现
  const loveSongs = reactive<Song[]>(
    getStorage(storageType.LOCAL, 'loveSongs') || []
  );
  // 收藏的视频,实现
  const loveVideo = reactive<MV[]>(
    getStorage(storageType.LOCAL, 'loveVideo') || []
  );
  // 收藏的歌单,实现
  const lovePlaylist = reactive<Playlist[]>(
    getStorage(storageType.LOCAL, 'lovePlaylist') || []
  );
  // 收藏的歌手
  const loveSinger = reactive<Artist[]>(
    getStorage(storageType.LOCAL, 'loveSinger') || []
  );
  // 收藏的专辑
  const loveAlbum = reactive<Album[]>(
    getStorage(storageType.LOCAL, 'loveAlbum') || []
  );
  // 收藏的电台
  const loveRadio = reactive<Playlist[]>(
    getStorage(storageType.LOCAL, 'loveRadio') || []
  );

  // 歌曲播放记录，实现
  const songRecord = reactive<Song[]>(
    getStorage(storageType.LOCAL, 'songRecord') || []
  );
  // 视频的播放记录，实现
  const videoRecord = reactive<MV[]>(
    getStorage(storageType.LOCAL, 'videoRecord') || []
  );
  // 下载的音乐，实现
  const musicDownload = reactive<Song[]>(
    getStorage(storageType.LOCAL, 'musicDownload') || []
  );
  // 下载的视频,实现
  const mvDownload = reactive<MV[]>(
    getStorage(storageType.LOCAL, 'mvDownload') || []
  );

  // 喜欢音乐的id对应的map
  const loveMusicId = computed(() => {
    const map: Map<string, number> = new Map();
    loveSongs.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });
  // 喜欢视频的id对应的map
  const loveVideoId = computed(() => {
    const map: Map<string, number> = new Map();
    loveVideo.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });
  // 喜欢歌手的id对应的map
  const loveSingerId = computed(() => {
    const map: Map<string, number> = new Map();
    loveSinger.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });
  // 喜欢歌单id对应的map
  const lovePlaylistId = computed(() => {
    const map: Map<string, number> = new Map();
    lovePlaylist.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });
  // 喜欢专辑id对应的map
  const loveAlbumId = computed(() => {
    const map: Map<string, number> = new Map();
    loveAlbum.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });
  // 喜欢歌单id对应的map
  const loveRadioId = computed(() => {
    const map: Map<string, number> = new Map();
    loveRadio.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });

  // 歌曲播放记录id对应的map
  const songRecordId = computed(() => {
    const map: Map<string, number> = new Map();
    songRecord.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });

  // 视频播放记录
  const videoRecordId = computed(() => {
    const map: Map<string, number> = new Map();
    videoRecord.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });
  // 歌曲播放记录id对应的map
  const musicDownloadId = computed(() => {
    const map: Map<string, number> = new Map();
    musicDownload.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });
  // 歌曲播放记录id对应的map
  const mvDownloadId = computed(() => {
    const map: Map<string, number> = new Map();
    mvDownload.forEach((item, index) => {
      map.set(item.id, index);
    });
    return map;
  });

  // 添加收藏并添加记录
  function addLove<T extends Source>(
    source: T,
    sourceList: T[],
    idMap: Map<string, number>
  ) {
    source.isLove = source.isLove ? false : true;
    const playIndex = songListId.value.get(source.id);
    const recordIndex = songRecordId.value.get(source.id);
    const downloadIndex = musicDownloadId.value.get(source.id);
    if (source.isLove) {
      sourceList.push(source);
      elMessage(elMessageType.SUCCESS, '收藏成功！');
      // 添加对应页面的喜欢
      if (playIndex != undefined)
        songList.value[playIndex as number].isLove = true;
      if (recordIndex != undefined)
        songRecord[recordIndex as number].isLove = true;
      if (downloadIndex != undefined)
        musicDownload[recordIndex as number].isLove = true;
    } else {
      sourceList.splice(idMap.get(source.id) as number, 1);
      elMessage(elMessageType.SUCCESS, '取消收藏成功！');
      // 移除对应页面的喜欢
      if (playIndex != undefined)
        songList.value[playIndex as number].isLove = false;
      if (recordIndex != undefined)
        songRecord[recordIndex as number].isLove = false;
      if (downloadIndex != undefined)
        musicDownload[recordIndex as number].isLove = false;
    }
  }

  // 添加播放记录
  function addRecord<T extends Source>(
    source: T,
    sourceList: T[],
    idMap: Map<string, number>
  ) {
    const index = idMap.get(source.id);
    if (index == undefined) {
      sourceList.push(source);
    }
  }

  // 下载音乐并且添加记录
  function addMuiscDownload(song: Song) {
    downloadMusic(song);
    const index = musicDownloadId.value.get(song.id);
    if (index == undefined) {
      musicDownload.push(song);
    }
  }
  // 下载视频并添加记录
  function addVideoDownload(mv: MV) {
    elMessage(elMessageType.SUCCESS, 'MV开始下载，请稍后。');
    const fileName = mv.name + '-' + mv.artist + '.mp4';
    const url = mv.url as string;
    download(url, fileName);
    const index = mvDownloadId.value.get(mv.id);
    if (index == undefined) {
      mvDownload.push(mv);
    }
  }

  // 初始化歌曲喜欢状态
  function initLoveMusic(musicList: Song[]) {
    musicList.forEach((item) => {
      if (loveMusicId.value.get(item.id) != undefined) {
        item.isLove = true;
      } else {
        item.isLove = false;
      }
    });
  }

  // 初始化其它关注的喜欢状态
  function initLoveStatus<T extends Source>(
    source: T,
    idMap: Map<string, number>
  ) {
    if (idMap.get(source.id)) {
      source.isLove = true;
    } else {
      source.isLove = false;
    }
  }

  return {
    musicDownload,
    mvDownload,
    loveSongs,
    lovePlaylist,
    loveVideo,
    loveSinger,
    loveAlbum,
    loveRadio,
    songRecord,
    videoRecord,
    loveMusicId,
    loveVideoId,
    loveSingerId,
    loveAlbumId,
    lovePlaylistId,
    songRecordId,
    videoRecordId,
    musicDownloadId,
    loveRadioId,
    addLove,
    addRecord,
    addMuiscDownload,
    addVideoDownload,
    initLoveMusic,
    initLoveStatus
  };
});

export default useUserStore;
