
CREATE TABLE IF NOT EXISTS `io_definitions` (
  `id` int(10) unsigned NOT NULL auto_increment,
  `name` varchar(100) NOT NULL,
  `devices_id` int(10) unsigned NOT NULL,
  `types_id` int(10) unsigned NOT NULL,
  `param1` varchar(50) default NULL,
  `param2` varchar(50) default NULL,
  `param3` varchar(50) default NULL,
  `param4` varchar(50) default NULL,
  PRIMARY KEY  (`id`)
);

 