<?php
    $time_start = microtime(true);

    require_once "sqlConnection.php";

    $filter = isset($_GET['filter']) ? $_GET['filter'] : "";
    $search = isset($_GET['search']) ? $_GET['search'] : "";
    $price_range = isset($_GET['price']) ? $_GET['price'] : "";
    $special_only = isset($_GET['specialOnly']) && $_GET['specialOnly'] != "unchecked" ? $_GET['specialOnly'] : "";
    $review_range = isset($_GET['review']) ? $_GET['review'] : "";
    $review_range_text = isset($_GET['reviewRange']) ? $_GET['reviewRange'] : "";
    $release_range = isset($_GET['releaseRange']) ? $_GET['releaseRange'] : "";
    $genres = isset($_GET['genres']) ? $_GET['genres'] : "";
    $features = isset($_GET['features']) ? $_GET['features'] : "";
    $start = isset($_GET['start']) ? $_GET['start'] : 0;
    $end = isset($_GET['end']) ? $_GET['end'] : 0;
    $seed = isset($_GET['seed']) ? $_GET['seed'] : 0;

    //$startQueryGames = 
    /*"SELECT * FROM games AS g
    LEFT JOIN game_reviews AS gr
    ON gr.appid = g.appid
    LEFT JOIN game_genres AS gg
    ON gg.appid = g.appid WHERE ";*/

    /*$startQueryGenres = 
    "FROM games AS g
    LEFT JOIN game_reviews AS gr
    ON gr.appid = g.appid
    LEFT JOIN game_genres AS gg
    ON gg.appid = g.appid WHERE ";*/

    $queryGames = "SELECT * FROM games AS g
    LEFT JOIN game_reviews AS gr
    ON gr.appid = g.appid
    LEFT JOIN game_genres AS gg
    ON gg.appid = g.appid WHERE (REPLACE(name, '''', '') LIKE CONCAT('%', ?, '%') OR REPLACE(developer, '''', '') LIKE CONCAT('%', ?, '%'))";

    if ($price_range != "") {
        $queryGames.= " AND (final_price BETWEEN " . $price_range[0] . " AND " . $price_range[1] . ") ";
    }

    if ($special_only != "") {
        $symbol = $special_only == "checked" ? '>' : '<=';
        $queryGames.= " AND (discount_percent ". $symbol . "0) ";
    }

    if ($review_range != "") {
        $queryGames.= " AND (review_percent BETWEEN " . $review_range[0] . " AND " . $review_range[1] . ") ";
    }

    if ($review_range_text != "") {
        if ($review_range_text[0] != "")
            $queryGames.= " AND (total_reviews > " . $review_range_text[0] . ") ";

        if ($review_range_text[1] != "")
            $queryGames.= " AND (total_reviews < " . $review_range_text[1] . ") ";
    }

    if ($release_range != "") {
        if ($release_range[0] != "")
            $queryGames.= " AND (release_date > '" . $release_range[0] . "') ";

        if ($release_range[1] != "")
            $queryGames.= " AND (release_date < '" . $release_range[1] . "') ";
    }

    if ($genres != "") {
        //$queryGames.=" AND (genre IN (";
        for ($i=0; $i<count($genres); $i++) {
            $symbol = $genres[$i][0] == "checked" ? "" : " NOT ";
            $queryGames.= " AND ('".$genres[$i][1] . "' " . $symbol . " IN (genre_1, genre_2, genre_3, genre_4, genre_5, genre_6)) ";
        }
    }

    if ($features != "") {
        for ($i=0; $i<count($features); $i++) {
            $symbol = $features[$i][0] == "checked" ? 1 : 0;
            $queryGames.= " AND (".$features[$i][1]." = ".$symbol.") ";
        }
    }

    /*$queryGenres = "select genre, count(*) As count From (
        select genre_1 AS genre ".$startQueryGenres.$queryGames." 
        union all 
        select genre_2 AS genre ".$startQueryGenres.$queryGames." 
        union all 
        select genre_3 AS genre ".$startQueryGenres.$queryGames." 
        union all 
        select genre_4 AS genre ".$startQueryGenres.$queryGames." 
        union all 
        select genre_5 AS genre ".$startQueryGenres.$queryGames." 
        union all 
        select genre_6 AS genre ".$startQueryGenres.$queryGames.") 
        genres group by genre ORDER BY count DESC;";*/

    $queryGenres = $queryGames;

    if ($filter != "relevance" && $filter != "") {
        $queryGames .= " ORDER BY " . $filter;
    }
    else
    {
        if ($search == "") {
            $queryGames .= "ORDER BY rand(".$seed.")";
        }
    }

    $queryGames.= " LIMIT ".$start.", 98";

    //$queryGames = $startQueryGames . $queryGames;
    $info = "";
    $error = "";
    $html = "";
    $data = [];

    $query = $mysqli->prepare($queryGames);
    $query->bind_param('ss', $search, $search);
    $query->execute();
    $result= $query->get_result();
    if (!$result) {
        $error .= printf("The query failed\nError message: %s", $mysqli->error);
    }
    else
    {
        $item_count = mysqli_num_rows($result); //get number of items

        if ($item_count == 0) {
            $html = "<div class='no-results'>No Results Found</div>";
        }
        else 
        {
            while ($row=$result->fetch_object()) {
                $item_appid = str_replace("''", "'",$row->appid);
                $item_images = [$row->screenshot_url_1, $row->screenshot_url_2, $row->screenshot_url_3, $row->screenshot_url_4];
                $item_tags = [$row->genre_1, $row->genre_2, $row->genre_3, $row->genre_4, $row->genre_5, $row->genre_6];
                $item_desc = str_replace("''", "'",$row->description);
                $item_img = $row->image_url;
                $item_alt_img = $row->alt_image_url;
                $item_total_positive = $row->total_positive;
                $item_total_negative = $row->total_negative;
                $item_total_reviews = $row->total_reviews;
                $item_total_review_percent = $row->review_percent;
                $item_url = $row->url;
                $item_name = $row->name;
                $item_dev = $row->developer;
                $item_initial_price = $row->initial_price;
                $item_final_price = $row->final_price;
                $item_discount = $row->discount_percent;
                $item_free = $row->is_free;
                $item_release = $row->release_date;

                $html .= sprintf('<div class="item" data-appid="%s" data-images="%s,%s,%s,%s" data-desc="%s" data-review="%s, %s, %s, %s" data-tags="%s, %s, %s, %s, %s, %s" data-release="%s">', $item_appid, $item_images[0], $item_images[1], $item_images[2], $item_images[3], $item_desc, $item_total_positive, $item_total_negative, $item_total_reviews, $item_total_review_percent, $item_tags[0], $item_tags[1], $item_tags[2], $item_tags[3], $item_tags[4], $item_tags[5], $item_release);
                $html .= sprintf("<a href='%s' target='_blank'><img src='%s' onerror=this.src='%s'></a>", $item_url, $item_img, $item_alt_img);
                $html .=  "<div class='item-details'>";
                $html .= sprintf("<div class='item-name'> %s </div>", $item_name);
                $html .= sprintf("<div class='item-dev'> %s </div>", $item_dev);

                $html .=  "<div class='item-price-info'>";
                if ($item_discount > 0) {
                    $html .= sprintf("<div class='item-initial-price'> $%s </div>", $item_initial_price/100);
                    $html .= sprintf("<div class='item-discount-info'><div class='item-discount'> -%s%% </div>", $item_discount);
                }
                else
                {
                    $html .= "<div class='item-discount-info'>";
                }

                if ($item_final_price <= 0 && $item_free == 0)
                    $html .= sprintf("<div class='item-final-price'> %s </div>", 'N/A');
                else
                    $html .= sprintf("<div class='item-final-price'> %s </div>", $item_free ? "Free" : "$".$item_final_price/100);
                $html .=  "</div></div></div></div>";
            }
        }
    }

    $query = $mysqli->prepare($queryGenres);
    $query->bind_param('ss', $search, $search);
    //$query->bind_param('ssssssssssss', $search, $search, $search, $search, $search, $search, $search, $search, $search, $search, $search, $search);
    $query->execute();
    $result2= $query->get_result();
    if (!$result2) {
        $error .= printf("The query failed\nError message: %s", $mysqli->error);
        exit;
    }
    else
    {
        //$count = 0;
        $item_count2 = mysqli_num_rows($result2); //get number of items

        if ($item_count2 == 0) {
            $data = "";
        }
        else 
        {
            while ($genres=$result2->fetch_object()) {
                /*$genre = $genres->genre;
                $count_num = $genres->count;
                if ($genre != 'undefined') { 
                    //if ($search == "") {
                    //    if ($count_num > 1) {
                            $data[$count] = [$genre, $count_num];
                            $count++;
                     //   }
                    //}
                    //else
                    //{
                    //    $data[$count] = [$genre, $count_num];
                    //    $count++;
                    //}
                }*/
                $item_tags = [$genres->genre_1, $genres->genre_2, $genres->genre_3, $genres->genre_4, $genres->genre_5, $genres->genre_6];
                for ($i=0; $i<count($item_tags); $i++) {
                    if (isset($data[$item_tags[$i]])) {
                        $genre_count = $data[$item_tags[$i]][1] +1;
                        $data[$item_tags[$i]] = [$item_tags[$i], $genre_count];
                    }
                    else
                    {
                        $data += array($item_tags[$i] => [$item_tags[$i], 1]);
                    }
                }
            }
        }
    }
    //$data = "";*/

    $result->free();
    $mysqli->close();

    $time_end = microtime(true);
    $execution_time = ($time_end - $time_start);

    $info = array("count" => $item_count, "exec_time" => $execution_time);
    $games = array("html"=>$html, "query"=>$queryGames, "query2"=>$queryGenres, "info"=>$info, "error"=>$error, "data"=>$data);
    echo json_encode($games);
?>