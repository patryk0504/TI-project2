<?php
 
//require 'vendor/autoload.php' ;

require "../vendor/autoload.php";

class db {
    private $user = "8sledzp" ;
    private $pass = "pass8sledzp";
    // private $host = "172.20.44.25";
    private $base = "movie_survey";
    public $conn;
 
    public function __construct() {
      // $connClient = new MongoDB\Client("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}"); 
      
      $connClient = new MongoDB\Client("mongodb+srv://{$this->user}:{$this->pass}@cluster0.fs0hf.mongodb.net/{$this->base}?retryWrites=true&w=majority"); 

      // $connClient = new MongoDB\Client('mongodb+srv://patryk0504:2612Oralb@cluster0.fs0hf.mongodb.net/movie_survey?retryWrites=true&w=majority');
      // $dbs = $connClient->listDatabases();
      $this->conn = $connClient -> {$this->base};   
    }
}

// $test = new db();
