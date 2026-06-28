#!/usr/bin/env node
'use strict';

// Dev tool: fold a user-list export back into the userscript's default lists.
//
// Usage:
//   node scripts/merge-user-lists.js <export.json> [path/to/script.user.js]
//
// <export.json> is a "Export my contributor lists" file: { american: [...], foreign: [...] }.
// New names (not already in the matching default list) are inserted just before
// the `]; // end DEFAULT_AMERICAN` / `]; // end DEFAULT_FOREIGN` markers, keeping
// the file's single-quote, 4-space-indent style. Run the result through your
// editor / git diff before committing.

const fs = require('node:fs');
const path = require('node:path');

const LISTS = [
    { key: 'american', marker: '// end DEFAULT_AMERICAN' },
    { key: 'foreign', marker: '// end DEFAULT_FOREIGN' },
];

function fail(msg) {
    console.error('Error: ' + msg);
    process.exit(1);
}

// Mirrors the file's escaping: single-quoted with \' and \\ escapes.
function quote(name) {
    return "'" + name.replaceAll('\\', '\\\\').replaceAll("'", "\\'") + "'";
}

function unescape(literal) {
    return literal.replace(/\\(['\\])/g, '$1');
}

// Extracts the existing names between a list's opening and its end marker.
// markerIdx is the line number of the end marker (e.g. `// end DEFAULT_AMERICAN`).
function existingNames(lines, markerIdx) {
    const names = [];
    for (let i = markerIdx - 1; i >= 0; i--) {
        const line = lines[i];
        if (/=\s*\[\s*$/.test(line)) break; // reached `const DEFAULT_... = [`
        const m = line.match(/'((?:\\.|[^'\\])*)'/);
        if (m) names.push(unescape(m[1]));
    }
    return names;
}

function main() {
    const [exportPath, scriptArg] = process.argv.slice(2);
    if (!exportPath) {
        fail('missing <export.json>. Usage: node scripts/merge-user-lists.js <export.json> [script.user.js]');
    }
    const scriptPath = scriptArg
        ? path.resolve(scriptArg)
        : path.join(__dirname, '..', 'contributor-assistant-plus.user.js');

    let exported;
    try {
        exported = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    } catch (e) {
        fail('could not read/parse ' + exportPath + ': ' + e.message);
    }
    if (typeof exported !== 'object' || exported === null) {
        fail('export must be an object like { american: [...], foreign: [...] }');
    }

    const content = fs.readFileSync(scriptPath, 'utf8');
    const lines = content.split('\n');
    let totalAdded = 0;

    for (const { key, marker } of LISTS) {
        const incoming = exported[key];
        if (incoming === undefined) continue;
        if (!Array.isArray(incoming)) fail(`export.${key} must be an array`);

        const markerIdx = lines.findIndex(l => l.includes(marker));
        if (markerIdx === -1) fail(`could not find marker "${marker}" in ${path.basename(scriptPath)}`);

        const existing = existingNames(lines, markerIdx);
        const existingLower = new Set(existing.map(n => n.toLowerCase()));
        const oppositeKey = key === 'american' ? 'foreign' : 'american';
        const oppositeMarker = key === 'american' ? '// end DEFAULT_FOREIGN' : '// end DEFAULT_AMERICAN';
        const oppositeLower = new Set(
            existingNames(lines, lines.findIndex(l => l.includes(oppositeMarker))).map(n => n.toLowerCase())
        );

        const toAdd = [];
        const seen = new Set();
        for (const raw of incoming) {
            const name = String(raw).trim();
            if (!name) continue;
            const lower = name.toLowerCase();
            if (existingLower.has(lower) || seen.has(lower)) continue;
            if (oppositeLower.has(lower)) {
                console.warn(`  ! "${name}" is already in the ${oppositeKey} defaults — adding to ${key} anyway`);
            }
            seen.add(lower);
            toAdd.push(name);
        }

        if (toAdd.length === 0) {
            console.log(`${key}: nothing new`);
            continue;
        }

        // Give the previous last element a trailing comma so the insert stays valid.
        const lastElIdx = markerIdx - 1;
        if (/'[^']*'\s*$/.test(lines[lastElIdx]) && !/,\s*$/.test(lines[lastElIdx])) {
            lines[lastElIdx] = lines[lastElIdx].replace(/(\s*)$/, ',$1');
        }

        const newLines = toAdd.map(n => '    ' + quote(n) + ',');
        lines.splice(markerIdx, 0, ...newLines);
        totalAdded += toAdd.length;
        console.log(`${key}: added ${toAdd.length}`);
        toAdd.forEach(n => console.log('  + ' + n));
    }

    if (totalAdded === 0) {
        console.log('No changes.');
        return;
    }

    fs.writeFileSync(scriptPath, lines.join('\n'));
    console.log(`\nWrote ${totalAdded} new name(s) to ${path.relative(process.cwd(), scriptPath)}.`);
    console.log('Review the diff and bump @version / DEFAULTS_VERSION before committing.');
}

main();
