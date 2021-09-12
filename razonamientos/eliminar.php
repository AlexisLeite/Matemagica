<?php
if(!isset($_GET['id'])) exit();
else {
  $razonamientos = json_decode(file_get_contents(__DIR__ . "/razonamientos.json",true));
  for($i=sizeof($razonamientos)-1; $i>=0; $i--) {
    if($razonamientos[$i]->id == $_GET['id']) {
      array_splice($razonamientos ,$i,1);
      file_put_contents(__DIR__ . "/razonamientos.json",json_encode($razonamientos));
      exit();
    }    
  }
}
?>