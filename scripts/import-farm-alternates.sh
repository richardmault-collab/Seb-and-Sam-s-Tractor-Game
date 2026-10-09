#!/usr/bin/env bash
# Directly bundle real animal recordings. No ffmpeg/apt dependencies needed.
set -euo pipefail
mkdir -p app/src/main/assets/sounds
base="https://raw.githubusercontent.com/Wh1teDuke/WilhelmSFX/ec4875a35d265b5431e3ba81fef6cc0ca0281bfc/Samples"
get() {
  echo "Importing alternate recording $1"
  curl -fL --retry 5 --retry-delay 1 --connect-timeout 20 --max-time 90 -sS \
    "$base/$2" -o "app/src/main/assets/sounds/$1.wav"
  test "$(stat -c%s "app/src/main/assets/sounds/$1.wav")" -gt 10000
  file "app/src/main/assets/sounds/$1.wav" | grep -iq 'WAVE audio'
}
get cow_2 "275154__bird_man__moo.wav"
get sheep_2 "710298__michaelperfect__sheep-baaing-3-norwegian-sheep-expressing-itself-concisely.wav"
get pig_2 "442904__qubodup__pig-squeak.wav"
get chicken_2 "435508__benjaminnelan__rooster-crow-1.wav"
get horse "269571__shadowisp__horse-neigh-shortened.wav"
get horse_2 "184503__madklown__horse.wav"
get duck "607226__d4xx__ducks_a.wav"
get duck_2 "732999__bjelicvuk__quack.wav"
get goat "675417__craigsmith__s01-31_single-goat-calling-out.wav"
get goat_2 "188182__erokia__goat-sound-2.wav"
get dog "277058__kwahmah_02__single-dog-bark.wav"
get dog_2 "464406__michael_grinnell__dog_bark_2.wav"
get cat "156643__yoyodaman234__catmeow1.wav"
get cat_2 "686775__nathan-osman__meow-1.wav"
# Additional machinery use genuine recorded engine sounds; these are not claimed
# to be recordings of those exact machine models.
get combine "264864__augustsandberg__marine-diesel-engine.wav"
get digger "458461__prometheus888__carengine.wav"
get loader "325809__soundjoao__motor-loop-3.wav"
# Second start point of the same real tractor recording, with no repeat download.
test -s app/src/main/assets/sounds/tractor.ogg
cp app/src/main/assets/sounds/tractor.ogg app/src/main/assets/sounds/tractor_2.ogg
echo "Expanded animal and farm engine samples are ready."
