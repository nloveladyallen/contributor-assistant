# Contributor Assistant+

A userscript that marks stock-media contributors as **American** or **foreign** across
major stock sites, and adds country filters to Pond5 and Envato search results.

Some clients will only license stock footage and photos from American contributors.
Stock sites rarely make a contributor's nationality obvious, so this script flags each
item's contributor and lets you build up your own American/foreign lists as you browse.

## Features

- **Contributor flagging** — on item pages, the contributor's name gets an emoji:
  - 🇺🇸 known American
  - 🛑 known foreign
  - ❓ unknown (not in any list yet)
- **One-click classification** — click the ❓ to mark a contributor as American (🇺🇸) or
  foreign (🛑). Your choice is saved and reused everywhere.
- **Search filters** — on Pond5 and Envato search pages, adds "Known American",
  "Known Foreign", and "Unknown" checkboxes to hide/show results by contributor status.
- **Personal lists** — your classifications always override the built-in defaults, and
  can be exported/imported as JSON.

### Supported sites

| Site | Item pages (flagging) | Search filters |
| --- | :---: | :---: |
| Shutterstock | ✅ | Already supported |
| Pond5 | ✅ | ✅ |
| Adobe Stock | ✅ | Already supported |
| Envato Elements | ✅ | ✅ |
| Storyblocks | ✅ | |
| Artgrid | ✅ | |
| Artlist | ✅ | |
| Dissolve | ✅ | |
| iStock | ✅ | Already supported |

## Installation

1. Install a userscript manager in your browser. [Tampermonkey](https://www.tampermonkey.net/)
   is recommended (Chrome, Edge, Firefox, Safari).
2. Open the installer link:
   **[contributor-assistant-plus.user.js](https://raw.githubusercontent.com/nloveladyallen/contributor-assistant/refs/heads/master/contributor-assistant-plus.user.js)**
3. Tampermonkey will prompt you to install it. Confirm.

Updates are published to the same URL; Tampermonkey checks for new versions automatically.

> **Note:** the "one-click classify" and search-filter features rely on the
> `window.onurlchange` API, which Tampermonkey supports. Other managers may work but are
> untested.

## Usage

### Flagging contributors

Open any supported item page (e.g. a Shutterstock video or an Adobe Stock image). An emoji
appears next to the contributor's name:

- 🇺🇸 / 🛑 — already classified.
- ❓ — unknown. Click it, then choose 🇺🇸 (American) or 🛑 (foreign). A ✅ confirms the
  contributor was saved to your list.

### Filtering search results

On a [Pond5 search](https://www.pond5.com/search) or Envato Elements
(stock-video / photos) search page, a **Country** filter with three checkboxes appears in
the sidebar. Uncheck a category to hide those results. Filtering also applies to results
loaded as you scroll.

### Managing your lists

Tampermonkey's extension menu (on any supported page) exposes these commands:

- **Export my contributor lists** — downloads your lists as a JSON file
  (`{ "american": [...], "foreign": [...] }`).
- **Import my contributor lists** — merges a previously exported JSON file into your lists.
- **Clear my contributor lists** — removes your personal classifications (defaults remain).
- **Reset everything to defaults** — wipes your lists and restores the built-in defaults.

## Development

The script is a single file, `contributor-assistant-plus.user.js`, with a companion
`contributor-assistant-plus.meta.js` used for update checks. When you change the script,
bump `@version` in both files (`scripts/bump-version.js`).

Contributor names are matched against two sources: the built-in `DEFAULT_AMERICAN` /
`DEFAULT_FOREIGN` lists and the user's personal lists (which take precedence).

### Folding user lists back into the defaults

To promote names from an exported user list into the built-in defaults:

```sh
node scripts/merge-user-lists.js <export.json> [path/to/script.user.js]
```

`<export.json>` is an "Export my contributor lists" file. New names (not already in the
matching default list, case-insensitive) are inserted before the
`// end DEFAULT_AMERICAN` / `// end DEFAULT_FOREIGN` markers, preserving the file's
formatting. Review the diff and bump `@version` / `DEFAULTS_VERSION` before committing.
