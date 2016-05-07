<?php
header("Content-Type: application/json; charset=utf-8");

$t = new DateTime();
$lines = file("http://linkdata.org/api/1/rdf1s1581i/gomisyusyubi_tsv.txt", FILE_IGNORE_NEW_LINES);
$json = array();
$i = 0;
foreach ($lines as $line) {
    if ( !preg_match('/^#/', $line) ) {
        $a = explode("\t", $line);
        $json[++$i] = array (
            'address'     => $a[0], // 地区名
            'column'      => $a[1], // 行
            'initial'     => $a[2], // 音
            'phonetic'    => $a[3], // よみ
            'burnable'    => $a[4], // 可燃ごみ
            'plastic'     => $a[5], // プラ容器
            'nonburnable' => $a[6], // 不燃ごみ
            'cans'        => $a[7], // かん、びん、ペット、有害、スプレーかん
            'dates' => array (
                array ( 'id' => 'burnable',    'title' => '可燃ごみ', 'date' => parse($a[4]) ),
                array ( 'id' => 'plastic',     'title' => 'プラ容器', 'date' => parse($a[5]) ),
                array ( 'id' => 'nonburnable', 'title' => '不燃ごみ', 'date' => parse($a[6]) ),
                array ( 'id' => 'cans',        'title' => 'かん、びん、ペット、有害、スプレーかん', 'date' => parse($a[7]) ),
            ),
            'note' => $a[8] // 備考
        );
    }
}

echo sprintf("gomisyusyubi(%s)",json_encode($json));
exit;

function parse($s) {
    global $t;
    $o = array('', 'first', 'second', 'third', 'fourth', 'fifth');
    switch(true) {
        case preg_match('/^[日月火水木金土]$/u', $s): //ex.金
            $d = array(
                "next ".getDayOfTheWeek($s)
            );
            break;
        case preg_match('/^毎週([日月火水木金土])・([日月火水木金土])$/u', $s, $m): //ex.毎週月・木
            $d = array(
                "next ".getDayOfTheWeek($m[1]),
                "next ".getDayOfTheWeek($m[2])
            );
            break;
        case preg_match('/^第([１２３４５])，([１２３４５])([日月火水木金土])$/u', $s, $m): //ex.第２，４月
            $d = array(
                $o[mb_convert_kana($m[1], n, 'UTF-8')]." ".getDayOfTheWeek($m[3])." of this month",
                $o[mb_convert_kana($m[2], n, 'UTF-8')]." ".getDayOfTheWeek($m[3])." of this month",
                $o[mb_convert_kana($m[1], n, 'UTF-8')]." ".getDayOfTheWeek($m[3])." of next month",
                $o[mb_convert_kana($m[2], n, 'UTF-8')]." ".getDayOfTheWeek($m[3])." of next month"
            );
            break;
        default:
            return $s;
    }
    $d = array_map( 'parseDate', $d );
    sort($d);
    foreach ($d as $date) {
        if ($date > $t) {
            return $date->format(DateTime::ATOM);
            break;
        }
    };
}

function parseDate($d) {
    return new DateTime($d);
}

function getDayOfTheWeek($s) {
    $w = array('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
    return $w[mb_strpos("日月火水木金土", $s, 0, "utf-8")];
}
?>
