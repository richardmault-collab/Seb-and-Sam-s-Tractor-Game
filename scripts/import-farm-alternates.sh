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
# Second start point of the same real tractor recording, with no repeat download.
test -s app/src/main/assets/sounds/tractor.ogg
cp app/src/main/assets/sounds/tractor.ogg app/src/main/assets/sounds/tractor_2.ogg
echo "Four additional animal sounds and second tractor take are ready."
