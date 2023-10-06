<template>
  <Stage width="800" height="400">

    <Rect v-for="(item,index) of list" v-bind="item" @mousedown="handleSelect(index)">
      <text fill="#000">{{ index }} </text>
    </Rect>
    <!-- <Sprite  :x="0" :y="0" :width="100" :height="100">
      <Rect :x="0" :y="0" :width="100" :height="100" />
    </Sprite>

    <Sprite :x="100" :y="100" :width="100" :height="100">
      <Rect :x="0" :y="0" :width="100" :height="100" />
    </Sprite> -->

    <Sprite v-bind="dragInfo" @move="move" :key="activeIndex"></Sprite>
  </Stage>
</template>
<script setup lang="ts">
import Stage from './components/stage/index.vue';
import Sprite from './components/sprite/sprite.vue';
import Rect from './components/sprite/rect/index.vue';
import { ref ,computed, nextTick} from 'vue';

const list = ref([
  {
    x: 30,
    y: 30,
    width: 100,
    height: 100
  },
  {
    x: 150,
    y: 150,
    width: 50,
    height: 50
  }
])

const dragInfo = computed(()=>{
  console.log(dragInfo.value);
  
  return list.value[activeIndex.value]
})

// const dragData = ref(list.value[0])
const activeIndex = ref(0)


function move(info) {
  // dragData.value = info
  list.value[activeIndex.value].x = info.x
  list.value[activeIndex.value].y = info.y
  list.value[activeIndex.value].width = info.width
  list.value[activeIndex.value].height = info.height
}

function handleSelect(index) {

  nextTick(()=>{
    activeIndex.value = index
  })
  console.log(activeIndex.value, 'activeIndex.value');
  console.log(dragInfo, 'dragInfo');
  
}
defineOptions({
  name: 'NewPage',
});
</script>

<style lang="scss" scoped></style>
