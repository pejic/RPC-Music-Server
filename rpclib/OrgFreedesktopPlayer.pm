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
	$self->{srv_n} = $srv_n;

	$self->connect();
	
	return($self);
}

sub connect
{
	my $self = shift;
	if (!defined($self->{player})) {
		my $iface_n = "org.freedesktop.MediaPlayer";
		my $obj_n = "/Player";
		my $bus = Net::DBus->session;
		my $srv;
		my $err = 0;
		eval {
			$srv = $bus->get_service($self->{srv_n});
		};
		if ($@) {
			$err = 1;
		}
		if (!$err) {
			$self->{player} = $srv->get_object($obj_n, $iface_n);
		}
	}
}

sub call_player_func
{
	my $self = shift;
	my $func_n = shift;
	$self->connect();
	my $obj = $self->{player};
	if (defined($obj)) {
		return($obj->$func_n(@_));
	}
	else {
		return (undef);
	}
}

sub get_metadata
{
	my $self = shift;
	return($self->call_player_func("GetMetadata"));
}

sub get_metadata_elem
{
	my $self = shift;
	my $key = shift;
	my $default = shift;
	my $mt = $self->get_metadata();
	if (defined($mt->{$key})) {
		return ($mt->{$key});
	}
	else {
		return ($default);
	}
}

sub get_playerName
{
	my $self = shift;
	return ($self->{playerName});
}

sub pause
{
	my $self = shift;
	$self->call_player_func("Pause");
}

sub previous
{
	my $self = shift;
	$self->call_player_func("Prev");
}

sub next
{
	my $self = shift;
	$self->call_player_func("Next");
}

sub get_artist
{
	my $self = shift;
	return($self->get_metadata_elem("artist",""));
}

sub get_title
{
	my $self = shift;
	return($self->get_metadata_elem("title",""));
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

