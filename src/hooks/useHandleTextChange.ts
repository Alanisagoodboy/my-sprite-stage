/**
 * 文本传输钩子
 */
import { watch,nextTick,type Ref } from "vue";
import EditDiv from "../components/common/edit-div.vue";
import { ISprite } from "../components/meta-data/types";
export default function useHandleTextChange(
  props: Readonly<{ sprite: ISprite<any> }> & {},
  emits: (event: "updateSprite", ...args: any[]) => void,
  editDivRef: Ref<InstanceType<typeof EditDiv> | null>,
) {
  // 进入文本编辑模式
  async function toEdit() {
    // editDivRef.value!.handleBlur();
    // await nextTick()
    editDivRef.value!.changeMode(true);
  }

  watch(
    () => props.sprite.mode,
    (val) => {
      if (val === "edit") {
        toEdit();
      }
    }
  );

  function handleTextChange(info: any) {
    emits("updateSprite", {
      id: props.sprite.id,
      stateSet: [
        {
          path: "attrs.content",
          value: info.content,
        },
        {
          path: "mode",
          value: info.contenteditable ? "edit" : "default",
        },
      ],
    });
  }

  return {
    toEdit,
    handleTextChange,
  };
}
