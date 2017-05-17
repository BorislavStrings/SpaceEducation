<?php
namespace App\Http\Traits;

use App\Models\File;
use Carbon\Carbon;
use Folklore\Image\Facades\Image;
use Illuminate\Http\UploadedFile;

trait UploadImage
{

    public static function uploadImage($request, $dir){
        if (isset($request['image']) && $request['image'] instanceof UploadedFile) {
            $ext = $request['image']->guessClientExtension();
            $hash = md5(uniqid(rand(), true));
            $path = '/files/'. $dir . '/' . $hash . '.' . $ext; // Path to store in database
            $real_path = 'cdn' . $path; // Path to upload image

            Image::make($request['image'],array())->save(base_path($real_path));

            $file = File::createRecord([
                'url' => $path,
                'create_data' => Carbon::now()
            ]);

            return $file->ID;
        }

        return 0;
    }
}
