#!/usr/bin/perl

use warnings;
use strict;
use diagnostics;

use CGI;

use rpclib::SoundCard;

##############################################################################


my @cards = (
	{name => 'Ensoniq',
		card => 0,
		mixers => ['Master', 'PCM'] },
	{name => 'Nvidia',
		card => 1,
		mixers => ['Front', 'Surround', 'Center'] }
	);

foreach my $snd (@cards) {
	my $card = SoundCard->new( { card => $snd->{card},
			mixers => $snd->{mixers} } );
	$snd->{SoundCard} = $card;
}

##############################################################################

my $q = CGI->new;

print $q->header('text/xml');


print <<EOF;
<?xml version="1.0"?>
<rpcmusic>
  <soundcards>
EOF

foreach my $snd (@cards) {
	my %card = %$snd;
	my $vol = $card{'SoundCard'}->get_volume();
	print <<EOF;
    <soundcard>
      <name>$card{'name'}</name>
      <volume>$vol</volume>
    </soundcard>
EOF
};

print <<EOF;
  </soundcards>
</rpcmusic>
EOF

