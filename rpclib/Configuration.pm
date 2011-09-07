package Configuration;

use Config::General;
use Scalar::Util qw(looks_like_number);

sub new
{
	my $class = shift;
	my $self = {};
	bless($self, $class);
	my $config_filename = $ENV{'HOME'}.'/.rpcmusic.conf';
	if (-e $config_filename) {
		my $config = new Config::General($config_filename);
		my %conf = $config->getall;
		$self->{conf} = \%conf;
	}
	else {
		$self->{conf} = \{};
	}
	return ($self);
}

sub getCards
{
	my $self = shift;
	my @cards;
	if (exists($self->{conf}{Card})) {
		my %confCards = %{$self->{conf}{Card}};
		foreach my $name (keys %confCards) {
			my $cardNo = $confCards{$name}{'Card'};
			my $mixer = $confCards{$name}{'Mixer'};
			if (ref($mixer) eq '') {
				$mixer = [$mixer];
			}
			push (@cards, {
					name => $name,
					card => $cardNo,
					mixers => $mixer });
		}
	}
	if (scalar(@cards) == 0) {
		push (@cards, {
				name => 'Master',
				card => 0,
				mixers => ['Master'] });
	}
	return (@cards);
}

sub getPlayers
{
	my $self = shift;
	return (AmarokPlayer->new());
}

sub getPort
{
	my $self = shift;
	if (exists($self->{conf}{Port})) {
		my $port = $self->{conf}{Port};
		if (looks_like_number($port)) {
			return ($port);
		}
	}
	return (8222);
}

1;

=head1 NAME

   rpclib::Configuration

=head1 SYNOPSIS

The Configuration class loads a configuration or provides a default one.

Usage:
my $conf = rpclib::Configuration->new();

my @cards = $conf->getCards();
my @players = $conf->getPlayers();

=head1 METHODS

=over 4

=item @cards = $conf->getCards()

Returns an array of hashrefs.  Each hash looks like this:
  {
    name => 'Name of Mixer',
    card => 0, # number of alsa card
    mixers => ['Master'] # array of one or more mixers of card 0
  }

=item @players = $conf->getPlayers()

Returns an array of SoundCard objects.

=item $port = $conf->getPort()

Returns the port to run the server on. Default 8222.

=back

=cut
