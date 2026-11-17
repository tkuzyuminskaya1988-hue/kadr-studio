"use strict";
const $ = id => document.getElementById(id);
const icons = {
  studio:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M9 10h12"/>',
  history:'<path d="M3 11a9 9 0 1 1 2.6 7M3 4v7h7m2-5v6l4 2"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8 3 3-2 2-2-1-2 3"/>',
  wallet:'<path d="M3 7V5a2 2 0 0 1 2-2h12v4M3 7h17v13H5a2 2 0 0 1-2-2Zm17 4h-6v5h6"/>',
  route:'<path d="M3 12h4c5 0 5-7 10-7h4m-4-3 4 3-4 3M7 12c5 0 5 7 10 7h4m-4-3 4 3-4 3"/>',
  view:'<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/><circle cx="12" cy="12" r="3"/>',
  expand:'<path d="M14 3h7v7m0-7-7 7M3 14v7h7m-7 0 7-7"/>',
  wand:'<path d="m3 20 12-12 3 3L6 23zM5 3v5M2.5 5.5h5M18 2v4m-2-2h4"/>',
  arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',upRight:'<path d="M6 18 18 6M7 6h11v11"/>',
  sliders:'<path d="M3 6h7m4 0h7M3 12h12m4 0h2M3 18h3m4 0h11"/><circle cx="12" cy="6" r="2"/><circle cx="17" cy="12" r="2"/><circle cx="8" cy="18" r="2"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 6"/>',
  video:'<rect x="2" y="5" width="13" height="14" rx="3"/><path d="m15 10 7-4v12l-7-4"/>',
  upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  spark:'<path d="m10 3 2.2 6.7L19 12l-6.8 2.3L10 21l-2.3-6.7L1 12l6.7-2.3ZM19 2l1 3 3 1-3 1-1 3-1-3-2-1 2-1z"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
function paintIcons(root=document) {
  root.querySelectorAll("i[data-i]:empty").forEach(el => {
    el.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">'+icons[el.dataset.i]+'</svg>';
  });
}
const samples = [
  {title:"Пески Сахары",file:"dune",category:"Пейзаж",author:"Benoît Deschasaux",photo:"qYvcpEBLB1c",prompt:"Одинокий путешественник на гребне огромной дюны в Сахаре. Закат окрашивает песок в медь, длинные тени подчёркивают изгибы барханов. Общий план, кинематографичная плёночная фотография.",motion:"Камера медленно приближается, ветер срывает песок с гребня дюны."},
  {title:"Тихий бетон",file:"concrete",category:"Архитектура",author:"Marc Cordeau",photo:"Z3MsCdxNJg4",prompt:"Чёрно-белая архитектурная фотография бруталистского здания снизу. Массивные бетонные диагонали, глубокие тени, жёсткий боковой свет и видимая фактура бетона.",motion:"Камера плавно поднимается вдоль фасада."},
  {title:"Лес в тумане",file:"forest",category:"Природа",author:"Clyde He",photo:"TEND07a9xDg",prompt:"Густой хвойный лес в предрассветном голубом тумане. Тёмные силуэты елей на переднем плане, дальние деревья едва проступают сквозь дымку. Мягкий рассеянный свет, атмосферная фотография.",motion:"Туман медленно движется между елями, камера плавно скользит над лесом."}
];
const WAN = "alibaba/wan-3.0", SEEDANCE = "bytedance/seedance-2.5";
const modelNames = {"openai/gpt-image-2.6-flare":"GPT Image 2.6 Flare","openai/gpt-image-2.6-sunburst":"GPT Image 2.6 Sunburst",[WAN]:"Wan 3.0",[SEEDANCE]:"Seedance 2.5"};
const refs = {image:[],video:[]};
const legacyRefCount = {image:0,video:0};
let mentionEditor, audioPreview, historyObserver, modalMediaUrl, generationFeed;
const imageSizes = ["1024x1024","1536x1024","1024x1536","1536x864","864x1536","2048x2048","2048x1152","3840x2160","2160x3840"];
const qualities = {low:"Низкое",medium:"Среднее",high:"Высокое",xhigh:"Очень высокое",max:"Максимальное"};
const videoFormats = ["16:9","4:3","1:1","3:4","9:16","21:9"];
const seedSizes = {
  "480p":["854x480","752x560","640x640","560x752","480x854","992x432"],
  "720p":["1280x720","1112x834","960x960","834x1112","720x1280","1470x630"],
  "1080p":["1920x1080","1440x1080","1080x1080","1080x1440","1080x1920","2520x1080"]
};
const videoModels = {
  [WAN]: {supported_resolutions:["480p","720p","1080p"],supported_durations:Array.from({length:29},(_,i)=>i+2),supported_aspect_ratios:videoFormats,pricing_skus:{duration_seconds_480p:"0.05",duration_seconds_720p:"0.1",duration_seconds_1080p:"0.2"}},
  [SEEDANCE]: {supported_resolutions:Object.keys(seedSizes),supported_durations:Array.from({length:27},(_,i)=>i+4),supported_aspect_ratios:videoFormats,
    pricing_skus:{video_tokens:"0.0000107",video_tokens_1080p:"0.0000117",video_tokens_without_audio:"0.0000107",video_tokens_with_video_input:"0.0000064",video_tokens_1080p_with_video_input:"0.000007"}}
};
const imageRates = {};
const session = {get(name){try{return sessionStorage.getItem("kadr-"+name)}catch{return null}},set(name,value){try{value == null ? sessionStorage.removeItem("kadr-"+name) : sessionStorage.setItem("kadr-"+name,value)}catch{}}};
let key=session.get("key")||"", mode="image", checking=false, account=null, accountRequest=0;
const pendingVideos=new Map(), activeRuns=new Map();
try{
  const stored=JSON.parse(session.get("pending"));
  for(const record of Array.isArray(stored)?stored:[stored]){
    if(record?.job && record.item?.id)pendingVideos.set(record.item.id,record);
  }
}catch{}
const drafts={image:{},video:{}};
const money = n => "$"+Number(n).toLocaleString(uiLocale(),{minimumFractionDigits:2,maximumFractionDigits:4});
function node(tag,txt,cls){const x=document.createElement(tag);if(txt!==undefined)x.textContent=txt;if(cls)x.className=cls;return x;}
function button(txt,handler,cls="secondary"){const b=node("button",t(txt),cls);if(Object.hasOwn(english,txt))b.dataset.label=txt;b.type="button";b.onclick=handler;return b;}
function opts(id,values,preferred){
  $(id).replaceChildren(...values.map(v=>Array.isArray(v)?new Option(t(v[1]),v[0]):new Option(v,v)));
  if([...$(id).options].some(o=>o.value===String(preferred)))$(id).value=preferred;
}
function videoOptions(size,duration,ratio){
  const model=videoModels[$("model").value];
  opts("size",model.supported_resolutions,size||"720p");
  opts("quality",model.supported_durations.filter(n=>n>0).map(n=>[n,n+t(" сек")]),duration||"5");
  opts("ratio",model.supported_aspect_ratios,ratio||"16:9");
}
function setMode(next,initial=false){
  if(checking)return;
  if(!initial) drafts[mode]=Object.fromEntries(["model","size","quality","ratio","sound","prompt"].map(id=>[id,$(id).value]));
  mode=next;const d=drafts[mode],video=mode==="video";
  $("imageTab").setAttribute("aria-pressed",!video);$("videoTab").setAttribute("aria-pressed",video);
  opts("model",Object.entries(modelNames).filter(([id])=>video===Object.hasOwn(videoModels,id)),d.model);
  $("sizeLabel").textContent=video?t("Разрешение"):t("Размер кадра");$("qualityLabel").textContent=video?t("Длительность"):t("Качество");
  if(video)videoOptions(d.size,d.quality,d.ratio);
  else{
    opts("size",imageSizes.map(x=>[x,x.replace("x"," × ")]),d.size||"1536x864");
    opts("quality",Object.entries(qualities),d.quality||"medium");
  }
  $("sound").value=d.sound||"on";
  $("videoExtra").hidden=!video;$("prompt").value=d.prompt||"";$("prompt").maxLength=video?20000:32000;
  $("files").accept=video?".jpg,.jpeg,.png,.webp,.bmp,.mp4,.mov,.wav,.mp3":".jpg,.jpeg,.png,.webp";
  $("mentionHint").textContent=video?t("В промпте можно писать img1, video1 и audio1. Введите @ для выбора."):t("В промпте можно писать img1, img2 и дальше. Введите @ для выбора.");
  $("fileHint").textContent=video?t("Фото, MP4, MOV, MP3, WAV. При генерации файлы попадут в TempFile по открытой ссылке на 6 часов."):t("JPG, PNG, WebP · до 16 изображений");
  $("fileError").textContent="";drawRefs();mentionEditor?.close();refresh();
}
function estimate(){
  if(mode==="video"){
    const model=$("model").value, resolution=$("size").value, duration=Number($("quality").value);
    const rates=videoModels[model].pricing_skus;
    if(model===WAN)return Number(rates["duration_seconds_"+resolution])*duration;
    const size=seedSizes[resolution]?.[videoFormats.indexOf($("ratio").value)];
    if(!size)return NaN;
    const [width,height]=size.split("x").map(Number);
    const input=refs.video.filter(ref=>ref.kind==="video").reduce((n,ref)=>n+ref.duration,0);
    const suffix=input?"_with_video_input":$("sound").value==="off"?"_without_audio":"";
    const rate=rates["video_tokens_"+resolution+suffix] ?? rates["video_tokens_"+resolution] ?? rates["video_tokens"+suffix] ?? rates.video_tokens;
    const seconds=input?Math.max(duration+Math.ceil(input),Math.ceil(5*duration/3)):duration;
    return seconds*width*height*24/1024*Number(rate);
  }
  const rate=imageRates[$("model").value]||0.00003;
  return Router.outputTokens($("size").value,$("quality").value)*rate;
}
function refresh(){
  $("count").textContent=$("prompt").value.length.toLocaleString(uiLocale());
  const cost=estimate();$("estimate").textContent=Number.isFinite(cost)?"≈ "+money(cost):t("Нет тарифа");
  $("generate").disabled=checking;$("language").disabled=checking;
}
function showSamples(){
  const list=node("div",undefined,"sample-list");openDialog(t("Примеры промптов")).append(list);
  for(const s of samples){
    const choose=button("",()=>{
      $("prompt").value=t(s.prompt)+(mode==="video"?" "+t(s.motion):"");
      $("prompt").setCustomValidity("");mentionEditor.paint();mentionEditor.close();refresh();
      $("modal").close();$("prompt").focus();
    },"sample-choice");
    const image=node("img");image.src="assets/"+s.file+".jpg";image.alt="";
    choose.append(image,node("span",t(s.title)));list.append(choose);
  }
}
function clearDialog(){
  historyObserver?.disconnect();$("dialogBody").replaceChildren();
  if(modalMediaUrl){URL.revokeObjectURL(modalMediaUrl);modalMediaUrl=null;}
}
function openDialog(title,large=false){
  clearDialog();
  $("modalTitle").textContent=title;$("modal").classList.toggle("lightbox",large);
  if(!$("modal").open)$("modal").showModal();return $("dialogBody");
}
function feedback(text,error=false){
  $("feedback").textContent=text;$("feedback").hidden=!text;$("feedback").classList.toggle("error",error);
}
function accountLabel(){
  if(Number.isFinite(account?.balance))return t("Баланс ")+money(account.balance);
  if(Number.isFinite(account?.limit))return t("Лимит ")+money(account.limit);
  return key?t("Баланс н/д"):t("Баланс —");
}
async function accountData(token){
  const [info,credits]=await Promise.allSettled([Router.request("/key",token),Router.request("/credits",token)]);
  if(info.status==="rejected")throw info.reason;
  const c=credits.value?.data,k=info.value.data;
  return {balance:typeof c?.total_credits==="number" && typeof c.total_usage==="number"?c.total_credits-c.total_usage:null,limit:k.limit_remaining,usage:k.usage};
}
async function syncAccount(){
  const token=key,sequence=++accountRequest;if(!token)return;
  try {const info=await accountData(token);if(key===token && sequence===accountRequest)account=info;}catch{}
  $("balance").textContent=accountLabel();
}
function showKey(){
  const body=openDialog(t("Ключ OpenRouter"));body.append($("keyForm").content.cloneNode(true));
  const f=body.querySelector("form"),input=f.querySelector("input");if(key)input.placeholder=t("Подключён ···· ")+key.slice(-4);
  if(key)body.append(button("Отключить ключ",()=>{key="";account=null;session.set("key",null);$("balance").textContent=accountLabel();$("modal").close();}));
  f.onsubmit=async e=>{
    e.preventDefault();const token=input.value.trim();if(!token)return;
    const b=f.querySelector(".primary");b.disabled=true;b.textContent=t("Проверяем…");
    try{const next=await accountData(token);key=token;account=next;session.set("key",token);input.value="";
      $("balance").textContent=accountLabel();$("modal").close();feedback(t("Ключ подключён. Можно начать генерацию."));}
    catch(err){f.querySelector(".message").textContent=err.message;}finally{b.disabled=false;b.textContent=t("Подключить");}
  };input.focus();
}
function showBalance(){
  if(!key)return showKey();
  const body=openDialog(t("Баланс OpenRouter"));
  body.append(node("p",Number.isFinite(account?.balance)?t("На аккаунте ")+money(account.balance):t("Баланс аккаунта недоступен с этим ключом."),"detail"));
  if(Number.isFinite(account?.limit))body.append(node("p",t("Остаток лимита ключа ")+money(account.limit),"detail"));
  if(Number.isFinite(account?.usage))body.append(node("p",t("Потрачено этим ключом ")+money(account.usage),"detail"));
  const a=node("a",t("Открыть кредиты OpenRouter ↗"));a.href="https://openrouter.ai/settings/credits";a.target="_blank";a.rel="noreferrer";body.append(a);
}
function priceInfo(){
  const b=openDialog(t("Как считается стоимость"));
  const details = { [WAN]:t("Длительность ролика умножается на тариф Wan 3.0 для выбранного разрешения. Провайдер может дополнительно учитывать входное видео."),
    [SEEDANCE]:t("Seedance 2.5 тарифицируется по видеотокенам. Оценка учитывает размеры кадра, 24 кадра в секунду и длину ролика. При наличии видеореференсов также учитываются их длительность, отдельная ставка и минимальный объём списания.") };
  b.append(node("p",details[$("model").value]||t("Оценка рендера учитывает размер кадра, качество и цену выходных токенов. Текст и входные изображения оплачиваются дополнительно."),"detail"));
  b.append(node("p",t("Фактическая сумма из ответа OpenRouter появится в истории после генерации."),"detail"));
}
function setRefOrder(next){
  renumberReferences(refs[mode],next,$("prompt"));
  refs[mode]=next;
  $("prompt").setCustomValidity("");
}
function labelRef(row,ref){
  const tag=row.querySelector(".ref-tag");
  tag.textContent=ref.tag;
  tag.title=t("Вставить @")+ref.tag+t(" в промпт");
  row.querySelector(".ref-remove").setAttribute("aria-label",t("Убрать ")+ref.tag);
  row.querySelector(".ref-grip").setAttribute("aria-label",t("Переместить ")+ref.tag);
}
function moveReference(ref,to){
  const current=refs[mode],from=current.indexOf(ref);
  if(checking || from<0 || to<0 || to>=current.length || to===from)return;
  hideRefPreview();
  const next=current.slice();
  next.splice(from,1);next.splice(to,0,ref);
  setRefOrder(next);
  const list=$("fileList"),row=list.children[from],target=list.children[to];
  list.insertBefore(row,from<to?target.nextSibling:target);
  next.forEach((item,i)=>labelRef(list.children[i],item));
  mentionEditor.close();mentionEditor.paint();refresh();
}
function bindReferenceDragging(){
  const list=$("fileList");
  let drag=null,scrollFrame=0;
  function moveAtPointer(){
    if(!drag || !drag.active)return;
    const index=refs[mode].indexOf(drag.ref);
    if(index<0)return;
    let target=index;
    Array.from(list.children).forEach((row,i)=>{
      const box=row.getBoundingClientRect(),middle=(box.top+box.bottom)/2;
      if(i<index && drag.y<middle)target=Math.min(target,i);
      if(i>index && drag.y>middle)target=Math.max(target,i);
    });
    moveReference(drag.ref,target);
  }
  function scrollNearEdge(){
    scrollFrame=0;
    if(!drag?.active)return;
    const panel=list.closest(".panel");
    const pane=panel.scrollHeight>panel.clientHeight && getComputedStyle(panel).overflowY==="auto"?panel:null;
    const bounds=pane?.getBoundingClientRect();
    const step=drag.y<(bounds?.top||0)+48?-12:drag.y>(bounds?.bottom||window.innerHeight)-48?12:0;
    if(!step)return;
    const y=pane?pane.scrollTop:window.scrollY;
    (pane||window).scrollBy(0,step);
    if((pane?pane.scrollTop:window.scrollY)!==y){moveAtPointer();scrollFrame=requestAnimationFrame(scrollNearEdge);}
  }
  list.onpointerdown=e=>{
    if(drag || !e.isPrimary || e.button!==0 || checking || refs[mode].length<2)return;
    const row=e.target.closest(".ref-card");
    if(!row || (!e.target.closest(".ref-grip") && (e.pointerType!=="mouse" || e.target.closest("button"))))return;
    const index=Array.from(list.children).indexOf(row);
    drag={id:e.pointerId,ref:refs[mode][index],row,y:e.clientY,startY:e.clientY,active:false};
    list.setPointerCapture(e.pointerId);
  };
  list.onpointermove=e=>{
    if(!drag || drag.id!==e.pointerId)return;
    drag.y=e.clientY;
    if(!drag.active && Math.abs(drag.y-drag.startY)<4)return;
    drag.active=true;drag.row.classList.add("moving");
    moveAtPointer();
    if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollNearEdge);
  };
  function end(e){
    if(!drag || drag.id!==e.pointerId)return;
    drag.row.classList.remove("moving");drag=null;
    cancelAnimationFrame(scrollFrame);scrollFrame=0;
    if(list.hasPointerCapture(e.pointerId))list.releasePointerCapture(e.pointerId);
  }
  list.onpointerup=list.onpointercancel=list.onlostpointercapture=end;
}
let previewAnchor=null;
function hideRefPreview(){
  if(!previewAnchor)return;
  const box=$("refPreview");
  box.hidden=true;box.replaceChildren();previewAnchor=null;
}
function showRefPreview(thumb,ref){
  if(previewAnchor===thumb)return;
  const box=$("refPreview"),anchor=thumb.getBoundingClientRect();
  const gap=10,viewW=document.documentElement.clientWidth,viewH=document.documentElement.clientHeight;
  const ratio=ref.w/ref.h||1;
  const width=Math.min(360,viewW-2*gap,Math.min(360,viewH-2*gap)*ratio);
  const height=width/ratio;
  let x=anchor.right+gap,y=anchor.top+(anchor.height-height)/2;
  if(x+width>viewW-gap){
    if(anchor.left-gap-width>=gap)x=anchor.left-gap-width;
    else{
      x=anchor.left+(anchor.width-width)/2;
      y=anchor.top>viewH-anchor.bottom?anchor.top-gap-height:anchor.bottom+gap;
    }
  }
  box.style.left=Math.max(gap,Math.min(x,viewW-gap-width))+"px";
  box.style.top=Math.max(gap,Math.min(y,viewH-gap-height))+"px";
  box.style.width=width+"px";box.style.height=height+"px";
  const media=thumb.cloneNode(false);media.removeAttribute("class");media.removeAttribute("tabindex");
  box.replaceChildren(media);previewAnchor=thumb;box.hidden=false;
}
function drawRefs(){
  hideRefPreview();
  if(audioPreview){audioPreview.pause();audioPreview=null;}
  $("mentionHint").hidden=!refs[mode].length;
  $("fileList").replaceChildren(...refs[mode].map(ref=>{
    const row=node("div",undefined,"ref-card"),details=node("div",undefined,"ref-details");
    const grip=node("button","⠿","ref-grip");grip.type="button";
    grip.disabled=refs[mode].length<2;
    grip.title=t("Перетащите или переместите стрелками ↑ и ↓");
    grip.onkeydown=e=>{
      if(e.key!=="ArrowUp" && e.key!=="ArrowDown")return;
      e.preventDefault();
      moveReference(ref,refs[mode].indexOf(ref)+(e.key==="ArrowUp"?-1:1));grip.focus();
    };
    let thumb;
    if(ref.kind==="audio"){
      const audio=new Audio();
      thumb=button("▶",async()=>{
        if(audioPreview===audio && !audio.paused){audio.pause();return;}
        audioPreview?.pause();audioPreview=audio;audio.src=ref.preview;
        try{await audio.play();}catch{$("fileError").textContent=t("Не удалось воспроизвести ")+ref.file.name;}
      },"ref-thumb ref-audio");
      thumb.setAttribute("aria-label",t("Прослушать ")+ref.file.name);
      audio.onplay=()=>{thumb.textContent="Ⅱ";};audio.onpause=audio.onended=()=>{thumb.textContent="▶";};
    }else{
      thumb=node(ref.kind==="video"?"video":"img",undefined,"ref-thumb");
      thumb.draggable=false;
      if(ref.kind==="video"){thumb.muted=true;thumb.preload="auto";thumb.playsInline=true;}
      else thumb.alt=ref.file.name;
      thumb.src=ref.preview+(ref.kind==="video"?"#t=0.1":"");
      thumb.tabIndex=0;
      thumb.onpointerenter=e=>{if(e.pointerType!=="touch" && !e.buttons)showRefPreview(thumb,ref);};
      thumb.onfocus=()=>{if(thumb.matches(":focus-visible"))showRefPreview(thumb,ref);};
      thumb.onpointerleave=thumb.onpointerdown=thumb.onblur=hideRefPreview;
    }
    const tag=button(ref.tag,()=>mentionEditor.insert(ref),"ref-tag");
    const caption=node("span",[ref.w && ref.h ? ref.w+" × "+ref.h : "",ref.duration ? ref.duration.toLocaleString(uiLocale(),{maximumFractionDigits:1})+t(" с") : ""].filter(Boolean).join(" · "),"ref-name");
    row.title=ref.file.name;
    details.append(tag,caption);row.append(grip,thumb,details);
    const remove=button("×",()=>{
      setRefOrder(refs[mode].filter(item=>item!==ref));URL.revokeObjectURL(ref.preview);
      $("fileError").textContent="";drawRefs();refresh();
    },"icon-btn ref-remove");
    row.append(remove);labelRef(row,ref);return row;
  }));
  mentionEditor?.close();mentionEditor?.paint();
}
async function mediaInfo(file,kind){
  const url=URL.createObjectURL(file);
  try{return await new Promise((resolve,reject)=>{
    const el=kind==="image"?new Image():document.createElement(kind);
    const timer=setTimeout(()=>fail(),12000);
    function fail(){clearTimeout(timer);reject(uiError(()=>t("Браузер не смог прочитать ")+file.name+t(". Проверьте формат и кодек.")));}
    function done(){clearTimeout(timer);resolve({duration:el.duration||0,w:el.naturalWidth||el.videoWidth||0,h:el.naturalHeight||el.videoHeight||0});}
    el.onerror=fail;if(kind==="image")el.onload=done;else{el.preload="metadata";el.onloadedmetadata=done;}el.src=url;
  });}finally{URL.revokeObjectURL(url);}
}
function referenceError(list,model){
  const seed=model===SEEDANCE, video=Object.hasOwn(videoModels,model);
  const total={image:0,video:0,audio:0},seconds={audio:0,video:0};
  const limits=seed?{image:30,video:10,audio:10}:{image:video?10:16,video:5,audio:5};
  for(const ref of list){
    const {kind,file,duration,w,h}=ref;
    const mb=kind==="video"?100:kind==="audio"?15:seed?30:video?20:50;
    if(!file.size||file.size>mb*1e6)return file.name+t(" — допустим непустой файл до ")+mb+t(" МБ.");
    if(++total[kind]>limits[kind])return t("Превышен лимит референсов этого типа для ")+modelNames[model]+" ("+limits[kind]+").";
    if(!video)continue;
    if(kind!=="image"){
      seconds[kind]+=duration;
      const min=seed?2:1, max=seed?30:15;
      if(!Number.isFinite(duration)||duration<min || seconds[kind]>max+0.02)return file.name+t(" — каждый клип от ")+min+t(" с, всего до ")+max+t(" с для этого типа.");
    }
    if(w){
      const min=seed?300:240,max=seed?6000:kind==="image"?8000:4096;
      if(Math.min(w,h)<min || Math.max(w,h)>max || Math.max(w,h)/Math.min(w,h)>(seed?2.5:8))return file.name+t(" — размеры кадра не подходят для ")+modelNames[model]+".";
      if(seed && kind==="video" && (w*h<407696 || w*h>8295044))return file.name+t(" — для видеореференса требуется от 407 696 до 8 295 044 пикселей в кадре.");
    }
  }
  return "";
}
async function addFiles(files){
  if(checking)return [];checking=true;$("controls").disabled=true;refresh();$("fileError").textContent="";
  const accepted=[],all=refs[mode],errors=[];
  try{for(const file of files){
    try{
      const ext=file.name.split(".").pop().toLowerCase();
      const kind=["jpg","jpeg","png","webp",...(mode==="video"?["bmp"]:[])].includes(ext)?"image":["mp4","mov"].includes(ext)?"video":["mp3","wav"].includes(ext)?"audio":null;
      if(!kind || (mode==="image" && kind!=="image"))throw uiError(()=>t("Формат файла не поддерживается."));
      const info=await mediaInfo(file,kind);
      const ref={file,kind,...info},error=referenceError([...all,...accepted,ref],$("model").value);
      if(error)throw new Error(error);
      ref.preview=URL.createObjectURL(file);
      ref.legacyTag="ref"+(++legacyRefCount[mode]);
      accepted.push(ref);
    }catch(err){errors.push(file.name+" — "+err.message);}
  }setRefOrder([...all,...accepted]);$("fileError").textContent=errors.join(" ");drawRefs();}
  finally{checking=false;$("controls").disabled=false;$("files").value="";refresh();}
  return accepted;
}
function fileName(item,blob){
  const type=blob.type.split(";")[0];
  const ext={"image/jpeg":"jpg","image/webp":"webp","video/quicktime":"mov","video/webm":"webm"}[type]||(item.mode==="video"?"mp4":"png");
  return t("Кадр-")+new Date(item.created).toISOString().replace(/[:.]/g,"-")+"."+ext;
}
async function resultBlob(item,availableBlob){
  const blob=availableBlob||await Library.media(item.id);
  if(!blob)throw uiError(()=>t("Файл этой генерации недоступен в истории."));
  return blob;
}
function openResult(item,blob){
  const body=openDialog(t("Результат генерации"),true),video=item.mode==="video";
  const media=node(video?"video":"img");modalMediaUrl=URL.createObjectURL(blob);media.src=modalMediaUrl;
  if(video){media.controls=true;media.playsInline=true;}else media.alt=item.prompt;
  const foot=node("div",undefined,"dlg-foot"),link=node("a",t("Скачать"));
  link.href=modalMediaUrl;link.download=fileName(item,blob);
  foot.append(link,reuseButton(item,blob),node("span",costLabel(item),"mono"));
  body.append(media,node("p",item.prompt,"detail"),foot);
}
function costLabel(item){return item.cost==null?t("Сумма уточняется"):money(item.cost);}
function reuseButton(item,availableBlob){
  const action=button("В референсы",async()=>{
    const parent=action.parentElement,dialog=action.closest("dialog");
    parent.querySelector(".history-error:not(.card-error)")?.remove();action.disabled=true;
    try{
      const blob=await resultBlob(item,availableBlob);
      if(!action.isConnected || (dialog && !dialog.open))return;
      if(checking)throw uiError(()=>t("Дождитесь завершения текущей операции."));
      if(item.mode==="video" && mode!=="video")setMode("video");
      const file=new File([blob],fileName(item,blob),{type:blob.type});
      const added=await addFiles([file]);
      if(!added.length)throw new Error($("fileError").textContent||t("Не удалось добавить файл."));
      if(dialog?.open)dialog.close();
      $("prompt").focus();
      feedback((item.mode==="video"?t("Видео добавлено"):t("Фото добавлено"))+t(" как ")+added[0].tag+".");
    }catch(e){const message=node("span",e.message,"history-error");message.setAttribute("role","status");parent.append(message);}
    finally{action.disabled=false;}
  },"secondary history-ref");
  return action;
}
function createFeed(){
  const cards=new Map(),container=$("feedCards"),filters=$("feedFilters");
  const removed=new Map();
  const channel=typeof BroadcastChannel==="function"?new BroadcastChannel("kadr-history"):null;
  if(channel)channel.onmessage=({data})=>{if(data?.deleted && typeof data.id==="string")forget(data);};
  let filter="all";
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      const card=cards.get(entry.target.dataset.id);
      if(!card || card.el!==entry.target)continue;
      card.near=entry.isIntersecting;
      if(entry.isIntersecting)loadPreview(card);
      else if(card.url && !(card.media.tagName==="VIDEO" && !card.media.paused))releasePreview(card);
    }
  },{rootMargin:"240px"});
  function releasePreview(card){
    card.media.removeAttribute("src");
    if(card.media.tagName==="VIDEO")card.media.load();
    URL.revokeObjectURL(card.url);card.url=null;
  }
  async function loadPreview(card){
    if(card.url || card.loading)return;
    card.loading=true;
    try{
      const blob=await resultBlob(card.item,card.blob);
      if(card.el.hidden || !card.el.isConnected || !card.near)return;
      card.url=URL.createObjectURL(blob);card.media.src=card.url+(card.item.mode==="video"?"#t=0.1":"");
    }catch(e){card.error.textContent=e.message;}
    finally{card.loading=false;}
  }
  function updateFilter(){
    let count=0,total=0,unpriced=0,finished=0;
    for(const marker of removed.values()){
      if(!Object.hasOwn(marker,"cost"))continue;
      finished++;if(Number.isFinite(marker.cost))total+=marker.cost;else unpriced++;
    }
    for(const card of cards.values()){
      if(card.ready){finished++;if(Number.isFinite(card.item.cost))total+=card.item.cost;else unpriced++;}
      card.el.hidden=filter!=="all" && card.item.mode!==filter;
      if(card.el.hidden && card.url)releasePreview(card);
      if(!card.el.hidden)count++;
    }
    filters.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.kind===filter));
    $("feedCount").textContent=String(count);
    $("feedSpend").hidden=!finished;
    $("feedSpend").textContent=unpriced && unpriced===finished?t("Стоимость генераций уточняется"):t("Списано за все генерации: ")+money(total)+(unpriced?t(" · часть списаний уточняется"):"");
    $("feedEmpty").hidden=count>0;
    $("emptyTitle").textContent=filter==="all"?t("Здесь появятся ваши работы"):filter==="video"?t("Пока нет видео"):t("Пока нет изображений");
    $("emptyText").textContent=filter==="all"?t("Создайте изображение или видео в студии."):t("Готовые работы этого типа появятся здесь.");
  }
  function forget(marker){
    const id=marker.id,card=cards.get(id);
    if(!removed.has(id) || !Number.isFinite(removed.get(id).cost) || Number.isFinite(marker.cost))removed.set(id,marker);
    if(pendingVideos.delete(id))savePending();
    if(card){
      observer.unobserve(card.el);
      if(card.url)releasePreview(card);
      cards.delete(id);card.el.remove();
    }
    updateFilter();
  }
  function announceRemoval(marker){forget(marker);channel?.postMessage(marker);}
  function askRemove(card){
    const body=openDialog(t("Удалить из ленты?"));
    body.append(node("p",card.item.prompt,"generation-prompt"));
    const text=card.ready?t("Файл и промпт будут удалены из истории этого браузера."):t("Карточка исчезнет из истории этого браузера.");
    body.append(node("p",text+(card.inFlight?t(" Запущенный запрос может завершиться со списанием в OpenRouter."):""),"detail"));
    const actions=node("div",undefined,"dlg-foot"),cancel=button("Оставить",()=>$("modal").close());
    const error=node("span",undefined,"history-error");error.setAttribute("role","status");
    const confirm=button("Удалить",async()=>{
      confirm.disabled=true;
      try{
        const marker=await Library.remove(card.item,card.ready);
        announceRemoval(marker);
        if(actions.isConnected && $("modal").open)$("modal").close();
      }catch{error.textContent=t("Удаление не удалось. Проверьте доступ к хранилищу браузера и повторите.");confirm.disabled=false;}
    },"secondary remove-confirm");
    actions.append(cancel,confirm,error);body.append(actions);cancel.focus();
  }
  function shell(item){
    if(cards.has(item.id))return cards.get(item.id);
    const el=node("article",undefined,"generation-card"),frame=node("div",undefined,"generation-media");
    const details=node("div",undefined,"generation-details"),meta=node("div",undefined,"generation-meta");
    const cost=node("span"),date=new Date(item.created),time=node("time",date.toLocaleString(uiLocale(),{dateStyle:"short",timeStyle:"short"}));
    time.dateTime=date.toISOString();meta.append(node("span",modelNames[item.model]||item.model),cost);
    details.append(meta,node("p",item.prompt,"generation-prompt"),time);
    const actions=node("div",undefined,"generation-actions");
    el.append(frame,details,actions);el.dataset.id=item.id;el.dataset.created=item.created;
    const before=Array.from(container.children).find(row=>Number(row.dataset.created)<=item.created);
    container.insertBefore(el,before||null);
    const card={el,item,frame,actions,cost,ready:false,url:null,loading:false};
    card.remove=button("Удалить",()=>askRemove(card),"secondary remove-generation");
    cards.set(item.id,card);return card;
  }
  function start(item){
    if(removed.has(item.id))return;
    const card=shell(item);
    if(card.ready)return;
    card.frame.classList.add("working-frame");
    const spin=node("span",undefined,"job-spinner");spin.setAttribute("aria-hidden","true");
    card.statusKey="Подготовка…";card.status=node("span",t(card.statusKey),"job-status");card.status.setAttribute("role","status");
    card.inFlight=true;
    card.frame.replaceChildren(spin,card.status);card.actions.replaceChildren(card.remove);card.actions.hidden=false;
    if(filter!=="all" && filter!==item.mode)filter="all";
    updateFilter();$("feed").scrollTop=0;
  }
  function progress(id,message){const card=cards.get(id);if(card?.status && !card.ready){card.statusKey=message;card.status.textContent=t(message);}}
  function fail(id,message,recheck){
    const card=cards.get(id);if(!card || card.ready)return;
    card.status=null;card.stateKey=recheck?"Проверка приостановлена":"Ошибка";
    card.frame.replaceChildren(node("span",t(card.stateKey),"job-state"));
    card.failure=typeof message==="function"?message:()=>t(message);
    const info=node("span",card.failure(),"history-error");info.setAttribute("role","status");
    card.actions.hidden=false;card.actions.replaceChildren(info);
    card.inFlight=Boolean(recheck);
    if(recheck)card.actions.append(button("Проверить готовность",recheck));
    card.actions.append(card.remove);
  }
  function insert(item,blob){
    if(removed.has(item.id))return;
    const card=shell(item);if(card.ready)return;
    const {el,frame,actions}=card;
    const media=node(item.mode==="video"?"video":"img");
    if(item.mode==="video"){media.controls=true;media.playsInline=true;media.preload="metadata";}else media.alt=item.prompt;
    const error=node("span",undefined,"history-error card-error");
    error.setAttribute("role","status");
    async function withFile(handler){
      error.textContent="";
      try{await handler(await resultBlob(item,blob));}catch(e){error.textContent=e.message;}
    }
    const expand=button("",()=>withFile(file=>openResult(item,file)),"icon-btn expand-result");
    expand.setAttribute("aria-label",t("Открыть результат"));const icon=node("i");icon.dataset.i="expand";expand.append(icon);
    const download=button("Скачать",()=>withFile(file=>{
      const link=node("a"),url=URL.createObjectURL(file);link.href=url;link.download=fileName(item,file);
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
    }));
    card.ready=true;card.inFlight=false;card.item=item;card.blob=blob;card.error=error;card.media=media;card.status=null;
    card.cost.textContent=costLabel(item);frame.classList.remove("working-frame");
    actions.hidden=false;actions.replaceChildren(download,reuseButton(item,blob),card.remove,error);
    if(blob)error.textContent=t("Не удалось сохранить в историю. Скачайте файл до закрытия вкладки.");
    frame.replaceChildren(media,expand);observer.observe(el);paintIcons(el);
  }
  filters.onclick=e=>{const btn=e.target.closest("button[data-kind]");if(btn){filter=btn.dataset.kind;updateFilter();}};
  async function load(){
    try{const items=await Library.records();
      for(const item of items)if(item.deleted && !removed.has(item.id))removed.set(item.id,item);
      for(const item of items.filter(i=>!i.deleted).sort((a,b)=>b.created-a.created))insert(item);
      $("feedStatus").textContent="";
    }catch{$("feedStatus").textContent=t("Не удалось прочитать историю этого браузера.");}
    updateFilter();
  }
  function add(item,blob){insert(item,blob);updateFilter();}
  function changeLanguage(){
    for(const card of cards.values()){
      const time=card.el.querySelector("time");
      time.textContent=new Date(card.item.created).toLocaleString(uiLocale(),{dateStyle:"short",timeStyle:"short"});
      if(card.ready){
        card.cost.textContent=costLabel(card.item);
        card.el.querySelector(".expand-result").setAttribute("aria-label",t("Открыть результат"));
        if(card.blob)card.error.textContent=t("Не удалось сохранить в историю. Скачайте файл до закрытия вкладки.");
      }else if(card.status)card.status.textContent=t(card.statusKey);
      else if(card.failure){
        card.frame.querySelector(".job-state").textContent=t(card.stateKey);
        card.actions.querySelector(".history-error").textContent=card.failure();
      }
    }
    updateFilter();
  }
  return {changeLanguage,load,add,start,progress,fail,announceRemoval,isRemoved:id=>removed.has(id),isReady:id=>cards.get(id)?.ready};
}
function historyThumbnail(item){
  if(item.mode!=="image")return node("span","▷","history-thumb");
  const img=node("img",undefined,"history-thumb");
  img.alt=t("Миниатюра изображения");img.dataset.recordId=item.id;
  historyObserver.observe(img);
  return img;
}
async function chooseSavedImage(){
  const body=node("div");
  openDialog(t("Фото из истории")).append(body);
  try{const items=(await Library.records()).filter(i=>i.mode==="image").sort((a,b)=>b.created-a.created);
    if(!body.isConnected)return;
    if(!items.length){body.append(node("p",t("Здесь появятся сгенерированные вами изображения."),"detail"));return;}
    historyObserver=new IntersectionObserver((entries,observer)=>{
      entries.forEach(async entry=>{
        if(!entry.isIntersecting)return;
        const img=entry.target;observer.unobserve(img);
        try{
          const blob=await Library.media(img.dataset.recordId);
          if(blob && img.isConnected){
            const url=URL.createObjectURL(blob);
            img.onload=img.onerror=()=>URL.revokeObjectURL(url);img.src=url;
          }
        }catch{img.alt=t("Миниатюра недоступна");}
      });
    },{root:$("modal"),rootMargin:"120px"});
    for(const item of items){
      const row=node("div",undefined,"history-item"),info=node("div");info.append(node("strong",item.prompt),node("small",modelNames[item.model]+" · "+new Date(item.created).toLocaleString(uiLocale())+" · "+(item.cost===null?t("сумма уточняется"):money(item.cost))));
      const actions=node("div",undefined,"history-actions");
      actions.append(reuseButton(item));
      row.append(historyThumbnail(item),info,actions);body.append(row);
    }
  }catch{body.append(node("p",t("Браузер не предоставил доступ к локальной истории."),"detail"));}
}
async function actual(result,token){
  const cost=result.usage?.cost ?? result.usage?.total_cost;
  if(cost!=null && Number.isFinite(Number(cost)))return Number(cost);
  const gid=result.generation_id || (String(result.id||"").startsWith("gen-")?result.id:null);
  if(gid){try{const res=await Router.request("/generation?id="+encodeURIComponent(gid),token);
    if(typeof res.data?.total_cost==="number")return res.data.total_cost;}catch{}}
  return null;
}
function savePending(){
  session.set("pending",pendingVideos.size?JSON.stringify([...pendingVideos.values()]):null);
}
async function finish(item,blob,result,token){
  item.cost=await actual(result,token);
  let saved=true;
  try{
    if(await Library.save(item,blob)===false){
      generationFeed?.announceRemoval({id:item.id,deleted:true,cost:item.cost});return;
    }
  }catch{saved=false;}
  generationFeed?.add(item,saved?null:blob);
}
async function finishVideo(record,token){
  const {item,job}=record;
  const progress=message=>generationFeed?.progress(item.id,message);
  const result=await Router.poll(job,token,progress);
  progress("Скачиваем готовое видео…");
  const blob=await Router.request("/videos/"+encodeURIComponent(job)+"/content?index=0",token,undefined,true);
  await finish(item,blob,result,token);
  pendingVideos.delete(item.id);savePending();
}
function reportFailure(item,err,unknown=false){
  if(err.terminal){pendingVideos.delete(item.id);savePending();}
  const record=pendingVideos.get(item.id);
  const message=()=>err.message==="Failed to fetch"?t("Не удалось связаться с сервисом. Проверьте соединение."):err.message;
  generationFeed?.fail(item.id,()=>message()+(unknown?t(" Перед повторной отправкой проверьте Activity в OpenRouter."):""),record?()=>resumeVideo(record):null);
}
async function resumeVideo(record){
  const {item}=record,token=key;
  if(activeRuns.has(item.id))return;
  if(!token){showKey();return;}
  activeRuns.set(item.id,{token,price:item.estimate||0});generationFeed?.start(item);
  try{await finishVideo(record,token);}
  catch(err){reportFailure(item,err);}
  finally{await settleRun(item,token);}
}
async function settleRun(item,token){
  try{if(key===token)await syncAccount();}finally{activeRuns.delete(item.id);}
}
function canAfford(price,token){
  const limits=[account?.balance,account?.limit].filter(Number.isFinite);
  if(!limits.length)return true;
  const held=[...activeRuns.values()].filter(run=>run.token===token).reduce((sum,run)=>sum+run.price,0);
  const available=Math.min(...limits)-held;
  return available>0 && (price===0 || price<=available+1e-9);
}
async function generate(event){
  event.preventDefault();if(checking)return;
  if(!key){showKey();return;}
  const prompt=$("prompt").value.trim();if(!prompt){$("prompt").setCustomValidity(t("Опишите сцену."));$("prompt").reportValidity();return;}
  const ref=refs[mode].slice(),model=$("model").value,video=mode==="video",duration=Number($("quality").value);
  const resolved=resolvePrompt(prompt,ref);
  if(resolved.missing.length){feedback(t("Упоминание без вложения: ")+resolved.missing.join(", ")+t(". Удалите его или выберите референс через @."),true);$("prompt").focus();return;}
  const invalid=referenceError(ref,model);if(invalid){feedback(invalid,true);return;}
  if(model===WAN && duration+ref.filter(r=>r.kind==="video").reduce((n,r)=>n+r.duration,0)>30.02){feedback(t("Входные видео и готовый ролик вместе должны длиться не больше 30 секунд. Уменьшите длительность."),true);return;}
  const token=key,price=estimate()||0;
  if(!canAfford(price,token)){
    const notice=t("С учётом текущих задач доступного остатка недостаточно по оценке. Проверяем баланс OpenRouter.");
    feedback(notice,true);await syncAccount();
    if(key===token && $("feedback").textContent===notice){
      const enough=canAfford(price,token);
      feedback(enough?t("Баланс обновлён. Можно запускать генерацию."):t("По оценке не хватает средств с учётом текущих задач. Дождитесь результата, измените настройки или пополните баланс."),!enough);
    }
    return;
  }
  const item={id:crypto.randomUUID(),created:Date.now(),model,prompt,mode,cost:null,estimate:price};
  const payload={model,prompt:resolved.prompt};
  if(video)Object.assign(payload,{duration,resolution:$("size").value,aspect_ratio:$("ratio").value,generate_audio:$("sound").value==="on"});
  else Object.assign(payload,{size:$("size").value,quality:$("quality").value,output_format:"png"});
  activeRuns.set(item.id,{token,price});
  generationFeed?.start(item);feedback("");
  const progress=message=>generationFeed?.progress(item.id,message);
  let submitting=false;
  try{
    if(ref.length){progress(video?"Загружаем референсы…":"Подготавливаем референсы…");payload.input_references=await Router.inputs(ref,item.mode);}
    progress(video?"Отправляем видео в очередь…":"Генерируем изображение…");
    submitting=true;const result=await Router.request(video?"/videos":"/images",token,payload);submitting=false;
    if(video){
      if(!result.id)throw uiError(()=>t("OpenRouter не вернул номер задачи. Проверьте Activity в OpenRouter."));
      const record={job:result.id,item};
      if(!generationFeed?.isRemoved?.(item.id)){pendingVideos.set(item.id,record);savePending();}
      await finishVideo(record,token);
    }else{
      const image=result.data?.[0];if(!image?.b64_json)throw uiError(()=>t("OpenRouter не вернул изображение. ")+(result.error?.message||t("Проверьте запрос в истории OpenRouter.")));
      const raw=atob(image.b64_json),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
      await finish(item,new Blob([bytes],{type:image.media_type||"image/png"}),result,token);
    }
  }catch(err){reportFailure(item,err,submitting&&!err.status);}
  finally{await settleRun(item,token);}
}
async function restoreVideos(){
  await generationFeed.load();
  for(const record of pendingVideos.values()){
    if(generationFeed.isReady(record.item.id) || generationFeed.isRemoved(record.item.id)){pendingVideos.delete(record.item.id);continue;}
    if(key)void resumeVideo(record);
    else{
      generationFeed.start(record.item);
      generationFeed.fail(record.item.id,"Подключите ключ, чтобы получить результат.",()=>resumeVideo(record));
    }
  }
  savePending();
}
async function refreshRates(){
  const rates=await Promise.allSettled([Router.request("/videos/models"),...Object.keys(modelNames).filter(m=>m.startsWith("openai/")).map(m=>Router.request("/images/models/"+m+"/endpoints"))]);
  for(const model of rates[0].value?.data||[]){
    if(Object.hasOwn(videoModels,model.id) && model.pricing_skus)videoModels[model.id]={...videoModels[model.id],...model};
  }
  if(mode==="video")videoOptions($("size").value,$("quality").value,$("ratio").value);
  for(const rate of rates.slice(1)){
    const price=rate.value?.endpoints?.[0]?.pricing?.find(p=>p.billable==="output_image" && p.unit==="token");
    if(price)imageRates[rate.value.id]=Number(price.cost_usd);
  }
  refresh();
}
initializeLanguage();
$("language").onchange=()=>{
  setLanguage($("language").value);
  setMode(mode);
  $("prompt").setCustomValidity("");
  feedback("");$("balance").textContent=accountLabel();generationFeed.changeLanguage();
  document.querySelectorAll("button[data-label]").forEach(b=>{b.textContent=t(b.dataset.label);});
};
mentionEditor=createMentionEditor($("prompt"),$("promptMirror"),$("mentionChoices"),()=>refs[mode]);
bindReferenceDragging();
window.addEventListener("resize",hideRefPreview);
window.addEventListener("blur",hideRefPreview);
document.addEventListener("scroll",hideRefPreview,true);
document.addEventListener("keydown",e=>{if(e.key==="Escape")hideRefPreview();});
generationFeed=createFeed();void restoreVideos();setMode("image",true);paintIcons();
$("studioNav").onclick=()=>{window.scrollTo({top:0,behavior:"smooth"});};
$("chooseSaved").onclick=chooseSavedImage;$("openKey").onclick=showKey;$("balanceBtn").onclick=showBalance;
$("estimateInfo").onclick=priceInfo;$("showSamples").onclick=showSamples;$("closeDlg").onclick=()=>$("modal").close();
$("modal").addEventListener("close",()=>{if(!$("modal").open)clearDialog();});
$("modal").onclick=e=>{if(e.target===$("modal")){const r=$("modal").getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$("modal").close();}};
$("imageTab").onclick=()=>setMode("image");$("videoTab").onclick=()=>setMode("video");
$("model").onchange=()=>{if(mode==="video"){videoOptions($("size").value,$("quality").value,$("ratio").value);$("fileError").textContent=referenceError(refs.video,$("model").value);}refresh();};
$("generator").oninput=()=>{$("prompt").setCustomValidity("");refresh();};$("generator").onchange=refresh;$("generator").onsubmit=generate;
$("dropzone").onclick=()=>$("files").click();$("files").onchange=e=>addFiles([...e.target.files]);
for(const type of ["dragenter","dragover","dragleave","drop"])$("dropzone").addEventListener(type,e=>{
  e.preventDefault();$("dropzone").classList.toggle("hover",type==="dragenter"||type==="dragover");
  if(type==="drop")void addFiles([...e.dataTransfer.files]);
});
$("balance").textContent=accountLabel();void syncAccount();void refreshRates();
