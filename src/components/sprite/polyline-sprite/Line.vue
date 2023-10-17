<template>
  <line
    :x1="0"
    :y1="0"
    :x2="0"
    :y2="0"
    stroke="#999"
    stroke-width="2"
    v-bind="sprite.props"
  />
</template>

<script setup lang="ts">
import { type ISprite } from "../../../components/meta-data/types";
defineProps<{
  sprite: ISprite;
}>();
</script>
