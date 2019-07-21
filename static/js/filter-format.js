$(window).on('load', function () {

    var $imgs = $('#gallery img'); // Store all images

    var $formatsButtons = $('#formatsButtons'); // Store buttons element
    var formatd = {}; // Create tagged object for types

    $imgs.each(function () { // Loop through images and
        var img = this; // Store img in variable
        var formats = $(this).data('formatPicture'); // Get this element's formats

        // format
        if (formats) { // If the element had formats
            formats.split(',').forEach(function (formatName) { // Split at comma and
                if (formatd[formatName] == null) { // If object doesn't have tag
                    formatd[formatName] = []; // Add empty array to object
                }
                formatd[formatName].push(img);
            });
        }

    });

    $.each(formatd, function (formatName) { // For each tag name
        $('<button/>', { // Create empty button
            text: formatName, // + ' (' + formatd[formatName].length + ')', // Add tag name
            click: function () { // Add click handler
                $(this) // The button clicked on
                    .addClass('active') // Make clicked item active
                    .siblings() // Get its siblings
                    .removeClass('active'); // Remove active from siblings
                $imgs // With all of the images
                    .css("opacity", "0.2") // Hide them
                    .filter(formatd[formatName]) // Find ones with this tag
                    .css("opacity", "1"); // Show just those images
            }
        }).appendTo($formatsButtons); // Add to the buttons
    });

});
