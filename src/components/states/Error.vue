
<template>
  <div class="error">
    <img src="@/assets/icon-error.svg" alt="Error" />
    <div>Mechaniku, brak przejazdu!</div>
    <div class="error-message">{{ error }}</div>
  </div>
</template>

<script>
export default {
  props: ["error"]
};
</script>

<style lang="scss" scoped>
.error {
  display: flex;
  justify-content: center;
  align-items: center;

  flex-direction: column;

  font-size: calc(1rem + 1.5vw);
  font-weight: 550;

  color: #ff1919;

  img {
    margin-bottom: 1rem;
    width: 200px;
  }

  &-message {
    font-size: 0.6em;
  }
}
</style>