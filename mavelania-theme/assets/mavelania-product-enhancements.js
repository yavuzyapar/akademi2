document.addEventListener('DOMContentLoaded',function(){
  var form=document.querySelector('[data-product-form]'),root=document.querySelector('[data-product-root]');if(!form||!root)return;
  if(root.dataset.mvEnhanced)return;root.dataset.mvEnhanced='1';
  var moneyFormat=root.dataset.moneyFormat||'${{amount}}';
  function mvMoney(cents){
    var value=(cents||0)/100;
    return moneyFormat.replace(/\{\{\s*(\w+)\s*\}\}/g,function(_,name){
      var decimals=name.indexOf('no_decimals')>-1?0:2;
      var comma=name.indexOf('comma_separator')>-1;
      var n=value.toFixed(decimals);
      var parts=n.split('.');
      parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,comma?'.':',');
      return parts.length>1?parts[0]+(comma?',':'.')+parts[1]:parts[0];
    });
  }
  var mvPriceMap={};
  try{
    // Built from the variant JSON; the duplicate price block it used to read
    // was removed so each price ships once.
    JSON.parse(root.querySelector('[data-product-json]').textContent||'[]').forEach(function(v){
      var entry={price:mvMoney(v.price)};
      if(v.compare_at_price&&v.compare_at_price>v.price)entry.compare_at_price=mvMoney(v.compare_at_price);
      mvPriceMap[v.id]=entry;
    });
  }catch(e){mvPriceMap={}}
  var description=root.querySelector('.mv-product-description');
  if(description&&!description.closest('details')){var trust=document.createElement('div');trust.className='mv-product-trust';trust.innerHTML='<span>'+(root.dataset.trust1||'Genuine leather')+'</span><span>'+(root.dataset.trust2||'Handmade')+'</span><span>'+(root.dataset.trust3||'Secure payment')+'</span>';var details=document.createElement('details');details.className='mv-product-details';details.innerHTML='<summary>'+(root.dataset.detailsLabel||'Details')+'</summary>';description.parentNode.insertBefore(trust,description);description.parentNode.insertBefore(details,description);details.appendChild(description)}
  var select=Array.prototype.slice.call(form.querySelectorAll('select')).find(function(item){var label=form.querySelector('label[for="'+item.id+'"]');return /color|colour/i.test(item.name+' '+(label?label.textContent:''))});
  if(select){
    // Colour names are resolved by assets/mavelania-colors.js (window.MvColors),
    // which the product cards use too.
    var MvColors=window.MvColors||{resolve:function(){return'#9a7a63'},finish:function(){return''},luminance:function(){return 0}};
    var key=MvColors.resolve,lum=MvColors.luminance,finishOf=function(raw){return MvColors.finish(raw)};
    var productJson=root.querySelector('[data-product-json]');
    var variantList=[];try{variantList=JSON.parse(productJson.textContent)||[]}catch(e){variantList=[]}
    var optIndex=Array.prototype.slice.call(form.querySelectorAll('select')).indexOf(select);
    var imageFor=function(value,text){
      for(var i=0;i<variantList.length;i++){var v=variantList[i],ov=v.options&&optIndex>-1?v.options[optIndex]:null;
        if((String(ov)===String(text)||String(v.id)===String(value))&&v.featured_image&&v.featured_image.src)return v.featured_image.src}
      return null};
    var sampleCacheKey='mv-swatch-cache';
    var sampleCache={};
    try{sampleCache=JSON.parse(sessionStorage.getItem(sampleCacheKey)||'{}')}catch(e){sampleCache={}}
    var saveSampleCache=function(){try{sessionStorage.setItem(sampleCacheKey,JSON.stringify(sampleCache))}catch(e){}};
    var idle=window.requestIdleCallback||function(fn){return setTimeout(function(){fn({timeRemaining:function(){return 8}})},240)};

    var sample=function(url,cb){
      if(sampleCache[url]){cb(sampleCache[url]);return}
      idle(function(){sampleNow(url,function(c){if(c){sampleCache[url]=c;saveSampleCache()}cb(c)})});
    };
    var sampleNow=function(url,cb){
      var img=new Image();img.crossOrigin='anonymous';
      img.onload=function(){
        try{
          var n=56,cv=document.createElement('canvas');cv.width=n;cv.height=n;
          var ctx=cv.getContext('2d');ctx.drawImage(img,0,0,n,n);
          var d=ctx.getImageData(0,0,n,n).data,bins={},bin,px;
          for(var i=0;i<d.length;i+=4){
            var r=d[i],g=d[i+1],b=d[i+2],a=d[i+3];
            if(a<200)continue;
            if(r>231&&g>231&&b>231)continue;
            bin=(r>>5)+','+(g>>5)+','+(b>>5);
            px=bins[bin]||(bins[bin]={n:0,r:0,g:0,b:0});
            px.n++;px.r+=r;px.g+=g;px.b+=b}
          var top=null;
          for(var k in bins){if(!top||bins[k].n>top.n)top=bins[k]}
          if(!top||top.n<40)return cb(null);
          var out=[Math.round(top.r/top.n),Math.round(top.g/top.n),Math.round(top.b/top.n)];
          cb('#'+out.map(function(x){return('0'+Math.max(0,Math.min(255,x)).toString(16)).slice(-2)}).join(''))
        }catch(e){cb(null)}};
      img.onerror=function(){cb(null)};
      img.src=url+(url.indexOf('?')>-1?'&':'?')+'width=80'};
    select.classList.add('mv-color-native');
    var swatches=document.createElement('div');
    swatches.className='mv-color-swatches';
    swatches.setAttribute('role','radiogroup');
    var optionLabel=form.querySelector('label[for="'+select.id+'"]');
    swatches.setAttribute('aria-label',(optionLabel&&optionLabel.textContent.trim())||root.dataset.colorLabel||'Color');
    var labelOut=document.createElement('span');
    labelOut.className='mv-color-swatch-label';

    var buttons=[];
    Array.prototype.forEach.call(select.options,function(option){
      var button=document.createElement('button');
      var tones=key(option.textContent);
      button.type='button';
      button.className='mv-color-swatch';
      button.setAttribute('role','radio');
      button.setAttribute('aria-checked','false');
      button.tabIndex=-1;
      button.dataset.value=option.value;
      button.setAttribute('aria-label',option.textContent);
      var paint=function(c){
        button.style.setProperty('--swatch',c);
        button.dataset.light=String(c.indexOf('gradient')<0&&lum(c)>0.36);
      };
      paint(tones);
      var finish=finishOf(String(option.textContent||'').toLowerCase());
      // Solid colours only: on a gradient swatch the texture layer would
      // paint over the colour.
      if(finish&&String(tones).indexOf('#')===0)button.dataset.finish=finish;
      if(tones==='#9a7a63'){
        var src=imageFor(option.value,option.textContent);
        if(src)sample(src,function(c){if(c)paint(c)});
      }
      button.addEventListener('click',function(){choose(option.value)});
      buttons.push(button);
      swatches.appendChild(button);
    });

    function choose(value,focusIt){
      select.value=value;
      select.dispatchEvent(new Event('change',{bubbles:true}));
      if(focusIt){
        var target=buttons.filter(function(b){return b.dataset.value===value})[0];
        if(target)target.focus();
      }
    }

    // Arrow-key navigation: radio group behaviour (roving tabindex)
    var NEXT={ArrowRight:1,ArrowDown:1,Right:1,Down:1},PREV={ArrowLeft:-1,ArrowUp:-1,Left:-1,Up:-1};
    swatches.addEventListener('keydown',function(event){
      var step=NEXT[event.key]||PREV[event.key];
      var index=buttons.indexOf(document.activeElement);
      if(index<0)return;
      if(step){
        event.preventDefault();
        var next=(index+step+buttons.length)%buttons.length;
        choose(buttons[next].dataset.value,true);
        return;
      }
      if(event.key==='Home'){event.preventDefault();choose(buttons[0].dataset.value,true);return}
      if(event.key==='End'){event.preventDefault();choose(buttons[buttons.length-1].dataset.value,true);return}
      if(event.key===' '||event.key==='Enter'){event.preventDefault();choose(buttons[index].dataset.value)}
    });

    select.after(swatches,labelOut);

    var syncSwatches=function(){
      var current=select.options[select.selectedIndex];
      labelOut.textContent=current?current.textContent:'';
      buttons.forEach(function(button){
        var on=button.dataset.value===select.value;
        button.setAttribute('aria-checked',String(on));
        button.tabIndex=on?0:-1;
      });
      // if nothing is selected, still leave one entry point into the group
      if(!buttons.some(function(b){return b.tabIndex===0})&&buttons[0])buttons[0].tabIndex=0;
    };
    select.addEventListener('change',syncSwatches);
    syncSwatches();

    var syncAvailability=function(){
      buttons.forEach(function(button){
        var option=Array.prototype.filter.call(select.options,function(o){return o.value===button.dataset.value})[0];
        var out=!!(option&&option.dataset.unavailable==='true');
        button.dataset.unavailable=String(out);
        button.setAttribute('aria-disabled',String(out));
      });
    };
    root.addEventListener('mv:options-updated',syncAvailability);
    setTimeout(syncAvailability,0)
  }
  var bar=document.querySelector('[data-mobile-buybar]'),quantity=form.querySelector('[name="quantity"]'),variantId=form.querySelector('[name="id"]'),add=form.querySelector('[data-add-button]');
  if(bar&&quantity&&variantId&&add){var variants=JSON.parse(root.querySelector('[data-product-json]').textContent),price=bar.querySelector('[data-mobile-price]'),out=bar.querySelector('[data-mobile-quantity]'),minus=bar.querySelector('[data-mobile-decrease]'),plus=bar.querySelector('[data-mobile-increase]'),mobileAdd=bar.querySelector('[data-mobile-add]'),formatter=null;var syncBar=function(){var v=variants.find(function(item){return String(item.id)===String(variantId.value)});var q=Math.max(1,parseInt(quantity.value,10)||1);if(!v){price.textContent='';out.textContent=q;minus.disabled=q===1;mobileAdd.disabled=true;mobileAdd.textContent=root.dataset.unavailableLabel||root.dataset.soldLabel||'Unavailable';return}price.textContent=q===1&&mvPriceMap[v.id]&&mvPriceMap[v.id].price?mvPriceMap[v.id].price:mvMoney(v.price*q);out.textContent=q;minus.disabled=q===1;mobileAdd.disabled=!v.available||add.disabled;mobileAdd.textContent=mobileAdd.disabled?(root.dataset.soldLabel||'Sold out'):(root.dataset.addLabel||'Add to bag')};minus.addEventListener('click',function(){quantity.value=Math.max(1,(parseInt(quantity.value,10)||1)-1);quantity.dispatchEvent(new Event('change',{bubbles:true}))});plus.addEventListener('click',function(){quantity.value=(parseInt(quantity.value,10)||1)+1;quantity.dispatchEvent(new Event('change',{bubbles:true}))});mobileAdd.addEventListener('click',function(){add.click()});form.addEventListener('change',function(){setTimeout(syncBar,40)});syncBar()}
  // The bag drawer lives in snippets/cart-drawer.liquid and is driven by
  // mavelania-shop.js (window.MvCart) so it works on every page, not only
  // here. Without it the form simply posts to the bag page as usual.
  form.addEventListener('submit',function(event){
    if(!event.submitter||event.submitter.name!=='add')return;
    if(!form.querySelector('[name="id"]').value)return;
    if(!window.MvCart)return;
    event.preventDefault();
    window.MvCart.add(new FormData(form),event.submitter)
      .catch(function(){HTMLFormElement.prototype.submit.call(form)});
  },true);
});


document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-product-root]').forEach(function (root) {
    var mainMedia = root.querySelector('.mv-product-main-media');
    var thumbs = Array.prototype.slice.call(
      root.querySelectorAll('.mv-product-thumbs [data-media-src]')
    );

    if (!mainMedia || thumbs.length < 2 || mainMedia.querySelector('.mv-gallery-nav')) return;

    var currentIndex = thumbs.findIndex(function (thumb) {
      return thumb.getAttribute('aria-current') === 'true';
    });

    if (currentIndex < 0) currentIndex = 0;

    var nav = document.createElement('div');
    nav.className = 'mv-gallery-nav';
    nav.innerHTML =
      '<button type="button" class="mv-gallery-prev" aria-label="Previous image">←</button>' +
      '<button type="button" class="mv-gallery-next" aria-label="Next image">→</button>';

    mainMedia.appendChild(nav);

    var previous = nav.querySelector('.mv-gallery-prev');
    var next = nav.querySelector('.mv-gallery-next');

    function updateControls() {
      previous.disabled = currentIndex === 0;
      next.disabled = currentIndex === thumbs.length - 1;
    }

    function showImage(index) {
  if (index < 0 || index >= thumbs.length || index === currentIndex) return;

  var direction = index > currentIndex ? 'is-next' : 'is-prev';

  mainMedia.classList.remove('is-next', 'is-prev');
  void mainMedia.offsetWidth;
  mainMedia.classList.add(direction);

  currentIndex = index;
  thumbs[currentIndex].click();
  updateControls();
}

previous.addEventListener('click', function () {
  showImage(currentIndex - 1);
});

next.addEventListener('click', function () {
  showImage(currentIndex + 1);
});
thumbs.forEach(function (thumb, index) {
      thumb.addEventListener('click', function () {
        currentIndex = index;
        updateControls();
      });
    });

    var startX = 0;
    var startY = 0;

    mainMedia.style.touchAction = 'pan-y';

    mainMedia.addEventListener('pointerdown', function (event) {
      if (event.pointerType !== 'touch') return;

      startX = event.clientX;
      startY = event.clientY;
    });

    mainMedia.addEventListener('pointerup', function (event) {
      if (event.pointerType !== 'touch') return;

      var moveX = event.clientX - startX;
      var moveY = event.clientY - startY;

      if (Math.abs(moveX) < 45 || Math.abs(moveX) < Math.abs(moveY)) return;

      showImage(moveX < 0 ? currentIndex + 1 : currentIndex - 1);
    });

    updateControls();
  });
});
/* ── Gallery filtering by colour ───────────────────────────────────────
   The colour swatches themselves are built further up in this file. This
   block only narrows the thumbnail strip to the selected colour, which the
   swatch code does not do. It reads the colour <select> (the swatches drive
   it) so it works whether the shopper uses a swatch or the plain select. */
(function () {
  var root = document.querySelector('[data-product-root]');
  if (!root) return;

  var form = root.querySelector('[data-product-form]');
  var thumbs = [].slice.call(root.querySelectorAll('.mv-product-thumbs [data-media-group]'));
  if (!form || thumbs.length < 2) return;

  // Same detection the swatch code uses, so both act on the same option.
  var select = [].slice.call(form.querySelectorAll('select')).filter(function (item) {
    var label = form.querySelector('label[for="' + item.id + '"]');
    return /color|colour/i.test(item.name + ' ' + (label ? label.textContent : ''));
  })[0];
  if (!select) return;

  function normalise(text) {
    return String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function filterGallery() {
    var needle = normalise(select.value);
    if (!needle) return;

    var matches = [];
    var shared = [];
    thumbs.forEach(function (thumb) {
      var group = normalise(thumb.getAttribute('data-media-group'));
      // Media with no colour in its alt text is shared across every colour
      // (detail shots, scale references) and stays visible.
      if (!group) { shared.push(thumb); return; }
      if (group === needle || group.indexOf(needle) !== -1) matches.push(thumb);
    });

    // No colour-tagged media at all: leave the gallery exactly as it was.
    var visible = matches.length ? matches.concat(shared) : thumbs;
    thumbs.forEach(function (thumb) { thumb.hidden = visible.indexOf(thumb) === -1; });

    var current = root.querySelector('.mv-product-thumbs [aria-current="true"]');
    if (current && current.hidden && visible.length) visible[0].click();
  }

  select.addEventListener('change', filterGallery);
  filterGallery();
})();
