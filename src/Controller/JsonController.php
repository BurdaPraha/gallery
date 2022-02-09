<?php

/**
 * @file
 * Contains \Drupal\gallery\Controller\JsonController.
 */

namespace Drupal\gallery\Controller;

use Drupal\Component\Utility\Unicode;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Drupal\gallery\Navigation;

class JsonController implements ContainerInjectionInterface {


    /**
     * @var Navigation
     */
    public $navigation;

    public function __construct(Navigation $navigation){
        $this->navigation = $navigation;
    }

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container) {
        /*
        return new static(
            $container->get('entity.manager')->getStorage('linkit_profile'),
            $container->get('linkit.result_manager')
        );
        */
    }


    /**
     * @param Request $request
     * @return JsonResponse
     */
    public function getNavigationData(Request $request) {

        $id = mb_strtolower($request->query->get('mid'));

        $prev = $this->navigation->loadGalleryPrev($id);
        $next = $this->navigation->loadGalleryNext($id);

        $json_object = new \stdClass();
        $json_object->prev = $prev;
        $json_object->next = $next;

        return new JsonResponse($json_object);
    }

}