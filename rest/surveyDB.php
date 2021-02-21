<?php
require_once "./mongo.php";

class SurveyDB{

    private $collection;
    private $mongoDB;

    public function __construct(){
        $this->mongoDB = new db();
        $this->collection = $this->mongoDB->conn->survey;
    }

    public function insert($surveyData){
        $filter  = [];
        $options = [
            'limit' => 1,
            'sort' => ['_id' => -1]];
        $isInserted = $this->collection->insertOne($surveyData);
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
        return false;
    }


    public function getAll(){
        $filter  = [];
        $options = [
            'sort' => ['_id' => -1]];
        $tmp = $this->collection->find($filter, $options)->toArray();
        $resArray = array();
        foreach($tmp as $row){
            foreach($row as $key=>$value){

            if($key == "_id"){
                $res[$key] = (string)$value.'_id';
            }else{
                $res[$key] = $value;
            }
            }
            array_push($resArray,$res);
        }
       
        return $resArray;
    }

}

?>