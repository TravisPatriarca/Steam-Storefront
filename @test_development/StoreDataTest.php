<!DOCTYPE html>
<html>
<head>
    <title>Steam Api Pull Request Test</title>
</head>
<body>
    <p> Testing Steam Api..... </p>
    <?php
        $json = file_get_contents('https://store.steampowered.com/api/appdetails/?appids=440');
        $obj = json_decode($json);
        print_r($obj);
    ?>

    <script> 
        //var json = <?php //echo file_get_contents('https://store.steampowered.com/api/appdetails/?appids=440'); ?>;
        //var response = JSON.parse(json);
        //console.log(json['440']['data']['name']);
    </script>
</body>
</html>
