#!/usr/bin/perl

use strict;
use warnings;

use AmarokPlayer;

my $player = AmarokPlayer->new();

$player->pause();
sleep(1);
$player->pause();
sleep(1);
$player->previous();
sleep(1);
$player->next();
