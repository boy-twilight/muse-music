import useFooterStore from '@/store/footer';
import useUserStore from '@/store/user';
import { storeToRefs } from 'pinia';
import { Song } from '@/model';
import { nextTick } from 'vue';
import { elMessage } from '@/utils';
import { elMessageType } from '@/model/enum';
import { getMusicUrl, getSimiMusic } from '@/api';
export default function usePlay() {
  const user = useUserStore();
  const footer = useFooterStore();
  const {
    songList,
    current,
    isPlay,
    playProcess,
    playTime,
    songListId,
    songNum,
  } = storeToRefs(footer);
  // 播放单曲
  const playMusic = async (song: Song) => {
    if (song.available == '0' || song.available == '8') {
      const index = songListId.value.get(song.id);
      if (index == undefined) {
        user.addRecord(song, user.songRecord, user.loveMusicId);
        if (current.value == 0) {
          if (isPlay) {
            isPlay.value = false;
          }
          playProcess.value = 0;
          playTime.value = 0;
          songList.value.unshift(song);
          await nextTick();
          isPlay.value = true;
        } else {
          songList.value.unshift(song);
          current.value = 0;
        }
      } else {
        if (current.value != index) {
          current.value = index;
        } else {
          isPlay.value = true;
        }
      }
    } else if (song.available == '1') {
      elMessage(elMessageType.INFO, '此歌曲为vip专属');
    } else if (song.available == '10') {
      elMessage(elMessageType.INFO, '此歌曲尚未拥有版权，请切换其它歌曲');
    }
  };

  // 播放全部音乐
  const playAllMusic = (songs: Song[]) => {
    if (songs.length > 0) {
      const temp: number = songNum.value;
      songs.forEach((item) => {
        const notInList = songListId.value.get(item.id);
        if (
          notInList == undefined &&
          (item.available == '0' || item.available == '8')
        ) {
          songList.value.push(item);
        }
      });
      current.value = temp;
      elMessage(elMessageType.SUCCESS, '已经添加到播放列表');
    } else {
      elMessage(elMessageType.INFO, '请添加歌曲');
    }
  };

  // 下首播放
  const playMusicNext = (song: Song) => {
    if (song.available == '0' || song.available == '8') {
      const index = songListId.value.get(song.id);
      if (index != current.value + 1 && index != current.value) {
        if (index != undefined) {
          const next = songList.value[current.value + 1];
          songList.value[index] = next;
          songList.value[current.value + 1] = song;
        } else {
          songList.value.splice(current.value + 1, 0, song);
        }
        user.addRecord(
          songList.value[current.value + 1],
          user.songRecord,
          user.songRecordId
        );
        elMessage(elMessageType.SUCCESS, '已添加到下一首播放');
      } else if (index == current.value) {
        elMessage(elMessageType.INFO, '歌曲正在播放，请勿重复操作');
      }
    } else if (song.available == '1') {
      elMessage(elMessageType.INFO, '此歌曲为vip专属');
    } else if (song.available == '10') {
      elMessage(elMessageType.INFO, '此歌曲尚未拥有版权，请切换其它歌曲');
    }
  };

  // 播放选中的歌曲
  const playSelectMusic = async (selectSongs: Song[]) => {
    if (selectSongs.length > 0) {
      isPlay.value = false;
      playProcess.value = 0;
      playTime.value = 0;
      await nextTick();
      selectSongs.forEach((item) => {
        const index = songListId.value.get(item.id);
        if (index == undefined) {
          songList.value.unshift(item);
        }
      });
      current.value = 0;
      isPlay.value = true;
      elMessage(elMessageType.SUCCESS, '已添加到播放列表！');
    } else {
      elMessage(elMessageType.INFO, '请添加歌曲！');
    }
  };

  // 播放相似音乐
  const playSimiMusic = async (id: string) => {
    try {
      // 当前音乐的数目
      const num = songList.value.length;
      const response: any = await getSimiMusic(id);
      const { songs } = response;
      for (const song of songs) {
        const { fee, name, id, artists, album } = song;
        // 判断相似歌曲是否存在播放列表中
        const index = songList.value.findIndex((item) => item.id == id);
        if ((fee == '0' || fee == '8') && index == -1) {
          const muisc: Song = {
            name,
            id,
            singer: artists.map((item: any) => item.name).join('、'),
            songImage: album.blurPicUrl,
            album: album.name,
            available: fee,
          };
          // 获取音乐的播放链接
          const musicResponse: any = await getMusicUrl(id);
          const { data } = musicResponse;
          if (data[0].url) {
            muisc.url = data[0].url;
            muisc.time = data[0].time;
            songList.value.splice(current.value + 1, 0, muisc);
            // 添加播放记录
            user.addRecord(
              songList.value[current.value + 1],
              user.songRecord,
              user.songRecordId
            );
            elMessage(
              elMessageType.SUCCESS,
              '已找到相似歌曲' + muisc.name + '，将于下一首播放。'
            );
            break;
          }
        }
      }
      if (songNum.value == num) {
        elMessage(elMessageType.INFO, '暂无相似歌曲');
      }
    } catch (err: any) {
      elMessage(elMessageType.ERROR, err.message);
    }
  };
  return {
    playMusic,
    playAllMusic,
    playMusicNext,
    playSimiMusic,
    playSelectMusic,
  };
}
