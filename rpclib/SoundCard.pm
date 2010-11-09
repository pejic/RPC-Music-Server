package SoundCard;

use warnings;
use strict;
use diagnostics;

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
