"use strict";
const Router = (() => {
  const base = "https://openrouter.ai/api/v1";
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function request(path, key, body, binary = false) {
    const headers = {};
    if (key) headers.Authorization = "Bearer " + key;
    if (body) headers["Content-Type"] = "application/json";
    const response = await fetch(base + path, {
      method: body ? "POST" : "GET", headers, body: body ? JSON.stringify(body) : undefined,
      credentials: "omit", signal: AbortSignal.timeout(body ? 900000 : binary ? 180000 : 20000)
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const reasons = {401:"Проверьте API-ключ.",402:"Недостаточно кредитов OpenRouter.",403:"Для этого ключа доступ ограничен.",429:"OpenRouter просит немного подождать."};
      const e = uiError(()=>[t(reasons[response.status]) || t("Ошибка OpenRouter ") + response.status, data.error?.message].filter(Boolean).join(" "));
      e.status = response.status;
      throw e;
    }
    return binary ? response.blob() : response.json();
  }
  function outputTokens(size, quality) {
    const [w,h] = size.split("x").map(Number);
    const long = {low:16,medium:24,high:48,xhigh:64,max:96}[quality];
    const scaled = long * Math.min(w,h) / Math.max(w,h);
    const floor = Math.floor(scaled);
    const short = scaled - floor === 0.5 ? floor + floor % 2 : Math.round(scaled);
    const baseTokens = Math.ceil(long * short * (2000000 + w*h) / 4000000);
    return Math.round(baseTokens * ({low:4.2, medium:3.3}[quality] || 1));
  }
  function asDataURL(file) {
    return new Promise((resolve,reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(uiError(()=>t("Не удалось прочитать файл.")));
      r.readAsDataURL(file);
    });
  }
  const uploads=new WeakMap();
  async function upload(refs) {
    const needed=refs.filter(r=>!r.url || r.expiry<Date.now()+600000);
    const fresh=needed.filter(r=>!uploads.has(r));
    for(let start=0;start<fresh.length;start+=20){
      const batch=fresh.slice(start,start+20);
      const task=uploadBatch(batch).finally(()=>batch.forEach(ref=>uploads.delete(ref)));
      batch.forEach(ref=>uploads.set(ref,task));
    }
    await Promise.all(needed.map(ref=>uploads.get(ref)));
  }
  async function uploadBatch(needed) {
    const form = new FormData();
    // TempFile can recode Unicode multipart filenames. Use distinct ASCII names on the wire.
    const files = needed.map((ref,index) => {
      const extension = ref.file.name.match(/\.[a-z0-9]+$/i)?.[0].toLowerCase() || "";
      const uploadName = "reference-" + (index+1) + extension;
      form.append("files",ref.file,uploadName);
      return {ref,uploadName};
    });
    form.append("expiryHours","6");
    const response = await fetch("https://tempfile.org/api/upload/local", {
      method:"POST",body:form,credentials:"omit",signal:AbortSignal.timeout(300000)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !Array.isArray(data.files) || data.files.length !== files.length) {
      throw uiError(()=>t("Загрузка в TempFile не завершена. ") + (data.error || t("Код ") + response.status) + t(". Повторите загрузку."));
    }
    const uploaded = new Map(data.files.map(file=>[file.name,file]));
    for (const {ref,uploadName} of files) {
      const found = uploaded.get(uploadName);
      if (!found || Number(found.size)!==ref.file.size || typeof found.id!=="string" || !/^[a-zA-Z0-9_-]+$/.test(found.id)) {
        throw uiError(()=>t("TempFile не подтвердил файл ") + ref.file.name);
      }
    }
    for (const {ref,uploadName} of files) {
      const found = uploaded.get(uploadName);
      ref.url = "https://tempfile.org/" + found.id + "/download";
      ref.expiry = Number(found.expiryTime) || Date.now()+6*3600000;
    }
  }
  async function inputs(refs, mode) {
    if (mode === "video") await upload(refs);
    return Promise.all(refs.map(async ref => {
      const type = ref.kind + "_url";
      return {type, [type]: {url: mode === "video" ? ref.url : await asDataURL(ref.file)}};
    }));
  }
  async function poll(id,key,progress) {
    const path = "/videos/" + encodeURIComponent(id);
    const deadline = Date.now() + 25*60000;
    let failures = 0;
    while (Date.now() < deadline) {
      let job;
      try { job = await request(path,key); failures = 0; }
      catch(e) {
        if ((e.status && e.status < 500 && e.status !== 429) || ++failures > 4) throw e;
        await pause(failures * 3000); continue;
      }
      if (job.status === "completed") return job;
      if (["failed","cancelled","canceled","expired"].includes(job.status)) {
        const e = uiError(()=>t("Видео не готово (")+job.status+"). "+(job.error?.message || job.error || ""));
        e.terminal = true; throw e;
      }
      progress(job.status === "pending" || job.status === "queued" ? "Видео в очереди OpenRouter…" : "Идёт генерация видео…");
      await pause(6000);
    }
    throw uiError(()=>t("Задача ещё выполняется. Можно проверить её готовность позже."));
  }
  return {request, outputTokens, inputs, poll, upload};
})();

const Library = (() => {
  let database;
  function db() {
    if (!database) database = new Promise((resolve,reject) => {
      const req = indexedDB.open("kadr-studio",1);
      req.onupgradeneeded = () => {req.result.createObjectStore("records",{keyPath:"id"});req.result.createObjectStore("media");};
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {database=null;reject(req.error);};
    });
    return database;
  }
  async function changeRecord(id,change) {
    const database=await db();
    return new Promise((resolve,reject)=>{
      const tx=database.transaction(["media","records"],"readwrite");
      const records=tx.objectStore("records"),media=tx.objectStore("media");
      const read=records.get(id);let result;
      read.onsuccess=()=>{result=change(read.result,records,media);};
      tx.oncomplete=()=>resolve(result);tx.onabort=()=>reject(tx.error);
    });
  }
  function save(item,blob){
    return changeRecord(item.id,(previous,records,media)=>{
      if(previous?.deleted){
        records.put({...previous,cost:item.cost});
        return false;
      }
      media.put(blob,item.id);records.put(item);return true;
    });
  }
  function remove(item,ready){
    return changeRecord(item.id,(previous,records,media)=>{
      // Keep only the ID and billing information so late results cannot restore a deleted file.
      const marker={id:item.id,deleted:true};
      if(previous && Object.hasOwn(previous,"cost"))marker.cost=previous.cost;
      else if(ready)marker.cost=item.cost;
      records.put(marker);media.delete(item.id);return marker;
    });
  }
  async function read(store,id) {
    const database = await db();
    return new Promise((resolve,reject) => {
      const s = database.transaction(store).objectStore(store);
      const req = id === undefined ? s.getAll() : s.get(id);
      req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
    });
  }
  return {save,remove,records:()=>read("records"),media:id=>read("media",id)};
})();
