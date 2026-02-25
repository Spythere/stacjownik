<template>
  <div class="player-avatar">
    <img
      v-if="avatarId"
      v-show="avatarLoadingStatus == Status.Data.Loaded"
      :src="avatarSrc"
      class="player-avatar-image"
      ref="avatarImageRef"
      alt="player image"
      @load="onAvatarLoadSuccess"
      @error="onAvatarLoadError"
    />

    <img
      v-if="avatarLoadingStatus == Status.Data.Error || avatarId == 0"
      class="img-placeholder"
      height="100"
      src="/images/default-avatar.jpg"
    />

    <Loading v-else-if="avatarLoadingStatus == Status.Data.Loading || avatarId === undefined" />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { Status } from '../../typings/common';
import Loading from '../Global/Loading.vue';

const props = defineProps({
  avatarId: {
    type: Number
  }
});

const avatarSrc = computed(
  () => `https://td2.info.pl/index.php?action=dlattach;attach=${props.avatarId};type=avatar`
);

const avatarImageRef = ref<HTMLImageElement | null>(null);
const avatarLoadingStatus = ref<Status.Data>(Status.Data.Loading);

function onAvatarLoadSuccess() {
  if (!avatarImageRef.value) return;

  avatarLoadingStatus.value = Status.Data.Loaded;
  avatarImageRef.value.style.opacity = '1';
}

function onAvatarLoadError() {
  if (!avatarImageRef.value) return;

  avatarLoadingStatus.value = Status.Data.Error;
  avatarImageRef.value.src = '/images/default-avatar.jpg';
  avatarImageRef.value.style.opacity = '1';
}
</script>

<style lang="scss" scoped>
.player-avatar {
  display: flex;
  justify-content: center;
  align-items: center;

  position: relative;
  min-height: 110px;

  .loading {
    top: 50%;
    margin: 0;
  }

  img.player-avatar-image {
    opacity: 0;
  }
}
</style>
