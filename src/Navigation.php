<?php

namespace Drupal\gallery;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\image\Entity\ImageStyle;

class Navigation {

    public function __construct(EntityTypeManagerInterface $entity_type_manager)
    {
        $this->entityTypeManager = $entity_type_manager;
    }

    /**
     * Prev gallery
     * @param $id
     * @param string $thumbnail
     * @return array|null
     */
    public function loadGalleryPrev($id, $thumbnail = 'thumbnail')
    {
        return $this->getMediaData($id, '<', 'DESC', $thumbnail);
    }

    /**
     * Next gallery
     * @param $id
     * @param string $thumbnail
     * @return array|null
     */
    public function loadGalleryNext($id, $thumbnail = 'thumbnail')
    {
        return $this->getMediaData($id, '>', 'ASC', $thumbnail);
    }

    /**
     * Load one gallery
     * @param $currentId
     * @param $dateComparator
     * @param $sortOrder
     * @param $thumbnail
     * @return array|null
     */
    public function getMediaData($currentId, $dateComparator, $sortOrder, $thumbnail)
    {
        /**
         * @var \Drupal\media\Entity\Media
         */
        $current = $this->entityTypeManager
            ->getStorage('media')
            ->load($currentId);

        if(!$current)
        {
            return null;
        }

        $prev_or_next = \Drupal::entityQuery('media')
            ->condition('bundle', $current->bundle())
            ->condition('status', 1)
            ->condition('created', $current->getCreatedTime(), $dateComparator)
            ->sort('created', $sortOrder)
            ->range(0, 1)
            ->execute();

        if(!$prev_or_next)
        {
            return null;
        }

        $gallery = $this->entityTypeManager
            ->getStorage('media')
            ->load(array_values($prev_or_next)[0]);

        $all = $gallery->get('field_media_images');
        if(isset($all[0]))
        {
            $file   = $all[0]->entity->field_image->entity->getFileUri();

            return [
                'id'        => $gallery->id(),
                'title'     => $gallery->label(),
                'path'      => $gallery->toUrl()->toString(),
                'images'    => $all,
                'thumb'     => ImageStyle::load($thumbnail)->buildUrl($file)
            ];
        }

        return null;
    }

    /**
     * Load gallery images
     * @param $id
     * @param string $thumbnail
     * @return array
     */
    public function loadGalleryThumbs($id, $thumbnail = 'thumbnail')
    {
        $gallery = $this->entityTypeManager
            ->getStorage('media')
            ->load($id);

        $images = $gallery->get('field_media_images');

        if($images)
        {
            $result = [];
            foreach($images as $image)
            {
                $mid        = $image->entity->id();
                $fileEntity = $image->entity->field_image->entity;
                $fid        = $image->entity->field_image->entity->id();
                $imageUrl   = $fileEntity->getFileUri();

                $result[] = [
                    'mid'   => $mid,
                    'fid'   => $fid,
                    'thumb' => ImageStyle::load($thumbnail)->buildUrl($imageUrl),
                ];
            }

            return $result;
        }

        return [];
    }
}