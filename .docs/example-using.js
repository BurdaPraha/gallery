/**
 * Vysledne pouziti v dalsim scriptu
 */
(function ( $ ) {

    var page = document.getElementById('page');

    /**
     * Is gallery on this page?
     */
    if(page.classList.contains('gallery'))
    {
        window.BurdaGallery = new BD_Gallery();
        BurdaGallery.create({
            sliderId:       AppConfig.gallery.sliderId,
            thumbsId:       AppConfig.gallery.thumbsId,
            counterId:      AppConfig.gallery.counterId,
            sidebarAdsId:   AppConfig.gallery.sidebarAdsId,
            lang: {
                prev:       'Předchozí',
                next:       'Další',
                gallery:    'galerie'
            }
        });
    }

}( jQuery ));