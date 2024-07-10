function getColors(n) {
    // Generate n colors evenly spaced around the HSL color wheel
    const saturation = 70;
    const luminance = 75;
    const colors = [];
    // Start at a random hue
    const startHue = Math.floor(Math.random() * 360);
    for (let i = 0; i < n; i++) {
        const hue = Math.floor((360 / n) * i + startHue);
        colors.push(hslToHex(hue, saturation, luminance));
    }
    return colors;
}

// https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex
function hslToHex(h, s, l) {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, '0'); // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

function textColor(backgroundColor) {
    var r = parseInt(backgroundColor.substring(1, 3), 16);
    var g = parseInt(backgroundColor.substring(3, 5), 16);
    var b = parseInt(backgroundColor.substring(5, 7), 16);
    var brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? "#000000" : "#FFFFFF";
}

function loadPosts() {
    $(document).ready(function () {
        // Fetch JSON data
        $.getJSON("posts.json", function (data) {
            // Store tag colors
            var tagColors = {};
            // Get the number of unique tags in the JSON data
            var uniqueTags = new Set();
            $.each(data, function (index, post) {
                $.each(post.tags, function (index, tag) {
                    uniqueTags.add(tag);
                });
            });
            // Generate a random color for each tag
            var colors = getColors(uniqueTags.size);
            Array.from(uniqueTags).forEach(function (tag, index) {
                tagColors[tag] = colors[index];
            });
            // Loop through each post in the JSON data
            $.each(data, function (index, post) {
                // Create a new div for the post
                var postDiv = $("<div>").addClass("post");

                // Set a data attribute with the post's tags for filtering
                postDiv.attr("data-tags", post.tags.join(","));

                // Create a new div for the post content
                var postContent = $("<div>").addClass("post-content");

                // Create a new div for the date
                var dateDiv = $("<div>")
                    .addClass("post-date")
                    .text(post.date);

                // Create a new div for the tags
                var tagsDiv = $("<div>").addClass("post-tags");
                $.each(post.tags, function (index, tag) {
                    var tagSpan = $("<span>")
                        .addClass("tag tag-text")
                        .text(tag)
                        .css("background-color", tagColors[tag]);
                    tagsDiv.append(tagSpan);
                });

                // Create a new div for the message
                var messageDiv = $("<div>")
                    .addClass("post-message")
                    .html(post.message);

                // Append date, tags, and message to the post content div
                postContent.append(dateDiv).append(tagsDiv).append(messageDiv);

                // Create a new div for the image
                var imageDiv = $("<div>").addClass("post-image");
                var img = $("<img>").attr("src", post.image);
                imageDiv.append(img);

                // Append the post content and image div to the post div
                postDiv.append(postContent).append(imageDiv);

                // Append the post div to the .timeline div
                $(".timeline").append(postDiv);
            });

            // Create tag buttons
            Object.keys(tagColors).forEach(function (tag) {
                var tagButton = $("<button>")
                    .addClass("btn btn-sm tag-text tag-button")
                    .css("border-color", tagColors[tag])
                    .text(tag)
                    .attr("data-tag", tag);
                $(".timeline-toolbar").append(tagButton);
            });

            // Filter function
            $(".tag-button").on("click", function () {
                var tag = $(this).attr("data-tag");
                // Toggle the active class on the button
                $(this).toggleClass("active");

                // Darken the color of the button if it's active, set back to none when disabled
                $(this).css("background-color", function () {
                    if ($(this).hasClass("active")) {
                        return tagColors[tag];
                    } else {
                        return "white";
                    }
                });

                // Build a list of the active tags
                var activeTags = [];
                $(".tag-button.active").each(function () {
                    activeTags.push($(this).attr("data-tag"));
                });


                // Filter the list to those which include any of the active tags
                $(".post").each(function () {
                    var tags = $(this).attr("data-tags").split(",");
                    var tagIntersection = activeTags.filter((x) => tags.includes(x));
                    if (tagIntersection.length > 0) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            });
        });
    });

    // Make all links open in a new tab
    $(document).on("click", "a", function (e) {
        e.preventDefault();
        window.open($(this).attr("href"));
    });
}

loadPosts();
