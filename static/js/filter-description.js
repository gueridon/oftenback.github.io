(function () {

    var $imgs = $('#gallery img'); // Store all images
    var $buttons = $('#descriptionButtons'); // Store buttons element
    var descriptioned = {}; // Create tagged object for descriptions

    $imgs.each(function () { // Loop through images and
        var img = this; // Store img in variable
        var descriptions = $(this).data('description'); // Get this element's descriptions


        if (descriptions) { // If the element had descriptions
            var $alldescriptions = descriptions.split(',');
            //document.write($alldescriptions[0])
            descriptions.split(',').forEach(function (descriptionName) { // Split at comma and
                if (descriptioned[descriptionName] == null) { // If object doesn't have tag
                    descriptioned[descriptionName] = []; // Add empty array to object
                }
                descriptioned[descriptionName].push(img); // Add the image to the array
            });
        }

    });

    $.each(descriptioned, function (descriptionName) {
        // For each tag name
        $('<button/>', { // Create empty button
            text: descriptionName, // + ' (' + descriptioned[descriptionName].length + ')', // Add tag name
            click: function () { // Add click handler
                $(this) // The button clicked on
                    .addClass('active') // Make clicked item active
                    .siblings() // Get its siblings
                    .removeClass('active'); // Remove active from siblings
                $imgs // With all of the images
                    .hide() // Hide them
                    .filter(descriptioned[descriptionName]) // Find ones with this tag
                    .show(); // Show just those images
            }
        }).appendTo($buttons); // Add to the buttons

    });
}());
