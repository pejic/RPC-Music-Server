package AmarokPlayer;

use OrgFreedesktopPlayer;
use base qw(OrgFreedesktopPlayer);

sub new
{
	my ($class) = shift;
	my $self = $class->SUPER::new("Amarok", 'org.mpris.amarok');
	return ($self);
}

1;
