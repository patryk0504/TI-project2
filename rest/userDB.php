<?php
require_once "./mongo.php";

class UserDB{


    private $sessionCollection;

    private $collection;
    private $mongoDB;

    public function __construct(){
        $this->mongoDB = new db();
        $this->collection = $this->mongoDB->conn->users;

        //kolekcja do sesji
        $this->sessionCollection = $this->mongoDB->conn->session;
    }

    public function logout($sessionID){
        $islogout = $this->sessionCollection->findOne(
            array('sessionID' => $sessionID['sessionID'])
        );
        if($islogout){//jezeli istnieje zapisana sesja o takim id -> usuwamy
            $filter = array ( 'sessionID' => $sessionID['sessionID'] );
            $this->sessionCollection->deleteOne($filter);
            return true;
        }
        return false;
    }

    public function login($login_pass){
        $isUser = $this->collection->findOne(
           array('login' => $login_pass['login'])
        );
        if($isUser){
            $phpArray = iterator_to_array($isUser);
        }else{
            return false;
        }
        if($phpArray === NULL){
            return false;
        }else{
            //check if pass is ok
            if($phpArray['pass'] == $login_pass['pass']){//zweryfikowany, zapisujemy zmienna sesyjna i zwracamy id
                $sessionID = md5(uniqid($phpArray['login'],true));
                $sessionStartTime = date('Y-m-d H:i:s', time());
                $ins = $this->sessionCollection->insertOne(array('sessionID' => $sessionID, 'startTime' => $sessionStartTime));
                return $sessionID;
            }
            return false;
        }
    }

    public function checkSession($sessionID){
        $isSet = $this->sessionCollection->findOne(
            array('sessionID' => $sessionID['sessionID'])
        );
        if($isSet){
            $startdate = DateTime::createFromFormat("Y-m-d H:i:s", $isSet['startTime']);
			$current_time = new DateTime('now');
            $roznica = $current_time->getTimestamp() - $startdate->getTimestamp();
            if($roznica > 8*60){//8*60 - 8 min
                $this->logout($sessionID);
                return false;
            }
            return true;
        }
        return false;
    }

    public function signin($login_pass){
        $filter  = [];
        $options = [
            'limit' => 1,
            'sort' => ['_id' => -1]];
        $isUser = $this->collection->findOne(
            array('login' => $login_pass['login'])
        );
        if($isUser){//znaleziono takiego uzytkownika
            return false;
        }else{//nie znaleziono wiec dodajemy
            $isInserted = $this->collection->insertOne($login_pass);
            if ($isInserted->getInsertedCount() === 1) {
            $tmp = $this->collection->find($filter, $options)->toArray()[0];
            foreach($tmp as $key=>$value){
                if($key == "_id"){
                    $res[$key] = (string)$value._id;
                }else{
                    $res[$key] = $value;
                }
            }
            return $res;
            }
        }
    }

}
// $usr = new UserDB;
// $arr = array();
// $arr["login"] = "qwerty";
// $arr["pass"] = "qwerty";
// $result = $usr->login($arr);
// echo print_r($result);

// $arr2['sessionID'] = $result;
// echo $usr->checkSession($arr2);
?>