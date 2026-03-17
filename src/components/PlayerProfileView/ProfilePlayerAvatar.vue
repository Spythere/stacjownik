<template>
  <div class="player-avatar">
    <img
      v-if="props.playerTD2Info && props.playerTD2Info.avatar"
      :src="`https://td2.info.pl/index.php?action=dlattach;attach=${props.playerTD2Info.avatar};type=avatar`"
      class="player-avatar-image"
      ref="avatarImageRef"
      alt="player image"
      @load="onAvatarLoadSuccess"
      @error="onAvatarLoadError"
    />

    <img
      v-if="
        avatarLoadingStatus == Status.Data.Error ||
        (props.playerTD2Info && !props.playerTD2Info.avatar)
      "
      class="img-placeholder"
      height="100"
      src="/images/default-avatar.jpg"
    />

    <Loading v-else-if="avatarLoadingStatus == Status.Data.Loading" />
  </div>
</template>

<script lang="ts" setup>
import { PropType, ref, useTemplateRef } from 'vue';
import { Status } from '../../typings/common';
import Loading from '../Global/Loading.vue';
import { Td2API } from '../../typings/api';

const props = defineProps({
  playerTD2Info: {
    type: Object as PropType<Td2API.UsersInfoByName.UserInfo>
  }
});

const avatarImageRef = useTemplateRef('avatarImageRef');
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
