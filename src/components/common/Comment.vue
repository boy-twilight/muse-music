<template>
  <div class="comment-container">
    <p class="title">精彩评论</p>
    <div
      class="comment"
      v-for="(item, order) in curList"
      :key="item.commentId"
      :class="{
        'none-border': order == curList.length - 1,
      }">
      <!-- 头像 -->
      <el-image
        :src="item.avatar"
        loading="lazy"
        class="left" />
      <div class="right">
        <!-- 昵称 -->
        <span class="nickname">{{ item.nickname }}</span>
        <!-- 评论时间 -->
        <p class="ip-time">
          <span class="comment-time"> {{ formatCommentTime(+item.time) }}</span>
          <span
            class="ip"
            v-if="item.ip"
            >来自{{ item.ip }}</span
          >
        </p>
        <!-- 评论内容 -->
        <p class="comment-content">
          {{ item.content }}
        </p>
        <!-- 点赞 -->
        <div class="like-count">
          <p
            @click="love(item.commentId)"
            v-prevent>
            <span class="iconfont_1 like">&#xe67c;</span>
            <span
              v-show="+item.likeCount > 0"
              class="count"
              >{{ item.likeCount }}</span
            >
          </p>
          <span class="reply">回复</span>
        </div>
        <!-- 打开回复区 -->
        <p
          @click="openReply(item.commentId)"
          v-if="item.reply && item.reply.length > 0"
          v-prevent
          class="get-reply">
          查看{{ item.reply?.length }}条回复<span
            class="iconfont"
            :class="{
              'is-rotate': activeId == item.commentId,
            }"
            >&#xe775;</span
          >
        </p>
        <!-- 评论区 -->
        <Transition name="show">
          <div
            class="reply-container"
            v-show="activeId == item.commentId"
            v-if="item.reply && item.reply.length > 0">
            <div
              class="reply-area"
              v-for="(reply, index) in item.reply"
              :key="reply.commentId"
              :class="{
                'none-border': index == item.reply.length - 1,
              }">
              <el-image
                :src="reply.avatar"
                loading="lazy"
                class="left" />
              <div class="right">
                <span class="nickname">{{ reply.nickname }}</span>
                <p class="ip-time">
                  <span class="comment-time">
                    {{ getRandomTime(item.time) }}</span
                  >
                  <span
                    class="ip"
                    v-if="reply.ip"
                    >来自{{ reply.ip }}</span
                  >
                </p>
                <p class="comment-content">
                  {{ reply.content }}
                </p>
                <div class="like-count">
                  <p @click="loveReply(item.commentId, index)">
                    <span class="iconfont_1 like">&#xe67c;</span>
                    <span
                      v-show="+reply.likeCount > 0"
                      class="count"
                      >{{ reply.likeCount }}</span
                    >
                  </p>
                  <span class="reply">回复</span>
                </div>
              </div>
            </div>
            <p
              @click="
                activeId = activeId == item.commentId ? '' : item.commentId
              "
              v-prevent
              class="collapse">
              收起 <span class="iconfont_1">&#xe655;</span>
            </p>
          </div>
        </Transition>
      </div>
    </div>
    <!-- 分页 -->
    <Pagination
      v-if="pageSize < total"
      :cur-page="curPage"
      :page-size="pageSize"
      :total="total"
      text="个评论"
      @page-change="pageChange" />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, inject } from 'vue';
import { Comment } from '@/model';
import { getTheme } from '@/utils/util';
import useConfigStore from '@/store/config';
import Pagination from '../pagination/Pagination.vue';

//配置主题
const config = useConfigStore();
const fontColor = getTheme().get('fontColor');
const fontBlack = getTheme().get('fontBlack');
const fontGray = inject('fontGray');
const boxShadow = getTheme().get('shadow');
const themeColor = getTheme().get('themeColor');
const replyBg = computed(() =>
  config.bgMode == 'skin' ? 'rgba(220,220,220,0.2)' : 'rgb(240,240,240)'
);

const props = defineProps<{
  comments: Comment[];
}>();

//评论id的映射
const mapper = computed(
  () => new Map(props.comments.map((item, index) => [item.commentId, index]))
);

//当前活跃的当评论
const activeId = ref<string>('');

//当前页数
const curPage = ref<number>(1);
//一页多少数据
const pageSize = ref<number>(20);
//当前展示的歌曲列表
const curList = computed(() =>
  props.comments.slice(
    (curPage.value - 1) * pageSize.value,
    curPage.value * pageSize.value
  )
);
//总的数据数
const total = computed(() => props.comments.length);
//页数变化
const pageChange = (page: number) => {
  curPage.value = page;
};

//获取一个随机评论时间
const getRandomTime = (time: string): string => {
  const random = Math.floor(
    Math.random() * Math.pow(10, 3) * 60 * 60 * 24 + Math.pow(10, 3) * 60 * 60
  );
  return formatCommentTime(random + +time);
};

//打开或关闭评论区
const openReply = async (commentId: string) => {
  if (activeId.value == commentId) {
    activeId.value = '';
  } else {
    if (activeId.value) {
      activeId.value = '';
      await nextTick();
      activeId.value = commentId;
    } else {
      activeId.value = commentId;
    }
  }
};

//点赞
const love = (commentId: string) => {
  //找到当前评论
  const curComment = props.comments[mapper.value.get(commentId) as number];
  const { isLove, likeCount } = curComment;
  curComment.likeCount = isLove ? +likeCount - 1 + '' : +likeCount + 1 + '';
  curComment.isLove = !isLove;
};

//点赞回复
const loveReply = (commentId: string, index: number) => {
  //找到这个子评论
  const curReply = (
    props.comments[mapper.value.get(commentId) as number].reply as Comment[]
  )[index];
  const { isLove, likeCount } = curReply;
  curReply.likeCount = isLove ? +likeCount - 1 + '' : +likeCount + 1 + '';
  curReply.isLove = !isLove;
};

//格式化时间
const formatCommentTime = (timeStap: number) => {
  const date: Date = new Date(timeStap);
  const year = date.getFullYear() + '年';
  const month = date.getMonth() + 1 + '月';
  const day = date.getDate() + '日';
  const hour =
    date.getHours() < 10 ? '0' + date.getHours() : date.getHours() + '';
  const minute =
    date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  return year + month + day + ' ' + hour + ':' + minute;
};
</script>

<style lang="less" scoped>
@font-color: v-bind(fontColor);
@font-color-light-black: v-bind(fontBlack);
@shadow: v-bind(boxShadow);
@reply-bg: v-bind(replyBg);
@font-color-gray: v-bind(fontGray);
@theme-color: v-bind(themeColor);
@color-gray: #7b7b7b;
@color-light-white: #e1e1e1;

.show-enter-from,
.show-leave-to {
  transform: scale(0);
}
.show-enter-to,
.show-leave-from {
  transform: scale(1);
}
.show-enter-active,
.show-leave-active {
  transition: 0.5s;
}

.none-border {
  border-bottom: none !important;
}

.is-rotate {
  transform: rotate(270deg) !important;
}

.comment-container {
  width: 80vw;
  display: flex;
  flex-direction: column;
  .title {
    font-size: 14px;
    color: @font-color;
    width: 80vw;
  }
  .pagination-container {
    margin-bottom: 20px;
  }

  .comment {
    padding: 20px 0;
    width: 80vw;
    border-bottom: 0.5px solid rgb(225, 225, 225);
    display: flex;
    .left {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }
    .right {
      flex: 1;
      margin-left: 15px;
      display: flex;
      flex-direction: column;

      .nickname {
        cursor: pointer;
        &:hover {
          color: @theme-color;
        }
        max-width: 300px;
      }

      .nickname,
      .comment-time,
      .get-reply,
      .ip {
        font-size: 13px;
        color: @font-color-gray;
      }
      .ip-time {
        margin: 0 0 12px 0;
        .ip {
          margin-left: 10px;
        }
        .comment-time {
          padding-top: 2px;
        }
      }

      .comment-content {
        font-size: 13px;
        color: @font-color;
        letter-spacing: 0.5px;
        line-height: 1.5;
      }

      .like-count {
        cursor: pointer;
        display: flex;
        align-items: flex-end;
        margin: 12px 0 5px 0;
        span {
          display: inline-block;
          height: 24px;
        }

        p {
          display: flex;
          align-items: flex-end;

          .like {
            font-size: 18px;
            color: @font-color;
          }
          .count {
            padding-top: 4.5px;
            font-size: 15px;
            margin-left: 6px;
            color: @font-color;
          }
          &:hover .like {
            color: @theme-color;
          }
          &:hover .count {
            color: @theme-color;
          }
        }

        .reply {
          font-size: 13px;
          padding-top: 6.5px;
          margin-left: 20px;
          color: @font-color-gray;
          &:hover {
            color: @theme-color;
          }
        }
      }

      .get-reply {
        margin-top: 5px;
        cursor: pointer;
        width: 105px;
        &:hover {
          color: @theme-color;
        }
        span {
          transition: 0.4s;
          display: inline-block;
          font-size: 14px;
          margin-left: 5px;
          transform: rotate(90deg);
        }
      }
      .reply-container {
        transition: 0.5s;
        margin-top: 10px;
        padding: 0 25px;
        border-radius: 5px;
        background-color: @reply-bg;
        transform-origin: top left;
        .reply-area {
          display: flex;
          padding: 20px 0;
          border-bottom: 0.5px solid rgb(210, 210, 210);
        }
        .collapse {
          margin: 10px 0 20px 0;
          width: 50px;
          height: 21px;
          cursor: pointer;
          &:hover {
            color: @theme-color;
          }
          font-size: 13px;
          color: @font-color-gray;
          .iconfont_1 {
            height: 20px;
            display: inline-block;
            font-size: 13px;
            transform: rotate(-180deg);
          }
        }
      }
    }
  }
}
</style>
