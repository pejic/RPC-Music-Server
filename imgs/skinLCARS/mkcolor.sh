#!/bin/bash

BUTTONS="play fastforward rewind next previous"
CAPS="cap-left cap-right"
CORNERS="top-left-corner bottom-left-corner"

INCOLOR=99AAFF
INCOLORCAPS=99AAFF
OUTCOLOR=$1;

function transform {
	btn=$1
	inc=$2;
	ouc=$3;
	inf="lcars-$inc-$btn.svg"
	ouf="lcars-$ouc-$btn.svg"
	echo cp $inf $ouf;
	echo perl -pe \''s/#'$inc'/#'$ouc'/ig'\' -i $ouf;
}

for btn in $BUTTONS; do
	transform $btn $INCOLOR $OUTCOLOR;
	transform $btn-active $INCOLOR $OUTCOLOR;
done;

for cap in $CAPS $CORNERS; do
	transform $cap $INCOLORCAPS $OUTCOLOR;
done;
