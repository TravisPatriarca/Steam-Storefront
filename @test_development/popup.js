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

jQuery(function() {
    var slideShow;
    var showPopup;
    $(document).on({
        mouseenter: function() {
            var name = $(this).parent().find('.item-name').html();
            var dev = $(this).parent().find('.item-dev').html();
            var imgArr = $(this).parent().attr('data-images').split(',');
            var tagArr = $(this).parent().attr('data-tags').split(',');
            var desc = $(this).parent().attr('data-desc');
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
});