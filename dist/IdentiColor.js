const palettes = [
    [
        '#fff5ed',
        '#fae0d8',
        '#f0f4bf',
        '#dfe1be',
        '#f1deee',
        '#c4b7bb'
    ],
    [
        '#faedcb',
        '#c9e4de',
        '#c6def1',
        '#dbcdf0',
        '#f2c6de',
        '#f7d9c4'
    ],
    [
        '#ffadad',
        '#ffd6a5',
        '#fdffb6',
        '#e4f1ee',
        '#d9edf8',
        '#dedaf4'
    ],
    [
        '#fd8a8a',
        '#ffcbcb',
        '#9ea1d4',
        '#f1f7b5',
        '#a8d1d1',
        '#dfebeb'
    ],
    [
        '#fad4d9',
        '#fce9b2',
        '#f8d7c6',
        '#ffedf3',
        '#e0eed5',
        '#f2cce3'
    ],
    [
        '#ede2ff',
        '#f7d59c',
        '#fff5c1',
        '#afb3ce',
        '#fae4cb',
        '#dbcdf0'
    ]
];
const _maxRandomBits = 52;
const _multiplierCap = 6;
const _paletteBitCap = 52;
const _comparatorCount = 12;
const _minimumBitsPerComparison = 2;
const _minimumShapes = 3;
const _maximumShapes = 5;
const _distanceBitsPerMultiplier = 5;
const _rotationBitsPerMultiplier = 7;
const _supportedHashLengths = [32, 40, 48, 64, 96, 128];
const _sortingNetwork = [
    [0, 5],
    [1, 3],
    [2, 4],
    [1, 2],
    [3, 4],
    [0, 3],
    [2, 5],
    [0, 1],
    [2, 3],
    [4, 5],
    [1, 2],
    [3, 4]
];
function GetNext(bitArray, count) {
    count = Math.min(count, bitArray.length, _maxRandomBits);
    return parseInt(bitArray.splice(0, count).join(''), 2);
}
function IdentiColor(hash, shapes = 4) {
    if (_supportedHashLengths.includes(hash.length)) {
        if ((_minimumShapes <= shapes) && (_maximumShapes >= shapes)) {
            let returnValue = '<svg ';
            returnValue += 'x="0" y="0" viewBox="0 0 100 100" ';
            returnValue += 'xmlns="http://www.w3.org/2000/svg">';
            let bitArray = [];
            let cL1 = hash.length;
            for (let iL1 = 0; iL1 < cL1; iL1++) {
                const tmpValue = parseInt(hash.substring(iL1, iL1 + 1), 16).toString(2).padStart(4, '0');
                for (let iL2 = 0; iL2 < 4; iL2++) {
                    bitArray.push(parseInt(tmpValue.substring(iL2, iL2 + 1)));
                }
            }
            const rectangles = shapes - 1;
            const paletteMinimumBits = Math.max(8, Math.ceil(Math.log2(palettes.length)));
            const minimumComparisonBits = _comparatorCount * _minimumBitsPerComparison;
            const multiplicator = Math.min(_multiplierCap, Math.floor((bitArray.length - paletteMinimumBits - minimumComparisonBits) /
                ((_distanceBitsPerMultiplier + _rotationBitsPerMultiplier) * rectangles)));
            const distanceBits = _distanceBitsPerMultiplier * multiplicator;
            const rotationBits = _rotationBitsPerMultiplier * multiplicator;
            const remainingBits = bitArray.length - ((distanceBits + rotationBits) * rectangles);
            const paletteUpperBits = Math.min(_paletteBitCap, remainingBits - minimumComparisonBits);
            const initialComparisonBits = remainingBits - paletteUpperBits;
            const paletteReduction = (_comparatorCount - (initialComparisonBits % _comparatorCount)) % _comparatorCount;
            const paletteBits = paletteUpperBits - paletteReduction;
            const comparisonBits = remainingBits - paletteBits;
            const bitsPerComparison = comparisonBits / _comparatorCount;
            const center = 50;
            const values = [];
            for (let iL1 = 0; iL1 < rectangles; iL1++) {
                const distance = ((GetNext(bitArray, distanceBits) / (Math.pow(2, distanceBits) - 1)) * 25) + center;
                const angle = Math.PI * iL1 / 2;
                const [tx, ty] = [Math.cos(angle), Math.sin(angle)].map((item) => (item * distance));
                const rotation = (70 * (GetNext(bitArray, rotationBits) / (Math.pow(2, rotationBits) - 1))) - 35;
                values.push([rotation.toFixed(1), center + tx, center + ty, tx.toFixed(5), ty.toFixed(5)]);
            }
            const paletteValue = GetNext(bitArray, paletteBits);
            const paletteIndex = Math.floor((paletteValue / Math.pow(2, paletteBits)) * palettes.length);
            const colors = Array.from(palettes[paletteIndex]);
            cL1 = _sortingNetwork.length;
            for (let iL1 = 0; iL1 < cL1; iL1++) {
                const comparisonValue = GetNext(bitArray, bitsPerComparison);
                if (1 === (comparisonValue % 2)) {
                    const [firstIndex, secondIndex] = _sortingNetwork[iL1];
                    [colors[firstIndex], colors[secondIndex]] = [colors[secondIndex], colors[firstIndex]];
                }
            }
            returnValue += `<rect x="0" y="0" width="100" height="100" fill="${colors.shift()}" />`;
            cL1 = values.length;
            for (let iL1 = 0; iL1 < cL1; iL1++) {
                returnValue += '<rect ';
                returnValue += 'x="0" y="0" ';
                returnValue += 'width="100" height="100" ';
                returnValue += `fill="${colors.shift()}" `;
                returnValue += 'transform="';
                returnValue += `rotate(${values[iL1][0]},${values[iL1][1]},${values[iL1][2]}) `;
                returnValue += `translate(${values[iL1][3]},${values[iL1][4]})`;
                returnValue += '" />';
            }
            returnValue += '</svg>';
            return returnValue;
        }
        else {
            throw RangeError(`Shapes must be between ${_minimumShapes} and ${_maximumShapes}, inclusive.`);
        }
    }
    else {
        throw RangeError(`Unsupported hash length. Use ${_supportedHashLengths.join(', ')} hexadecimal characters.`);
    }
}
export default IdentiColor;
//# sourceMappingURL=IdentiColor.js.map