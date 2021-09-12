<?php 
$fichero = __DIR__ . "/razonamientos.json";
$titulo = $_GET['Titulo'];
$letra = $_GET['Letra'];
$preguntas = $_GET['Preguntas'];
$respuestas = $_GET['Respuestas'];

for($i=sizeof($preguntas)-1; $i>=0; $i--)
  if($respuestas[$i] == '') {
    array_splice($respuestas,$i,1);
    array_splice($preguntas,$i,1);
  }

if(sizeof($preguntas) == 0)
  exit;

if(!file_exists($fichero)) {
  $f = fopen($fichero,'w');
  fwrite($f, json_encode([]));
  fclose($f);
}
  
try {
  $razonamientos = json_decode(file_get_contents($fichero), true);
  $maxId = 0;
  $existe = false;

  $nuevoRazonamiento = [
    'titulo' => $titulo,
    'letra' => $letra,
    'preguntas' => $preguntas,
    'respuestas' => $respuestas
  ];

  foreach($razonamientos as $k => $r) {
    if($r['titulo'] == $titulo)  {
      $nuevoRazonamiento['id'] = $razonamientos[$k]['id'];
      $razonamientos[$k] = $nuevoRazonamiento;
      $existe = true;
      break;
    }
    if($r['id'] > $maxId)
      $maxId = $r['id'];
  }
  
  if(!$existe) {
    $nuevoRazonamiento['id'] = ++$maxId;
    $razonamientos[] = $nuevoRazonamiento;
  }

  file_put_contents($fichero,json_encode($razonamientos));
  echo $nuevoRazonamiento['id'];
} catch(Exception $e) {
  echo $e;
}
?>