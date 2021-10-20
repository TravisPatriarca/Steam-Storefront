jQuery(function() {
    updateGames();

    let genre_limit = 8;
    $('#genre-search').on('input', function() {
        let elements = $('.genre-checkbox');
        let vals = [];
        for(let i=0;typeof(elements[i])!='undefined';vals.push(elements[i++].getAttribute('data-genre')));
        $('.genre-div').children().removeClass('active-genre');
        let term = $(this).val();
        if (term != "") {
            let search = new RegExp(term , 'i');
            let b = vals.filter(item => search.test(item));
            let bLength = b.length;
            for (let i=0; i<bLength && i<genre_limit; i++) {
                $('.genre-checkbox[data-genre="'+b[i]+'"]').parent().addClass('active-genre');
            }
        }
        else {
            let activeNum = $('.genre-checkbox[data-state="checked"]').length + $('.genre-checkbox[data-state="exclude"]').length;
            $('.genre-checkbox[data-state="checked"]').parent().addClass('active-genre');
            $('.genre-checkbox[data-state="exclude"]').parent().addClass('active-genre');
            let remainder = genre_limit-activeNum;
            if (remainder > 0)
            $('.genre-checkbox[data-state="unchecked"]:lt('+remainder+')').parent().addClass('active-genre');
        }
    })
});

function updateGames(scroll) {
    infiniScroll = true;

    const search = $('#search').val();
    const filter = $('.same-as-selected').attr('value');

    const priceSlider = $("#price-slider").data("ionRangeSlider");
    const priceRange = [priceSlider.result.from*100, priceSlider.result.to*100];

    const specialOffers = $('.filter-specials .checkbox').attr('data-state');

    const reviewSlider = $("#review-slider").data("ionRangeSlider");
    const reviewRange = [reviewSlider.result.from, reviewSlider.result.to];

    const reviewRangeText = [$('#review-min').val(), $('#review-max').val()];

    const releaseStart = $('#release-start').val();
    const releaseEnd = $('#release-end').val();
    const releaseRange = [releaseStart, releaseEnd];

    let features = [];
    const featureCheck = $(".feature .checkbox").filter("[data-state='checked'], [data-state='exclude']");
    featureCheck.each(function (i, obj) {
        features[i] = [$(this).attr('data-state'), $(this).attr('data-value')];
    });

    let genres = [];
    let genres2 = [];
    let genreCheck = $(".genre .checkbox").filter("[data-state='checked'], [data-state='exclude']");
    genreCheck.each(function (i, obj) {
        genres[i] = [$(this).attr('data-state'), $(this).attr('data-genre')];
        genres2[$(this).attr('data-genre')] = [$(this).attr('data-state'), 0];
    });

    let genre_limit = 8;

    if (!scroll) {
        start = 0;
        itemCount = 0;
    }

    $('.item a').off('mouseenter');
    $('.item a').off('mouseleave');
    $.ajax ({
        type: "GET",
        data: {filter: filter, search: search, price: priceRange, specialOnly: specialOffers, review: reviewRange, reviewRange: reviewRangeText, releaseRange: releaseRange, features: features, genres: genres, start: start, seed: seed},
        url: "php/getGames.php",
        dataType: "JSON",
        encode: true,
        success: function(response) {
            if (scroll == true) {
                if (response.info.count > 0) {  
                    $(".item-invisible").remove();
                    $(".games").append(response.html);
                    scrolling = false;
                }
                else
                {
                    infiniScroll = false;
                }
            }
            else
            {
                $(".games").hide().html(response.html).fadeIn(300);
            }

            if (response.info.count % 98 != 0) {
                infiniScroll = false;
            }

            itemCount += response.info.count;
            const items_per_row = 7;
            const extra_needed = items_per_row - (itemCount % items_per_row);
            if (extra_needed != 7) {
                for (let i=0; i<extra_needed; i++) {
                    $(".games").append("<div class='item item-invisible'><img src='#'><div class='item-details'><div class='item-name'> NULL </div><div class='item-dev'> NULL </div><div class='item-price-info'><div class='item-final-price'> 0 </div></div></div></div>");
                }
            }
            console.log("Games found: " + itemCount);
            //console.log(response.query);
            //console.log(response.query2);
            //console.log("Games: " + response.info.count);
            //console.log("Execution time: " + response.info.exec_time.toFixed(6) + "s");

            let genreHtml = "";
            let genreCount = response.data.length;
            for (let i=0; i<genreCount; i++) {

                let genre = response.data[i][0];
                let count_num = response.data[i][1];
                
                if (genre) { 
                    let active = i < genre_limit ? 'active-genre' : '';
                    if (genres2[genre] === undefined)
                        genreHtml += "<div class='filter-specials genre "+active+"'><div class='genre-checkbox' data-state='unchecked' data-genre='"+genre+"' data-states='3'></div><div title='"+genre+"'>"+genre+"</div><div>"+count_num+"</div></div>";
                    else
                    {
                        genres2[genre][1] = count_num;
                    }
                }
            }
            $(".genre-div").html(genreHtml);

            let genresLength = genres.length;
            let activeGenreHtml = "";
            if (genresLength > 0) {
                for (let i=0; i<genresLength; i++) {
                    let genre = genres[i][1];
                    let genreState = genres2[genre][0];
                    let genreCount = genres2[genre][1];
                    activeGenreHtml += "<div class='filter-specials genre active-genre'><div class='genre-checkbox' data-state='"+genreState + "' data-genre='"+genre+"' data-states='3'></div><div title='"+genre+"'>"+genre+"</div><div>"+genreCount+"</div></div>";
                }
                activeGenreHtml += "</br>";
            }
            $(".active-genre-div").html(activeGenreHtml);
            $('.genre-checkbox').addClass('checkbox');
        }
    })
}

