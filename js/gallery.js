(function ( $ ) {

    window.BD_Gallery = function() {};

    window.BD_Gallery.prototype = {

        create: function(appConfig) {

            this.options = {
                galleryId:      null,
                itemCount:      0,
                itemCurrent:    0,
                bufferAds:      0,
                bufferClicks:   0,
                daemonPause:    false,
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


        setter: function(key, val) {

            this.options[key] = val;

            //console.log(this.options[key]);

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
                //console.warn('slider element "' + this.options.sliderId + '" not exist!');
            }
            if(0 == this.thumbs.length) {
                //console.warn('thumbs element "' + this.options.thumbsId + '" not exist!');
            }
            if(0 == this.counter.length) {
                //console.warn('counter element "' + this.options.counterId + '" not exist!');
            }
            if(0 == this.sidebarAds.length && this.options.sidebarAdsId != null) {
                //console.warn('sidebar ads element "' + this.options.sidebarAdsId + '" not exist!');
            }
            if("" == this.galleryId) {
                //console.warn('data attribute "data-gallery-id" missing on slider element!');
            }

        },


        /**
         * Get JSON data from gallery module route, todo: not used right now, right routing wip
         * @return JSON
         */
        loadArrowsData: function() {

            var request = new XMLHttpRequest();
            request.open('GET', '/bd_gallery/' + this.galleryId, true); // todo: domain?
            request.onload = function (e) {

                if (request.readyState === 4)
                {
                    if (request.status === 200)
                    {
                        //console.log(request.responseText); // todo!
                        return request.responseText;
                    }
                    else
                    {
                        //console.error(request.statusText);
                    }
                }
            };
            request.send(null);
        },


        /**
         * Override html of arrows
         * Data object is stored in template "media--gallery--full.html.twig"
         */
        rewriteArrows: function () {

            if(typeof window.galleryLayer != "undefined")
            {
                if(null == this.options.arrowsData) {

                    this.options.arrowsData = window.galleryLayer;
                    // this.options.arrowsData = this.loadArrowsData(); todo: not used right now

                }
            }
            else
            {
                //console.warn("variable 'window.galleryLayer' object not found!");
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
                '<div class="wrap">' +
                ('next' == way ? this.tplGallery('next') : '') +
                '<div class="wrap__way"><i class="fa fa-angle-' + ('next' == way ? 'right' : 'left') + '" aria-hidden="true"></i></div>' +
                ('prev' == way ? this.tplGallery('prev') : '') +
                '</div>';

        },


        /**
         * Refresh counter data and replace html
         * @param event
         */
        rewriteCounter: function (event) {

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
        clickOnThumb: function(close) {

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
        reloadAdsDaemon: function () {

            //console.log("buffer: " + this.options.bufferAds);
            //console.log("pauza obnovovani: " + this.options.daemonPause);

            // adding new frame
            if(this.options.bufferAds > 0) {

                //console.log("vytvarim novy iframe ....");

                var frameUrl = this.sidebarAds.attr("data-frame-url") + '&u=' + Date.now();
                var frameTpl = '' +
                    '<iframe ' +
                    'data-frame-time="' + Date.now() + '" ' +
                    'data-frame-showed="false" ' +
                    'id="u-' + Date.now() + '" ' +
                    'src="' + frameUrl + '" ' +
                    'style="display: none; width: 300px; height: 123px;" ' +
                    'frameborder="0" ' +
                    'scrolling="no">' +
                    '</iframe>';

                // create new frame
                $(frameTpl).appendTo(this.sidebarAds);

                // remove from buffer
                this.options.bufferAds--;
            }

            // get count of iframes
            var childsCount = this.sidebarAds.children().length;

            // if alone in wrapper
            if(childsCount > 1)
            {
                this.sidebarAds.children('iframe').each(function (key, value) {

                    var childElement = $(value);
                    var childOrder   = key + 1;

                    // if isn't the last one
                    //if(childsCount != childOrder)
                    //{
                    var childTime   = childElement.attr('data-frame-time');
                    var difference  = (new Date() - childTime) / 1000;
                    var wasShow     = childElement.attr('data-frame-showed');
                    var wasLoaded   = 123 != childElement.height();

                    // if is older than 2 seconds
                    if(difference >= 2 && true == wasLoaded) // "false" == wasShow
                    {
                        // hide all
                        childElement.parent().children().hide();

                        // show our iframe
                        childElement.show();
                        childElement.attr('data-frame-showed', true)
                    }
                    //}

                });
            }

            //console.log("--- Stav je: " + this.options.bufferClicks + " kliků, v bufferu: " + this.options.bufferAds + " bufferu, iframů: " + childsCount + "  ---");

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

                // create counter
                than.rewriteCounter(event);


                // init daemon
                setInterval(than.reloadAdsDaemon.bind(than), 1000);


            });


            /**
             * Carousel construct
             */
            this.slider.owlCarousel({
                items:              1,
                nav:                true,
                navText:            [than.tplArrow('prev'), than.tplArrow('next')],
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

                // setup for ads
                than.options.bufferClicks++;
                than.options.bufferAds++;

            });


            /**
             * just swipe or click to arrows
             */
            this.slider.on('next.owl.carousel prev.owl.carousel to.owl.carousel dragged.owl.carousel', function(event) {

                // todo: this event not working, check it for future drag events

            });

            /**
             * Thumbs activate view listener
             */
            this.thumbs.find('label').on('click', function() {

                return than.clickOnThumb();

            });

        }


    };

}( jQuery ));