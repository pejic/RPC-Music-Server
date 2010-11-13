#!/usr/bin/perl

use warnings;
use strict;
use diagnostics;

use CGI;

use rpclib::SoundCard;

##############################################################################
# CONFIG
#

# The allow volume error in a ratio (percent divided by 100).
my $VOLUME_ERROR = 0.02;

my @cards = (
	{name => 'Ensoniq',
		card => 0,
		mixers => ['Master', 'PCM'] },
	{name => 'Nvidia',
		card => 1,
		mixers => ['Front', 'Surround', 'Center'] }
	);

##############################################################################
# Init & helper code
#

my $q = CGI->new;

foreach my $snd (@cards) {
	my $card = SoundCard->new( { card => $snd->{card},
			mixers => $snd->{mixers} } );
	$snd->{SoundCard} = $card;
}

sub get_card_by_name
{
	my $name = shift;
	my @gc = grep {$_->{'name'} == $name} @cards;
	if (scaler(@gc) == 1) {
		return ($gc[0]);
	}
	return (undef);
}

##############################################################################

my @send_errors;

my $cmd = $q->param('cmd');
$cmd = "none" if !defined($cmd);

if ($cmd eq 'set_volume') {
	my $card = $q->param('card');
	my $volume = $q->param('volume');
	my $cardhash = get_card_by_name($card);
	if (!defined($cardhash)) {
		push @send_errors, "Trying to set the volume"
			. ", but card \"$card\" was not found.";
	}
	my $soundCard = $cardhash->{'SoundCard'};
	$soundCard->set_volume($volume);
	my $rvol = $soundCard->get_volume();
	if ($volume < $rvol - $VOLUME_ERROR || $volume > $rvol + $VOLUME_ERROR){
		push @send_errors, "Couldn't set volume on card \"$card\"."
			. " Requested volume is $volume and"
			. " new volume is $rvol.";
	}
}


##############################################################################
# Printing results
#

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
  <errors>
EOF

foreach my $error (@send_errors) {
	$error =~ s/&/&amp;/g;
	$error =~ s/</&lt;/g;
	$error =~ s/>/&gt;/g;
	print <<EOF;
    <error>$error</error>
EOF
}

print <<EOF;
  </errors>
</rpcmusic>
EOF

