import{b7 as i}from"./index-r0Ml_rWi.js";/*!
 * All material copyright ESRI, All Rights Reserved, unless otherwise specified.
 * See https://github.com/Esri/calcite-design-system/blob/dev/LICENSE.md for details.
 * v2.12.0
 */const h={arrow:"calcite-floating-ui-arrow",arrowStroke:"calcite-floating-ui-arrow__stroke"},w={width:12,height:6,strokeWidth:1},$=({floatingLayout:n,key:c,ref:l})=>{const{width:t,height:o,strokeWidth:r}=w,e=t/2,a=n==="vertical",s=`M0,0 H${t} L${t-e},${o} Q${e},${o} ${e},${o} Z`;return i("svg",{"aria-hidden":"true",class:h.arrow,height:t,key:c,ref:l,viewBox:`0 0 ${t} ${t+(a?0:r)}`,width:t+(a?r:0)},r>0&&i("path",{class:h.arrowStroke,d:s,fill:"none","stroke-width":r+1}),i("path",{d:s,stroke:"none"}))};export{$ as F};
