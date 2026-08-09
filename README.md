# IdentiColor

IdentiColor generates pastel SVG avatars from hexadecimal hashes.

## Install

```bash
npm install @stefanobalocco/identicolor
```

## Usage

ESM:

```js
import IdentiColor from '@stefanobalocco/identicolor';

const hash = '65dee7708ba413165fc2eaba3e991443d013f397b29e2c8acdced248c442e0ca';
const svg = IdentiColor( hash );
```

Browser module via jsDelivr:

```html
<script type="module">
	import IdentiColor from 'https://cdn.jsdelivr.net/npm/@stefanobalocco/identicolor@1.0.0/dist/IdentiColor.min.js';

	const hash = '65dee7708ba413165fc2eaba3e991443d013f397b29e2c8acdced248c442e0ca';
	const svg = IdentiColor( hash );
</script>
```

## Examples

<img src="example-1.svg" alt="Example 1 (45e4da3c0dd3f4786b799dcec06989c70d2bf8eb7c8e005d88c86469788102fbfe7505f35723a004260c33f6caad8c57)" width="256" height="256"> <img src="example-2.svg" alt="Example 2 (dd18873b91776e861f9ad733835f96c31a6e08aca33673e7bf892e7e6bc9dcbb60094b2cfd5869690395b07e009ae59e)" width="256" height="256"> <img src="example-3.svg" alt="Example 3 (4687c8ff5f43bc17531dd375292a8f69c2d1e9e754b9e4c229900fcdf1af45b1505244e1287e965e15de95b0cb25be05)" width="256" height="256">

## API

### `IdentiColor( hash, shapes? )`

- `hash`: hexadecimal input with a supported length. The function validates its length, not individual characters.
- `shapes`: optional number that defaults to `4`. Values from `3` through `5`, inclusive, create one background and two, three, or four foreground rectangle layers.

Returns the SVG string. Throws a `RangeError` for an unsupported hash length or shapes value.

## How it works

The function consumes bits from the hash to select a palette, order its colors through twelve fixed compare-exchange steps, and determine each rectangle's distance and rotation. It uses six pastel palettes; each rectangle is translated along a cardinal axis and independently rotated by a hash-derived value from `-35°` to `35°`.

## Acknowledgements

- Pastel palettes from [kdesign.co](https://kdesign.co/blog/pastel-color-palette-examples/)
- Inspired by [MetaMask's jazzicon](https://github.com/MetaMask/jazzicon)
