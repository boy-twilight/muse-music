<template>
  <div
    class="music-bits"
    :class="{
      'show-animation': isPlay && show,
    }">
    <div
      :class="{
        animation1: isPlay && show,
      }"></div>
    <div
      :class="{
        animation2: isPlay && show,
      }"></div>
    <div
      :class="{
        animation3: isPlay && show,
      }"></div>
    <div
      :class="{
        animation4: isPlay && show,
      }"></div>
    <div
      :class="{
        animation5: isPlay && show,
      }"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import useFooterStore from '@/store/footer';

const props = defineProps<{
  showAnimation: boolean;
}>();

const footer = useFooterStore();
const { isPlay } = storeToRefs(footer);

// 是否展示动画
const show = computed(() => props.showAnimation);
</script>

<style lang="less" scoped>
.show-animation {
  opacity: 1 !important;
}

.music-bits {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  position: absolute;
  right: 2px;
  height: 15px;
  width: 30px;
  opacity: 0;
}

.music-bits {
  div {
    height: 5.5px;
    width: 2.5px;
    margin-right: 2px;
    transform-origin: bottom center;
    background-color: #ffffff;
    &:last-child {
      margin-right: 0;
    }
  }
}

.animation1 {
  animation: rhythm1 0.8s ease-in-out infinite;
}

.animation2 {
  animation: rhythm2 0.8s ease-in-out 0.2s infinite;
}

.animation3 {
  animation: rhythm3 0.8s ease-in-out 0.4s infinite;
}

.animation4 {
  animation: rhythm4 0.8s ease-in-out 0.6s infinite;
}

.animation5 {
  animation: rhythm5 0.8s ease-in-out 0.8s infinite;
}

@keyframes rhythm1 {
  0% {
    transform: scaleY(1);
  }
  20% {
    transform: scaleY(2);
  }
  50% {
    transform: scaleY(0.7);
  }
  75% {
    transform: scaleY(1.5);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes rhythm2 {
  0% {
    transform: scaleY(1);
  }
  20% {
    transform: scaleY(1.8);
  }
  50% {
    transform: scaleY(0.9);
  }
  75% {
    transform: scaleY(1.3);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes rhythm3 {
  0% {
    transform: scaleY(1);
  }
  20% {
    transform: scaleY(2.5);
  }
  50% {
    transform: scaleY(0.6);
  }
  75% {
    transform: scaleY(1.8);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes rhythm4 {
  0% {
    transform: scaleY(1);
  }
  20% {
    transform: scaleY(1.2);
  }
  50% {
    transform: scaleY(0.8);
  }
  75% {
    transform: scaleY(1.4);
  }
  100% {
    transform: scaleY(1);
  }
}

@keyframes rhythm5 {
  0% {
    transform: scaleY(1);
  }
  20% {
    transform: scaleY(1.6);
  }
  50% {
    transform: scaleY(1.1);
  }
  75% {
    transform: scaleY(2);
  }
  100% {
    transform: scaleY(1);
  }
}
</style>
