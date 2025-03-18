/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

const titleToggle = document.getElementById('titleTranslation') as HTMLInputElement;
const audioToggle = document.getElementById('audioTranslation') as HTMLInputElement;
const audioLanguageSelect = document.getElementById('audioLanguage') as HTMLSelectElement;
const descriptionToggle = document.getElementById('descriptionTranslation') as HTMLInputElement;
const subtitlesToggle = document.getElementById('subtitlesTranslation') as HTMLInputElement;
const subtitlesLanguageSelect = document.getElementById('subtitlesLanguage') as HTMLSelectElement;

// Initialize toggle states from storage
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get settings
        const data = await browser.storage.local.get('settings');
        
        // If settings don't exist, initialize them
        if (!data.settings) {
            await browser.storage.local.set({
                settings: {
                    titleTranslation: true,
                    audioTranslation: true,
                    descriptionTranslation: true,
                    subtitlesTranslation: false,
                    subtitlesLanguage: 'original'
                }
            });
            titleToggle.checked = true;
            audioToggle.checked = true;
            descriptionToggle.checked = true;
            subtitlesToggle.checked = false;
            subtitlesLanguageSelect.value = 'original';
            return;
        }
        
        // Settings exist, use them
        const settings = data.settings as ExtensionSettings;
        
        // Set toggle states
        titleToggle.checked = settings.titleTranslation;
        audioToggle.checked = settings.audioTranslation;
        descriptionToggle.checked = settings.descriptionTranslation;
        subtitlesToggle.checked = settings.subtitlesTranslation;
        
        // Set subtitle language
        if (settings.subtitlesLanguage) {
            subtitlesLanguageSelect.value = settings.subtitlesLanguage;
        }

        // Set audio language
        if (settings.audioLanguage) {
            audioLanguageSelect.value = settings.audioLanguage;
        }
        
        console.log(
            '[NTM-Debug] Settings loaded - Title translation prevention is: %c%s',
            settings.titleTranslation ? 'color: green; font-weight: bold' : 'color: red; font-weight: bold',
            settings.titleTranslation ? 'ON' : 'OFF'
        );
        console.log(
            '[NTM-Debug] Settings loaded - Audio translation prevention is: %c%s',
            settings.audioTranslation ? 'color: green; font-weight: bold' : 'color: red; font-weight: bold',
            settings.audioTranslation ? 'ON' : 'OFF'
        );
        console.log(
            '[NTM-Debug] Settings loaded - Description translation prevention is: %c%s',
            settings.descriptionTranslation ? 'color: green; font-weight: bold' : 'color: red; font-weight: bold',
            settings.descriptionTranslation ? 'ON' : 'OFF'
        );
        console.log(
            '[NTM-Debug] Settings loaded - Subtitles translation prevention is: %c%s',
            settings.subtitlesTranslation ? 'color: green; font-weight: bold' : 'color: red; font-weight: bold',
            settings.subtitlesTranslation ? 'ON' : 'OFF'
        );
    } catch (error) {
        console.error('Load error:', error);
    }

    // Load subtitles language
    browser.storage.local.get('subtitlesLanguage').then((result) => {
        if (result.subtitlesLanguage && typeof result.subtitlesLanguage === 'string') {
            subtitlesLanguageSelect.value = result.subtitlesLanguage;
        }
    });
});

// Handle title toggle changes
titleToggle.addEventListener('change', async () => {
    const isEnabled = titleToggle.checked;
    
    // Save state
    try {
        const data = await browser.storage.local.get('settings');
        const settings = data.settings as ExtensionSettings;
        
        await browser.storage.local.set({
            settings: {
                ...settings,
                titleTranslation: isEnabled
            }
        });
        console.log('Title state saved');
    } catch (error) {
        console.error('Title save error:', error);
    }

    // Update state
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
            await browser.tabs.sendMessage(tabs[0].id, {
                action: 'toggleTranslation',
                feature: 'titles',
                isEnabled
            });
            console.log('Title state updated');
        }
    } catch (error) {
        console.error('Title update error:', error);
    }
});

// Handle audio toggle changes
audioToggle.addEventListener('change', async () => {
    const isEnabled = audioToggle.checked;
    
    // Save state
    try {
        const data = await browser.storage.local.get('settings');
        const settings = data.settings as ExtensionSettings;
        
        await browser.storage.local.set({
            settings: {
                ...settings,
                audioTranslation: isEnabled
            }
        });
        console.log('Audio state saved');
    } catch (error) {
        console.error('Audio save error:', error);
    }

    // Update state
    try {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
            await browser.tabs.sendMessage(tabs[0].id, {
                action: 'toggleTranslation',
                feature: 'audio',
                isEnabled
            });
            console.log('Audio state updated');
        }
    } catch (error) {
        console.error('Audio update error:', error);
    }
});

// Handle description toggle changes
descriptionToggle.addEventListener('change', async () => {
    const isEnabled = descriptionToggle.checked;
    
    try {
        const data = await browser.storage.local.get('settings');
        const settings = data.settings as ExtensionSettings;
        
        await browser.storage.local.set({
            settings: {
                ...settings,
                descriptionTranslation: isEnabled
            }
        });

        // Send message to content script
        await browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id!, {
                feature: 'description',
                isEnabled
            } as Message);
        });
    } catch (error) {
        console.error('Save error:', error);
    }
});

// Handle subtitles toggle changes
subtitlesToggle.addEventListener('change', async () => {
    const isEnabled = subtitlesToggle.checked;
    
    try {
        const data = await browser.storage.local.get('settings');
        const settings = data.settings as ExtensionSettings;
        
        await browser.storage.local.set({
            settings: {
                ...settings,
                subtitlesTranslation: isEnabled
            }
        });

        // Send message to content script
        await browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
            browser.tabs.sendMessage(tabs[0].id!, {
                feature: 'subtitles',
                isEnabled
            } as Message);
        });
    } catch (error) {
        console.error('Save error:', error);
    }
});

// Handle subtitles language selection changes
subtitlesLanguageSelect.addEventListener('change', async () => {
    const selectedLanguage = subtitlesLanguageSelect.value;
    
    // Save language preference
    try {
        const data = await browser.storage.local.get('settings');
        const settings = data.settings as ExtensionSettings;
        
        await browser.storage.local.set({
            settings: {
                ...settings,
                subtitlesLanguage: selectedLanguage
            }
        });
        
        console.log('Subtitles language saved:', selectedLanguage);
        
        // Inform active tab about the change
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
            await browser.tabs.sendMessage(tabs[0].id, {
                feature: 'subtitlesLanguage',
                language: selectedLanguage
            });
        }
    } catch (error) {
        console.error('Failed to save subtitles language:', error);
    }
});

// Handle audio language selection changes
audioLanguageSelect.addEventListener('change', async () => {
    const selectedLanguage = audioLanguageSelect.value;
    
    try {
        const data = await browser.storage.local.get('settings');
        const settings = data.settings as ExtensionSettings;
        
        await browser.storage.local.set({
            settings: {
                ...settings,
                audioLanguage: selectedLanguage
            }
        });
        
        console.log('Audio language saved:', selectedLanguage);
        
        // Inform active tab about the change
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        if (tabs[0]?.id) {
            await browser.tabs.sendMessage(tabs[0].id, {
                feature: 'audioLanguage',
                language: selectedLanguage
            });
        }
    } catch (error) {
        console.error('Failed to save audio language:', error);
    }
});