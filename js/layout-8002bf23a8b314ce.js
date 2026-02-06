(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[3185],  {
  8959:function(e, t, n) {
  Promise.resolve().then(n.bind(n, 7530))
}
, 7530:function(e, t, n) {
  "use strict";
n.r(t), n.d(t,  {
  default:function() {
  return h
}
}
);
var s=n(7437), a=n(2265), o=n(6463);
let c=()=> {
  let e=(0, o.usePathname)(), [t, s]=(0, a.useState)(null);
return(0, a.useEffect)(()=>((async()=> {
   {
  let e=new(await n.e(9605).then(n.t.bind(n, 9605, 23))).default.WOW( {
  boxClass:"wow", animateClass:"animated", offset:0, mobile:!0, live:!0
}
);
e.init(), s(e)
}
}
)(), ()=> {
  t&&t.stop()
}
), []), (0, a.useEffect)(()=> {
  t&&t.sync()
}
, [e, t]), t
}
;
var i=()=> {
  (0, a.useEffect)(()=> {
  let e=e=> {
  document.querySelectorAll(".magnetic-item").forEach(t=> {
  let n=t.getBoundingClientRect(), s=n.left+n.width/4, a=n.top+n.height/4, o=e.clientX-s, c=e.clientY-a;
Math.abs(o)<=n.width/3&&Math.abs(c)<=n.height/3?(t.style.transform="translate3d(".concat(.03*o, "px,  ").concat(.03*c, "px,  0)"), t.style.transition="transform 0.3s ease"):t.style.transform="translate3d(0,  0,  0)"
}
)
}
, t=e=> {
  let t=document.querySelector(".magnetic-item");
t&&(t.style.transition="0.3s ease")
}
, n=e=> {
  let t=document.querySelector(".magnetic-item");
t&&(t.style.transform="translate3d(0,  0,  0)", t.style.transition="0.3s ease", setTimeout(()=> {
  t.style.transition="none"
}
, 300))
}
;
return document.addEventListener("mousemove", e), document.addEventListener("mouseenter", t), document.addEventListener("mouseleave", n), ()=> {
  document.removeEventListener("mousemove", e), document.removeEventListener("mouseenter", t), document.removeEventListener("mouseleave", n)
}
}
, [])
}
, r=n(6846), l=n.n(r), d=n(6862), u=n.n(d);
n(4831), n(2394), n(6651), n(1756), n(9486), n(3660), n(3542), n(9697), n(1043), n(3995), n(7342);
var m=()=> {
  let[e, t]=(0, a.useState)(!1);
(0, a.useEffect)(()=> {
  "dark"===localStorage.getItem("theme")&&(t(!0), document.body.classList.add("dark"))
}
, []);
let n=()=> {
  t(!e), localStorage.setItem("theme", e?"light":"dark"), document.body.classList.toggle("dark", !e)
}
;
return(0, s.jsxs)("div",  {
  className:"tt-style-switch d-lg-flex d-none", children:[(0, s.jsx)("span",  {
  className:"dark ".concat(e?"active":""), onClick:()=> {
  e||n()
}
, children:"Dark"
}
), (0, s.jsx)("span",  {
  className:"light ".concat(e?"":"active"), onClick:()=> {
  e&&n()
}
, children:"Light"
}
)]
}
)
}
, f=()=> {
  let[e, t]=(0, a.useState)(!1), [n, o]=(0, a.useState)(0);
return(0, a.useEffect)(()=> {
  let e=()=> {
  let e=document.documentElement.scrollTop;
o(e/(document.documentElement.scrollHeight-document.documentElement.clientHeight)*100), e>800?t(!0):e<=100&&t(!1)
}
;
return window.addEventListener("scroll", e), ()=> {
  window.removeEventListener("scroll", e)
}
}
, []), (0, s.jsx)("div",  {
  className:"circle-container ".concat(e?"active":""), onClick:()=> {
  window.scrollTo( {
  top:0, behavior:"smooth"
}
)
}
, children:(0, s.jsx)("svg",  {
  className:"circle-progress svg-content", width:"100%", height:"100%", viewBox:"-1 -1 102 102", children:(0, s.jsx)("path",  {
  d:"M50, 1 a49, 49 0 0, 1 0, 98 a49, 49 0 0, 1 0, -98", style: {
  strokeDasharray:"".concat(307.919), strokeDashoffset:"".concat(307.919-n/100*307.919), transition:"stroke-dashoffset 50ms linear"
}
}
)
}
)
}
)
}
;
function h(e) {
  let {
  children:t
}
=e;
return(0, o.usePathname)(), i(), c(), (0, a.useEffect)(()=> {
  n(7160)
}
, []), (0, s.jsxs)("html",  {
  lang:"en", children:[(0, s.jsxs)("head",  {
  children:[(0, s.jsx)("link",  {
  rel:"icon", href:"/assets/img/fav-icon.svg", type:"image/x-icon", sizes:"16x16"
}
), (0, s.jsx)("meta",  {
  name:"description", content:"Your description here"
}
), (0, s.jsx)("meta",  {
  name:"keywords", content:"next.js,  SEO,  meta tags"
}
), (0, s.jsx)("title",  {
  children:"Artmart - Art & Auction NextJS Template."
}
)]
}
), (0, s.jsxs)("body",  {
  id:"body", className:" ".concat(l().variable, " ").concat(u().variable), children:[(0, s.jsx)(m,  {
}
), (0, s.jsx)(f,  {
}
), t]
}
)]
}
)
}
}
, 3660:function() {
}
, 4831:function() {
}
, 1043:function() {
}
, 2394:function() {
}
, 3542:function() {
}
, 9486:function() {
}
, 9697:function() {
}
, 3995:function() {
}
, 6651:function() {
}
}
, function(e) {
  e.O(0, [3892, 5, 5652, 5028, 5321, 3668, 6734, 2971, 7023, 1744], function() {
  return e(e.s=8959)
}
), _N_E=e.O()
}
]);


// >>> SITE-RESTORE PATCH (added by assistant)
// Hides the floating circle if it is mis-positioned, provides fallback CSS vars,
// and fixes common broken image src paths at runtime.
(function(){
  try{
    function hideCircle() {
      try {
        var c = document.querySelector('.circle-container');
        if (c) c.style.display = 'none';
      } catch(e){}
    }
    function ensureCssVars(){
      try{
        var root = document.documentElement;
        var vars = {
          '--white-color':'#ffffff',
          '--title-color':'#111111',
          '--primary-color':'#e94560',
          '--text-color':'#333333',
          '--border-color':'#e6e6e6'
        };
        for(var k in vars){
          if (!getComputedStyle(root).getPropertyValue(k).trim()){
            root.style.setProperty(k, vars[k]);
          }
        }
      } catch(e) {}
    }
    function fixImgSrcs(){
      try{
        var imgs = document.querySelectorAll('img');
        imgs.forEach(function(img){
          if(!img.src) return;
          if(img.src.indexOf('bultimore.com') !== -1){
            var newSrc = img.src.replace(/(\.\/)?bultimore\.com[\/\\]?/g, './assets/');
            newSrc = newSrc.replace(/(^|\/)\.\//g, '/');
            if(newSrc && newSrc !== img.src){
              try{ img.src = newSrc; }catch(e){}
            }
          }
        });
      } catch(e) {}
    }
    function runPatch(){
      hideCircle();
      ensureCssVars();
      fixImgSrcs();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runPatch);
    } else {
      runPatch();
    }
    window.addEventListener('load', runPatch);
  }catch(e){
    console && console.error && console.error('Site-restore patch error', e);
  }
})();
// <<< END SITE-RESTORE PATCH
