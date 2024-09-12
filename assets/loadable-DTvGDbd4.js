import{b9 as t,ba as s}from"./index-r0Ml_rWi.js";/*!
 * All material copyright ESRI, All Rights Reserved, unless otherwise specified.
 * See https://github.com/Esri/calcite-design-system/blob/dev/LICENSE.md for details.
 * v2.12.0
 */const n=new WeakMap,o=new WeakMap;function p(e){o.set(e,new Promise(a=>n.set(e,a)))}function c(e){n.get(e)()}function r(e){return o.get(e)}async function m(e){if(await r(e),!!t())return s(e),new Promise(a=>requestAnimationFrame(()=>a()))}export{c as a,m as c,p as s};
