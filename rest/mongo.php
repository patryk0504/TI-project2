<?php
 
//require 'vendor/autoload.php' ;

require "../vendor/autoload.php";

class db {
    private $user = "8sledzp" ;
    private $pass = "pass8sledzp";
    private $host = "172.20.44.25";
    private $base = "8sledzp";
    public $conn;
 
    public function __construct() {
      $connClient = new MongoDB\Client("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}"); 
      $this->conn = $connClient -> {$this->base};   
    }
}