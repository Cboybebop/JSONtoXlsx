<?php
error_reporting(E_ALL);
     require 'vendor/autoload.php';
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

    $jsonToExcel = new Spreadsheet();
    
    // Note: Only run this localhost, dont put it on a server :) 
    // URL to JSON file
    $json = file_get_contents('url-goes-here');
    $data = json_decode($json);
    // If JSON had a key, we'd declare $key = 'id'; here and then foreach ($data->$key) below
    // Declace all the json fields per object, firefox reads this a lot easier
    $pipedcols = "json-fields-go-here";
    $cols = explode('|', $pipedcols);
    
    
    $jsonToExcel->setActiveSheetIndex(0);
    $activeSheet = $jsonToExcel->getActiveSheet();
    
    // Note currently 26 columns maximum as cols set a to z
    function getColLetter ($i) {
    $COLS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $ct = ($i > 25) ? floor($i / 26) : 0;
    $ret = $COLS[$i % 26];
        while ($ct--)
            $ret .= $ret;
    return $ret;
    }

    // build header row
    foreach ($cols as $i=>$col) {
        $activeSheet->setCellValue(getColLetter($i) . 1, $col);
    }

    // populate content rows
    foreach ($data as $i=>$row) {
        foreach ($cols as $j=>$col) {
            $activeSheet->setCellValue(getColLetter($j) . ($i + 2), $row->$col);
        }
    }

    
    $writer = new Xlsx($jsonToExcel);
    $writer->save('test.xlsx');
    echo "All done!";
?>