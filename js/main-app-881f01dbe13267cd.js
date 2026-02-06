(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1744],  {
  8391:function(e, n, t) {
  Promise.resolve().then(t.t.bind(t, 5751, 23)), Promise.resolve().then(t.t.bind(t, 6513, 23)), Promise.resolve().then(t.t.bind(t, 6130, 23)), Promise.resolve().then(t.t.bind(t, 9275, 23)), Promise.resolve().then(t.t.bind(t, 5324, 23)), Promise.resolve().then(t.t.bind(t, 1343, 23))
}
}
, function(e) {
  var n=function(n) {
  return e(e.s=n)
}
;
e.O(0, [2971, 7023], function() {
  return n(1028), n(8391)
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
