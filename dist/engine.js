// All commerce values are fixtures, in integer cents. No live Redshop data.
export const products = {
 daisy:{id:'daisy',name:'Daisy pendant necklace',shop:'Demo jewelry shop',variant:'Gold tone · White enamel',price:399,photo:'necklace-generated.png',type:'necklace',floral:true,lid:false,detail:'Fictional demo SKU with an AI-generated illustration. A simple daisy pendant replaces the heart-shaped design. Gold tone replaces rose gold. Metal composition, dimensions and allergy suitability are unverified.'},
 necklace:{id:'necklace',name:'Sunflower Heart Necklace',shop:'ccc 的店',variant:'Rose gold',price:579,photo:'necklace.jpg',type:'necklace',floral:true,lid:false,detail:'A rose-gold-tone sunflower and heart pendant. Original selected item; quantity stays at one.'},
 flower:{id:'flower',name:'Non-glazed Ceramic Coffee Cup',shop:'不泥不器的店',variant:'With handle · Floral · With lid',price:3465,photo:'flower.jpg',type:'mug',floral:true,lid:true,detail:'The original dimensional floral cup, shown with a handle and lid. This demonstration uses a fixed SKU.'},
 plain:{id:'plain',name:'OK HONEY ceramic mug',shop:'OK HONEY 的店',variant:'Speckled · 500 ml · No lid',price:153,photo:'plain.jpg',type:'mug',floral:false,lid:false,detail:'A speckled, open-top ceramic mug. It keeps the mug category, but loses the original floral decoration and lid.'},
 floral:{id:'floral',name:'Blue daisy ceramic mug',shop:'Demo partner shop',variant:'Painted daisies · With lid',price:2495,photo:'floral-generated.png',type:'mug',floral:true,lid:true,detail:'Fictional demo SKU with an AI-generated illustration: painted blue daisies, a lid and handle. Unlike the original cup, the flowers are flat decoration. Capacity and actual seller eligibility are not verified. Not a live Redshop listing.'}
};
export const initial = {necklace:'necklace',mug:'flower',coupon:true,shipping:'direct',version:1};
export const defaults = {keepNecklace:false,keepMug:false,floral:'any',lid:false,budget:null,noLater:true,freeShipping:false,cheapest:false,ignoreHistory:false};
export function quote(mug='flower',coupon=true,shipping='direct',extra=0,necklace='necklace'){
 const base={flower:[3998,2010,150,542],plain:[686,1500,74,220],floral:[3028,1500,120,402]}[mug];
 if(!base)throw Error('Unknown SKU');
 let [items,freight,processing,tax]=base;
 if(!['necklace','daisy'].includes(necklace))throw Error('Unknown necklace');
 const replaced=necklace==='daisy';
 const discount=coupon&&!replaced?46:0;
 const subtotal=items+46+(replaced?products.daisy.price-products.necklace.price:0);
 if(replaced){freight-=287;processing-=10;tax-=35;}
 const total=subtotal-discount+freight+processing+tax+extra;
 return {subtotal,discount,shipping:shipping==='direct'?freight+extra:null,processing,tax,total:shipping==='direct'?total:null,payNow:shipping==='direct'?total:total-freight-extra,complete:shipping==='direct'};
}
export function validateConditions(raw){
 if(!raw||typeof raw!=='object')throw Error('No conditions returned');
 const c={...defaults};
 for(const k of ['keepNecklace','keepMug','lid','noLater','freeShipping','cheapest','ignoreHistory'])if(typeof raw[k]==='boolean')c[k]=raw[k];
 if(['any','prefer','must'].includes(raw.floral))c.floral=raw.floral;
 if(raw.budget!==null&&raw.budget!==undefined){if(typeof raw.budget!=='number'||!Number.isFinite(raw.budget)||raw.budget<=0||raw.budget>10000)throw Error('Budget must be a positive USD amount');c.budget=raw.budget;}
 return c;
}
export function findOptions(c,order,context='cart',unavailable=[]){
 c=validateConditions(c);
 if(c.freeShipping)return [];
 const necklace=order.necklace||'necklace';
 const current=quote(order.mug,order.coupon,order.shipping,order.extra||0,necklace);
 const pairs=[{mug:order.mug,necklace}];
 if(!c.keepMug)for(const mug of ['plain','floral'])if(mug!==order.mug)pairs.push({mug,necklace});
 if(!c.keepNecklace)for(const n of ['daisy','necklace'])if(n!==necklace)pairs.push({mug:order.mug,necklace:n});
 let options=pairs.map(pair=>{const changed=pair.mug!==order.mug||pair.necklace!==necklace;const slot=pair.necklace!==necklace?'necklace':'mug';return {...pair,slot,product:products[pair[slot]],quote:quote(pair.mug,order.coupon,'direct',0,pair.necklace),changed};});
 options=options.filter(x=>!unavailable.includes(x.product.id)&&(c.floral!=='must'||products[x.mug].floral)&&(!c.lid||products[x.mug].lid)&&(c.budget===null||x.quote.total<Math.round(c.budget*100)));
 const originalCheck=checkOriginal(order);
 if(!c.cheapest&&originalCheck.lower){const retained=options.find(x=>!x.changed);if(retained)return [{...retained,saved:current.total-retained.quote.total}];}
 // One replacement at a time: do not change a second product to force a match.
 if(options.some(x=>x.changed&&x.quote.total<(current.total??Infinity)))options=options.filter(x=>x.changed);
 options.sort((a,b)=>{
  if(c.cheapest)return a.quote.total-b.quote.total;
  // Explicit requirements outrank optional context. Saved-original context is
  // a soft preference: a budget can still eliminate the preferred option.
  if(!c.ignoreHistory&&context==='history'){
   const retained=x=>Number(x.mug===order.mug);
   if(retained(a)!==retained(b))return retained(b)-retained(a);
  }
  // Category-preserving alternatives with known lid/decoration attributes first;
  // price is a tie-break, not evidence of the user's attachment.
  const price=x=>x.slot==='mug'?2:1;
  if(price(a)!==price(b))return price(b)-price(a);
  if(a.slot==='mug'&&b.slot==='mug'){
   if((c.floral==='prefer'||(!c.ignoreHistory&&context!=='cart'))&&a.product.floral!==b.product.floral)return Number(b.product.floral)-Number(a.product.floral);
   const original=products[order.mug],similarity=p=>Number(p.floral===original.floral)+Number(p.lid===original.lid);
   if(similarity(a.product)!==similarity(b.product))return similarity(b.product)-similarity(a.product);
  }
  return a.quote.total-b.quote.total;
 });
 return options.map(x=>({...x,saved:current.total===null?null:current.total-x.quote.total}));
}
export function commit(order,option,expectedVersion){
 if(order.version!==expectedVersion)throw Error('STALE_ORDER');
 if(!products[option.mug]||products[option.mug].type!=='mug'||!products[option.necklace]||products[option.necklace].type!=='necklace')throw Error('UNKNOWN_PRODUCT');
 return {...order,mug:option.mug,necklace:option.necklace,shipping:'direct',version:order.version+1};
}

export const presets={
 cheaper:{text:'Keep the necklace. Find the lowest total for a mug.',conditions:{...defaults,keepNecklace:true,cheapest:true}},
 flowers:{text:'Keep the necklace. The mug must have flowers. Under $40, with no later shipping charges.',conditions:{...defaults,keepNecklace:true,floral:'must',budget:40}},
 flexible:{text:'Keep the necklace. I would prefer flowers, but a plain mug is OK. Under $30.',conditions:{...defaults,keepNecklace:true,floral:'prefer',budget:30}},
 keep:{text:'Keep both original products. Can I lower the total?',conditions:{...defaults,keepNecklace:true,keepMug:true}}
};

// Conservative guard: a small model must not lock the original mug merely
// because the sentence says to keep the necklace. This is an explicit, tested
// wording check, not another model, and the user can always override the form.
export function reviewModelConditions(raw,text){
 const c=validateConditions(raw);
 const mugPronoun=/\b(?:mug|cup)\b[^.!?]*[.!?]?\s*(?:please\s+)?(?:keep|retain)\s+it\b/i.test(text)&&!/(?:necklace|pendant)/i.test(text);
 const necklacePronoun=/\b(?:necklace|pendant)\b[^.!?]*[.!?]?\s*(?:please\s+)?(?:keep|retain)\s+it\b/i.test(text)&&!/(?:mug|cup)/i.test(text);
 const explicit=mugPronoun||/(?:keep|retain|preserve)\s+(?:(?:this|the|my|same|exact|original)\s+)*(?:mug|cup|both|everything)|(?:do not|don't|cannot|can't)\s+(?:change|replace|swap)\s+(?:(?:the|my|this|original)\s+)*(?:mug|cup)|保留.{0,5}(?:杯|两件|全部)|杯.{0,5}(?:不换|不变)/i.test(text);
 const negated=/(?:don't|do not|no need to)\s+keep\s+(?:(?:the|my|this|original)\s+)*(?:mug|cup)|不(?:用|要|必)保留.{0,4}杯/i.test(text);
 const necklaceExplicit=necklacePronoun||/(?:keep|retain|preserve)\s+(?:(?:this|the|my|same|exact|original)\s+)*(?:necklace|pendant|both|everything)|(?:do not|don't)\s+(?:change|replace|swap)\s+(?:(?:the|my|this|original)\s+)*(?:necklace|pendant)|保留.{0,5}(?:项链|两件|全部)|项链.{0,5}(?:不换|不变)/i.test(text);
 const necklaceNegated=/(?:don't|do not|no need to)\s+keep\s+(?:(?:the|my|this|original)\s+)*(?:necklace|pendant)|不(?:用|要|必)保留.{0,4}项链/i.test(text);
 const necklaceReview=c.keepNecklace&&(!necklaceExplicit||necklaceNegated);
 if(necklaceReview)c.keepNecklace=false;
 const needsReview=necklaceReview||(c.keepMug&&(!explicit||negated));
 if(c.keepMug&&(!explicit||negated))c.keepMug=false;
 return {conditions:c,needsReview};
}

// Only the coupon eligibility and delivery options in this fixture are checked.
export function checkOriginal(order){
 const current=quote(order.mug,order.coupon,order.shipping,order.extra||0,order.necklace||'necklace');
 const direct=quote(order.mug,order.coupon,'direct',0,order.necklace||'necklace');
 const deferred=quote(order.mug,order.coupon,'consolidation',0,order.necklace||'necklace');
 return {current,direct,deferred,lower:current.complete&&direct.total<current.total,
  coupon:direct.discount>0?'The eligible merchant discount is already applied.':'No additional eligible coupon is available in this demo.',
  result:!current.complete?'Your current payment excludes later international shipping. No saving can be confirmed.':direct.total<current.total?'A refreshed direct-shipping quote lowers the total without replacing either item.':'No lower complete total was found for these exact items in the checked offers.'};
}
// A conservative explicit-topic guard around model output. Not a second model.
// Untouched fields are inherited; ambiguous changes are returned for clarification.
export function mergeRequest(previous,raw,text){
 const prior=validateConditions(previous),next={...prior},changed=[];
 const mentions={keepNecklace:/necklace|pendant|both|everything|项链|两件|全部/i,budget:/\$|dollars?|USD|budget|under|below|预算|美元|美金|低于|以内/i,floral:/flower|floral|plain|花|素色/i,keepMug:/(?:keep|retain|preserve|replace|swap|change|different|original|exact|same).*(?:mug|cup|both|everything)|(?:mug|cup).*(?:keep|replace|swap|change)|保留.*(?:杯|两件|全部)|杯.*(?:不换|不变|换)|换.*杯/i,lid:/lid|盖/i,freeShipping:/free shipping|shipping.*free|no shipping fee|免运费|不付运费/i,cheapest:/cheapest|lowest|最低|最便宜/i,ignoreHistory:/history|personal|preference|gift|送|历史|偏好/i};
 const checked=reviewModelConditions(raw,text);
 for(const [key,re] of Object.entries(mentions))if(re.test(text)&&Object.hasOwn(raw,key)){if(checked.needsReview&&['keepMug','keepNecklace'].includes(key)&&raw[key]===true&&!checked.conditions[key])continue;next[key]=checked.conditions[key];if(next[key]!==prior[key])changed.push(key);}
 // Explicit numeric budget edits are deterministic; no guesses for missing amounts.
 const n=text.match(/(?:under|below|budget(?:\s+(?:to|of|is))?|预算(?:提高到|改成|改为|到|为)?|低于)\s*\$?\s*(\d+(?:\.\d{1,2})?)/i)||text.match(/\$\s*(\d+(?:\.\d{1,2})?)|([0-9]+(?:\.[0-9]{1,2})?)\s*(?:dollars?|USD|美元|美金)/i);
 if(n){next.budget=Number(n[1]||n[2]);if(!changed.includes('budget'))changed.push('budget');}
 if(/(?:no|remove)\s+(?:the\s+)?budget\s*(?:limit)?|不限预算|取消预算/i.test(text)){next.budget=null;if(!changed.includes('budget'))changed.push('budget');}
 if(mentions.budget.test(text)&&!n&&raw.budget===null&&!/no.*budget|remove.*budget|不限预算|取消预算/i.test(text)){next.budget=prior.budget;const i=changed.indexOf('budget');if(i>=0)changed.splice(i,1);}
 const ambiguous=checked.needsReview||raw.clarification===true||(!changed.length&&!Object.keys(mentions).some(k=>mentions[k].test(text)))||(mentions.budget.test(text)&&!n&&!/no.*budget|remove.*budget|不限预算|取消预算/i.test(text)&&(!Object.hasOwn(raw,'budget')||raw.budget===null));
 return {conditions:validateConditions(next),changed,needsReview:checked.needsReview,clarification:ambiguous,question:checked.needsReview?'Which original item should stay: the mug, the necklace, or both?':ambiguous?'Please specify the item to keep or a total budget in USD.':''};
}

export function speechOutcome({hasNewText,error,started,userStopped}){if(error==='not-allowed'||error==='service-not-allowed')return 'permission';if(error==='audio-capture')return 'microphone';if(hasNewText)return 'ready';if(!started&&!userStopped)return 'unavailable';return 'empty';}
