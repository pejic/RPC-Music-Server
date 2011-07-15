package OrgFreedesktopPlayer;

use strict;
use warnings;
use diagnostics;

use base "AudioPlayer";
use Net::DBus;
use Net::DBus::Dumper;
use Data::Dumper;

sub new
{
	my ($class, $pname, $srv_n) = @_;
	my $self = $class->SUPER::new(@_);
	$self->{playerName} = $pname;
	my $iface_n = "org.freedesktop.MediaPlayer";
	my $obj_n = "/Player";
	
	my $bus = Net::DBus->session;
	my $srv = $bus->get_service($srv_n);
	my $obj = $srv->get_object($obj_n, $iface_n);
	$self->{player} = $obj;

	return($self);
}

sub callPlayerFunc
{
	my $self = shift;
	my $func_n = shift;
	my $obj = $self->{player};
	return($obj->$func_n(@_));
}

sub get_metadata
{
	my $self = shift;
	return($self->callPlayerFunc("GetMetadata"));
}

sub get_playerName
{
	my $self = shift;
	return ($self->{playerName});
}

sub pause
{
	my $self = shift;
	$self->callPlayerFunc("Pause");
}

sub previous
{
	my $self = shift;
	$self->callPlayerFunc("Prev");
}

sub next
{
	my $self = shift;
	$self->callPlayerFunc("Next");
}

sub get_artist
{
	my $self = shift;
	my $mt = $self->get_metadata();
	return ($mt->{'artist'});
}

sub get_title
{
	my $self = shift;
	my $mt = $self->get_metadata();
	return ($mt->{'title'});
}

1;

=head1 NAME

   rpclib::OrgFreedesktopPlayer

=head1 SYNOPSIS

Control a media player that implements the standard freedesktop.org DBus
interface with the rpclib::AudioPlayer interface.

my $player = OrgFreedesktopPlayer->new("Amarok", "org.mpris.amarok");
$player->pause();

=head1 DESCRIPTION

OrgFreedesktopPlayer attempts to connect to the given DBus address (e.g.
"org.mpris.amarok") after which the commands from the rpclib::AudioPlayer
interface may be called on the OrgFreedesktopPlayer object to send DBus signals.
Other classes should be created for each player that is to be supported (e.g.
AmarokPlayer).

=cut

