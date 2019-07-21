$(window).on('load', function () {


    var $imgs = $('.vignettelink'); // Store all images
    var $placesButtons = $('#placesButtons'); // Store buttons element
    var unorderedplaced = {}; // Create tagged object for types

    $imgs.each(function () { // Loop through images and
        var img = this; // Store img in variable
        var places = $(this).data('place'); // Get this element's places

        // PLACE
        if (places) { // If the element had places
            places.split(',').forEach(function (placeName) { // Split at comma and
                if (unorderedplaced[placeName] == null) { // If object doesn't have tag
                    unorderedplaced[placeName] = []; // Add empty array to object
                }
                unorderedplaced[placeName].push(img);
            });
        }

    });

    var counter = 1;

    const orderedplaced = {};
    Object.keys(unorderedplaced).sort().forEach(function (key) {
        orderedplaced[key] = unorderedplaced[key];
    });
    $.each(orderedplaced, function (placeName) { // For each tag name
        $('<button/>', { // Create empty button
            text: placeName, // + ' (' + orderedplaced[placeName].length + ')', // Add tag name
            class: 'subCategory',
            style: 'background-color:' + $googleColors[counter],
            click: function () { // Add click handler
                $(this) // The button clicked on
                    .addClass('active') // Make clicked item active
                    .siblings() // Get its siblings
                    .removeClass('active'); // Remove active from siblings


                // $containers.css("opacity","0.2");
                //  $containers.children().filter(placed[placeName]).css("border","10px solide white"); 


                $imgs // With all of the images
                    .css("display", "none") // Hide them
                    .filter(orderedplaced[placeName]) // Find ones with this tag
                    .css("display", "block"); // Show just those images
            }
        }).appendTo($placesButtons); // Add to the buttons
        counter += 1;
    });

});
