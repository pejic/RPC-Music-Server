#!/usr/bin/perl

use strict;
use warnings;

use AmarokPlayer;

my $player = AmarokPlayer->new();

my $a = $player->getArtist();
my $t = $player->getTitle();
print "Now Playing : $a - $t\n";

$player->pause();
sleep(1);
$player->pause();
sleep(1);
$player->previous();
sleep(1);
$player->next();
