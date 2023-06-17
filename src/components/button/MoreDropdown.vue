<template>
  <el-dropdown
    v-if="showDrop"
    :popper-class="`dropdown songlist-more ${dropDownMode}`"
    trigger="click"
    @command="handleMore">
    <span
      class="iconfont"
      ref="more"
      >&#xe605;</span
    >
    <template #dropdown>
      <el-dropdown-menu
        :style="{
          color: fontColor,
          background: bg,
        }">
        <el-dropdown-item
          v-for="dropItem in dropItems"
          :key="dropItem.command"
          :command="dropItem.command">
          <span
            v-html="dropItem.command == 'love' ? loveIcon : dropItem.icon"
            :style="dropItem.command == 'love' ? lovetyle : dropItem.style"
            :class="dropItem.isIcon1 ? 'iconfont_1' : 'iconfont'"></span>
          {{ dropItem.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
  <span
    @click="showDropMenu"
    v-prevent
    v-else
    class="iconfont"
    >&#xe605;</span
  >
</template>

<script lang="ts" setup>
import { Ref, computed, ref, nextTick, inject } from 'vue';
import { storeToRefs } from 'pinia';
import {
  getTheme,
  getSimiSong,
  elMessage,
  shareMuiscInfo,
  getSourceComments,
  downloadLyric,
} from '@/utils/util';
import { Song, DropDownItem, Comment } from '@/model';
import { elMessageType } from '@/model/enum';
import useFooterStore from '@/store/footer';
import useUserStore from '@/store/user';
import useConfigStore from '@/store/config';

//主题设置
const config = useConfigStore();
const bg = getTheme().get('background');
const fontColor = getTheme().get('fontColor') as Ref<string>;
//下列框处于哪种模式
const dropDownMode = computed(() => {
  if (config.bgMode == 'color') {
    return fontColor.value == '#ffffff' ? 'dropdown-dark' : 'dropdown-light';
  } else {
    return 'dropdown-skin';
  }
});

//评论
const soucreComments = inject('soucreComments') as Comment[];
//是否展开评论区
const showComments = inject('showComments') as Ref<boolean>;

const more = ref<HTMLSpanElement>();

//是否显示下拉框
const showDrop = ref<boolean>(false);

//声明接受值
const props = defineProps<{
  //传入歌曲
  song: Song;
  //播放函数
  play: Function;
}>();

//用户再点击喜欢过后我喜欢的图标发送变化
const loveIcon = computed<string>(() =>
  props.song.isLove ? '&#xe760;' : '&#xe761'
);
const lovetyle = computed<string>(() =>
  props.song.isLove
    ? 'margin: 0 7px 0 4px;color:#ff6a6a;'
    : 'margin: 0 7px 0 4px;'
);

//下拉选项
const dropItems: DropDownItem[] = [
  {
    name: '播放',
    icon: '&#xea6e;',
    style: 'margin: 0 9px 0 2px; font-size: 15px;',
    command: 'playMusic',
  },
  {
    name: '下一首播放',
    icon: '&#xe63c;',
    style: 'margin: 0 7px 0 0px; font-size: 20px',
    command: 'playNext',
  },
  {
    name: '播放相似单曲',
    icon: '&#xe602;',
    style: 'margin: 0 8px 0 3px;',
    command: 'playSimi',
    isIcon1: true,
  },
  {
    name: '复制歌曲信息',
    icon: '&#xe63b;',
    style: 'margin: 1px 7px 0 4px;',
    command: 'copyMusic',
  },

  {
    name: '我喜欢',
    icon: '&#xe761;',
    style: 'margin: 0 7px 0 4px;',
    command: 'love',
  },
  {
    name: '查看评论',
    icon: '&#xe60b;',
    style: 'margin: 1px 7px 0 4px;',
    command: 'comment',
  },

  {
    name: '下载歌词',
    icon: '&#xe602;',
    style: 'margin: 0 7px 0 4px;',
    command: 'downLyric',
  },

  {
    name: '下载歌曲',
    icon: '&#xf0304;',
    style: 'margin: 0 8px 0 3px; font-size: 16px;',
    command: 'downloadMusic',
  },
];

//点击显示下拉框
const showDropMenu = async () => {
  showDrop.value = true;
  await nextTick();
  more.value?.click();
};

const footer = useFooterStore();
const { songList, current, songListId } = storeToRefs(footer);

const user = useUserStore();

//下首播放
const playNext = (song: Song) => {
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
  } else if ((song.available = '1')) {
    elMessage(elMessageType.INFO, '此歌曲为vip专属');
  } else if ((song.available = '10')) {
    elMessage(elMessageType.INFO, '此歌曲尚未拥有版权，请切换其它歌曲');
  }
};

//点击更多操作
const handleMore = (command: string) => {
  const song = props.song;
  if (command == 'love') {
    user.addLove(song, user.loveSongs, user.loveMusicId);
  } else if (command == 'downloadMusic') {
    user.addMuiscDownload(song);
  } else if (command == 'playSimi') {
    getSimiSong(song.id, current.value, songList.value, () => {
      user.addRecord(
        songList.value[current.value + 1],
        user.songRecord,
        user.songRecordId
      );
    });
  } else if (command == 'playMusic') {
    props.play(song);
  } else if (command == 'playNext') {
    playNext(song);
  } else if (command == 'downLyric') {
    downloadLyric(song);
  } else if (command == 'copyMusic') {
    shareMuiscInfo(song);
  } else if (command == 'comment') {
    if (soucreComments.length > 0) {
      soucreComments.splice(0);
    }
    getSourceComments(song.id, '0', soucreComments, () => {
      showComments.value = true;
    });
  }
};
//监控背景颜色，修改下拉框Hover颜色
</script>

<style lang="less">
.songlist-more {
  .el-dropdown-menu {
    .el-dropdown-menu__item {
      padding: 10px 70px 10px 15px;
    }
  }
}
</style>
