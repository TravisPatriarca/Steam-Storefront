function getGenres() {
    let genres = [];
    let genres2 = [];
    let genreCheck = $(".genre .checkbox").filter("[data-state='checked'], [data-state='exclude']");

    genreCheck.each(function (i, obj) {
        genres[i] = [$(this).attr('data-state'), $(this).attr('data-genre')];
        genres2[$(this).attr('data-genre')] = [$(this).attr('data-state'), 0];
    });

    let genre_limit = 8;
    const search = $('#search').val();

    $.ajax ({
        type: "GET",
        data: {genres: genres, search: search},
        url: "php/getGenres.php",
        dataType: "JSON",
        encode: true,
        success: function(response) {
            console.log(response.query);
            let genreHtml = "";
            let genreCount = response.data.length;
            for (let i=0; i<genreCount; i++) {

                let genre = response.data[i][0];
                let count_num = response.data[i][1];
                
                if (genre) { 
                    let active = i < genre_limit ? 'active-genre' : '';
                    if (genres2[genre] === undefined)
                        genreHtml += "<div class='filter-specials genre "+active+"'><div class='genre-checkbox checkbox' data-state='unchecked' data-genre='"+genre+"' data-states='3'></div><div title='"+genre+"'>"+genre+"</div><div>"+count_num+"</div></div>";
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
                    activeGenreHtml += "<div class='filter-specials genre active-genre'><div class='genre-checkbox checkbox' data-state='"+genreState + "' data-genre='"+genre+"' data-states='3'></div><div title='"+genre+"'>"+genre+"</div><div>"+genreCount+"</div></div>";
                }
                activeGenreHtml += "</br>";
            }
            $(".active-genre-div").html(activeGenreHtml);
            createCheckbox('.genre-checkbox', {updateGenre: true});
        }
    }).done(function(response) {
        let elements = $('.genre-checkbox');
        let vals = [];
        for(let i=0;typeof(elements[i])!='undefined';vals.push(elements[i++].getAttribute('data-genre')));
        $('#genre-search').off('input');

        $('#genre-search').on('input', function() {
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
        });
    });
}