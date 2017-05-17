<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Requests;
use App\Files;

class FilesController extends Controller
{
    public function download($file_id) {
        $file = Files::findOrFail($file_id);

        return response()->download($file->url);
    }
}
