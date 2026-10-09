# Farm sound recordings and licensing

The sound effects in **version 1.2** are actual field recordings or physical foley, **not a computer speaking animal noises**. They are included inside the Android APK so the game does not need internet access.

Each source was trimmed to a short clip, converted to mono Ogg/Vorbis at 24 kHz, loudness-normalised and given a short fade-in for comfortable playback. The names below refer to the bundled files under `app/src/main/assets/sounds/`.

| In-game file | Original recording and creator | Licence |
| --- | --- | --- |
| `cow.ogg` | [Cow - Moan 2](https://freesound.org/people/JarredGibb/sounds/233146/) by **JarredGibb** | CC0 1.0 |
| `sheep.ogg` | [Sheep baaing 1](https://freesound.org/people/michaelperfect/sounds/710296/) by **Michael Perfect** | CC0 1.0 |
| `pig.ogg` | [Pig Oink](https://freesound.org/people/qubodup/sounds/442906/) by **qubodup** | CC0 1.0 |
| `chicken.ogg` | [Chicken Single Alarm Call](https://freesound.org/people/Rudmer_Rotteveel/sounds/316920/) by **Rudmer_Rotteveel** | CC0 1.0 |
| `tractor.ogg` | [WWS Tractor Ursus C328 driving](https://commons.wikimedia.org/wiki/File:WWS_TractorUrsusC328driving.ogg) by **Work With Sounds / Monika Widzicka** | **CC BY 4.0** |
| `horn.ogg` | [Truck Horn](https://freesound.org/people/danlucaz/sounds/513741/) by **danlucaz** | CC0 1.0 |
| `water.ogg` | [Pouring water 2015](https://freesound.org/people/bart1234567/sounds/319963/) by **bart1234567** | CC0 1.0 |
| `seed.ogg` | [Step on Dirt](https://freesound.org/s/370367/) by **lilmati** | Upstream Wilhelm SFX CC0 collection |
| `hay.ogg` | [Grasswalking Step 2](https://freesound.org/people/BranndyBottle/sounds/464690/) by **BranndyBottle** | CC0 1.0 |

**Tractor-specific attribution:** "WWS Tractor Ursus C328 driving", Work With Sounds / Monika Widzicka, retrieved from Wikimedia Commons. Licensed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Changes: trimmed recording, downsampled, mono conversion, loudness normalisation and fade-in. The work is attributed without any suggestion that the author endorses this game.

The eight Freesound-derived recordings were retrieved via the [Wilhelm SFX sample collection](https://github.com/Wh1teDuke/WilhelmSFX) at pinned commit `ec4875a35d265b5431e3ba81fef6cc0ca0281bfc`. The import/encoding script is checked into `scripts/import-farm-audio.sh`. CC0 works require no attribution, but creator credits are provided for transparency.

## New second takes in v1.3

Four additional real recordings are supplied as bundled WAV files (in order to preserve their original recorded quality without requiring network access at playtime):

| File | Source |
| --- | --- |
| `cow_2.wav` | [Bird_man — Moo](https://freesound.org/people/Bird_man/sounds/275154/), sourced via the CC0 Wilhelm SFX collection |
| `sheep_2.wav` | [Michael Perfect — Sheep Baaing 3](https://freesound.org/people/michaelperfect/sounds/710298/) |
| `pig_2.wav` | [qubodup — Pig Squeak](https://freesound.org/people/qubodup/sounds/442904/) |
| `chicken_2.wav` | [Benjamin Nelan — Rooster Crow 1](https://freesound.org/people/benjaminnelan/sounds/435508/) |
| `tractor_2.ogg` | Second variation of the same real Ursus C-328 tractor recording, whose attribution and licence appear above |

Alternates change automatically on repeat taps. The recording files are included offline in the APK, and source audio credits are kept here.

The cheerful background melody, tap/success tones and number-reading prompts remain separate interface/narration features. In **Guess the Farm Sound**, all clues play recorded sound only; the app does not read the answer or imitate an animal by voice.

## New animal and machinery audio for v1.4

The added audio files are original field recordings included offline as WAV assets. They were obtained from the [Wilhelm SFX sample repository](https://github.com/Wh1teDuke/WilhelmSFX) and are listed for credit and source tracing. They rotate between two real takes when available.

| Game file | Source recording | Attribution |
| --- | --- | --- |
| `horse.wav` | [Horse Neigh Shortened](https://freesound.org/s/269571/) | shadowisp |
| `horse_2.wav` | [Horse](https://freesound.org/s/184503/) | madklown |
| `duck.wav` | [Ducks](https://freesound.org/s/607226/) | d4xx |
| `duck_2.wav` | [Quack](https://freesound.org/s/732999/) | bjelicvuk |
| `goat.wav` | [Single Goat Calling Out](https://freesound.org/s/675417/) | craigsmith |
| `goat_2.wav` | [Goat Sound 2](https://freesound.org/s/188182/) | erokia |
| `dog.wav` | [Single Dog Bark](https://freesound.org/s/277058/) | kwahmah_02 |
| `dog_2.wav` | [Dog Bark 2](https://freesound.org/s/464406/) | michael_grinnell |
| `cat.wav` | [Cat Meow 1](https://freesound.org/s/156643/) | yoyodaman234 |
| `cat_2.wav` | [Meow 1](https://freesound.org/s/686775/) | nathan-osman |
| `combine.wav` | [Marine Diesel Engine](https://freesound.org/s/264864/) | augustsandberg |
| `digger.wav` | [Car Engine](https://freesound.org/s/458461/) | prometheus888 |
| `loader.wav` | [Motor Loop 3](https://freesound.org/s/325809/) | soundjoao |

**Machinery limitation:** The combine/digger/loader sounds are real motor/engine recordings, not recordings of the precise machinery portrayed. They are used as approximate mechanical audio effects, not exact acoustic identifiers. The tractor uses the separately credited genuine tractor recording.

**Licensing:** The WilhelmSFX distribution contains recordings sourced under Creative Commons CC0 or other available sound library licence arrangements; this document preserves provenance but the specific original Freesound licence and suitability for redistribution should be independently verified before any public/commercial release. This family test app remains ad-free and offline.

