package AudioPlayer;

use base qw(Class::Virtual);

__PACKAGE__->virtual_methods(qw(
		getPlayerName
		pause
		previous
		next
		getArtist
		getTitle
		));


sub new
{
	my ($class) = @_;
	my $self = {};
	bless($self, $class);
	return($self);
}


1;

=pod

=head1 NAME

AudioPlayer

=head1 DESCRIPTION

Defines an interface to an audio player for it's information and controls.

=head1 METHODS

=over 4

=item $audioPlayer->getPlayerName()

Returns the name of the player (e.g. "Amarok").

=item $audioPlayer->pause()

Pauses when the player is playing, and plays when the player is paused.

=item $audioPlayer->previous()

Skips to the previous track.

=item $audioPlayer->next()

Skips to the next track.

=item $audioPlayer->getArtist()

Returns the name of the artist of the currently playing track.

=item $audioPlayer->getTitle()

Returns the title of the currently playing track.

=back

