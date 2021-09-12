<?php

/* Mi idea es que este script entregue siempre el id siguiente al ultimo entregado, empezando por el primero si
ya se llegó al último */

$razonamientos = json_decode(file_get_contents("razonamientos.json", true));
if (!isset($_GET['id'])) {
  if (!isset($_COOKIE['lastExerciseId'])) {
    setcookie('lastExerciseId', 0);
  } else setcookie('lastExerciseId', $_COOKIE['lastExerciseId'] + 1 >= sizeof($razonamientos) ? 0 : $_COOKIE['lastExerciseId'] + 1);
  $razonamiento = $razonamientos[$_COOKIE['lastExerciseId']];
  echo json_encode($razonamiento);
} else {
  $randId = rand(0, sizeof($razonamientos));
  foreach ($razonamientos as $r) {
    if ($r->id == $randId) {
      echo json_encode($r);
      exit();
    }
  }
}
