(function ( $ )
{
    /**
     * Is gallery on this page?
     */
    if($("#page.gallery").length > 0)
    {

        var itemCount, itemCurrent = 0;
        var owl     = $('.owl-gallery');
        var thumbs  = $('.item-media-gallery__header__thumbs');

        /**
         * Template for gallery with getting DOM element by way and current index of total slides
         * @param way
         * @returns {string}
         */
        function tplGallery(way)
        {
            if(typeof galleryLayer != "undefined")
            {
                if(galleryLayer[way].path && ('left' == way && 1 == itemCurrent || 'right' == way && itemCount == itemCurrent))
                {
                    return '' +
                        '<div class="wrap__gallery">' +
                        '<a href="' + galleryLayer[way].path + '">' +
                        '<span class="wrap__gallery__img"><img src="' + galleryLayer[way].thumb + '"></span>' +
                        '<span class="wrap__gallery__txt">' +
                        '<span class="txt-label">Další galerie</span>' +
                        '<span class="txt-headline">' + galleryLayer[way].title + '</span>' +
                        '</span>' +
                        '</a>' +
                        '</div>';
                }
            }

            console.warn("galleryLayer object not found!"); // todo: ony dev
            return '';
        }

        /**
         * Template for arrow with adding gallery
         * @param way
         * @returns {string}
         */
        function tplArrow(way)
        {
            return '' +
                '<div class="wrap">' + ('right' == way ? tplGallery('right') : '') +
                '<div class="wrap__way"><i class="fa fa-angle-'+way+'" aria-hidden="true"></i></div>' + ('left' == way ? tplGallery('left') : '') +
                '</div>';
        }

        /**
         * Override html of arrows
         */
        function rewriteArrows()
        {
            var nav  = owl.find('.owl-nav');
            var prev = nav.find('.owl-prev');
            var next = nav.find('.owl-next');

            prev.html(tplArrow('left'));
            next.html(tplArrow('right'));
        }

        /**
         * Override html of slide/slides counter
         */
        function rewriteCounter()
        {
            var el = $('.item-media-gallery__header__counter');
            el.html(itemCurrent + " / " + itemCount);
        }

        /**
         * Thumbnails list
         * @param close
         */
        function clickOnThumb(close)
        {
            var list = thumbs[0].classList;

            if(list.contains('active') || true == close)
            {
                owl.removeClass('go-hidden');
                list.remove('active');
            }
            else
            {
                owl.addClass('go-hidden');
                list.add('active');
            }
        }

        /**
         * Reload ads around gallery
         */
        function reloadAds()
        {
            // todo: do it!
            console.log("Reloaduji reklamu");
        }

        /**
         * Slider triggers
         */
        owl.on('initialize.owl.carousel initialized.owl.carousel changed.owl.carousel', function(e)
        {
            itemCount   = e.item.count;
            itemCurrent = e.item.index + 1;
            rewriteCounter();
            rewriteArrows();
        });

        /**
         * Carousel construct
         */
        owl.owlCarousel({
            items:              1,
            nav:                true,
            navText:            [tplArrow('left'), tplArrow('right')],
            URLhashListener:    true,
            startPosition:      'URLHash',
            callbacks:          true,
            center:             true,
            lazyLoad:           true,
            autoplay:           false,
            dots:               false
        });

        /**
         * Thumbs activate
         */
        thumbs.on('click', function(e)
        {
            clickOnThumb();
        });

        /**
         * Item slide / swiped
         * Do: thumbs deactivate, reload ads
         */
        owl.on('changed.owl.carousel', function(e)
        {
            clickOnThumb(true);
            reloadAds();
        });
    }

}( jQuery ));