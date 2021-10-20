jQuery(function() {
    //createCheckbox('.checkbox');
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
});