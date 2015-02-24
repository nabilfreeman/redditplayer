<?php
    $url=$_POST['url'];
    if($url!="")
        echo file_get_contents($url);
?>