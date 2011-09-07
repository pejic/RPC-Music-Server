#!/usr/bin/perl

use strict;
use warnings;
use diagnostics;

use Cwd;
use File::Basename;

# Change to installation directory
BEGIN {
my $INSTALL_DIR = dirname(Cwd::abs_path($0));
chdir $INSTALL_DIR;
}

# Whether the server is run in the background as a daemon.
my $background = 0;
if (defined($ARGV[0]) && $ARGV[0] eq '-d') {
	$background = 1;
	printf("will background\n");
}

my $logging = 0;
if ($logging) {
	open (LOG, '>>', "LOG.txt");
}
else {
	open (LOG, '>>', '/dev/null');
}

{
package RPCMusicServer;

use HTTP::Server::Simple::CGI;
use base qw(HTTP::Server::Simple::CGI);

use lib './rpclib';

use SoundCard;
use AmarokPlayer;
use Configuration;

use HTML::Entities qw(encode_entities);

######################################################################
# CONFIG
#

# The allowed volume error in a ratio (percent divided by 100).
my $VOLUME_ERROR = 0.02;

my $conf = Configuration->new();

# Controls which mixers are exposed.
my @cards = $conf->getCards();

# Controls which players are exposed.
my @players = $conf->getPlayers();

######################################################################

my $unsafeChars = '<>&';

sub txt2html
{
	my $text = shift;
	encode_entities( $text, $unsafeChars );
}

#
# Maps some urls to the functions called when the url is requested.  The
# png images and dynamic svg images are handled separately.
#
my %dispatch = (
	'/' => \&resp_welcome,
	'/rpcMusic.js' => \&resp_jsfile,
	'/rpcMusic.pl' => \&resp_query
);

#
# Maps the extension to the coresponding mime type.
#
my %ext2type = (
	'png' => 'image/png',
	'html' => 'text/html',
	'js' => 'text/javascript',
	'css' => 'text/css',
	'svg' => 'image/svg+xml'
);

sub file_ext {
	my $filename = shift;
	$filename =~ m/\.([^\.]*)$/;
	my $ext = $1;
	return ($ext);
}

#
# Handles a new page request by calling other handlers depending on the URL.
#
sub handle_request {
	my $self = shift;
	my $cgi = shift;

	my $path = $cgi->path_info();
	my $relpath = $path;
	$relpath =~ s/^\///g;
	my $handler = $dispatch{$path};

	my $date = `date`;
	chomp($date);
	print main::LOG "[$date] path: $path, relpath: $relpath\n";
	main::LOG->sync;

	if (ref($handler) eq "CODE") {
		print "HTTP/1.0 200 OK\r\n";
		$self->$handler($cgi);
	}
	elsif ($path =~ /^\/imgs/ && -e $relpath) {
		print "HTTP/1.0 200 OK\r\n";
		$self->resp_file($cgi, $relpath);
	}
	elsif ($path =~ /^\/imgs\/skinLCARS\/lcars-([0-9A-Fa-f]{6,6})-(.*)\.svg/
			&& -e "imgs/skinLCARS/lcars-AXBYCZ-$2.svg") {
		print "HTTP/1.0 200 OK\r\n";
		$self->resp_lcarscolor($cgi, $relpath, $1, $2);
	}
	else {
		print "HTTP/1.0 404 Not found\r\n";
		print $cgi->header,
		       $cgi->start_html('Not found'),
		       $cgi->h1('Not found'),
		       $cgi->end_html;
	}
}

#
# LCARS skins require SVG images with where only the colors differ.  Instead of
# creating a lot of SVG image files, this script will create them dynamically
# from a template.  The URL contains the color, and the templates are stored as
# files.
#
# The handle_request function takes care of parsing out the color and checking
# whether the template exists.
#
sub resp_lcarscolor {
	my $self = shift;
	my $cgi = shift;
	my $relpath = shift;
	my $color = shift;
	my $filepart = shift;

	my $defname = "imgs/skinLCARS/lcars-AXBYCZ-$filepart.svg";
	print main::LOG "relpath: $relpath\n";
	print main::LOG "defname: $defname\n";
	print $cgi->header(-type=>$ext2type{'svg'}, -charset=>'utf8');

	open (SVGFILE, '<', $defname);
	while (my $line = <SVGFILE>) {
		$line =~ s/AXBYCZ/$color/g;
		print $line;
	}
	close (SVGFILE);
}

#
# Responds with the file at the url with the appropriate mime type detected
# from the file extension.
#
sub resp_file {
	my $self = shift;
	my $cgi = shift;
	my $filename = shift;
	my $ext = file_ext($filename);
	my $type = $ext2type{$ext};
	print main::LOG "\text: $ext; type: $type\n";
	main::LOG->sync;
	print $cgi->header( -type => $type,
				-charset=>'utf-8');
	open (WELCOME_FILE, '<', $filename);
	while (my $line = <WELCOME_FILE>) {
		print $line;
	}
	close (WELCOME_FILE);
}

#
# Responds with the welcome page.
#
sub resp_welcome {
	my $self = shift;
	my $cgi = shift;
	$self->resp_file($cgi, 'rpcMusic.html');
}

#
# Responds with the client side javascript file for the welcome page.
#
sub resp_jsfile {
	my $self = shift;
	my $cgi = shift;
	$self->resp_file($cgi, 'rpcMusic.js');
}

#
# Responds with the XML containing the status of the mixers and music player.
#
# Also performs any commands passed via GET requests.
#
sub resp_query {
	my $self = shift;
	my $cgi = shift;

	######################################################################
	# Init & helper code
	#

	my $q = $cgi;

	foreach my $snd (@cards) {
		my $card = SoundCard->new( { card => $snd->{card},
				mixers => $snd->{mixers} } );
		$snd->{SoundCard} = $card;
	}

	my $get_card_by_name = sub {
		my $name = shift;
		my @gc;
		my $i;
		for ($i = 0; $i < scalar(@cards); $i++) {
			if (($cards[$i]{'name'}) eq $name) {
				push (@gc, $cards[$i]);
			}
		}
		if (scalar(@gc) == 1) {
			return ($gc[0]);
		}
		return (undef);
	};

	my $find_player_by_name = sub {
		my $pname = shift;
		foreach my $player (@players) {
			if ($player->get_playerName() eq $pname) {
				return ($player);
			}
		}
		return (undef);
	};

	######################################################################

	my @send_errors;

	my $cmd = $q->param('cmd');
	$cmd = "none" if !defined($cmd);

	if ($cmd eq 'set_volume') {
		my $card = $q->param('card');
		my $volume = $q->param('volume');
		if (!defined($card) || !defined($volume)) {
			push @send_errors, "Card ($card) or "
					."volume ($volume) not set.";
		}
		else {
			my $cardhash = &$get_card_by_name($card);
			if (!defined($cardhash)) {
				push @send_errors, "Trying to set the volume"
					. ", but card \"$card\" was not found.";
			}
			else {
				my $soundCard = $cardhash->{'SoundCard'};
				$soundCard->set_volume($volume);
				my $rvol = $soundCard->get_volume();
				if ($volume < $rvol - $VOLUME_ERROR
					|| $volume > $rvol + $VOLUME_ERROR){
					push @send_errors,
					"Couldn't set volume on card \"$card\"."
					. " Requested volume is $volume and"
					. " new volume is $rvol.";
				}
			}
		}
	}
	my @simple_buttons = ('pause', 'next', 'previous');
	foreach my $button (@simple_buttons) {
		if ($cmd eq $button) {
			my $playerName = $q->param('playerName');
			if (!defined($playerName)) {
				push @send_errors,
				"Must specify playerName with cmd=$button.";
			}
			else {
				my $player = &$find_player_by_name($playerName);
				if (!defined($player)) {
					push @send_errors,
					"Couldn't find the player $playerName.";
				}
				else {
					$player->$button();
				}
			}
		}
	}


	######################################################################
	# Printing results
	#

	print $q->header('text/xml; charset=utf-8');


	print <<EOF;
<?xml version="1.0"?>
<rpcmusic>
  <soundcards>
EOF

	foreach my $snd (@cards) {
		my %card = %$snd;
		my $vol = $card{'SoundCard'}->get_volume();
		print <<EOF;
    <soundcard>
      <name>$card{'name'}</name>
      <volume>$vol</volume>
    </soundcard>
EOF
	};

	print <<EOF;
  </soundcards>
  <players>
EOF

	foreach my $player (@players) {
		my $playerName = txt2html($player->get_playerName());
		my $artist = txt2html($player->get_artist());
		my $title = txt2html($player->get_title());
		print <<EOF;
    <player>
      <playerName>$playerName</playerName>
      <artist>$artist</artist>
      <title>$title</title>
    </player>
EOF
	}

	print <<EOF;
  </players>
  <errors>
EOF

	foreach my $error (@send_errors) {
		$error =~ s/&/&amp;/g;
		$error =~ s/</&lt;/g;
		$error =~ s/>/&gt;/g;
		print <<EOF;
    <error>$error</error>
EOF
	}

	print <<EOF;
  </errors>
</rpcmusic>
EOF
}

} # RPCMusicServer

my $srv = RPCMusicServer->new(8222);
if ($background) {
	my $pid = $srv->background();
	print "Use 'kill $pid' to stop the RPCMusic server.\n";
}
else {
	$srv->run();
}

