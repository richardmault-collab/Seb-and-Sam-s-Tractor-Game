# Seb & Sam’s Tractor Farm 🚜

An offline, ad-free Android farming game made for Seb (3) and Sam (1), with animated cartoon characters inspired by their photo.

## New in v1.2: Real farm audio

The animal noises now come from **real cows, sheep, pigs and chickens**, and the tractor comes from a **real working tractor recording**. Farm tasks use physical water, earth and rustling sound effects too. There are no longer robotic voices pretending to say animal noises. Audio works entirely offline, including Guess the Farm Sound. Music and narration are separate from the realistic recordings; the app still speaks numbers and simple praise to help learning. Read [SOUND_CREDITS.md](SOUND_CREDITS.md) for source recordings and licences.

**Play**: Animal taps and sounds, **Guess the Farm Sound** (hear a cow, sheep, pig, chicken or tractor, then choose from exactly three pictures), a tractor drive, barn peekaboo, counting sheep from 1 to 5, matching coloured tractors, planting seeds, and delivering hay.

**Guess the Farm Sound** works in both Sam and Seb modes. Tap the big speaker as often as you like, choose one of three pictures, and get positive encouragement. Correct answers celebrate and unlock another sound; wrong answers gently encourage trying again. The background music pauses during this listening game. Turn on sound effects (🔊) in the top bar to hear the sounds.

## Get the Android app

1. Open **Actions** in this repository and select **Build Android APK**.
2. Run the workflow if it has not run automatically.
3. Download the **seb-and-sam-tractor-farm-debug-apk** artifact from the successful run.
4. Unzip it and install `app-debug.apk` on an Android phone. Android may ask you to allow installation from this source.

**Updating a previous test APK?** GitHub's temporary debug signing key can change between builds. If Android says the update cannot be installed, uninstall the previous Seb & Sam’s Tractor Farm app first, then install this APK. This clears only on-device sound/music preferences; there are no accounts or saved game achievements.

You can also open the repository folder in **Android Studio**, allow Gradle to sync, and select **Run** on a connected Android device.

## Browser preview

Open `app/src/main/assets/index.html` in a modern browser to preview most gameplay. Spoken prompts use Android text-to-speech when installed, and the browser speech service as fallback.

## Safety and design

No adverts, in-app purchases, external links, accounts, analytics, or network permissions. All progress stays on the device. Music and sound effects can be turned off independently. Large hit targets, no fail states and no time limits. Counting never exceeds **5**.

Made with Java, an offline Android WebView, HTML/CSS/SVG, recorded Ogg/Vorbis audio, plus locally synthesised background music and UI chimes. No online image/audio services are needed.