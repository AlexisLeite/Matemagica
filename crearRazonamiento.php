<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Matematic</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <link rel="stylesheet" href="razonamientos/crearRazonamiento.css">

  <script src="https://code.jquery.com/jquery-3.5.0.js"></script>
  <script src="src/scripts/profes/razonamientos/crearRazonamiento.js"></script>
</head>
<body>
  <?php
    if(isset($_GET['Crear']))
      require_once('razonamientos/ProcesarFormularioCrearRazonamientos.php');
  ?>
</body>
</html>