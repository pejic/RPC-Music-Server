package SoundCard;

use warnings;
use strict;
use diagnostics;

sub new
{
	my $self = {};
	my $class = shift;
	my $opts = shift;
	$self->{'card'} = $opts->{'card'};
	$self->{'mixers'} = $opts->{'mixers'};
	bless( $self, $class );
}

sub get_volume
{
	my $self = shift;
	my $i = 0;
	my @mixers = @{$self->{'mixers'}};
	my $nmixers = scalar(@mixers);
	my $vol = 0;
	for ($i = 0; $i < $nmixers; $i++) {
		my $cmd = "amixer -c ".$self->{'card'}." get $mixers[$i]";
		my $res = `$cmd`;
		$res =~ /(\d*)%/;
		my $vol_i = $1;
		$vol = ($vol_i/100.0)/$nmixers + $vol;
	}
	return ($vol);
}

sub set_volume
{
	my $self = shift;
	my $vol = shift;
	my $volper = sprintf "%.0d", ($vol * 100);
	my $i = 0;
	my @mixers = @{$self->{'mixers'}};
	my $nmixers = scalar(@mixers);
	for ($i = 0; $i < $nmixers; $i++) {
		my $cmd = "amixer -c ".$self->{'card'}
			." set $mixers[$i] $volper%";
		print "CMD: $cmd\n";
		`$cmd`;
	}
}

=pod

=head1 NAME

SoundCard - volume controls for alsa.

=head1 SYNOPSIS

SoundCard supports setting and getting volumes for a particular sound card and
it's mixers.

=head1 DESCRIPTION

SoundCard allows setting and getting of volumes on a given set of their mixers
of a sound card.

=head1 METHODS

=over 4

=item $card = SoundCard->new( { card => 0, mixers => [ 'Master' ] } )

Makes a new handle to the 'Master' mixer on sound card 0.

=item $card->get_volume()

Returns the average volume of the mixers in the range [0,1].

=item $card->set_volume( $volume )

Set the volume of the mixers to the given value in the range [0, 1].

=back

=cut

1;
