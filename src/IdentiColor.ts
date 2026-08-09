const palettes: string[][] = [
	[ // 05- Spring kiss
		'#fff5ed',
		'#fae0d8',
		'#f0f4bf',
		'#dfe1be',
		'#f1deee',
		'#c4b7bb'
	],
	[ // 09 - Pastel Rainbow
		'#faedcb',
		'#c9e4de',
		'#c6def1',
		'#dbcdf0',
		'#f2c6de',
		'#f7d9c4'
	],
	[ // 16 - Technicolor
		'#ffadad',
		'#ffd6a5',
		'#fdffb6',
		'#e4f1ee',
		'#d9edf8',
		'#dedaf4'
	],
	[ // 21 - New kicks
		'#fd8a8a',
		'#ffcbcb',
		'#9ea1d4',
		'#f1f7b5',
		'#a8d1d1',
		'#dfebeb'
	],
	[ // 27 - Kawaii
		'#fad4d9',
		'#fce9b2',
		'#f8d7c6',
		'#ffedf3',
		'#e0eed5',
		'#f2cce3'
	],
	[ // 23 - Golden girls
		'#ede2ff',
		'#f7d59c',
		'#fff5c1',
		'#afb3ce',
		'#fae4cb',
		'#dbcdf0'
	]
];
const _maxRandomBits: number = 52;
const _multiplierCap: number = 6;
const _paletteBitCap: number = 52;
const _comparatorCount: number = 12;
const _minimumBitsPerComparison: number = 2;
const _minimumShapes: number = 3;
const _maximumShapes: number = 5;
const _distanceBitsPerMultiplier: number = 5;
const _rotationBitsPerMultiplier: number = 7;
const _supportedHashLengths: number[] = [ 32, 40, 48, 64, 96, 128 ];
const _sortingNetwork: [ number, number ][] = [
	[ 0, 5 ],
	[ 1, 3 ],
	[ 2, 4 ],
	[ 1, 2 ],
	[ 3, 4 ],
	[ 0, 3 ],
	[ 2, 5 ],
	[ 0, 1 ],
	[ 2, 3 ],
	[ 4, 5 ],
	[ 1, 2 ],
	[ 3, 4 ]
];

function GetNext( bitArray: number[], count: number ): number {
	count = Math.min( count, bitArray.length, _maxRandomBits );
	return parseInt( bitArray.splice( 0, count ).join( '' ), 2 );
}

function IdentiColor( hash: string, shapes: number = 4 ): string {
	if( _supportedHashLengths.includes( hash.length ) ) {
		if( ( _minimumShapes <= shapes ) && ( _maximumShapes >= shapes ) ) {
			let returnValue: string = '<svg ';
			returnValue += 'x="0" y="0" viewBox="0 0 100 100" ';
			returnValue += 'xmlns="http://www.w3.org/2000/svg">';
			let bitArray: number[] = [];
			let cL1: number = hash.length;
			for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
				const tmpValue: string = parseInt( hash.substring( iL1, iL1 + 1 ), 16 ).toString( 2 ).padStart( 4, '0' );
				for( let iL2: number = 0; iL2 < 4; iL2++ ) {
					bitArray.push( parseInt( tmpValue.substring( iL2, iL2 + 1 ) ) );
				}
			}
			// Multiple palette from: https://kdesign.co/blog/pastel-color-palette-examples/
			const rectangles: number = shapes - 1;
			const paletteMinimumBits: number = Math.max( 8, Math.ceil( Math.log2( palettes.length ) ) );
			const minimumComparisonBits: number = _comparatorCount * _minimumBitsPerComparison;
			const multiplicator: number = Math.min(
				_multiplierCap,
				Math.floor(
					( bitArray.length - paletteMinimumBits - minimumComparisonBits ) /
					( ( _distanceBitsPerMultiplier + _rotationBitsPerMultiplier ) * rectangles )
				)
			);
			const distanceBits: number = _distanceBitsPerMultiplier * multiplicator;
			const rotationBits: number = _rotationBitsPerMultiplier * multiplicator;
			const remainingBits: number = bitArray.length - ( ( distanceBits + rotationBits ) * rectangles );
			const paletteUpperBits: number = Math.min( _paletteBitCap, remainingBits - minimumComparisonBits );
			const initialComparisonBits: number = remainingBits - paletteUpperBits;
			const paletteReduction: number = ( _comparatorCount - ( initialComparisonBits % _comparatorCount ) ) % _comparatorCount;
			const paletteBits: number = paletteUpperBits - paletteReduction;
			const comparisonBits: number = remainingBits - paletteBits;
			const bitsPerComparison: number = comparisonBits / _comparatorCount;
			const center: number = 50;
			const values: [ string, number, number, string, string ][] = [];
			for( let iL1: number = 0; iL1 < rectangles; iL1++ ) {
				// rotationDistance = iL1
				const distance: number = ( ( GetNext( bitArray, distanceBits ) / ( Math.pow( 2, distanceBits ) - 1 ) ) * 25 ) + center;
				const angle: number = Math.PI * iL1 / 2;
				const [ tx, ty ]: number[] = [ Math.cos( angle ), Math.sin( angle ) ].map( ( item: number ): number => ( item * distance ) );
				const rotation: number = ( 70 * ( GetNext( bitArray, rotationBits ) / ( Math.pow( 2, rotationBits ) - 1 ) ) ) - 35;
				values.push( [ rotation.toFixed( 1 ), center + tx, center + ty, tx.toFixed( 5 ), ty.toFixed( 5 ) ] );
			}
			const paletteValue: number = GetNext( bitArray, paletteBits );
			const paletteIndex: number = Math.floor(
				( paletteValue / Math.pow( 2, paletteBits ) ) * palettes.length
			);
			const colors: string[] = Array.from( palettes[ paletteIndex ] );
			cL1 = _sortingNetwork.length;
			for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
				const comparisonValue: number = GetNext( bitArray, bitsPerComparison );
				if( 1 === ( comparisonValue % 2 ) ) {
					const [ firstIndex, secondIndex ]: number[] = _sortingNetwork[ iL1 ];
					[ colors[ firstIndex ], colors[ secondIndex ] ] = [ colors[ secondIndex ], colors[ firstIndex ] ];
				}
			}
			returnValue += `<rect x="0" y="0" width="100" height="100" fill="${ colors.shift() }" />`;
			cL1 = values.length;
			for( let iL1: number = 0; iL1 < cL1; iL1++ ) {
				returnValue += '<rect ';
				returnValue += 'x="0" y="0" ';
				returnValue += 'width="100" height="100" ';
				returnValue += `fill="${ colors.shift() }" `;
				returnValue += 'transform="';
				returnValue += `rotate(${ values[ iL1 ][ 0 ] },${ values[ iL1 ][ 1 ] },${ values[ iL1 ][ 2 ] }) `;
				returnValue += `translate(${ values[ iL1 ][ 3 ] },${ values[ iL1 ][ 4 ] })`;
				returnValue += '" />';
			}
			returnValue += '</svg>';
			return returnValue;
		} else {
			throw RangeError( `Shapes must be between ${ _minimumShapes } and ${ _maximumShapes }, inclusive.` );
		}
	} else {
		throw RangeError( `Unsupported hash length. Use ${ _supportedHashLengths.join( ', ' ) } hexadecimal characters.` );
	}
}

export default IdentiColor;