<!-- 文本精灵 -->
<template>
  <g>
    <foreignObject
      :width="sprite.boundingBox.width"
      :height="sprite.boundingBox.height"
    >
      <EditDiv
        ref="editDivRef"
        :content="sprite.attrs.content"
        size-type="fit-content"
        @text-change="handleTextChange"
      />
    </foreignObject>
  </g>
</template>

<script setup lang="ts">
import EditDiv from "../../common/edit-div.vue";
import { ISprite } from "../../meta-data/types";

import useHandleTextChange from "../../../hooks/useHandleTextChange.ts";

defineOptions({
  name: "text-sprite",
});

const props = defineProps<{
  sprite: ISprite;
}>();
const emits = defineEmits(["updateSprite"]);
const editDivRef = ref<InstanceType<typeof EditDiv> | null>(null);
const { handleTextChange } = useHandleTextChange(props, emits, editDivRef);
</script>

<style scoped></style>
