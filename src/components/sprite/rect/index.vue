<template>
  <rect x="0" y="0" :width="width" :height="height" fill="#398cfe" stroke-width="3" ><slot/></rect>
</template>
<script setup lang="ts">
defineOptions({
  name: 'NewPage',
});

defineProps({
  width: Number,
  height: Number,
});
</script>

<style lang="scss" scoped></style>
