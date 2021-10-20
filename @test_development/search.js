jQuery(function() {
    //search box
    let previousSearch = "";
    submitSearch(previousSearch, $('#search')); 

    //min review
    let prevMinReview = "";
    submitSearch(prevMinReview, $('#review-min')); 

    //max review
    let prevMaxReview = "";
    submitSearch(prevMaxReview, $('#review-max')); 
});

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