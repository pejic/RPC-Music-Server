package AmarokPlayer;

use base qw(OrgFreedesktopPlayer);

sub new
{
	my ($class) = shift;
	my $self = $class->SUPER::new('org.mpris.amarok', '/Player');
	return ($self);
}

1;
