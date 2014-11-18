
DROP TABLE IF EXISTS `pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(256) NOT NULL,
  `template` varchar(256) NOT NULL DEFAULT 'page',
  `content` TEXT  NOT NULL,
  `isHomePage` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE utf8_bin; 
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pages`
--

LOCK TABLES `pages` WRITE;
/*!40000 ALTER TABLE `pages` DISABLE KEYS */;
INSERT INTO `pages` VALUES 
(1,'home', 'home','<p>Lorem ipsum dolor sit amet, consectetur</p> adipisicing elit. Voluptate suscipit nihil fugit perspiciatis laboriosam nulla iusto, dicta. Iusto suscipit expedita, rem neque maiores nobis id, nulla, optio, perspiciatis sequi corporis.', 1),
(2,'test', 'page','Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptate suscipit nihil fugit perspiciatis laboriosam nulla iusto, dicta. Iusto suscipit expedita, rem neque maiores nobis id, nulla, optio, perspiciatis sequi corporis.', 0),
(3,'about', 'page' ,'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptate suscipit nihil fugit perspiciatis laboriosam nulla iusto, dicta. Iusto suscipit expedita, rem neque maiores nobis id, nulla, optio, perspiciatis sequi corporis.', 0);
/*!40000 ALTER TABLE `pages` ENABLE KEYS */;
UNLOCK TABLES;


DROP TABLE IF EXISTS `blocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `blocks` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `key` varchar(256) NOT NULL,
  `value` varchar(256) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE utf8_bin; 
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `blocks`
--

LOCK TABLES `blocks` WRITE;
/*!40000 ALTER TABLE `blocks` DISABLE KEYS */;
INSERT INTO `blocks` VALUES 
(1,'tel','+27834234'),
(2,'address', 'melega 5');
/*!40000 ALTER TABLE `blocks` ENABLE KEYS */;
UNLOCK TABLES;
