import { Directive } from 'vue';

//阻止浏览器默认行为
export const vPrevent: Directive<HTMLElement> = (element) => {
  element.onmousedown = () => {
    return false;
  };
};
