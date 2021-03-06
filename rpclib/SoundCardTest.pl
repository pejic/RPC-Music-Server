#!/usr/bin/perl

use strict;
use warnings;
use diagnostics;

use SoundCard;

my $card = SoundCard->new( { card => 0, mixers => [ 'Master', 'PCM' ] } );
my $vol = $card->get_volume();
print "Volume = $vol\n";

print ">> PASS <<\n"; # compile error if not implemented

$card->set_volume(0.40);
my $vol2 = $card->get_volume();
print "Volume = $vol2\n";

if ($vol2 < 0.38 || $vol2 > 0.42) {
	print ">> FAIL <<\n";
}
else {
	print ">> PASS <<\n";
}

$card->set_volume(0.00);
my $vol3 = $card->get_volume();
print "Volume = $vol3\n";

if ($vol3 > 0.02 ) {
	print ">> FAIL <<\n";
}
else {
	print ">> PASS <<\n";
}

$card->set_volume($vol);
