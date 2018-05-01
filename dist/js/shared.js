"use strict";var responsiveBreakPoints=[{media:{minwidth:0,maxwidth:500},srcset:[{imgSuffix:"small",imgCondition:"450w"}],sizes:[]},{media:{minwidth:501,maxwidth:850},srcset:[{imgSuffix:"medium",imgCondition:"550w"}],sizes:[]},{media:{minwidth:851,maxwidth:null},srcset:[{imgSuffix:"large",imgCondition:"800w"}],sizes:[]}],responsiveImage=function(i){document.createElement("figure");var e=document.createElement("picture"),t=!0,a=!1,m=void 0;try{for(var r,d=responsiveBreakPoints[Symbol.iterator]();!(t=(r=d.next()).done);t=!0){var n=r.value,s=document.createElement("source");s.className="lazy",s.media="",n.media.maxwidth&&n.media.minwidth?s.media+="(min-width: "+n.media.minwidth+"px) and (max-width: "+n.media.maxwidth+"px)":(n.media.minwidth&&(s.media+="(min-width: "+n.media.minwidth+"px)"),n.media.maxwidth&&(s.media+="(max-width: "+n.media.maxwidth+"px)"));var o=[],l=!0,h=!1,u=void 0;try{for(var w,c=n.srcset[Symbol.iterator]();!(l=(w=c.next()).done);l=!0){var f=w.value;"small"!==f.imgSuffix&&o.push(DBHelper.imageUrlForRestaurant(i,f.imgSuffix)+"  "+f.imgCondition)}}catch(i){h=!0,u=i}finally{try{!l&&c.return&&c.return()}finally{if(h)throw u}}0<o.length&&(s.dataset.srcset=o.join(o,","),e.append(s))}}catch(i){a=!0,m=i}finally{try{!t&&d.return&&d.return()}finally{if(a)throw m}}};
//# sourceMappingURL=shared.js.map