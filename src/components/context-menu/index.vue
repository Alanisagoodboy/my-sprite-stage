<template>
  <Teleport to="body">
    <div
      v-show="isShowMenu"
      class="contextmenu"
      :style="{
        left: (point.x || 0) + 'px',
        top: (point.y || 0) + 'px',
      }"
    >
      <ul>
        <li v-for="menu of menuList" :key="menu.value" @mousedown="menuClick(menu)">
          {{ menu.label }}
        </li>
      </ul>
      <!-- <ul @mouseup="menuClick">
        <template v-if="menuClick">
          <template v-if="!menuClick.isLock">
            <li @click="menuClick">复制</li>
            <li @click="menuClick">粘贴</li>
            <li @click="menuClick">剪切</li>
            <li @click="menuClick">删除</li>
            <li @click="menuClick">锁定</li>
            <li @click="menuClick">置顶</li>
            <li @click="menuClick">置底</li>
            <li @click="menuClick">上移</li>
            <li @click="menuClick">下移</li>
          </template>
          <li v-else @click="menuClick">解锁</li>
        </template>
        <li v-else @click="menuClick">粘贴</li>
      </ul> -->
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref, nextTick } from "vue";
const props = defineProps<{
  target: HTMLElement;
  menuList: any[];
}>();

const emits = defineEmits(["menu-item-click"]);
// 菜单显示的位置
const point = reactive<ICoordinate>({
  x: 0,
  y: 0,
});

const isShowMenu = ref(false);

function setIsShowMenu(val: boolean) {
  isShowMenu.value = val;
}

function menuClick(menu: any) {
  // alert('kkk')
  setIsShowMenu(false);
  emits("menu-item-click", menu);
}

onMounted(async () => {
  await nextTick();
  props.target.addEventListener("contextmenu", contextmenu);
  document.addEventListener("mousedown", handleClick);
});
onUnmounted(() => {
  props.target.removeEventListener("contextmenu", contextmenu);
  document.removeEventListener("mousedown", handleClick);
});

function handleClick(params: type) {
  setIsShowMenu(false);
}

function contextmenu(e: MouseEvent) {
  // 禁用默认菜单
  e.preventDefault();

  setIsShowMenu(true);
  point.x = e.clientX;
  point.y = e.clientY;
}
</script>

<style scoped>
.contextmenu {
  position: fixed;
  /* overflow: visible; */
  left: 0;
  top: 0;
}
ul {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin: 5px 0;
  padding: 6px 0;
}
li {
  font-size: 14px;
  padding: 0 20px;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #606266;
  height: 34px;
  line-height: 34px;
  box-sizing: border-box;
  cursor: pointer;
}
li:hover {
  background-color: #f5f7fa;
}
</style>
