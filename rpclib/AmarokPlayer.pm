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

=head1 NAME

   rpclib::AmarokPlayer

=head1 SYNOPSIS

The AmarokPlayer class allows controlling and querying the Amarok player with
the AudioPlayer interface.

Usage:
my $amarok = rpclib::AmarokPlayer->new()

$amarok->pause();

=head1 DESCRIPTION

The AmarokPlayer class is a wrapper to OrgFreedesktopPlayer.

=cut

