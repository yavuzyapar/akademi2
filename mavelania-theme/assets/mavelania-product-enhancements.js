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
    var colors={
      'onyx':'#15130f','black':'#171616','jet black':'#111111','deep black':'#111111','smooth black':'#181818','textured black':'#24201d','noir':'#141312','ebony':'#1d1a17','raven':'#1a1a1a','obsidian':'#16161a',
      'charcoal':'#36322e','anthracite':'#333130','graphite':'#3b3936','slate':'#4a4e52',
      'brown':'#6f4a33','dark brown':'#3f2b20','light brown':'#a3673f','orange brown':'#a95228','vintage brown':'#6b442d','chocolate':'#432c21','coffee':'#4b352a','espresso':'#382720','mocha':'#6b4f3f','cognac':'#8a4b25','whisky':'#96551f','whiskey':'#96551f','chestnut':'#6a3a26','walnut':'#5a4032','tobacco':'#7a4c2b','sepia':'#6b4a33','bronze':'#8c6239','copper':'#a25d33','rust':'#8f4522',
      'tan':'#b98a5a','light tan':'#cf9b69','camel':'#b0834f','caramel':'#a96f2f','toffee':'#8a5a33','honey':'#c08a45','amber':'#b97d2c','cinnamon':'#8e4f2b','hazel':'#8d6238','nude':'#d8b89c','biscuit':'#c8a279',
      'bordeaux':'#5a1a24','burgundy':'#5b1a26','wine':'#5f1f2b','maroon':'#591c22','oxblood':'#48111a','claret':'#5d1a26','merlot':'#541823','red':'#8c1c22','cherry':'#7a1520','ruby':'#7d1725',
      'beige':'#cdb79e','sand':'#d2bb98','stone':'#a89c8e','taupe':'#8b7d6f','mink':'#9c8877','greige':'#b3a696','mushroom':'#a2948a','ivory':'#efe6d6','cream':'#eee4d2','bone':'#e6ded0','off white':'#f2eee6','white':'#f7f6f3','powder':'#e4d3c6',
      'gray':'#7b7876','grey':'#7b7876','light gray':'#aaa7a2','light grey':'#aaa7a2','dark gray':'#4d4a47','dark grey':'#4d4a47','silver':'#b6b4b0','smoke':'#8d8a86',
      'navy':'#1e2a40','dark blue':'#233248','blue':'#31506e','denim':'#3f5c7d','indigo':'#2a3358','petrol':'#1f4e50','teal':'#20585c','ice blue':'#a9bdcd',
      'green':'#4a6b57','olive':'#5b5c39','forest':'#2f4a38','emerald':'#1f5c46','sage':'#8b9a88','khaki':'#7d7448',
      'gold':'#c19a4b','mustard':'#b8892b','yellow':'#d3a83a','orange':'#c1642c','terracotta':'#a5563c',
      'fuchsia':'#c2185b','magenta':'#b5197a','hot pink':'#d81b7a','ecru':'#e8dfcc','marine':'#1e2a40','steel':'#5c6670','sterling':'#b6b4b0','platinum':'#c9c7c2','pewter':'#8a8781','cobalt':'#20408a','turquoise':'#1f8a8a','mint':'#9ec8b0','lime':'#8fae3a','coral':'#d4674f','salmon':'#e0917c','peach':'#e7b394','apricot':'#d99a5b','moro':'#3a2118','nero':'#171616','rosso':'#8c1c22','verde':'#4a6b57','bianco':'#f7f6f3','antique gold':'#c19a4b',
      'pink':'#d9a2ad','rose':'#c98b90','dusty rose':'#c09a96','lilac':'#a893b8','purple':'#5b3d6b','plum':'#5a2740','aubergine':'#432033',
      /* Colour names specific to the Mavelania catalogue. Hex values were
         checked against the product photography; without these every one of
         them fell back to the same #9a7a63 placeholder. */
      'carobwood':'#5a3a28','tamarind':'#e6dbc8','clay':'#7c5a46','terra':'#8b6250','moccasin':'#bf8a52',
      'sunburst':'#f2bb08','butter':'#e5c163','marmalade':'#e2600f','tang':'#ef7212','fire':'#f2760f',
      'rouge':'#d92b33','desire':'#d9202a','port':'#61303a','blush':'#4a2228','huckleberry':'#ef3f88',
      'moss':'#3e5145','hunter':'#2c3330','bottle':'#26302b',
      'peacock':'#1e6e88','atlantic':'#3f6280','reflection':'#3a566f','slateblue':'#414d6b','cosmic':'#414455',
      'phantom':'#2b2c30','night':'#2d2d2d','jet':'#1b1b1b','smoky':'#4a4a4c',
      'sandy wheat':'#ece0cd','sandy orange':'#ef9a33','sandy olive':'#2f3330','sandy tan':'#a5652f',
      'sandy mocha':'#8a6244','sandy gray':'#6f6f6d','sandy grey':'#6f6f6d','golden tan':'#c08a4e',
      'bitter brown':'#3a2a26','light orange':'#f0731a','pebble orange':'#e2702a','pebble lilac':'#b89ccc',
      /* Names that arrive as supplier codes (Ar + siyah / kahve / lacivert,
         i.e. black / brown / navy in Turkish) */
      'arsiy':'#24242a','arkah':'#4a3630','arlac':'#2e3550'
    };
    var ignore=/\b(suede|nubuck|leather|croco|crocodile|croc|python|ostrich|saffiano|patent|matte|mat|glossy|shiny|nappa|calf|grain|grained|textured|smooth|floater|vintage|antique|tone|toned|color|colour|classic|premium|genuine)\b/g;
    var colorKeys=Object.keys(colors).sort(function(a,b){return b.length-a.length});
    var scan=function(text){var used=[],out=[];colorKeys.forEach(function(k){var from=0,i;while((i=text.indexOf(k,from))>-1){var end=i+k.length,bounded=(i===0||text.charAt(i-1)===' ')&&(end===text.length||text.charAt(end)===' '),overlap=used.some(function(u){return i<u[1]&&end>u[0]});if(bounded&&!overlap){used.push([i,end]);out.push(k)}from=i+1}});return out};
    // ── Tone modifiers ──────────────────────────────────────────────
    // "Golden Tan" and "Tan" rendered as identical circles on the same
    // product. When a known modifier sits next to a known base colour we
    // lighten or darken the base deterministically so every option is
    // distinguishable.
    // Note: in this catalogue "Sandy" is not a tone, it is a pebbled finish
    // (Sandy Olive is nearly black, Sandy Orange is a vivid orange). It is
    // therefore not a tone modifier; finishOf() treats it as a texture and
    // the real values are declared explicitly in the map above.
    var toneWords={'light':16,'pale':22,'soft':13,'bright':15,
                   'dark':-20,'deep':-22,'bitter':-17,'burnt':-14,'midnight':-25,'rich':-11};
    var desatWords={'soft':.22,'pale':.34,'smoky':.25,'dusty':.30};
    var hexToRgb=function(h){h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
    var rgbToHex=function(c){return'#'+c.map(function(x){return('0'+Math.max(0,Math.min(255,Math.round(x))).toString(16)).slice(-2)}).join('')};
    var shift=function(hex,pct,desat){
      if(!hex||hex.indexOf('#')!==0||hex.length!==7)return hex;
      var c=hexToRgb(hex);
      if(desat){var g=(c[0]*.299+c[1]*.587+c[2]*.114);c=c.map(function(x){return x+(g-x)*desat})}
      c=c.map(function(x){return pct>=0?x+(255-x)*(pct/100):x*(1+pct/100)});
      return rgbToHex(c);
    };
    // Returns the shifted tone when a name matches "<modifier> <base colour>".
    var modified=function(words){
      var pct=0,desat=0,base=null,hit=false;
      words.forEach(function(w){
        if(toneWords[w]!==undefined){pct+=toneWords[w];hit=true}
        if(desatWords[w]!==undefined)desat=Math.max(desat,desatWords[w]);
      });
      if(!hit&&!desat)return null;
      var rest=words.filter(function(w){return toneWords[w]===undefined&&desatWords[w]===undefined}).join(' ').trim();
      if(!rest)return null;
      base=colors[rest];
      if(!base){var f=scan(rest);if(f.length)base=colors[f[0]]}
      if(!base)return null;
      return shift(base,pct,desat);
    };
    // Finish/texture: suede and pebbled versions of one colour resolve to the
    // same hex, so we tag the swatch with a finish and separate them in CSS.
    var finishOf=function(raw){
      if(/\b(suede|nubuck|suet)\b/.test(raw))return'suede';
      if(/\b(patent|rugan|glossy|shiny)\b/.test(raw))return'gloss';
      if(/\b(pebble|sandy|croco|crocodile|croc|kroko|python|ostrich|saffiano|grained|textured)\b/.test(raw))return'grain';
      return'';
    };
    // Only genuinely two-tone names become a gradient ("Black / Tan",
    // "Tan & Brown"). A single colour like "Espresso Brown" must not render
    // as a split swatch.
    var twoTone=/[\/&+]|\sand\s|\sve\s|\s-\s/;
    // Splits a compound name written as one word, e.g. "Slateblue"; the last
    // part is the head colour (slate + blue -> blue).
    var splitWord=function(text){
      if(!text||text.indexOf(' ')>-1)return null;
      for(var i=0;i<colorKeys.length;i++){
        var k=colorKeys[i];
        if(k.length<4||k.indexOf(' ')>-1||text.length<=k.length)continue;
        if(text.slice(0,k.length)===k&&colors[text.slice(k.length)])return colors[text.slice(k.length)];
        if(text.slice(-k.length)===k&&colors[text.slice(0,text.length-k.length)])return colors[k];
      }
      return null;
    };
    var key=function(text){
      var src=String(text||'').toLowerCase();
      var raw=src.replace(/[^a-zçğıöşü\s-]/g,' ').replace(/-/g,' ').replace(/\s+/g,' ').trim();
      if(colors[raw])return colors[raw];
      var stripped=raw.replace(ignore,' ').replace(/\s+/g,' ').trim();
      if(colors[stripped])return colors[stripped];
      var tuned=modified(raw.split(' '));
      if(tuned)return tuned;
      var found=scan(raw);
      if(!found.length)found=scan(stripped);
      if(!found.length)return splitWord(raw)||splitWord(stripped)||'#9a7a63';
      var uniq=[];
      found.forEach(function(k){var c=colors[k];if(uniq.indexOf(c)<0)uniq.push(c)});
      if(uniq.length>1&&twoTone.test(src))return'linear-gradient(135deg,'+uniq[0]+' 0 50%,'+uniq[1]+' 50% 100%)';
      return uniq[0];
    };
    var lum=function(hex){var h=hex.replace('#','');if(h.length!==6)return 0;var f=function(v){return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)};return 0.2126*f(parseInt(h.slice(0,2),16)/255)+0.7152*f(parseInt(h.slice(2,4),16)/255)+0.0722*f(parseInt(h.slice(4,6),16)/255)};
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
