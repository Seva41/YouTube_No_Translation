/*
 * Copyright (C) 2025-present YouGo (https://github.com/youg-o)
 * This program is licensed under the GNU Affero General Public License v3.0.
 * You may redistribute it and/or modify it under the terms of the license.
 *
 * Attribution must be given to the original author.
 * This program is distributed without any warranty; see the license for details.
*/

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';

const source = readFileSync(new URL('../src/content/subtitles/subtitlesScript.js', import.meta.url), 'utf8');
type Track = { languageCode?: string; kind?: string; name?: { simpleText: string } };
type AudioTrack = { id: string };

const asr = (languageCode: string): Track => ({ languageCode, kind: 'asr', name: { simpleText: languageCode } });
const manual = (languageCode: string): Track => ({ languageCode, name: { simpleText: languageCode } });
const audioTrack = (languageCode: string, isOriginal: boolean): AudioTrack => ({
    id: `251;${Buffer.from(`acont ${isOriginal ? 'original' : 'dubbed-auto'} lang==${languageCode}`).toString('base64')}`
});

function select(captionTracks: Track[], { audioLanguage = 'en-US', defaultAudioLanguage = audioLanguage, enabled = true, current = {} }: { audioLanguage?: string | null; defaultAudioLanguage?: string | null; enabled?: boolean; current?: Track } = {}) {
    let selected = current;
    const availableAudioTracks = audioLanguage
        ? [audioTrack('fr-FR', false), audioTrack(audioLanguage, true)]
        : [audioTrack('fr-FR', false)];
    const player = {
        getOption: () => current,
        getAvailableAudioTracks: () => availableAudioTracks,
        getPlayerResponse: () => ({
            captions: { playerCaptionsTracklistRenderer: { captionTracks } },
            streamingData: defaultAudioLanguage ? { adaptiveFormats: [
                { audioTrack: { id: 'ar.10', audioIsDefault: false, isAutoDubbed: true } },
                { audioTrack: { id: `${defaultAudioLanguage}.4`, audioIsDefault: true } }
            ] } : undefined
        }),
        setOption: (_module: string, _option: string, track: Track) => { selected = track; }
    };
    runInNewContext(source, {
        document: { getElementById: () => player },
        window: { location: { pathname: '/watch' } },
        atob,
        localStorage: { getItem: (key: string) => ({
            'ynt-subtitlesLanguage': 'original',
            'ynt-subtitlesAsrEnabled': String(enabled)
        } as Record<string, string>)[key] },
        setTimeout: () => assert.fail('Unexpected retry'),
        console
    });
    return selected;
}

// Minimized from 3QtoaoMYzMU: Arabic precedes English; original audio is en-US.4.
test('original captions select English ASR, not the first dubbed ASR', () => {
    assert.equal(select([asr('ar'), asr('en')]).languageCode, 'en');
});

test('selection does not depend on caption order', () => {
    assert.equal(select([asr('en'), asr('ar')]).languageCode, 'en');
});
test('corrects an already active Arabic ASR track', () => {
    assert.equal(select([asr('ar'), asr('en')], { current: asr('ar') }).languageCode, 'en');
});
test('prefers manual captions matching the original base language', () => {
    const track = manual('en-GB');
    assert.equal(select([asr('ar'), asr('en'), track]), track);
});
test('keeps ASR disabled when requested', () => {
    assert.equal(select([asr('ar'), asr('en')], { enabled: false }).languageCode, undefined);
});
test('supports legacy single ASR without audio metadata', () => {
    assert.equal(select([asr('fr')], { audioLanguage: null }).languageCode, 'fr');
});
test('does not guess from multiple ASR tracks without audio metadata', () => {
    assert.equal(select([asr('ar'), asr('en')], { audioLanguage: null }).languageCode, undefined);
});
test('preserves the single manual track fallback', () => {
    const track = manual('fr');
    assert.equal(select([track], { audioLanguage: null }), track);
});
test('does not treat a lone dubbed ASR as a manual fallback', () => {
    assert.equal(select([asr('ar')]).languageCode, undefined);
});
test('uses the original language rather than hardcoding English', () => {
    assert.equal(select([asr('ar'), asr('en'), asr('fr')], { audioLanguage: 'fr-FR' }).languageCode, 'fr');
});

test('selects original-language manual captions without a matching ASR track', () => {
    const originalManualTrack = manual('zh');
    assert.equal(
        select([asr('en'), manual('en-US'), originalManualTrack], { audioLanguage: 'zh-Hant' }),
        originalManualTrack
    );
});

test('identifies the original track from its encoded ID, not audioIsDefault', () => {
    const originalTrack = manual('en-US');
    assert.equal(
        select([manual('fr-FR'), originalTrack], { audioLanguage: 'en-US', defaultAudioLanguage: 'fr-FR' }),
        originalTrack
    );
});
