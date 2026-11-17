**[Open Kadr Studio in your browser](https://tkuzyuminskaya1988-hue.github.io/kadr-studio/)**

[Русский](README.md) · English

# Kadr Studio

Generate images and videos with your own OpenRouter account. Set the prompt, model and references on the left and browse results on the right. Download a result or use it as a reference for your next shot. Choose **English** or **Русский** in the header. The studio remembers your preference in this browser.

The hosted studio works in a modern browser with an internet connection. Generation requires an OpenRouter API key with access to the selected model. To run your own copy, serve the included HTML, CSS, JavaScript and assets. No build step is required.

## Run locally

1. On GitHub, choose **Code → Download ZIP** and extract the archive. If you use Git, clone the repository instead.

   ```sh
   git clone https://github.com/tkuzyuminskaya1988-hue/kadr-studio.git
   cd kadr-studio
   ```

2. Open a terminal in the folder containing `index.html`. On Windows, you can type `powershell` in the File Explorer address bar and press Enter. Start a local server with Python 3.

   **Windows (PowerShell)**

   ```powershell
   python -m http.server 8000 --bind 127.0.0.1
   ```

   **macOS or Linux**

   ```sh
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

3. Keep the terminal open and visit [http://127.0.0.1:8000/](http://127.0.0.1:8000/). Press **Ctrl+C** in the terminal to stop the server. Use the same browser, address and port next time to see your previous work.

On Windows, if the `python` command is unavailable, try `py -3 -m http.server 8000 --bind 127.0.0.1`. If the port is in use, change `8000` to `8001` in both the command and the URL. A different port has its own browser history database. [Download Python 3](https://www.python.org/downloads/)

## Generate your first image

1. Click **API key**, paste your key and select **Connect**. The header shows the balance or remaining key allowance when available. [Create an OpenRouter key](https://openrouter.ai/settings/keys) · [Manage credits](https://openrouter.ai/settings/credits)
2. Choose **Image** and a model. Try an **Example prompt** or write your own, such as “A foggy morning on a riverside promenade, soft side lighting, wide shot.”
3. Choose the image size and quality. For a video, switch to **Video** and set resolution, duration, aspect ratio and audio. The studio displays the estimated cost above **Generate**.
4. Click **Generate**. A card appears in the feed immediately. You can edit the form and submit another job while it runs. Each job keeps its own prompt, settings and references.
5. When the result appears, click **Download** to save the original file or **Use as reference** to attach it to the editor. Reusing a video switches the editor to video mode.

## Supported models

| Mode | Model | OpenRouter identifier |
| --- | --- | --- |
| Image | GPT Image 2.6 Flare | `openai/gpt-image-2.6-flare` |
| Image | GPT Image 2.6 Sunburst | `openai/gpt-image-2.6-sunburst` |
| Video | Wan 3.0 | `alibaba/wan-3.0` |
| Video | Seedance 2.5 | `bytedance/seedance-2.5` |

## References and prompts

Drop files in **References** or click to browse. Hover over an image or video thumbnail to see a larger preview. Audio references have a playback button. Each type is numbered separately in upload order, regardless of filename: `img1`, `img2`, `video1`, `audio1`.

> The character from @img1 walks down the street in @img2. The camera tracks alongside them.

Type `@` to choose a reference, or paste a prompt with bare names such as `img1`. Drag a reference to reorder it, or focus its handle and use the up and down arrow keys. The studio updates the numbers in your prompt so they keep pointing to the same files. Removing a reference marks its mentions as removed. Replace or delete those mentions before submitting.

Image mode accepts JPG, PNG and WebP. Video mode also accepts BMP, MP4, MOV, MP3 and WAV. File size, frame dimensions, duration and reference counts depend on the model. The editor reports validation errors below the attachments.

For image generation, the browser sends reference images directly to OpenRouter as part of the request. For video generation, starting a job uploads attached references to TempFile and passes public HTTPS links to OpenRouter. The studio requests a six-hour expiry. Anyone who receives a link can open it while it is valid.

## History, API keys and charges

| Item | What happens |
| --- | --- |
| Finished images and videos | Files, prompts and reported charges are saved in IndexedDB for the current site and browser profile. They survive normal reloads and tab closure. Download files separately to move them to another device. |
| API key | Stored in the current tab’s session storage and sent only to OpenRouter. Each user enters their own key. |
| Image in progress | Keep the tab open until the result arrives. Reloading or closing it can interrupt delivery. |
| Video in progress | Once OpenRouter accepts the job, its ID is saved in the tab session. Reloading the same tab resumes status checks. Closing the tab can end that session. |
| Deletion | **Delete** asks for confirmation, then removes the file and prompt from local history. A record ID and any known charge are retained for accounting. OpenRouter may still finish and charge for a running request. |

The estimate uses your settings and the available pricing data. If the key exposes a balance or allowance, estimates for active jobs also count toward the funds available for another job. A completed card shows the actual charge when OpenRouter reports it. You can check individual requests in [OpenRouter Activity](https://openrouter.ai/activity).

## Host your own copy

Serve `index.html`, `style.css`, all four JavaScript files and the `assets/` folder together on a static HTTPS host. Relative paths support subdirectories, including a GitHub Pages project site. Users enter their keys in the interface.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Directory listing or 404 on localhost | Start the server from the folder containing `index.html` and check the port in your browser. |
| OpenRouter returns 401 or 402 | For 401, reconnect the key. For 402, check your credits and any spending limit on the key. |
| Error 429 | The provider is rate-limiting requests. Wait before submitting another job. |
| TempFile cannot verify a file | Check your connection and the model’s file limits, then attach the file again. |
| Connection lost during submission | Check OpenRouter Activity before retrying. The provider may already have accepted the job. |
| History appears empty | Check the browser profile, hostname and port. Clearing site data clears local history. If storage is full, download a finished result before closing its tab. |

## Source files

| File | Purpose |
| --- | --- |
| `index.html`, `style.css` | Studio interface and responsive layout. |
| `app.js` | Editor, model settings, estimates, concurrent jobs, feed and references. |
| `api.js` | OpenRouter requests, TempFile uploads, video polling and local history. |
| `mentions.js` | Reference highlighting, suggestions and renumbering. |
| `i18n.js` | Interface translations and language preference. |
| `assets/` | Studio mark and sample photographs. |

Sample photography by [Benoît Deschasaux](https://unsplash.com/photos/qYvcpEBLB1c), [Marc Cordeau](https://unsplash.com/photos/Z3MsCdxNJg4) and [Clyde He](https://unsplash.com/photos/TEND07a9xDg) on Unsplash.
