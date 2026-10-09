# Seb & Sam’s Tractor Farm 🚜

An offline, ad-free Android farming game made for Seb (3) and Sam (1), with animated cartoon characters inspired by their photo.

**Play**: Animal taps and sounds, **Guess the Farm Sound** (hear a cow, sheep, pig, chicken or tractor, then choose from exactly three pictures), a tractor drive, barn peekaboo, counting sheep from 1 to 5, matching coloured tractors, planting seeds, and delivering hay.

**Guess the Farm Sound** works in both Sam and Seb modes. Tap the big speaker as often as you like, choose one of three pictures, and get positive encouragement. Correct answers celebrate and unlock another sound; wrong answers gently encourage trying again. The background music pauses during this listening game. Turn on sound effects (🔊) in the top bar to hear the sounds.

## Get the Android app

1. Open **Actions** in this repository and select **Build Android APK**.
2. Run the workflow if it has not run automatically.
3. Download the **seb-and-sam-tractor-farm-debug-apk** artifact from the successful run.
4. Unzip it and install `app-debug.apk` on an Android phone. Android may ask you to allow installation from this source.

You can also open the repository folder in **Android Studio**, allow Gradle to sync, and select **Run** on a connected Android device.

## Browser preview

Open `app/src/main/assets/index.html` in a modern browser to preview most gameplay. Spoken prompts use Android text-to-speech when installed, and the browser speech service as fallback.

## Safety and design

No adverts, in-app purchases, external links, accounts, analytics, or network permissions. All progress stays on the device. Music and sound effects can be turned off independently. Large hit targets, no fail states and no time limits. Counting never exceeds **5**.

Made with Java, an offline Android WebView, HTML/CSS/SVG and synthesised Web Audio (no licensed music or third-party image services needed).