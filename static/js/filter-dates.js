$(window).on('load', function () {
    var $imgs = $('.vignettelink'); // Store all images
    var $datesButtons = $('#datesButtons'); // Store buttons element
    var dated = {}; // Create tagged object for types

    $imgs.each(function () { // Loop through images and
        var img = this; // Store img in variable
        var dates = $(this).data('date').substring(0, 4); // Get this element's dates

        // date
        if (dates) { // If the element had dates
            dates.split(',').forEach(function (dateName) { // Split at comma and
                if (dated[dateName] == null) { // If object doesn't have tag
                    dated[dateName] = []; // Add empty array to object
                }
                dated[dateName].push(img);
            });
        }
    });

    var counter = 1;
    $.each(dated, function (dateName) { // For each tag name
        $('<button/>', { // Create empty button
            text: dateName, //+ ' (' + dated[dateName].length + ')', // Add tag name
            class: 'subCategory',
            style: 'background-color:' + $googleColors[counter],
            click: function () { // Add click handler
                $(this) // The button clicked on
                    .addClass('active') // Make clicked item active
                    .siblings() // Get its siblings
                    .removeClass('active'); // Remove active from siblings
                $imgs // With all of the images
                    .css("display", "none") // Hide them
                    .filter(dated[dateName]) // Find ones with this tag
                    .css("display", "block"); // Show just those images
            }
        }).appendTo($datesButtons); // Add to the buttons
        counter += 1;
    });

});
