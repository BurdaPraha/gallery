<?php

namespace Drupal\gallery;

use Drupal\media_entity\MediaInterface;
use Drupal\image\Entity\ImageStyle;
use Drupal\Core\File;

class Gallery
{

    /**
     * @param MediaInterface $media_entity
     * @return string|null
     */
    public static function mediaFileUrl(MediaInterface $media_entity)
    {
        $source_field = $media_entity->getType()->getConfiguration()['source_field'];

        if ($media_entity->hasField($source_field))
        {
            $file_entities = $media_entity->get($source_field)->referencedEntities();
            if (!empty($file_entities)) {
                return $file_entities[0]->getFileUri();
            }
        }

        return null;
    }


    /**
     * @param $currentId
     * @param $dateComparator
     * @param $sortOrder
     * @param $thumbnail
     * @return array|null
     * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
     */
    public static function getMediaData($currentId, $dateComparator, $sortOrder, $thumbnail)
    {
        /** @var $current \Drupal\media_entity\Entity\Media */
        $current = \Drupal::entityTypeManager()
            ->getStorage('media')
            ->load($currentId);

        if(!$current) {
            return null;
        }

        $prev_or_next = \Drupal::entityQuery('media')
            ->condition('bundle', $current->bundle())
            ->condition('status', 1)
            ->condition('created', $current->getCreatedTime(), $dateComparator)
            ->sort('created', $sortOrder)
            ->range(0, 1)
            ->execute();

        if(!$prev_or_next) {
            return null;
        }

        /** @var $gallery \Drupal\media_entity\Entity\Media */
        $gallery = \Drupal::entityTypeManager()
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
     * Prev gallery
     * @param $id
     * @param string $thumbnail
     * @return array|null
     */
    public static function loadPrev($id, $thumbnail = 'thumbnail')
    {
        return self::getMediaData($id, '<', 'DESC', $thumbnail);
    }

    /**
     * Next gallery
     * @param $id
     * @param string $thumbnail
     * @return array|null
     */
    public static function loadNext($id, $thumbnail = 'thumbnail')
    {
        return self::getMediaData($id, '>', 'ASC', $thumbnail);
    }
}