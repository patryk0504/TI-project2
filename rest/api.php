<?php

// session_start();
         
require '../vendor/autoload.php' ;        
require_once("rest.php");
require_once("./userDB.php");
require_once("./surveyDB.php");

     
class API extends REST {
     
    public $data = "";
     
    public function __construct(){
        parent::__construct();      // Init parent contructor
        $this->Userdb = new UserDB();
        $this->Surveydb = new SurveyDB();
    }
             
    public function processApi(){
        $func = "_".$this->_endpoint ; 
        if((int)method_exists($this,$func) > 0) {
            $this->$func();
        } else {    $this->response('Page not found',404); }         
    }

    private function _isLogged(){
        if($this->get_request_method() != "POST"){
            $this->response('',406);
        }
        if(!empty($this->_request) ){
            try {
                   $json_array = json_decode($this->_request,true);
                   $res = $this->Userdb->checkSession($json_array);
                   if ( $res != false ) {//session started
                        $result = array('return'=>'true');
                        $this->response($this->json($result), 200);
                    } else {
                        $result = array('return'=>'false');
                        $this->response($this->json($result), 200);
                    }
            } catch (Exception $e) {
                $this->response('', 400) ;
            }
        } else {
            $error = array('status' => "Failed", "msg" => "Invalid send data");
            $this->response($this->json($error), 400);
        }
    }

    private function _getAll(){
        if($this->get_request_method() != "GET")
            $this->response('',406);
        if(!($this->Userdb->checkSession( $_COOKIE )))
            $this->response('', 401) ;
        
        try {
            $result = $this->Surveydb->getAll();
            if ( $result ) {
                $this->response($this->json($result), 200);
            } else {
                $result = array('return'=>'Blad pobierania danych. Baza danych jest pusta.');
                $this->response($this->json($result), 200);
            }
        } catch (Exception $e) {
            $this->response('', 400) ;
        }
        
    }

    private function _logout(){
        if($this->get_request_method() != "POST")
            $this->response('',406);
        if(!empty($this->_request) ){
            try{
                $json_array = json_decode($this->_request,true);
                $res = $this->Userdb->logout($json_array);
                if ( $res ) {//session started
                    $result = array('return'=>'Wylogowano');
                    $this->response($this->json($result), 200);
                } else {
                    $result = array('return'=>'sessionid not found', 'status' => 'false');
                    $this->response($this->json($result), 200);
                }
            }catch(Exception $e) {
                    $this->response('', 400) ;
                }
        } else {
                $error = array('status' => "Failed", "msg" => "Invalid send data");
                $this->response($this->json($error), 400);
            }
    }

    private function _login(){
        if($this->get_request_method() != "POST") {
            $this->response('',406);
        }
       
        if(!empty($this->_request) ){
            try {
                   $json_array = json_decode($this->_request,true);
                   //check if login is valid
                   if(!isset($json_array['login']) || strlen($json_array['login']) < 4){
                        $result = array('return'=>'Bledne dane logowania', 'status' => 'false');
                        $this->response($this->json($result), 200);
                   }else{
                        $res = $this->Userdb->login($json_array);
                        if ( $res != false ) {//session started
                            $result = array('return'=>'Pomyslnie zalogowano uzytkownika.', 'status' => 'true', 'sessionID' => $res, 'sessionIDtimeout' => 10*60);
                            $this->response($this->json($result), 200);
                        } else {
                            $result = array('return'=>'Bledne dane logowania', 'status' => 'false');
                            $this->response($this->json($result), 200);
                     }
                   }
            } catch (Exception $e) {
                $this->response('', 400) ;
            }
        } else {
            $error = array('status' => "Failed", "msg" => "Invalid send data");
            $this->response($this->json($error), 400);
        }
    }

    private function _insert(){
        if($this->get_request_method() != "POST")
            $this->response('',406);
        if(!($this->Userdb->checkSession( $_COOKIE )))
            $this->response('', 401) ;

        if(!empty($this->_request) ){
            try {
                   $json_array = json_decode($this->_request,true);
                   $result = $this->Surveydb->insert($json_array);
                   if ( $result ) {
                        $this->response($this->json($result), 200);
                    } else {
                        $result = array('return'=>'Blad dodawania rekordu');
                        $this->response($this->json($result), 200);
                    }
            } catch (Exception $e) {
                $this->response('', 400) ;
            }
        } else {
            $error = array('status' => "Failed", "msg" => "Invalid send data");
            $this->response($this->json($error), 400);
        }
    }

    private function _signin(){
        if($this->get_request_method() != "POST") {
            $this->response('',406);
        }
        if(!empty($this->_request) ){
            try {
                   $json_array = json_decode($this->_request,true);
                   if(!isset($json_array['login']) || strlen($json_array['login']) < 4){
                        $result = array('return'=>'Niepoprawny format loginu!');
                        $this->response($this->json($result), 200);
                   }else if(!isset($json_array['pass']) || strlen($json_array['pass']) < 4){
                        $result = array('return'=>'Niepoprawny format hasla!');
                        $this->response($this->json($result), 200);
                   }else{
                        $result = $this->Userdb->signin($json_array);
                        if ( $result ) {
                            $this->response($this->json($result), 200);
                        } else {
                            $result = array('return'=>'Uzytkownik o takim loginie jest juz zarejestrowany!');
                            $this->response($this->json($result), 200);
                        }
                   }
            } catch (Exception $e) {
                $this->response('', 400) ;
            }
        } else {
            $error = array('status' => "Failed", "msg" => "Invalid send data");
            $this->response($this->json($error), 400);
        }
    }
         
 
    private function json($data){
        if(is_array($data)){
            return json_encode($data);
        }
    }
}
         
    $api = new API;
    $api->processApi();
 
?>