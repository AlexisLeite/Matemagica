<?php

$razonamientos = json_decode(file_get_contents(__DIR__ . '/razonamientos.json'),true);
$titulos = [];

foreach($razonamientos as $r) {
  $titulos[] = ['id' => $r['id'], 'titulo' => $r['titulo']];
}

echo json_encode($titulos);
?>