jQuery(function() {
    createDropdown();
});

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