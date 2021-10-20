<?php
    $host = "localhost";
    $user = "Travis";
    $passwd = "test1234";
    $dbname = "steam_new";

    $genres = isset($_REQUEST['genres']) ? $_REQUEST['genres'] : "";

    $mysqli = new mysqli($host, $user, $passwd, $dbname);
    if ($mysqli->connect_errno) {
        echo "Failed to connect to MySQL: " . $mysqli->connect_error
        . "<br/>Error number: ". $mysqli->connect_errno;
    }

    $queryString = "select genre, count(*) As count From (";
    for ($j=1; $j<=6; $j++) {
        if ($j > 1)
            $queryString .= "union all ";

        $queryString .= "select genre_".$j." AS genre from games WHERE";
        if ($genres != "") {
            for ($i=0; $i<count($genres); $i++) {
                $symbol = $genres[$i][0] == "checked" ? "" : " NOT ";
                if ($i > 0)
                    $queryString .= "AND";

                $queryString.= " '".$genres[$i][1] . "'" . $symbol . " IN (genre_1, genre_2, genre_3, genre_4, genre_5, genre_6) ";
            }
        }
    }
    $queryString .=") genres group by genre ORDER BY count DESC;";

    $query = $mysqli->prepare($queryString);
    $query->execute();
    $result= $query->get_result();
    if (!$result) {
        printf("The query failed\n");
        printf("Error message: %s", $mysqli->error);
        exit;
    }
    else
    {
        $count = 0;
        while ($row=$result->fetch_object()) {
            $genre = $row->genre;
            $count_num = $row->count;
            if ($genre != 'undefined') { 
                $data[$count] = [$genre, $count_num];
                $count++;
            }
        }
    }

    $result->free();
    $mysqli->close();

    $genres = array("data"=>$data, "query"=>$queryString);
    echo json_encode($genres);
?>
