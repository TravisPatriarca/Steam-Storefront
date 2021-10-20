<!DOCTYPE html>
<html>
<head>
    <link rel='stylesheet' type='text/css' href='css/index.css' />
    <link rel='stylesheet' type='text/css' href='css/filter.css' />
    <link rel='stylesheet' type='text/css' href='css/search.css' />
    <link rel='stylesheet' type='text/css' href='css/games.css' />
    <title>All Good Games</title>
    
</head>
<body>
    <header>
        <nav class='menu'> 
            <ul class='nav-links'>
                <li><a href='index.php' class='nav-button'>Explore</a></li>
                <li><a href='games.php' class='nav-link-selected nav-button'>Games</a></li>
                <li><a href='about.html' class='nav-button'>About</a></li>
                <li><a class='donate' href='donate.html'>Donate</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <div class='margin-container'>
            <div class='filters'> <!-- container for simple filter and search bar -->
                <div class="custom-select"><!-- container for simple filter -->
                    <select>
                        <option value='relevance'>Relevance</option>
                        <option value='release-date'>Release Date</option>
                        <option value='lowest-price'>Lowest Price</option>
                        <option value='highest-price'>Highest Price</option>
                        <option value='user-reviews'>User Reviews</option>
                        <option value='highest-discount'>Highest Discount</option>
                    </select>
                </div> 
                <div> <!-- container for search bar -->
                    <input type='text' placeholder='Search' class='search'>
                </div> 
            </div>
            <div class='main-content'> <!-- container for games and side filters -->
                <div class='games'>
                    <?php
                        $host = "localhost";
                        $user = "Travis";
                        $passwd = "test1234";
                        $dbname = "steam_new";
                    
                        $filter = 'final_price ASC';
                        $filter_type = 1;

                        $mysqli = new mysqli($host, $user, $passwd, $dbname);
                        if ($mysqli->connect_errno) {
                            echo "Failed to connect to MySQL: " . $mysqli->connect_error
                            . "<br/>Error number: ". $mysqli->connect_errno;
                        }

                        $query = $mysqli->prepare("SELECT * FROM games ORDER BY " . $filter);
                        //$query->bind_param('s', $filter);
                        $query->execute();
                        $result= $query->get_result();

                        //$result = $mysqli->query($query);
                        if (!$result) {
                            printf("The query failed\n");
                            printf("Error message: %s", $mysqli->error);
                            exit;
                        }
                        else
                        {
                            //$item_count = mysqli_num_rows($result); //get number of items

                            while ($row=$result->fetch_object()) {
                                $item_img = $row->image_url;
                                $item_url = $row->url;
                                $item_name = $row->name;
                                $item_dev = $row->developer;
                                $item_initial_price = $row->initial_price;
                                $item_final_price = $row->final_price;
                                $item_discount = $row->discount_percent;
                                $item_free = $row->is_free;

                                echo "<div class='item'>";
                                printf("<a href='%s'><img src='%s'></a>", $item_url, $item_img);
                                echo "<div class='item-details'>";
                                printf("<div class='item-name'> %s </div>", $item_name);
                                printf("<div class='item-dev'> %s </div>", $item_dev);

                                echo "<div class='item-price-info'>";
                                if ($item_discount > 0) {
                                    printf("<div class='item-discount'> -%s%% </div>", $item_discount);
                                    printf("<div class='item-initial-price'> $%s </div>", $item_initial_price/100);
                                }
                                printf("<div class='item-final-price'> %s </div>", $item_free ? "Free" : "$".$item_final_price/100);
                                echo "</div>";

                                echo "</div>";
                                echo "</div>";
                            }

                            /*$items_per_row = 8;
                            $extra_needed = $items_per_row - ($item_count % $items_per_row);
                            for ($i=0; $i<$extra_needed; $i++) {
                                echo "<div class='item item-invisible'>";
                                printf("<img src='%s'>", "#");
                                echo "<div class='item-details'>";
                                printf("<div class='item-name'> %s </div>", "NULL");
                                printf("<div class='item-dev'> %s </div>", "NULL");

                                echo "<div class='item-price-info'>";
                                printf("<div class='item-final-price'> %s </div>", "0");
                                echo "</div>";

                                echo "</div>";
                                echo "</div>";
                            }*/
                        }

                        $result->free();
                        $mysqli->close();
                    ?>
                </div> <!-- container for games -->
                <div class='advanced-filter'>

                </div> <!-- container for side filters -->
            </div>
        </div>
    </main>
    <script>
    var x, i, j, l, ll, selElmnt, a, b, c;
        /* Look for any elements with the class "custom-select": */
        x = document.getElementsByClassName("custom-select");
        l = x.length;
        for (i = 0; i < l; i++) {
        selElmnt = x[i].getElementsByTagName("select")[0];
        ll = selElmnt.length;
        /* For each element, create a new DIV that will act as the selected item: */
        a = document.createElement("DIV");
        a.setAttribute("class", "select-selected");
        a.innerHTML = selElmnt.options[selElmnt.selectedIndex].innerHTML;
        x[i].appendChild(a);
        /* For each element, create a new DIV that will contain the option list: */
        b = document.createElement("DIV");
        b.setAttribute("class", "select-items select-hide");
        for (j = 0; j < ll; j++) {
            /* For each option in the original select element,
            create a new DIV that will act as an option item: */
            c = document.createElement("DIV");
            c.innerHTML = selElmnt.options[j].innerHTML;
            c.addEventListener("click", function(e) {
                /* When an item is clicked, update the original select box,
                and the selected item: */
                var y, i, k, s, h, sl, yl;
                s = this.parentNode.parentNode.getElementsByTagName("select")[0];
                sl = s.length;
                h = this.parentNode.previousSibling;
                for (i = 0; i < sl; i++) {
                if (s.options[i].innerHTML == this.innerHTML) {
                    s.selectedIndex = i;
                    h.innerHTML = this.innerHTML;
                    y = this.parentNode.getElementsByClassName("same-as-selected");
                    yl = y.length;
                    for (k = 0; k < yl; k++) {
                    y[k].removeAttribute("class");
                    }
                    this.setAttribute("class", "same-as-selected");
                    break;
                }
                }
                h.click();
            });
            b.appendChild(c);
        }
        x[i].appendChild(b);
        a.addEventListener("click", function(e) {
            /* When the select box is clicked, close any other select boxes,
            and open/close the current select box: */
            e.stopPropagation();
            closeAllSelect(this);
            this.nextSibling.classList.toggle("select-hide");
            this.classList.toggle("select-arrow-active");
        });
        }

        function closeAllSelect(elmnt) {
        /* A function that will close all select boxes in the document,
        except the current select box: */
        var x, y, i, xl, yl, arrNo = [];
        x = document.getElementsByClassName("select-items");
        y = document.getElementsByClassName("select-selected");
        xl = x.length;
        yl = y.length;
        for (i = 0; i < yl; i++) {
            if (elmnt == y[i]) {
            arrNo.push(i)
            } else {
            y[i].classList.remove("select-arrow-active");
            }
        }
        for (i = 0; i < xl; i++) {
            if (arrNo.indexOf(i)) {
            x[i].classList.add("select-hide");
            }
            }
            }

            /* If the user clicks anywhere outside the select box,
            then close all select boxes: */
    document.addEventListener("click", closeAllSelect);
</script>
</body>
</html>
