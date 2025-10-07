# pwstrength_meter

[![Packagist](https://img.shields.io/packagist/dt/texxasrulez/pwstrength_meter?style=plastic)](https://packagist.org/packages/texxasrulez/pwstrength_meter)
[![Packagist Version](https://img.shields.io/packagist/v/texxasrulez/pwstrength_meter?style=plastic&logo=packagist&logoColor=white)](https://packagist.org/packages/texxasrulez/pwstrength_meter)
[![Project license](https://img.shields.io/github/license/texxasrulez/pwstrength_meter?style=plastic)](https://github.com/texxasrulez/pwstrength_meter/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/texxasrulez/pwstrength_meter?style=plastic&logo=github)](https://github.com/texxasrulez/pwstrength_meter/stargazers)
[![issues](https://img.shields.io/github/issues/texxasrulez/pwstrength_meter)](https://github.com/texxasrulez/pwstrength_meter/issues)
[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-blue.svg?style=plastic&logo=paypal)](https://www.paypal.me/texxasrulez)

A small Roundcube plugin that adds a live password strength meter to the **Settings → Password** screen (provided by the official `password` plugin). It displays a color gradient bar and a label that updates as you type.

## Features
- Zero-config: works with the standard Roundcube `password` plugin UI
- Color Gradient visual meter + textual label (Very weak → Very strong)
- Sensible heuristic: length, character variety, and simple pattern penalties
- Skin‑friendly, minimal CSS

## Requirements
- Roundcube 1.5+ (tested with modern builds)
- The official `password` plugin enabled

## Installation
1. Copy this folder to your Roundcube `plugins/` directory as `pwstrength_meter`.
2. Enable it by adding to your Roundcube config (e.g. `config/config.inc.php`):
   ```php
   $config['plugins'][] = 'pwstrength_meter';
   ```
3. Ensure the `password` plugin is enabled and accessible under **Settings → Password**.

No additional configuration is needed. The meter will appear under the "new password" input on the password page.

## How it works
The plugin injects a small JS/CSS bundle **only** on the password page. The JS locates the most likely "new password" input (by name/id heuristics) and renders a 5‑segment meter beneath it. The score ranges 0–5 and is based on length, character class variety, and a few simple penalties for repeats and sequences.

## Accessibility
- The meter exposes `aria` attributes and a text label announcing the current strength.

## Customization
You can tweak colors and spacing in `pwstrength_meter.css`. The JS heuristic is in `js/pwstrength_meter.js` if you want a different scoring model.

## Localization
Add files under `localization/xx_XX.inc` with a `$labels` array mirroring `en_US.inc` keys.

