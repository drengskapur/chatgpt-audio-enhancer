// ==UserScript==
// @name         ChatGPT Audio Enhancer
// @namespace    com.drengskapur.chatgpt
// @version      1.0.8
// @description  Enhance ChatGPT with audio playback controls and download functionality, including auto-download feature.
// @author       drengskapur
// @match        *://chatgpt.com/*
// @match        *://chat.openai.com/*
// @downloadURL  https://raw.githubusercontent.com/drengskapur/chatgpt-audio-enhancer/main/chatgpt-audio-enhancer.user.js
// @updateURL    https://raw.githubusercontent.com/drengskapur/chatgpt-audio-enhancer/main/chatgpt-audio-enhancer.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    console.log('ChatGPT Audio Controls & Downloader loaded');

    // --- Audio Player Elements ---
    let audio = null; // Audio element for playback
    let playPauseBtn; // Play/Pause button
    let controlsDiv; // Container for audio controls
    let seekBar; // Seek bar
    let audioBlob = null; // Audio data (Blob)
    let currentTimeText; // Current time display
    let settingsBtn; // Settings button
    let isRepeating = localStorage.getItem('isRepeating') === 'true'; // Is audio repeating?
    let isAutoDownload = localStorage.getItem('isAutoDownload') === 'true'; // Is auto-download enabled?

    /**
     * Downloads a Blob as a file.
     *
     * @param {Blob} blob The Blob object to download.
     * @param {string} fileName The desired file name for download.
     */
    function downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    }

    /**
     * Updates the audio source and initializes controls.
     *
     * @param {Blob} blob The audio Blob to set as the audio source.
     */
    function updateAudioSource(blob) {
        const fileUrl = URL.createObjectURL(blob);

        if (audio) {
            audio.pause();
            audio.src = fileUrl;
        } else {
            audio = new Audio(fileUrl);
            if (!controlsDiv) {
                createControls();
            }
        }

        audioBlob = blob;
        setControlsState(true);

        audio.play().catch(err => console.error('Audio playback error:', err))
            .then(() => {
                playPauseBtn.innerHTML = '⏸️';
                playPauseBtn.title = 'Pause';
                if (isAutoDownload) {
                    download();
                }
            });

        audio.addEventListener('timeupdate', updateSeekBar);
        audio.addEventListener('ended', () => {
            if (isRepeating) {
                restartAudio();
            }
        });
        audio.addEventListener('error', (e) => {
            console.error('Audio element error:', e);
        });
    }

    /**
     * Intercepts fetch requests to capture synthesized audio data.
     */
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
        const url = args[0];

        if (typeof url === 'string' && url.includes('backend-api/synthesize')) {
            console.log('Intercepted TTS audio synthesis fetch:', url);
            try {
                const response = await originalFetch(...args);

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const blob = await response.blob();
                updateAudioSource(blob);
                return response;
            } catch (error) {
                console.error('Error fetching or downloading audio:', error);
                throw error;
            }
        }
        return originalFetch(...args);
    };

    /**
     * Creates the audio controls UI and appends it to the page.
     */
    function createControls() {
        controlsDiv = document.createElement('div');
        controlsDiv.id = 'audioControls';
        controlsDiv.style.cssText = `
            position: fixed;
            top: 0px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            display: flex;
            gap: 5px;
            align-items: center;
            opacity: 1;
            transition: opacity 0.5s ease;
            background: rgba(0, 0, 0, 0);
            padding: 5px;
            border-radius: 5px;
            color: white;
        `;

        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';

        buttonContainer.appendChild(createButton('⏪', 'Rewind 10 seconds', rewind));
        playPauseBtn = createButton('▶️', 'Play', togglePlayPause);
        buttonContainer.appendChild(playPauseBtn);
        buttonContainer.appendChild(createButton('⏩', 'Forward 10 seconds', fastForward));

        seekBar = document.createElement('input');
        seekBar.type = 'range';
        seekBar.min = 0;
        seekBar.max = 100;
        seekBar.value = 0;
        seekBar.style.width = '200px';
        seekBar.addEventListener('input', seek);

        currentTimeText = document.createElement('span');
        currentTimeText.textContent = '0:00';

        const downloadButton = createButton('⬇️', 'Download', download);
        settingsBtn = createButton('⚙️', 'Settings', openSettingsModal);

        controlsDiv.appendChild(buttonContainer);
        controlsDiv.appendChild(seekBar);
        controlsDiv.appendChild(currentTimeText);
        controlsDiv.appendChild(downloadButton);
        controlsDiv.appendChild(settingsBtn);

        document.body.appendChild(controlsDiv);
        setControlsState(false);
    }

    /**
     * Creates a button element with the given label, tooltip, and click handler.
     *
     * @param {string} label The text label for the button.
     * @param {string} tooltip The tooltip text for the button.
     * @param {function} onClick The function to execute when the button is clicked.
     * @returns {HTMLButtonElement} The created button element.
     */
    function createButton(label, tooltip, onClick) {
        const button = document.createElement('button');
        button.innerHTML = label;
        button.title = tooltip;
        button.style.cssText = `
            cursor: pointer;
            background: none;
            border: none;
            font-size: 16px;
            padding: 5px 10px;
            border-radius: 5px;
            color: white;
        `;
        button.addEventListener('click', onClick);
        return button;
    }

    /**
     * Sets the visibility of the audio controls.
     *
     * @param {boolean} enabled True to show controls, false to hide.
     */
    function setControlsState(enabled) {
        controlsDiv.style.display = enabled ? 'flex' : 'none';
    }

    // --- Audio Control Functions ---

    function restartAudio() {
        audio.currentTime = 0;
        audio.play();
        playPauseBtn.innerHTML = '⏸️';
        playPauseBtn.title = 'Pause';
    }

    function togglePlayPause() {
        if (audio.paused || audio.ended) {
            audio.play();
            playPauseBtn.innerHTML = '⏸️';
            playPauseBtn.title = 'Pause';
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '▶️';
            playPauseBtn.title = 'Play';
        }
    }

    function rewind() {
        audio.currentTime = Math.max(0, audio.currentTime - 10);
    }

    function fastForward() {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
    }

    function openSettingsModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10001;
            background: #333; /* Changed to a solid color */
            padding: 20px;
            border-radius: 10px;
            color: white;
        `;

        const modalContent = `
            <h2>Settings</h2>
            <label style="display: block; margin-bottom: 10px;">
                <input type="checkbox" id="autoDownloadCheckbox" ${isAutoDownload ? 'checked' : ''}>
                Auto-Download
            </label>
            <label style="display: block; margin-bottom: 20px;">
                <input type="checkbox" id="repeatCheckbox" ${isRepeating ? 'checked' : ''}>
                Repeat
            </label>
            <button id="closeSettingsBtn" style="
                cursor: pointer;
                background: #555;
                border: none;
                font-size: 16px;
                padding: 10px 20px;
                border-radius: 5px;
                color: white;
            ">Close</button>
        `;

        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

        document.getElementById('autoDownloadCheckbox').addEventListener('change', (e) => {
            isAutoDownload = e.target.checked;
            localStorage.setItem('isAutoDownload', isAutoDownload);
        });

        document.getElementById('repeatCheckbox').addEventListener('change', (e) => {
            isRepeating = e.target.checked;
            localStorage.setItem('isRepeating', isRepeating);
        });

        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    /**
     * Downloads the audio blob if available.
     */
    function download() {
        if (audioBlob) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const filename = `${year}-${month}-${day}_${hours}${minutes}${seconds}_audio.aac`;
            downloadBlob(audioBlob, filename);
        } else {
            console.error('No audio to download.');
        }
    }

    /**
     * Updates the seek bar position and current time display.
     */
    function updateSeekBar() {
        const value = (audio.currentTime / audio.duration) * 100;
        seekBar.value = value;
        currentTimeText.textContent = formatTime(audio.currentTime);
    }

    /**
     * Sets the audio current time based on the seek bar position.
     */
    function seek() {
        const time = (seekBar.value / 100) * audio.duration;
        audio.currentTime = time;
    }

    /**
     * Formats time in seconds to minutes:seconds format.
     *
     * @param {number} seconds The time in seconds.
     * @returns {string} The formatted time string.
     */
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Observes and hides the "Failed to play message" if it appears.
     * This might be specific to certain ChatGPT layouts.
     */
    function blockFailedToPlayMessage() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const divs = node.querySelectorAll('div');
                            divs.forEach((div) => {
                                if (div.textContent.includes('Failed to play message')) {
                                    div.style.display = 'none';
                                }
                            });
                        }
                    });
                }
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    blockFailedToPlayMessage();
})();
