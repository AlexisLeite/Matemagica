<?php 

$dir = __DIR__ . '/../../../templates/';
$plantillas = [];

foreach($_GET['plantillas'] as $plantilla) {
  preg_match('/(?:.*?\/)?([^\/]+)/', $plantilla, $file);
  $plantillas[$file[1]] = file_get_contents("{$dir}" . trim($plantilla) .".tpl");
}
echo json_encode($plantillas);

?>