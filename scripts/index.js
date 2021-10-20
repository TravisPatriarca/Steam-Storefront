jQuery(function() { 
    sliders();
    checkbox();
    search();
    popup();
    genreSearch();
    createDropdown();
    updateGames();
    scroll();
    release();
});

let settings = {}
settings.seed = Math.floor(1000 + Math.random() * 9000);
settings.scrolling = false;
settings.infiniScroll = true;

function release() {
    var oldStart = "";
    var oldEnd = "";
    $('.release-range').on('focusout', function() {
        var releaseStart = $('#release-start').val();
        var releaseEnd = $('#release-end').val();
        if (oldStart != releaseStart || oldEnd != releaseEnd) {
            updateGames();
            oldStart = releaseStart;
            oldEnd = releaseEnd;
        }
           
    })
}

function sliders() {
    $("#review-slider").ionRangeSlider({
        type: "double",
        min: 0,
        max: 100,
        from: 0,
        to: 100,
        hide_min_max: true,
        hide_from_to: true,
        skin: "round",

        onChange: function (data) {
            $('#review-slider-text').html('Between '+data.from+'% and '+data.to+'%');
        },
        onFinish: function (data) {
            if (old_from !== data.from || old_to !== data.to) {
                old_from = data.from;
                old_to = data.to;
                updateGames();
            }
        }
    });
    $("#review-slider").ionRangeSlider();

    var old_from;
    var old_to;

    $("#price-slider").ionRangeSlider({
        type: "double",
        min: 0,
        max: 200,
        from: 0,
        to: 200,
        hide_min_max: true,
        hide_from_to: true,
        skin: "round",
        onChange: function (data) {
            $('#price-slider-text').html('Between $'+data.from+' and $'+data.to);
        },
        onFinish: function (data) {
            if (old_from !== data.from || old_to !== data.to) {
                old_from = data.from;
                old_to = data.to;
                updateGames();
            }
        }
    });
    $("#price-slider").ionRangeSlider();
}

function scroll() {
    var start = 0;
    $(window).on("scroll", function() {
        var docHeight = $(document).height();
        var scrollPos = $(window).height() + $(window).scrollTop();
        if (!settings.scrolling && settings.infiniScroll) {
            if (scrollPos+300 >= docHeight) { 
                console.log("load");
                settings.scrolling = true;
                start += 98;
                updateGames(1, start);
            }
        }
    });
}

function updateGames(scroll, start) {
    if (!scroll)
        $('.item').remove();

    settings.infiniScroll = true;

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
        //itemCount = 0;
    }
    console.log(start);

    $('.item a').off('mouseenter');
    $('.item a').off('mouseleave');
    $.ajax ({
        type: "GET",
        data: {filter: filter, search: search, price: priceRange, specialOnly: specialOffers, review: reviewRange, reviewRange: reviewRangeText, releaseRange: releaseRange, features: features, genres: genres, start: start, seed: settings.seed},
        url: "php/getGames.php",
        dataType: "JSON",
        encode: true,
        success: function(response) {
            if (scroll == true) {
                if (response.info.count > 0) {  
                    $(".item-invisible").remove();
                    $(".games").append(response.html);
                    settings.scrolling = false;
                }
            }
            else
            {
                $(".games").hide().html(response.html).fadeIn(300);
            }

            if (response.info.count % 98 != 0) {
                settings.infiniScroll = false;
            }
            else
            {
                settings.infiniScroll = true;
            }

            //itemCount += response.info.count;
            let itemCount = $('.item').length;
            const items_per_row = 7;
            const extra_needed = items_per_row - (itemCount % items_per_row);
            if (extra_needed != 7) {
                for (let i=0; i<extra_needed; i++) {
                    $(".games").append("<div class='item item-invisible'><img src='#'><div class='item-details'><div class='item-name'> NULL </div><div class='item-dev'> NULL </div><div class='item-price-info'><div class='item-final-price'> 0 </div></div></div></div>");
                }
            }
            console.log("Games found: " + itemCount);
            //console.log(response.query);
            console.log("Server exec: " + response.info.exec_time + "s");
            //console.log(response.query2);
            //console.log("Games: " + response.info.count);
            //console.log("Execution time: " + response.info.exec_time.toFixed(6) + "s");
            //console.log(response.data);

            var genreArray = new Array();
            for (var items in response.data){
                genreArray.push( response.data[items]);
            }
            genreArray.sort(compareSecondColumn);

            function compareSecondColumn(a, b) {
                if (a[1] === b[1]) {
                    return 0;
                }
                else {
                    return (a[1] > b[1]) ? -1 : 1;
                }
            }

            let genreHtml = "";
            let genreCount = genreArray.length;
            for (let i=0; i<genreCount; i++) {

                let genre = genreArray[i][0];
                let count_num = genreArray[i][1];
                
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

            $('.genre-checkbox[data-state="unchecked"]:lt('+genre_limit+')').parent().addClass('active-genre');
        }
    })
}

function genreSearch() {
    let genre_limit = 8;
    $('#genre-search').on('input', function() {
        //get all genre names
        let vals = []
        $('.genre-checkbox').each(function(i) {
            vals[i] = $(this).attr('data-genre'); 
        }); 

        $('.genre-div').children().removeClass('active-genre');
        let term = $(this).val();
        if (term != "") {
            let search = new RegExp(term , 'i');
            let filteredVals = vals.filter(item => search.test(item));
            let filteredLength = filteredVals.length;
            for (let i=0; i<filteredLength && i<genre_limit; i++) {
                $('.genre-checkbox[data-genre="'+filteredVals[i]+'"]').parent().addClass('active-genre');
            }
        }
        else 
        {
            $('.genre-checkbox[data-state="unchecked"]:lt('+genre_limit+')').parent().addClass('active-genre');
        }
    })
}

function createDropdown() {
    //open/close filter options when sort by is clicked
    $('.select-selected').on('click', function(e) {
        e.stopPropagation();
        $('.select-items').toggleClass("select-hide");
    });

    //set 'same-as-selected' class on clicked option and change filter heading
    $('.select-items div').on('click', function() {
        $('#selected-name').html($(this).html());
        $('.select-items div').removeClass("same-as-selected");
        $(this).addClass("same-as-selected");
        updateGames();
    })

    //close filter when option is clicked
    $('.select-items').on('click', function() {
        $('.select-items').removeClass("select-hide");
    });

    //close filter when anywhere else is clicked
    document.addEventListener("click", function() {
        $('.select-items').addClass("select-hide");
    });
}

function checkbox() {
    $(document).on('click', '.checkbox', function() {
        const state = $(this).attr('data-state');
        switch (state) {
            case 'unchecked':
                $(this).attr('data-state', 'checked');
                break;
    
            case 'checked':
                if ($(this).attr('data-states') == '3')
                    $(this).attr('data-state', 'exclude');
                else    
                    $(this).attr('data-state', 'unchecked');
                break;
    
            case 'exclude':
                $(this).attr('data-state', 'unchecked');
                break;
        }
        updateGames();

        $('#genre-search').val("");

    });
}

function search() {
    let previousSearch = "";    //search box
    submitSearch(previousSearch, $('#search')); 

    let prevMinReview = "";     //min review
    submitSearch(prevMinReview, $('#review-min')); 

    let prevMaxReview = "";    //max review
    submitSearch(prevMaxReview, $('#review-max')); 
    
    function submitSearch(prev, elem) {
        $(elem).on("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                if ($(this).val().trim() != prev) {
                    prev = $(this).val();
                    updateGames();
                }
            }
        });
    }
}

function popup() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    function simplifyNumber(value) {
        if (value > 1000000) {
            return (value/1000000).toFixed(2) + "M";
        }
        else
            if (value > 1000)
                return Math.floor(value/1000) + "K";
            else    
                return value;
    }

    var slideShow;
    var showPopup;
    $(document).on({
        mouseenter: function() {
            var name = $(this).parent().find('.item-name').html();
            var dev = $(this).parent().find('.item-dev').html();
            var imgArr = $(this).parent().attr('data-images').split(',');
            var tagArr = $(this).parent().attr('data-tags').split(',');
            var desc = $(this).parent().attr('data-desc');
            //var release = $(this).parent().attr('data-release').split('-');
            var review = $(this).parent().attr('data-review').split(',');
            var pos=$(this).parent().offset();
            var w=$(this).parent().width();

            var imgArrLength = imgArr.length;
            for (var i=0; i<imgArrLength; i++) {
                $('#item-popup-details').find('img:eq('+i+')').attr('src', imgArr[i]);
            }

            showPopup = setTimeout(function() {
                $('#item-popup-name').html(name);
                $('#item-popup-dev').html(dev);
                $('#item-popup-desc').html(desc);
                //$('#item-popup-release').html(release[2].replace(/^0+/, '') + ' ' + months[parseInt(release[1])-1] + ', ' + release[0]);
    
                var tagArrLength = tagArr.length;
                for (var i=0; i<tagArrLength; i++) {
                    $('#item-popup-tags').find('span:eq('+i+')').html(tagArr[i]);
                }

                function getGreenToRed(percent){
                    r = percent<50 ? 205 : Math.floor(205-(percent*2-100)*205/100);
                    g = percent>50 ? 205 : Math.floor((percent*2)*205/100);
                    return 'rgb('+r+','+g+',0)';
                }
                
                $('#item-popup-total-review').html("Reviews: " + simplifyNumber(parseInt(review[2])));
                $('#item-popup-review-percent').html(review[3] + '% Positive');
                $('#item-popup-review-percent').css('color', getGreenToRed(review[3]));
            
                var parentHeight = $('#item-popup-details').height();
                var childHeight = $('#item-popup-images').height();
                var height = Math.max(parentHeight-childHeight, 220);
                $('#item-popup-images').css('height', height);
        
                $('#item-popup-details').css({ left: pos.left + w + 10, top: pos.top}); 
        
                var index = 0;
                var images = $('#item-popup-details img');
                
                showSlides();
                function showSlides() {
                    if (index < images.length-1)
                        index++;
                    else
                        index = 0;
        
                    $('#item-popup-images img').stop(true).fadeOut(50);
                    $('#item-popup-images img:eq('+index+')').stop(true).fadeIn(50);
                    slideShow = setTimeout(showSlides, 1500);
                }
                $('#item-popup-details').stop(true).fadeIn(50);
            }, 150);
        },

        mouseleave: function() {
            $('#item-popup-details').stop(true).fadeOut(50);
            clearTimeout(slideShow);
            clearTimeout(showPopup);
        }
    }, '.item a');
}