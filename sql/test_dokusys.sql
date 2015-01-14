SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Tabellenstruktur für Tabelle `test_dokusys_topics`
--
DROP TABLE IF EXISTS `test_dokusys_topics`;
CREATE TABLE IF NOT EXISTS `test_dokusys_topics` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `parent` int(11) NOT NULL default '0',
  `topic` varchar(200) NOT NULL,
  `keywords` varchar(255) NOT NULL,
  `topictext` text NOT NULL,
  `dokustatus` int(11) NOT NULL default '100',
  `user` varchar(30) NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) AUTO_INCREMENT=1001 ;

--
-- Daten für Tabelle `test_dokusys_topics`
--

INSERT INTO `test_dokusys_topics` (`id`, `parent`, `topic`, `keywords`, `topictext`, `dokustatus`, `user`, `time`) VALUES
(0, 0, 'Doku-Management', '', '<h4>Artikel anlegen</h4><blockquote class="small">Neue Artikel werden unterhalb des aktuellen Artikels mit Klick auf das <span class="fa fa-plus-square text-primary" style="font-size: 14pt;"></span>-Symbol am Ende der oberen Pfadanzeige erzeugt.</blockquote><h4>Artikel bearbeiten</h4><blockquote class="small">Zum Bearbeiten den mit <span class="fa fa-pencil-square-o text-primary" style="font-size: 18pt;"></span>  markierten Artikel in der Pfadanzeige anklicken.</blockquote>', 100, 'System', 0);

--
-- Tabellenstruktur für Tabelle `test_dokusys_links`
--
DROP TABLE IF EXISTS `test_dokusys_links`;
CREATE TABLE IF NOT EXISTS `test_dokusys_links` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `topic_id` int(10) unsigned NOT NULL,
  `bez` varchar(255) NOT NULL,
  `version` int(11) NOT NULL default '1',
  `link` varchar(255) NOT NULL,
  `target` tinyint(4) NOT NULL default '0',
  `typ` char(10) NOT NULL,
  `sort` int(11) NOT NULL default '1000',
  `user` varchar(20) NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) AUTO_INCREMENT=1001;

--
-- Tabellenstruktur für Tabelle `test_dokusys_uploads`
--
DROP TABLE IF EXISTS `test_dokusys_uploads`;
CREATE TABLE IF NOT EXISTS `test_dokusys_uploads` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `link_id` int(10) unsigned NOT NULL,
  `filename` varchar(50) NOT NULL,
  `version` int(11) NOT NULL default '1',
  `user` varchar(30) NOT NULL,
  `time` int(11) NOT NULL,
  PRIMARY KEY  (`id`)
) AUTO_INCREMENT=1001;

