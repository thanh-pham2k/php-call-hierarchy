<?php

namespace App\Utils;

class MathUtil {
    public static function add(int $a, int $b): int {
        return $a + $b;
    }

    public static function square(int $n): int {
        return self::add($n, $n);
    }
}

class Calculator {
    public function compute(): int {
        return MathUtil::square(5);
    }
}
