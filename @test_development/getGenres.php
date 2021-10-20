<?php
    require_once "sqlConnection.php";

    $genres = isset($_REQUEST['genres']) ? $_REQUEST['genres'] : "";
    $search = isset($_GET['search']) ? $_GET['search'] : "";

    $queryString = "select genre, count(*) As count From (";
    for ($j=1; $j<=6; $j++) {
        if ($j > 1) { //if not first element
            $queryString .= "union all ";
        }

        $queryString .= "select genre_".$j." AS genre from games ";
        if ($genres != "" || $search != "") {
            $queryString .= "WHERE";
            if ($search != "") {
                $queryString .= " REPLACE(name, '''', '') LIKE CONCAT('%', '".$search."', '%') OR REPLACE(developer, '''', '') LIKE CONCAT('%', '".$search."', '%') ";
                if ($genres != "") {
                    $queryString .= " AND";
                }
            }

            if ($genres != "") {
                for ($i=0; $i<count($genres); $i++) {
                    $symbol = $genres[$i][0] == "checked" ? "" : " NOT ";
                    if ($i > 0) {
                        $queryString .= "AND";
                    }
                    $queryString.= " '".$genres[$i][1] . "'" . $symbol . " IN (genre_1, genre_2, genre_3, genre_4, genre_5, genre_6) ";
                }
            }
        }
    }
    $queryString .=") genres group by genre ORDER BY count DESC;";

    /*$query = $mysqli->prepare($queryString);
    $query->execute();
    $result= $query->get_result();
    $error = "";
    if (!$result) {
        $error .= printf("The query failed\nError message: %s", $mysqli->error);
    }
    else
    {
        $count = 0;
        while ($row=$result->fetch_object()) {
            $genre = $row->genre;
            $count_num = $row->count;
            if ($genre != 'undefined') { 
                if ($genres == "" && $search == "") {
                    if ($count_num > 1) {
                        $data[$count] = [$genre, $count_num];
                        $count++;
                    }
                }
                else
                {
                    $data[$count] = [$genre, $count_num];
                    $count++;
                }
            }
        }
    }

    $result->free();
    $mysqli->close();*/
    $error = "";
    $data = "";
    $genres = array("data"=>$data, "query"=>$queryString, "error"=>$error);
    echo json_encode($genres);
?>