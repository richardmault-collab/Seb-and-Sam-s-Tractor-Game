#!/usr/bin/env bash
# Download openly licensed *field recordings* and bundle short, mono Ogg clips.
# This script runs once in GitHub Actions. App playback requires NO internet.
set -euo pipefail
mkdir -p app/src/main/assets/sounds
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT
BASE="https://raw.githubusercontent.com/Wh1teDuke/WilhelmSFX/ec4875a35d265b5431e3ba81fef6cc0ca0281bfc/Samples"
get() {
  local key="$1" remote="$2"
  echo "Downloading real $key recording..."
  curl -fL --retry 3 --connect-timeout 20 -sS "$BASE/$remote" -o "$work/$key.wav"
  ffprobe -v error "$work/$key.wav" >/dev/null
}
get cow "233146__jarredgibb__cow-moan-2-96khz.wav"
get sheep "710296__michaelperfect__sheep-baaing-1-norwegian-sheep-expressing-itself-concisely.wav"
get pig "442906__qubodup__pig-oink.wav"
get chicken "316920__rudmer_rotteveel__chicken-single-alarm-call.wav"
get horn "513741__danlucaz__truck-horn.wav"
get water "319963__bart1234567__pouring-water-2015.wav"
get seed "370367__lilmati__step-on-dirt.wav"
get hay "464690__branndybottle__grasswalking_step2.wav"
# Second genuine takes keep repeat taps interesting for toddlers.
get cow_2 "275154__bird_man__moo.wav"
get sheep_2 "710298__michaelperfect__sheep-baaing-3-norwegian-sheep-expressing-itself-concisely.wav"
get pig_2 "442904__qubodup__pig-squeak.wav"
get chicken_2 "435508__benjaminnelan__rooster-crow-1.wav"

echo "Downloading genuine tractor recording from Wikimedia Commons..."
TRACTOR_FILE="WWS_TractorUrsusC328driving.ogg"
# Wikimedia Commons upload directories are based on a file name's MD5.
hex=$(printf '%s' "$TRACTOR_FILE" | md5sum | cut -d' ' -f1)
p1=$(printf '%s' "$hex" | cut -c1)
p2=$(printf '%s' "$hex" | cut -c1-2)
tractor_url="https://upload.wikimedia.org/wikipedia/commons/$p1/$p2/$TRACTOR_FILE"
curl -fL --retry 3 --connect-timeout 20 -A "SebSamTractorFarm/1.2 (family educational game)" -sS "$tractor_url" -o "$work/tractor.ogg"
ffprobe -v error "$work/tractor.ogg" >/dev/null

encode() {
  local key="$1" start="$2" duration="$3" src_ext="$4"
  echo "Preparing clip: $key"
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -i "$work/$key.$src_ext" \
    -t "$duration" -ac 1 -ar 24000 \
    -af "loudnorm=I=-20:TP=-3:LRA=8,afade=t=in:st=0:d=0.025" \
    -c:a libvorbis -q:a 4 "app/src/main/assets/sounds/$key.ogg"
}
encode cow 0 2.18 wav
encode sheep 0 1.10 wav
encode pig 0 0.74 wav
encode chicken 0 1.16 wav
encode tractor 7 4.20 ogg
encode horn 0 1.80 wav
encode water 0 2.60 wav
encode seed 0 1.10 wav
encode hay 0 1.20 wav
# Alternate takes of the same farm sound (real recordings, never synthesised voices).
encode cow_2 0 1.90 wav
encode sheep_2 0 1.25 wav
encode pig_2 0 1.10 wav
encode chicken_2 0 1.30 wav
encode tractor_2 13 3.80 ogg

for f in app/src/main/assets/sounds/*.ogg; do
  ffprobe -v error "$f" >/dev/null
  test "$(stat -c%s "$f")" -gt 500
done
echo "All fourteen real farm clips are bundled and decodable."
