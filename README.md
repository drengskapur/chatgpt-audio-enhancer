## ChatGPT Audio Enhancer

| <h1 style="font-size:60px;">Enhance ChatGPT with Audio Controls and Download Functionality</h1> |
|:-:|
| <img src="https://raw.githubusercontent.com/drengskapur/chatgpt-audio-enhancer/main/chatgpt-audio-enhancer.gif" width="66%"> |

This userscript adds a convenient control bar to ChatGPT, allowing you to:

* **Play, pause, rewind, and fast-forward** synthesized audio responses.
* **Repeat** audio playback.
* **Download** audio responses as AAC files.

### Installation

1. **Install a userscript manager:**

   * **Tampermonkey:** [https://tampermonkey.net/](https://tampermonkey.net/)
   * **Greasemonkey:** [https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)

2. **Install ChatGPT Audio Enhancer:**

   * **Easiest method:** Click this link to open the raw script: [https://raw.githubusercontent.com/drengskapur/chatgpt-audio-enhancer/main/chatgpt-audio-enhancer.user.js](https://raw.githubusercontent.com/drengskapur/chatgpt-audio-enhancer/main/chatgpt-audio-enhancer.user.js)
     - Tampermonkey/Greasemonkey should automatically detect the script and prompt you to install it.
   * **Manual Installation:**
     - Copy the script's URL
       ```
       https://raw.githubusercontent.com/drengskapur/chatgpt-audio-enhancer/main/chatgpt-audio-enhancer.user.js
       ```
     - Open your userscript manager's settings.
     - Look for an option to "Add New Script" or "Import from URL."
     - Paste the copied URL into the field and click "Install."

3. **Enable the script:** Ensure ChatGPT Audio Enhancer is enabled within your userscript manager's settings.

### Usage

Once installed and enabled, the script will automatically add audio controls to ChatGPT whenever audio responses are available.

* **Play/Pause:** Click the ▶️/⏸️ button.
* **Rewind/Fast Forward:** Click the ⏪/⏩ buttons.
* **Restart:** Click the ⏮️ button.
* **Repeat:** Click the 🔁/🟦 button.
* **Download:** Click the ⬇️ button.

### Features

* **Intercepts audio synthesis requests:** Captures synthesized audio data and plays it back using HTML5 audio.
* **Customizable controls:** Provides a floating control bar with playback controls, seeking, and download options.
* **Repeat functionality:** Allows users to loop audio playback.
* **Download option:** Enables downloading audio responses as AAC files.

### Security and Privacy

ChatGPT Audio Enhancer operates with minimal permissions (`@grant none`) and only accesses ChatGPT's audio URLs for playback and download. It does not read or store any other data from your ChatGPT sessions.

**Note:** While this script prioritizes privacy, using browser extensions and userscripts carries inherent risks. Ensure you trust the source of any script you install. Refer to your userscript manager's documentation for more information on userscript security.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
