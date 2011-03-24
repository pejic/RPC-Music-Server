#!/usr/bin/perl

use strict;
use warnings;

use AmarokPlayer;

my $player = AmarokPlayer->new();

my $a = $player->get_artist();
my $t = $player->get_title();
print "Now Playing : $a - $t\n";

$player->pause();
sleep(1);
$player->pause();
sleep(1);
$player->previous();
sleep(1);
$player->next();
