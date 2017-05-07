(function ( $ ) {

    window.BD_Gallery = function() {};

    window.BD_Gallery.prototype = {

        create: function(appConfig) {

            this.options = {
                galleryId:      null,
                bufferAds:      0,
                bufferClicks:   0,
                reloadCount:    0,
                itemCount:      0,
                itemCurrent:    0,
                lang: {
                    prev:       'Previous',
                    next:       'Next',
                    gallery:    'gallery'
                },
                arrowsData:     null,
                sliderId:       appConfig.sliderId,
                thumbsId:       appConfig.thumbsId,
                counterId:      appConfig.counterId,
                sidebarAdsId:   typeof appConfig.sidebarAdsId != "undefined" ? appConfig.sidebarAdsId : null
            };

            if(appConfig.lang){
                this.options.lang = appConfig.lang;
            }

            this.getElements();
            this.createCarousel();

        },


        /**
         * load html elements
         */
        getElements: function() {

            this.slider     = $(this.options.sliderId);
            this.thumbs     = $(this.options.thumbsId);
            this.counter    = $(this.options.counterId);
            this.sidebarAds = $(this.options.sidebarAdsId);
            this.galleryId  = this.slider.attr('data-gallery-id');

            if(0 == this.slider.length) {
                console.warn('slider element "#' + this.options.sliderId + '" not exist!');
            }
            if(0 == this.thumbs.length) {
                console.warn('thumbs element "#' + this.options.thumbsId + '" not exist!');
            }
            if(0 == this.counter.length) {
                console.warn('counter element "#' + this.options.counterId + '" not exist!');
            }
            if(0 == this.sidebarAds.length && this.options.sidebarAdsId != null) {
                console.warn('sidebar ads element "#' + this.options.sidebarAdsId + '" not exist!');
            }
            if(this.galleryId) {
                console.warn('data attribute "data-gallery-id" missing!');
            }

        },


        /**
         * Get JSON data from gallery module route
         * @return JSON
         */
        loadArrowsData: function() {

            var request = new XMLHttpRequest();
            request.open('GET', '/gallery/' + this.galleryId, true); // todo: domain?
            request.onload = function (e) {

                if (request.readyState === 4)
                {
                    if (request.status === 200)
                    {
                        return request.responseText;
                    }
                    else
                    {
                        console.error(request.statusText);
                    }
                }
            };
            request.send(null);
        },


        /**
         * Override html of arrows
         * Data object is stored in template "media--gallery--full.html.twig"
         */
        rewriteArrows: function ()
        {
            if(typeof window.galleryLayer != "undefined" && null == this.options.arrowsData)
            {
                //this.options.arrowsData = window.galleryLayer;
                this.options.arrowsData = this.loadArrowsData();
            }
            else
            {
                console.warn("variable 'window.galleryLayer' object not found!");
            }

            var nav  = this.slider.find('.owl-nav');
            var prev = nav.find('.owl-prev');
            var next = nav.find('.owl-next');

            prev.html(this.tplArrow('prev'));
            next.html(this.tplArrow('next'));
        },


        /**
         * Template for gallery with getting DOM element by way and current index of total slides
         * @param way
         * @returns {string}
         */
        tplGallery: function(way) {

            if(this.options.arrowsData)
            {
                var isFirst = (1 == this.options.itemCurrent && 'prev' == way);
                var isLast  = (this.options.itemCount == this.options.itemCurrent && 'next' == way);

                if(isFirst || isLast)
                {
                    var langWay     = isFirst ? this.options.lang.prev : this.options.lang.next;
                    var langLabel   = langWay + ' ' + this.options.lang.gallery;
                    var wayData     = this.options.arrowsData[way];
                    var langTitle   = wayData.title;
                    var thumb       = wayData.thumb;
                    var path        = wayData.path;

                    return '' +
                        '<div class="wrap__gallery">' +
                        '<a href="' + path + '">' +
                        '<span class="wrap__gallery__img"><img src="' + thumb + '"></span>' +
                        '<span class="wrap__gallery__txt">' +
                        '<span class="txt-label">' + langLabel + '</span>' +
                        '<span class="txt-headline">' + langTitle + '</span>' +
                        '</span>' +
                        '</a>' +
                        '</div>';
                }
            }

            return '';

        },


        /**
         * Template for arrow with adding gallery
         * @param way
         * @returns {string}
         */
        tplArrow: function (way) {

            return '' +
                '<div class="wrap">' + ('next' == way ? this.tplGallery('next') : '') +
                '<div class="wrap__way"><i class="fa fa-angle-'+way+'" aria-hidden="true"></i></div>' + ('prev' == way ? this.tplGallery('prev') : '') +
                '</div>';

        },


        /**
         * Refresh counter data and replace html
         * @param event
         */
        rewriteCounter: function (event)
        {
            if(event)
            {
                this.options.itemCount   = event.item.count;
                this.options.itemCurrent = event.item.index + 1;
            }

            this.counter.html(this.options.itemCurrent + " / " + this.options.itemCount);
        },


        /**
         * Thumbnails list
         * @param close
         */
        clickOnThumb: function(close)
        {
            if(this.thumbs.hasClass('active') || true == close)
            {
                this.slider.removeClass('go-hidden');
                this.thumbs.removeClass('active');
            }
            else
            {
                this.slider.addClass('go-hidden');
                this.thumbs.addClass('active');
            }
        },


        /**
         * Reload ads around gallery
         */
        reloadAds: function ()
        {
            BD_Gallery.bufferClicks++;
            console.log("Reloaduji reklamu");

            // do it
            this.sidebarAds.src = this.sidebarAds.src + '&u' + Date.now();
        },


        /**
         * Reload ads around gallery, todo: !!!!!!!!!!!!
         */
        daemonReloadAds: function ()
        {
            console.log("funkce zavolana");
            console.log("daemon zavolan");

            if(BD_Gallery.bufferAds > 0 && bufferPause == false)
            {
                bufferPause = true;

                console.log("buffer:" + BD_Gallery.bufferAds);

                adFrame.src = adFrame.getAttribute('data-default-src') + '&frameId=' + Date.now();

                adFrame.addEventListener("load", function() {

                    BD_Gallery.bufferAds--;
                    BD_Gallery.reloadCount++;
                    bufferPause = false;
                    alert("ad");

                });


                console.log("its done!");
            }
            else
            {
                console.log("buffer 0")
            }

            console.log("pauza je: " + bufferPause);
            console.log("-- Stav je: " + BD_Gallery.reloadCount + " obnovení z " + BD_Gallery.bufferClicks + " kliků, buffer: " + BD_Gallery.bufferAds + " --");
        },


        /**
         * Create owl Carousel with event listeners
         */
        createCarousel: function() {

            var than = this;

            /**
             * It must be before carousel constructor!
             */
            this.slider.on('initialized.owl.carousel', function(event) {

                console.log(event);

                than.rewriteCounter(event);
                than.rewriteArrows();

                //window.setInterval(daemonReloadAds, 1000);

            });


            /**
             * Carousel construct
             */
            this.slider.owlCarousel({
                items:              1,
                nav:                true,
                //navText:            [than.tplArrow('left'), than.tplArrow('next')],
                autoHeight:         false,
                URLhashListener:    true,
                startPosition:      'URLHash',
                callbacks:          true,
                center:             true,
                lazyLoad:           true,
                autoplay:           false,
                dots:               true
            });


            /**
             * Slider triggers
             */
            this.slider.on('changed.owl.carousel', function(event) {

                than.rewriteCounter(event);
                than.rewriteArrows();
                than.clickOnThumb(true);
                than.reloadAds();

            });


            /**
             * just swipe or click to arrows
             */
            this.slider.on('next.owl.carousel prev.owl.carousel to.owl.carousel dragged.owl.carousel', function(event) {

                than.options.bufferClicks++;
                than.options.bufferAds++;

                than.rewriteArrows(event);

                console.info("calling...");

            });

            /**
             * Thumbs activate
             */
            this.thumbs.on('click', function() {

                return than.clickOnThumb();

            });

        }


    };

}( jQuery ));