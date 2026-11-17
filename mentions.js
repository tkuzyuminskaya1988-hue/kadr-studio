"use strict";
// A deleted mention stays a single token even if its old number is later reused.
const refToken = /\[(?:удалён|removed): @?(?:img|video|audio|ref)\d+\]|(?<![\p{L}\p{N}_@])(?:(?:@?(?:img|video|audio)|@ref)\d+(?![\p{L}\p{N}_])|@)/giu;
const refPrefix = {image:"img",video:"video",audio:"audio"};
function renumberReferences(previous, next, input) {
  const changes = new Map(), counts = {image:0,video:0,audio:0};
  for (const ref of previous) {
    if (!next.includes(ref)) {
      changes.set(ref.tag,null);
      changes.set(ref.legacyTag,null);
    }
  }
  for (const ref of next) {
    const tag = refPrefix[ref.kind]+(++counts[ref.kind]);
    if (ref.tag && ref.tag!==tag) changes.set(ref.tag,tag);
    ref.tag=tag;
  }
  if (!changes.size) return;
  // Match the original text once so swaps and img10/img1 cannot cascade.
  const matches = [...input.value.matchAll(refToken)];
  for (const match of matches.reverse()) {
    const token = match[0], key = tokenName(token);
    if (!changes.has(key)) continue;
    const tag = changes.get(key);
    const replacement = tag ? (token.startsWith("@")?"@":"")+tag : t("[удалён: ")+token+"]";
    input.setRangeText(replacement,match.index,match.index+token.length,"preserve");
  }
}
function referenceNames(attachments) {
  const byTag = new Map(), counts = {image:0,video:0,audio:0};
  const types = {image:"Image",video:"Video",audio:"Audio"};
  for (const ref of attachments) {
    const providerName = types[ref.kind]+" "+(++counts[ref.kind]);
    byTag.set(ref.tag,providerName);
    if (ref.legacyTag) byTag.set(ref.legacyTag,providerName);
  }
  return byTag;
}
function tokenName(token) {return token.replace(/^@/,"").toLowerCase();}
function resolvePrompt(text, attachments) {
  const byTag = referenceNames(attachments);
  const missing = new Set();
  const prompt = text.replace(refToken, token => {
    if(token==="@")return token;
    const name = byTag.get(tokenName(token));
    if (!name) missing.add(token);
    return name || token;
  });
  return {prompt,missing:[...missing]};
}

function createMentionEditor(input, mirror, menu, getRefs) {
  let active = 0, matches = [], fragment = null;
  function syncScroll() {
    mirror.style.width = (input.clientWidth + 2) + "px";
    mirror.scrollTop = input.scrollTop;
    mirror.scrollLeft = input.scrollLeft;
  }
  function paint() {
    const text = input.value, known = referenceNames(getRefs());
    const parts = document.createDocumentFragment();
    let start = 0;
    for (const match of text.matchAll(refToken)) {
      parts.append(text.slice(start,match.index));
      const tag = document.createElement("mark");
      tag.textContent = match[0];
      if (match[0]!=="@" && !known.has(tokenName(match[0]))) tag.className = "missing";
      parts.append(tag);
      start = match.index + match[0].length;
    }
    parts.append(text.slice(start)+"\u200b");
    mirror.replaceChildren(parts);
    syncScroll();
  }
  function close() {
    menu.hidden = true;
    input.removeAttribute("aria-activedescendant");
    fragment = null;
    matches = [];
  }
  function insert(ref, range) {
    let start = range?.start ?? input.selectionStart, end = range?.end ?? input.selectionEnd;
    const left = input.value.slice(0,start), right = input.value.slice(end);
    const prefix = /[\p{L}\p{N}_@]$/u.test(left) ? " " : "";
    const suffix = !right || /^[\p{L}\p{N}_@]/u.test(right) ? " " : "";
    close();
    input.focus();
    input.setRangeText(prefix + "@" + ref.tag + suffix,start,end,"end");
    input.dispatchEvent(new Event("input",{bubbles:true}));
    close();
  }
  function highlight() {
    Array.from(menu.children).forEach((option,i)=>option.setAttribute("aria-selected",i===active));
    const selected = menu.children[active];
    if (selected) {
      input.setAttribute("aria-activedescendant",selected.id);
      if (selected.offsetTop < menu.scrollTop) menu.scrollTop = selected.offsetTop;
      else if (selected.offsetTop+selected.offsetHeight > menu.scrollTop+menu.clientHeight) menu.scrollTop = selected.offsetTop+selected.offsetHeight-menu.clientHeight;
    }
  }
  function suggest() {
    const caret = input.selectionStart;
    const match = /(?<![\p{L}\p{N}_@])@([\p{L}\p{N}_-]*)$/u.exec(input.value.slice(0,caret));
    if (document.activeElement!==input || !match || caret!==input.selectionEnd) {close();return;}
    const query = match[1].toLowerCase();
    matches = getRefs().filter(ref=>ref.tag.startsWith(query) || ref.file.name.toLowerCase().includes(query));
    if (!matches.length) {close();return;}
    const tail = /^[\p{L}\p{N}_-]*/u.exec(input.value.slice(caret))[0];
    fragment = {start:caret-match[0].length,end:caret+tail.length};
    active = 0;
    menu.replaceChildren(...matches.map((ref,i)=>{
      const option = document.createElement("button");
      option.type="button"; option.tabIndex=-1; option.id="mention-option-"+i;
      option.setAttribute("role","option");
      const tag = document.createElement("b"), name = document.createElement("span");
      tag.textContent="@"+ref.tag; name.textContent=ref.file.name;
      option.append(tag,name);
      option.onmousedown=e=>e.preventDefault();
      option.onclick=()=>insert(ref,fragment);
      return option;
    }));
    menu.hidden=false;
    highlight();
  }
  input.addEventListener("input",e=>{paint();if(!e.isComposing)suggest();});
  input.addEventListener("compositionend",suggest);
  input.addEventListener("click",suggest);
  input.addEventListener("blur",close);
  input.addEventListener("scroll",syncScroll);
  input.addEventListener("keyup",e=>{if(["ArrowLeft","ArrowRight","Home","End"].includes(e.key))suggest();});
  input.addEventListener("keydown",e=>{
    if(menu.hidden || e.isComposing)return;
    if(e.key==="Escape"){e.preventDefault();close();return;}
    if(e.key==="Enter" || e.key==="Tab"){e.preventDefault();insert(matches[active],fragment);return;}
    if(e.key==="ArrowDown" || e.key==="ArrowUp"){
      e.preventDefault();
      active=(active+(e.key==="ArrowDown"?1:-1)+matches.length)%matches.length;
      highlight();
    }
  });
  new ResizeObserver(syncScroll).observe(input);
  return {paint,close,insert:ref=>insert(ref,fragment)};
}
