$(window).on('load', function () {
    var $imgs = $('.vignettelink');
    var $images = $('.vignettepicture');
    $('#showallButton').click(function () {
        $imgs.css("display", "block");
        $images
            .removeClass("noshadow")
            .addClass("shadow");






    });

});
