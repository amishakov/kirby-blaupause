<?php

use Kirby\Toolkit\Str;

$name = $name ?? "phone";
$size = $size ?? "1em";
if (!Str::endsWith($size, 'rem') && !Str::endsWith($size, 'em') && !Str::endsWith($size, 'px')) {
	$size = $size . "rem";
}

$sprite = asset('icons.svg');

?>
<i class="i" style="--size: <?= $size ?>" data-type="<?= $name ?>">
	<svg aria-hidden>
		<use xlink:href="<?= $sprite->url() ?>?v=<?= $sprite->mediaHash() ?>#symbol-<?= $name ?>" />
	</svg>
</i>