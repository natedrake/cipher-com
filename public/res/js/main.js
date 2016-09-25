/**
 *  main.js
 *  @authors
 *      - John O'Grady <natedrake> | 14101718
 *  @date 10/11/2015
 *  @note controls ajax calls and jQuery animation
 */
 
var ajaxurls = [];
ajaxurls["comments"] = 'https://cipher-natedrake13.c9users.io/comment';

/**
 *  @note timer to control animation
 **/
var animationTimer;

/**
 *  @note $(document).onready 
 **/
$(function(){
    /**
     *  @note check if the user refreshed the page with the vigenere option 
     *      selected in the drop down menu
     **/
    if ($('#input-select option:selected').val() === 'vig') {
        /**
         * @note set the drop downs selected index to the default = caesar
         **/
        $('#input-select option')[0].selected = true;
    }
    /**
     *  @note prevent default on forms on submit event to stop page refreshing on submit.
     **/
    $('form').each(function(index) {
        $(this).submit(function(event) {
            event.preventDefault();
        });
    });
    /**
     *  @note send request to encrypt text
     */
    $('#encrypt-form').submit(function() {
        /**
         *  @note put the submit button into the loading state
         **/
        $('#encrypt-btn').button('loading');
        /** 
         *  @note serialize the form data 
         **/
        var formData = ($(this).serializeArray());
        /**
         *  @note post our serialized data to the server
         **/
        $.post('/enc', formData, function(data) {
            /**
             *  @note put the submit button back to default state (clickable)
             **/
            $('#encrypt-btn').button('reset');
            /**
             *  @note update our table of previous requests
             **/
            updatePreviousRequests();
            /**
             *  @note refresh the input text box
             **/
            $('#input-text').val('');
        });
    });
    
    /**
     * event called when user changes item in dropdown list
     **/
    $('#input-select').on('change', function(event) {
        /**
         *  @note find the value of the selected item
         **/
        var selectedCipher = $('#input-select option:selected').val();
        /**
         *  @note check if vigenere cipher is open
         *      if so, remove the input text box for our key phrase
         **/
        if ($('.keywrapper').length > 0) {
            $('.keywrapper').remove();
        }
        /**
         *  @note if the user chose the vigenere cipher, 
         *      diplay the input box for the key phrase
         **/
        if (selectedCipher === 'vig') {
            addCipherKeyInput();
        }
    });
    
    /**
     * Adding a hover over function to the Encrypt button
     * changes colour
     */
    var currentColor;
    $("#encrypt-btn").hover(function(){
        currentColor = $('#encrypt-btn').css('background-color');
        $(this).css("background-color", "green");
    }, function(){
        $(this).css("background-color", currentColor);
    });
    
    /**
     *  @note submit a comment to a post
     */
    $('#submit-comment').on('click', function(event) {
        /**
         *  @note client side validation
         **/
        if($('#comment-body').val().length > 0) {
            /**
             *  @note data validate, submit to the server
             **/
            $.post(ajaxurls['comments'], $('#comment-form').serializeArray(), function(data) {
                /**
                 *  @note using ajax update our comments list
                 **/
                updateComments()
            });
        }
    });
    
    /**
     *  @note load previous requests.
     *      Updates when the page is first loaded
     */
    $('#requests').ready(function(event) {
        updatePreviousRequests();
    });
});

/**
 *  @note update previous requests table
 */
function updatePreviousRequests() {
    /**
     *  @note post empty query to server as server can make 
     *      distinction of data from client IP address
     **/
    $.post('/requests', '', function(data) {
        /**
         *  @note once we send our post request
         *      animate the table with a loading animation
         **/
        createAnimationSchema($('#requests'));
        /**
         *  @note perform the animation on a loop
         **/
        setTimeout(function() {
            /**
             *  @note after 2 seconds, finish the animation
             *      could of finished animation when response from
             *      server was received, but this was instant and
             *      animation was too quick. Delay of two seconds 
             *      will suffice
             **/
            finishAnimation(function() {
                /**
                 *  @note write our respons XHTML to our requests table
                 **/
                $('#requests').html(data);
                
                /**
                 *  @note add jquery effects and event listeners on table elements
                 **/
                $('.request-entry').each(function(index) {
                    /**
                     *  @note parse the id of the element in the table
                     *      this will be used during the deletion process
                     **/
                    var id = parseInt(($(this).children(0).html()));
                    /**
                     *  @note when the users mouse hovers over a table item
                     *      fade to half opacity
                     **/
                    $(this).on('mouseenter', function(event) {
                        event.preventDefault();
                        $(this).fadeTo(1000, 0.5);
                    });
                    /**
                     *  @note when the users mouse leaves a table item
                     *      fade back to full opacity
                     **/
                    $(this).on('mouseleave', function(event) {
                        event.preventDefault();
                        $(this).fadeTo(1000, 1.0);
                    });
                    
                    /**
                     *  @note remove a record when the item is double clicked
                     **/
                    $(this).dblclick(function(event) {
                        event.preventDefault();
                        removeRequest(id);
                    });
                    /**
                     *  @note if there is a single click on the table item
                     *      check if this is from a mobile user, as one 
                     *      press on a mobile device will delete a record
                     **/
                    $(this).click(function(event) {
                        event.preventDefault();
                        if (window.mobilecheck()) {
                           removeRequest(id);
                        }
                    });
                })
            });
        }, 2000);
    });
}

/**
 *  @note update comment list on a blog post 
 */
function updateComments(postid) {
    $.post('/getcomments', {postid: postid}, function(data) {
        /**
         *  @TODO update comments using ajax
         **/
    });
}

/**
 *  @note function to inject the input box when vigenere 
 *      cipher from dropdown box is sleected
 */
function addCipherKeyInput() {
    var cipherKeyInput = $(
        '<div class="form-group keywrapper">'+
        '<label for="cipher-key">Choose a Key Phrase</label>'+
        '<input id="cipher-key" name="cipherkey" class="form-control" autocomplete="no" placeholder="Choose a key for encryption" required="true">'+
        '</div>'
    );
    $('#input-select').parent().prev().after(cipherKeyInput);
}

/**
 *  @param element
 *  @note adds all elements neccessary to perform animation
 **/
function createAnimationSchema(element) {
    var html = $('<span class="glyphicon glyphicon-cog span-center-big" id="spinner"></span>');
    element.addClass('table-fade');
    element.append(html);
    (performScalingAnimation(html));
}

/**
 *  @param element
 *  @ note function that actually performs the scaling 
 *      on the element supplied
 **/
function scaleElement(element) {
    /**
     *  @note save the default font size of the element
     *      really only designed for bootstrap glyphicons
     **/
    var defaultFontSize = parseCssProperty(element.css('font-size'));
    /**
     *  @note record default opacity of element
     **/
    var defaultOpacity = element.css('opacity');
    /**
     * @note the maximum scale factor for element 
     **/
    var iScaleMax = 0;
    iScaleMax = parseCssProperty(element.css('font-size'));
    /**
     *  @note set our max scale
     **/
    iScaleMax += (iScaleMax * .2);
    /**
     *  @note animate the object by changing size and opacity
     **/
    element.animate({
        fontSize: iScaleMax+"px",
        opacity: 0.5
    }, 750, function() {
        element.animate({
            fontSize: defaultFontSize+"px",
            opacity: defaultOpacity
        }, 750, function() {}); // scale back to normal
    });
}

/**
 *  @note Perform animation to scale an element up and back to its default scale
 **/
function performScalingAnimation(element) {
    animationTimer = setInterval(scaleElement(element), 1550);
}

/**
 *  @param callback function
 *      call back function to call once animation actually stops
 *  @note function to clear interval that keeps the animation running
 *      removes elements used in animation from the DOM
 **/
function finishAnimation(callback) {
    /**
     *  @note remove our animation schema
     **/
    $('#spinner').remove();
    /**
     *  @note show our table in full opacity
     **/ 
    $('#requests').removeClass('table-fade');
    /**
     *  @note stop the animation from running
     **/
    clearInterval(animationTimer);
    /**
     *  @note check if callback function supplied
     **/
    if (typeof(callback) === 'function') {
        callback();
    }
}

/**
 *  @note function to remove request from recent requests table
 **/
function removeRequest(id) {
    $.post('/removerequest/'+id, '', function(data) {
        updatePreviousRequests();
    });
}

/** 
 * DRY code
 * 
 */

/**
 *  @param property
 *  @note gets integer value of css properties. e.g. font-size
 **/
function parseCssProperty(property) {
    /**
     *  @note string representation of property value
     **/
    var sResult = property;
    /**
     *  @note parse string representation of value to an int
     *      regex removes everything but digits
     **/
    var iResult = parseInt(sResult.replace(/[^\d]/g, ''));
    /**
     *  @note make sure that result is a number
     **/
    if (!isNaN(iResult)) {
        return iResult;
    } else {
        return null;
    }
}

/**
 *  @note mobile browser detection
 *  @ref taken from http://stackoverflow.com/questions/11381673/detecting-a-mobile-browser
 *      by user Michael Zaporozhets
 * 
 *  @note coulda, shoulda, woulda, wrote my own regex. This will suffice for checking if mobile
 **/
window.mobilecheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}