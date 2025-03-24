/* 
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 * 
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
 */

/**
 * This script is injected when a timestamp is clicked in the description.
 * It accesses the player directly to navigate to the specific timestamp.
 */
(() => {
    const LOG_PREFIX = '[YNT]';
    const LOG_STYLES = {
        DESCRIPTION: { context: '[DESCRIPTION]', color: '#2196F3' }
    };

    function createLogger(category) {
        return (message, ...args) => {
            console.log(
                `%c${LOG_PREFIX}${category.context} ${message}`,
                `color: ${category.color}`,
                ...args
            );
        };
    }

    // Create error logger function
    const ERROR_COLOR = '#F44336';  // Red

    function createErrorLogger(category) {
        return (message, ...args) => {
            console.log(
                `%c${LOG_PREFIX}${category.context} %c${message}`,
                `color: ${category.color}`,  // Keep category color for prefix
                `color: ${ERROR_COLOR}`,     // Red color for error message
                ...args
            );
        };
    }

    const descriptionLog = createLogger(LOG_STYLES.DESCRIPTION);
    const descriptionErrorLog = createErrorLogger(LOG_STYLES.DESCRIPTION);

    // Get timestamp from custom event
    const timestampEvent = document.currentScript.getAttribute('ynt-timestamp-event');
    if (!timestampEvent) {
        descriptionErrorLog('No timestamp event found');
        return;
    }

    const timestampData = JSON.parse(timestampEvent);
    const seconds = parseInt(timestampData.seconds, 10);

    // Get player
    const player = document.getElementById('movie_player');
    if (!player) {
        descriptionErrorLog('Player element not found');
        return;
    }

    // Navigate to timestamp
    try {
        player.seekTo(seconds, true);
        descriptionLog(`Navigated to timestamp: ${seconds}s`);
    } catch (error) {
        descriptionErrorLog(`Failed to navigate to timestamp: ${error}`);
    }
})();