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

	my $path =
"unix:abstract=/tmp/dbus-d1AdhBP74b,guid=2c3e76a609bf62476319518c0000022a";
	# TODO: read path from ~slobo/.dbus/session-bus/...-0
	
	my $bus = Net::DBus->new(address => $path);
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

sub getMetadata
{
	my $self = shift;
	return($self->callPlayerFunc("GetMetadata"));
}

sub getPlayerName
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

sub getArtist
{
	my $self = shift;
	my $mt = $self->getMetadata();
	return ($mt->{'artist'});
}

sub getTitle
{
	my $self = shift;
	my $mt = $self->getMetadata();
	return ($mt->{'title'});
}

1;
