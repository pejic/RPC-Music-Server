#!/bin/sh

function mkicon {
	inkscape -e app-icon-$1x$1.png -w $1 ../app-icon-src.svg
}

mkicon 57
mkicon 72
mkicon 114
mkicon 144
