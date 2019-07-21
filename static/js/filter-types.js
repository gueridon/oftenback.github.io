var $googleColors = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#3B3EAC",
                      "#990099", "#0099C6", "#DD4477", "#66AA00", "#B82E2E",
                      "#316395", "#994499", "#22AA99", "#AAAA11", "#6633CC",
                      "#E67300", "#329262", "#8B0707", "#5574A6", "#3B3EAC",
                      "#3366CC", "#DC3912", "#FF9900", "#109618", "#3B3EAC",
                      "#990099", "#0099C6", "#DD4477", "#66AA00", "#B82E2E",
                      "#316395", "#994499", "#22AA99", "#AAAA11", "#6633CC",
                      "#E67300", "#329262", "#8B0707", "#5574A6", "#3B3EAC"];

$(window).on('load', function () {
    //$("#typeToggle").one('click', function() {

    var $imgs = $('.vignettelink'); // Store all images
    var $typeButtons = $('#typeButtons'); // Store buttons element
    var typed = {}; // Create tagged object for types

    $imgs.each(function () { // Loop through images and
        var img = this; // Store img in variable
        var types = $(this).data('type'); // Get this element's types

        //types
        if (types) { // If the element had types
            types.split(',').forEach(function (typeName) { // Split at comma and
                if (typed[typeName] == null) { // If object doesn't have tag
                    typed[typeName] = []; // Add empty array to object
                }
                typed[typeName].push(img); // Add the image to the array
            });
        }
    });
    var counter = 1;
    $.each(typed, function (typeName) { // For each tag name
        $('<button/>', { // Create empty button
            text: typeName, // + ' (' + typed[typeName].length + ')', // Add tag name
            class: 'subCategory',
            style: 'background-color:' + $googleColors[counter],
            click: function () { // Add click handler
                $(this) // The button clicked on
                    .addClass('active') // Make clicked item active
                    .siblings() // Get its siblings
                    .removeClass('active'); // Remove active from siblings
                $imgs // With all of the images
                    .css("display", "none") // Hide them
                    .filter(typed[typeName]) // Find ones with this tag
                    .css("display", "block"); // Show just those images
            }
        }).appendTo($typeButtons); // Add to the buttons
        counter += 1;
    });
    //});
});
