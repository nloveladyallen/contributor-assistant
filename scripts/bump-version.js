#!/usr/bin/env node
'use strict';

// Dev tool: bump the userscript version and/or DEFAULTS_VERSION.
//
// Usage:
//   node scripts/bump-version.js [-s] [-d] [script.user.js] [script.meta.js]
//
//   -s   bump the script @version (in both .user.js and .meta.js) to today's
//        date, following the YYYY-MM-DDx pattern. Same day => next letter.
//   -d   bump DEFAULTS_VERSION (in the .user.js) by one.
//   both flags bump both; no flags prompts interactively.
//
// The .user.js / .meta.js paths may be given as the non-flag arguments (in that
// order); otherwise they default to the files next to this script's parent dir.

const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

function fail(msg) {
    console.error('Error: ' + msg);
    process.exit(1);
}

// 'a' -> 'b', 'z' -> 'aa', 'az' -> 'ba'. Base-26 over lowercase letters.
function nextSuffix(suffix) {
    if (!suffix) return 'a';
    const chars = suffix.split('');
    let i = chars.length - 1;
    while (i >= 0) {
        if (chars[i] === 'z') {
            chars[i] = 'a';
            i--;
        } else {
            chars[i] = String.fromCodePoint(chars[i].codePointAt(0) + 1);
            return chars.join('');
        }
    }
    return 'a' + chars.join('');
}

function today() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// From `2026-06-28a` produce the next version for today. If the existing version
// is already dated today, advance the letter; otherwise start today at 'a'.
function nextScriptVersion(current) {
    const date = today();
    const m = current?.match(/^(\d{4}-\d{2}-\d{2})([a-z]*)$/);
    if (m?.[1] === date) {
        return date + nextSuffix(m[2]);
    }
    return date + 'a';
}

const VERSION_RE = /^(\s*\/\/\s*@version\s+)(\S+)(\s*)$/m;

function readFile(p) {
    try {
        return fs.readFileSync(p, 'utf8');
    } catch (e) {
        fail('could not read ' + p + ': ' + e.message);
    }
}

function bumpScriptVersion(userPath, metaPath) {
    const userContent = readFile(userPath);
    const userMatch = userContent.match(VERSION_RE);
    if (!userMatch) fail('could not find @version in ' + path.basename(userPath));

    const newVersion = nextScriptVersion(userMatch[2]);

    for (const p of [userPath, metaPath]) {
        const content = readFile(p);
        if (!VERSION_RE.test(content)) fail('could not find @version in ' + path.basename(p));
        const updated = content.replace(VERSION_RE, (_, prefix, _old, suffix) => prefix + newVersion + suffix);
        fs.writeFileSync(p, updated);
    }

    console.log(`@version: ${userMatch[2]} -> ${newVersion}`);
}

const DEFAULTS_RE = /^(\s*const\s+DEFAULTS_VERSION\s*=\s*)(\d+)(\s*;.*)$/m;

function bumpDefaultsVersion(userPath) {
    const content = readFile(userPath);
    const m = content.match(DEFAULTS_RE);
    if (!m) fail('could not find DEFAULTS_VERSION in ' + path.basename(userPath));

    const current = Number.parseInt(m[2], 10);
    const next = current + 1;
    const updated = content.replace(DEFAULTS_RE, (_, prefix, _old, suffix) => prefix + next + suffix);
    fs.writeFileSync(userPath, updated);

    console.log(`DEFAULTS_VERSION: ${current} -> ${next}`);
}

function prompt(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(question, answer => {
        rl.close();
        resolve(answer.trim().toLowerCase());
    }));
}

async function resolveFlags(flags) {
    if (flags.script || flags.defaults) return flags;

    const answer = await prompt('Bump [s]cript version, [d]efaults version, or [b]oth? ');
    if (answer === 's' || answer === 'script') return { script: true, defaults: false };
    if (answer === 'd' || answer === 'defaults') return { script: false, defaults: true };
    if (answer === 'b' || answer === 'both') return { script: true, defaults: true };
    fail('unrecognized choice "' + answer + '"');
}

async function main() {
    const args = process.argv.slice(2);
    const flags = { script: false, defaults: false };
    const positional = [];

    for (const arg of args) {
        if (arg === '--script') flags.script = true;
        else if (arg === '--defaults') flags.defaults = true;
        else if (arg === '-h' || arg === '--help') {
            console.log('Usage: node scripts/bump-version.js [-s] [-d] [script.user.js] [script.meta.js]');
            return;
        } else if (/^-[a-z]+$/.test(arg)) {
            // Short flags, bundled or not: -s, -d, -sd, -ds.
            for (const ch of arg.slice(1)) {
                if (ch === 's') flags.script = true;
                else if (ch === 'd') flags.defaults = true;
                else fail('unknown flag "-' + ch + '"');
            }
        } else if (arg.startsWith('-')) fail('unknown flag "' + arg + '"');
        else positional.push(arg);
    }

    const scriptDir = path.join(__dirname, '..');
    const userPath = positional[0]
        ? path.resolve(positional[0])
        : path.join(scriptDir, 'contributor-assistant-plus.user.js');
    const metaPath = positional[1]
        ? path.resolve(positional[1])
        : path.join(scriptDir, 'contributor-assistant-plus.meta.js');

    const resolved = await resolveFlags(flags);
    if (resolved.script) bumpScriptVersion(userPath, metaPath);
    if (resolved.defaults) bumpDefaultsVersion(userPath);
}

main();
