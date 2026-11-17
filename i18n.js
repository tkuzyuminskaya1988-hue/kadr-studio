"use strict";
const english={
  "Пески Сахары": "Sahara dunes",
  "Пейзаж": "Landscape",
  "Одинокий путешественник на гребне огромной дюны в Сахаре. Закат окрашивает песок в медь, длинные тени подчёркивают изгибы барханов. Общий план, кинематографичная плёночная фотография.": "A lone traveler on the crest of a vast dune in the Sahara. The setting sun turns the sand copper, and long shadows trace the curves of the dunes. Wide shot, cinematic film photography.",
  "Камера медленно приближается, ветер срывает песок с гребня дюны.": "The camera moves slowly closer as wind carries sand off the ridge.",
  "Тихий бетон": "Quiet concrete",
  "Архитектура": "Architecture",
  "Чёрно-белая архитектурная фотография бруталистского здания снизу. Массивные бетонные диагонали, глубокие тени, жёсткий боковой свет и видимая фактура бетона.": "A black-and-white architectural photograph of a brutalist building seen from below. Massive diagonal concrete forms, deep shadows, hard side lighting and visible concrete texture.",
  "Камера плавно поднимается вдоль фасада.": "The camera glides up the facade.",
  "Лес в тумане": "Forest in the mist",
  "Природа": "Nature",
  "Густой хвойный лес в предрассветном голубом тумане. Тёмные силуэты елей на переднем плане, дальние деревья едва проступают сквозь дымку. Мягкий рассеянный свет, атмосферная фотография.": "A dense evergreen forest in blue mist before dawn. Dark spruce silhouettes in the foreground, distant trees barely visible through the haze. Soft, diffuse light and an atmospheric photographic look.",
  "Туман медленно движется между елями, камера плавно скользит над лесом.": "Mist drifts between the trees as the camera glides over the forest.",
  "Низкое": "Low",
  "Среднее": "Medium",
  "Высокое": "High",
  "Очень высокое": "Very high",
  "Максимальное": "Maximum",
  " сек": " s",
  "Разрешение": "Resolution",
  "Размер кадра": "Image size",
  "Длительность": "Duration",
  "Качество": "Quality",
  "В промпте можно писать img1, video1 и audio1. Введите @ для выбора.": "Use img1, video1 or audio1 in your prompt. Type @ to choose a reference.",
  "В промпте можно писать img1, img2 и дальше. Введите @ для выбора.": "Use img1, img2 and so on in your prompt. Type @ to choose a reference.",
  "Фото, MP4, MOV, MP3, WAV. При генерации файлы попадут в TempFile по открытой ссылке на 6 часов.": "Images, MP4, MOV, MP3 and WAV. Starting a generation uploads these files to TempFile with public links that last 6 hours.",
  "JPG, PNG, WebP · до 16 изображений": "JPG, PNG, WebP · up to 16 images",
  "Нет тарифа": "Rate unavailable",
  "Примеры промптов": "Example prompts",
  "Баланс ": "Balance ",
  "Лимит ": "Key limit ",
  "Баланс н/д": "Balance unavailable",
  "Баланс —": "Balance —",
  "Ключ OpenRouter": "OpenRouter API key",
  "Подключён ···· ": "Connected ···· ",
  "Отключить ключ": "Disconnect key",
  "Проверяем…": "Checking…",
  "Ключ подключён. Можно начать генерацию.": "Key connected. You can start generating.",
  "Подключить": "Connect",
  "Баланс OpenRouter": "OpenRouter balance",
  "На аккаунте ": "Account balance: ",
  "Баланс аккаунта недоступен с этим ключом.": "This key cannot access the account balance.",
  "Остаток лимита ключа ": "Remaining key allowance: ",
  "Потрачено этим ключом ": "Spent with this key: ",
  "Открыть кредиты OpenRouter ↗": "Open OpenRouter credits ↗",
  "Как считается стоимость": "How the estimate works",
  "Длительность ролика умножается на тариф Wan 3.0 для выбранного разрешения. Провайдер может дополнительно учитывать входное видео.": "The estimate multiplies the clip length by the Wan 3.0 rate for the selected resolution. The provider may also charge for input video.",
  "Seedance 2.5 тарифицируется по видеотокенам. Оценка учитывает размеры кадра, 24 кадра в секунду и длину ролика. При наличии видеореференсов также учитываются их длительность, отдельная ставка и минимальный объём списания.": "Seedance 2.5 bills by video tokens. The estimate uses the frame dimensions, 24 frames per second and the clip length. Video references also affect the estimate through their duration, input rate and minimum billable amount.",
  "Оценка рендера учитывает размер кадра, качество и цену выходных токенов. Текст и входные изображения оплачиваются дополнительно.": "The render estimate uses the image size, quality and output token price. Text and input images cost extra.",
  "Фактическая сумма из ответа OpenRouter появится в истории после генерации.": "The actual charge appears in your history when OpenRouter returns it.",
  "Вставить @": "Insert @",
  " в промпт": " into the prompt",
  "Убрать ": "Remove ",
  "Переместить ": "Move ",
  "Перетащите или переместите стрелками ↑ и ↓": "Drag or move with the ↑ and ↓ keys",
  "Не удалось воспроизвести ": "Could not play ",
  "Прослушать ": "Play ",
  " с": " s",
  "Браузер не смог прочитать ": "The browser could not read ",
  ". Проверьте формат и кодек.": ". Check the file format and codec.",
  " — допустим непустой файл до ": " — use a nonempty file up to ",
  " МБ.": " MB.",
  "Превышен лимит референсов этого типа для ": "Too many references of this type for ",
  " — каждый клип от ": " — each clip must be at least ",
  " с, всего до ": " s, with a total of up to ",
  " с для этого типа.": " s for this type.",
  " — размеры кадра не подходят для ": " — frame dimensions are outside the supported range for ",
  " — для видеореференса требуется от 407 696 до 8 295 044 пикселей в кадре.": " — video references must contain between 407,696 and 8,295,044 pixels per frame.",
  "Формат файла не поддерживается.": "Unsupported file format.",
  "Кадр-": "Kadr-",
  "Файл этой генерации недоступен в истории.": "This file is unavailable in your history.",
  "Результат генерации": "Generation result",
  "Скачать": "Download",
  "Сумма уточняется": "Charge pending",
  "В референсы": "Use as reference",
  "Дождитесь завершения текущей операции.": "Wait for the current operation to finish.",
  "Не удалось добавить файл.": "Could not add the file.",
  "Видео добавлено": "Video added",
  "Фото добавлено": "Image added",
  " как ": " as ",
  "Стоимость генераций уточняется": "Charges are pending",
  "Списано за все генерации: ": "Total spent: ",
  " · часть списаний уточняется": " · some charges are pending",
  "Здесь появятся ваши работы": "Your work will appear here",
  "Пока нет видео": "No videos yet",
  "Пока нет изображений": "No images yet",
  "Создайте изображение или видео в студии.": "Create an image or video in the studio.",
  "Готовые работы этого типа появятся здесь.": "Completed generations of this type will appear here.",
  "Удалить из ленты?": "Remove from feed?",
  "Файл и промпт будут удалены из истории этого браузера.": "The file and prompt will be deleted from this browser’s history.",
  "Карточка исчезнет из истории этого браузера.": "This card will be removed from this browser’s history.",
  " Запущенный запрос может завершиться со списанием в OpenRouter.": " OpenRouter may still complete and charge for the request.",
  "Оставить": "Keep",
  "Удалить": "Delete",
  "Удаление не удалось. Проверьте доступ к хранилищу браузера и повторите.": "Could not delete the item. Check browser storage access and try again.",
  "Подготовка…": "Preparing…",
  "Проверка приостановлена": "Status check paused",
  "Ошибка": "Error",
  "Проверить готовность": "Check status",
  "Открыть результат": "Open result",
  "Не удалось сохранить в историю. Скачайте файл до закрытия вкладки.": "Could not save to history. Download the file before closing this tab.",
  "Не удалось прочитать историю этого браузера.": "Could not read this browser’s history.",
  "Миниатюра изображения": "Image thumbnail",
  "Фото из истории": "Images from history",
  "Здесь появятся сгенерированные вами изображения.": "Images you generate will appear here.",
  "Миниатюра недоступна": "Thumbnail unavailable",
  "сумма уточняется": "charge pending",
  "Браузер не предоставил доступ к локальной истории.": "This browser did not grant access to local history.",
  "Скачиваем готовое видео…": "Downloading the finished video…",
  "Не удалось связаться с сервисом. Проверьте соединение.": "Could not reach the service. Check your connection.",
  " Перед повторной отправкой проверьте Activity в OpenRouter.": " Check OpenRouter Activity before submitting again.",
  "Опишите сцену.": "Describe your scene.",
  "Упоминание без вложения: ": "Missing reference: ",
  ". Удалите его или выберите референс через @.": ". Remove the mention or choose an attached reference with @.",
  "Входные видео и готовый ролик вместе должны длиться не больше 30 секунд. Уменьшите длительность.": "Input videos and the generated clip must total 30 seconds or less. Shorten the clip.",
  "С учётом текущих задач доступного остатка недостаточно по оценке. Проверяем баланс OpenRouter.": "Your estimated available balance is too low after accounting for active jobs. Checking OpenRouter…",
  "Баланс обновлён. Можно запускать генерацию.": "Balance updated. You can start generating.",
  "По оценке не хватает средств с учётом текущих задач. Дождитесь результата, измените настройки или пополните баланс.": "Estimated funds are insufficient after accounting for active jobs. Wait for a result, change settings or add credits.",
  "Загружаем референсы…": "Uploading references…",
  "Подготавливаем референсы…": "Preparing references…",
  "Отправляем видео в очередь…": "Submitting video…",
  "Генерируем изображение…": "Generating image…",
  "OpenRouter не вернул номер задачи. Проверьте Activity в OpenRouter.": "OpenRouter did not return a job ID. Check OpenRouter Activity.",
  "OpenRouter не вернул изображение. ": "OpenRouter did not return an image. ",
  "Проверьте запрос в истории OpenRouter.": "Check this request in OpenRouter Activity.",
  "Подключите ключ, чтобы получить результат.": "Connect your API key to retrieve the result.",
  "Проверьте API-ключ.": "Check your API key.",
  "Недостаточно кредитов OpenRouter.": "Insufficient OpenRouter credits.",
  "Для этого ключа доступ ограничен.": "Access is restricted for this key.",
  "OpenRouter просит немного подождать.": "OpenRouter is rate-limiting requests. Try again shortly.",
  "Ошибка OpenRouter ": "OpenRouter error ",
  "Не удалось прочитать файл.": "Could not read the file.",
  "Загрузка в TempFile не завершена. ": "The TempFile upload did not finish. ",
  "Код ": "Code ",
  ". Повторите загрузку.": ". Try uploading again.",
  "TempFile не подтвердил файл ": "TempFile could not verify ",
  "Видео не готово (": "Video job ended (",
  "Видео в очереди OpenRouter…": "Video queued in OpenRouter…",
  "Идёт генерация видео…": "Generating video…",
  "Задача ещё выполняется. Можно проверить её готовность позже.": "This job is still running. You can check its status later.",
  "[удалён: ": "[removed: ",
  "Кадр / Студия генерации": "Kadr / Generation Studio",
  "Кадр — рабочая студия для генерации изображений и видео через OpenRouter.": "Kadr is a browser studio for generating images and videos with OpenRouter.",
  "Кадр — студия": "Kadr Studio",
  "КАДР": "KADR",
  "Студия": "Studio",
  "API-ключ": "API key",
  "Студия генерации": "Generation studio",
  "Изображение": "Image",
  "Видео": "Video",
  "Модель": "Model",
  "Промпт": "Prompt",
  "Опишите сцену, свет и детали кадра…": "Describe the scene, lighting and details…",
  "Референсы для промпта": "Prompt references",
  "Введите @, чтобы выбрать прикреплённый референс.": "Type @ to choose an attached reference.",
  "Формат": "Aspect ratio",
  "Звук": "Audio",
  "Со звуком": "With audio",
  "Без звука": "Without audio",
  "Референсы": "References",
  "Из истории": "From history",
  "Перетащите файлы": "Drop files here",
  "или выберите": "or browse",
  "Оценка стоимости": "Estimated cost",
  "Сгенерировать": "Generate",
  "Мои генерации": "My generations",
  "Тип генерации": "Generation type",
  "Все": "All",
  "Изображения": "Images",
  "Загружаем историю…": "Loading history…",
  "Закрыть": "Close",
  "Ключ хранится в этой вкладке и передаётся только в OpenRouter.": "Your key stays in this tab and is sent only to OpenRouter.",
  "Получить ключ ↗": "Get an API key ↗",
  "Язык интерфейса": "Interface language"
};

let language="ru";
const staticLabels=[];
function uiLocale(){return language==="en"?"en-US":"ru-RU";}
function t(source){return language==="en" && Object.hasOwn(english,source)?english[source]:source;}

function uiError(format){
  const error=new Error(format());
  Object.defineProperty(error,"message",{get:format,configurable:true});
  return error;
}

function setLanguage(value){
  language=value==="en"?"en":"ru";
  document.documentElement.lang=language;
  document.getElementById("language").value=language;
  try{localStorage.setItem("kadr-language",language);}catch{}
  for(const render of staticLabels)render();
}
function initializeLanguage(){
  let preferred=navigator.language.toLowerCase().startsWith("en")?"en":"ru";
  try{preferred=localStorage.getItem("kadr-language")||preferred;}catch{}
  // Capture only the original interface. Prompts, filenames and saved media are user data.
  for(const root of [document,document.getElementById("keyForm").content]){
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const text=walker.currentNode,original=text.data,key=original.trim();
      if(Object.hasOwn(english,key))staticLabels.push(()=>{text.data=original.replace(key,()=>t(key));});
    }
    for(const element of root.querySelectorAll("[title],[placeholder],[aria-label],meta[name=description]")){
      for(const attr of ["title","placeholder","aria-label","content"]){
        const key=element.getAttribute(attr);
        if(key && Object.hasOwn(english,key))staticLabels.push(()=>element.setAttribute(attr,t(key)));
      }
    }
  }
  setLanguage(preferred);
}
