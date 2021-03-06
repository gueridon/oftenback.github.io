$(window).on('load', function () { // Lives in an IIFE
    var $imgs = $('.vignettelink'); // Get the images
    var $search = $('#filter-search'); // Get the input element
    var cache = []; // Create an array called cache

    $imgs.each(function () { // For each image
        var tag = $(this).data('description');
        cache.push({ // Add an object to the cache array
            element: this, // This image
            text: tag.trim().toLowerCase() // Its alt text (lowercase trimmed)
        });
    });

    function filter() { // Declare filter() function
        var query = this.value.trim().toLowerCase(); // Get the query
        cache.forEach(function (img) { // For each entry in cache pass image
            var index = 0; // Set index to 0
            if (query) { // If there is some query text
                index = img.text.indexOf(query); // Find if query text is in there
            }
            img.element.style.display = index === -1 ? 'none' : 'block'; // Show / hide
        });
    }

    if ('oninput' in $search[0]) { // If browser supports input event
        $search.on('input', filter); // Use input event to call filter()
    } else { // Otherwise
        $search.on('keyup', filter); // Use keyup event to call filter()
    }

});
