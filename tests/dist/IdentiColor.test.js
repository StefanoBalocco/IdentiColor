import { readFile } from 'node:fs/promises';
import test from 'ava';
const REFERENCE_HASH = '65dee7708ba413165fc2eaba3e991443d013f397b29e2c8acdced248c442e0ca';
const ALL_F_HASH = 'f'.repeat(64);
const SHAPE_COUNTS = [3, 4, 5];
const INVALID_SHAPES = [0, 1, 2, 6];
const LONG_HASH = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
const UNSUPPORTED_LENGTH_HASH = 'f'.repeat(24);
const ALLOCATION_FIXTURES = [
    { hash: '00112233445566778899aabbccddeeff', shapes: 3 },
    { hash: '00112233445566778899aabbccddeeff', shapes: 4 },
    { hash: '00112233445566778899aabbccddeeff', shapes: 5 },
    { hash: '00112233445566778899aabbccddeeff00112233', shapes: 3 },
    { hash: '00112233445566778899aabbccddeeff00112233', shapes: 4 },
    { hash: '00112233445566778899aabbccddeeff00112233', shapes: 5 },
    { hash: '00112233445566778899aabbccddeeff0011223344556677', shapes: 3 },
    { hash: '00112233445566778899aabbccddeeff0011223344556677', shapes: 4 },
    { hash: '00112233445566778899aabbccddeeff0011223344556677', shapes: 5 },
    { hash: REFERENCE_HASH, shapes: 3 },
    { hash: REFERENCE_HASH, shapes: 4 },
    { hash: REFERENCE_HASH, shapes: 5 },
    { hash: LONG_HASH, shapes: 3 },
    { hash: LONG_HASH, shapes: 4 },
    { hash: LONG_HASH, shapes: 5 },
];
const distPath = '../../dist';
const bundleFixtures = [
    {
        name: 'original>',
        bundle: (await import(`${distPath}/IdentiColor.js`)),
    },
    {
        name: 'minified>',
        bundle: (await import(`${distPath}/IdentiColor.min.js`)),
    },
];
const exampleFixtures = [
    {
        hash: '45e4da3c0dd3f4786b799dcec06989c70d2bf8eb7c8e005d88c86469788102fbfe7505f35723a004260c33f6caad8c57',
        shapes: 3,
        svg: await readFile(new URL('../../example-1.svg', import.meta.url), 'utf8'),
    },
    {
        hash: 'dd18873b91776e861f9ad733835f96c31a6e08aca33673e7bf892e7e6bc9dcbb60094b2cfd5869690395b07e009ae59e',
        shapes: 4,
        svg: await readFile(new URL('../../example-2.svg', import.meta.url), 'utf8'),
    },
    {
        hash: '4687c8ff5f43bc17531dd375292a8f69c2d1e9e754b9e4c229900fcdf1af45b1505244e1287e965e15de95b0cb25be05',
        shapes: 5,
        svg: await readFile(new URL('../../example-3.svg', import.meta.url), 'utf8'),
    },
];
const GOLDEN_SVG = '<svg x="0" y="0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="100" height="100" fill="#f7d9c4" /><rect x="0" y="0" width="100" height="100" fill="#c9e4de" transform="rotate(-25.5,109.94831240731133,50) translate(59.94831,0.00000)" /><rect x="0" y="0" width="100" height="100" fill="#f2c6de" transform="rotate(10.5,50.00000000000001,119.03485394458738) translate(0.00000,69.03485)" /><rect x="0" y="0" width="100" height="100" fill="#c6def1" transform="rotate(3.0,-23.788336849574307,50.00000000000001) translate(-73.78834,0.00000)" /></svg>';
const cL1 = bundleFixtures.length;
for (let iL1 = 0; iL1 < cL1; iL1++) {
    const fixture = bundleFixtures[iL1];
    const bundleName = fixture.name;
    const IdentiColor = fixture.bundle.default;
    test(bundleName + ' default call returns string and equals explicit four shapes', (t) => {
        const defaultSvg = IdentiColor(REFERENCE_HASH);
        const explicitSvg = IdentiColor(REFERENCE_HASH, 4);
        t.is(typeof defaultSvg, 'string');
        t.is(defaultSvg, explicitSvg);
    });
    test(bundleName + ' identical inputs produce identical SVG', (t) => {
        const firstSvg = IdentiColor(REFERENCE_HASH, 4);
        const secondSvg = IdentiColor(REFERENCE_HASH, 4);
        t.is(firstSvg, secondSvg);
    });
    test(bundleName + ' different full hashes produce different SVG', (t) => {
        t.not(IdentiColor(REFERENCE_HASH), IdentiColor(ALL_F_HASH));
    });
    test(bundleName + ' uppercase hash equals lowercase hash', (t) => {
        t.is(IdentiColor(REFERENCE_HASH.toUpperCase()), IdentiColor(REFERENCE_HASH));
    });
    test(bundleName + ' shapes three four five emit three four five rects', (t) => {
        const cL2 = SHAPE_COUNTS.length;
        for (let iL2 = 0; iL2 < cL2; iL2++) {
            const shapeCount = SHAPE_COUNTS[iL2];
            const svg = IdentiColor(REFERENCE_HASH, shapeCount);
            t.is(svg.split('<rect').length - 1, shapeCount);
        }
    });
    test(bundleName + ' emits structurally valid SVG without NaN or undefined', (t) => {
        const svg = IdentiColor(REFERENCE_HASH);
        t.true(svg.startsWith('<svg'));
        t.true(svg.endsWith('</svg>'));
        t.true(svg.includes('viewBox="0 0 100 100"'));
        t.true(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
        t.regex(svg, /^<svg[^>]*><rect x="0" y="0" width="100" height="100" fill="#[0-9a-f]{6}" \/>/);
        t.false(svg.includes('undefined'));
        t.false(svg.includes('NaN'));
    });
    test(bundleName + ' invalid shapes throw RangeError', (t) => {
        const cL2 = INVALID_SHAPES.length;
        for (let iL2 = 0; iL2 < cL2; iL2++) {
            const invalidShape = INVALID_SHAPES[iL2];
            t.throws(() => IdentiColor(REFERENCE_HASH, invalidShape), { instanceOf: RangeError, message: 'Shapes must be between 3 and 5, inclusive.' });
        }
    });
    test(bundleName + ' valid-length allocations emit valid SVG', (t) => {
        const cL2 = ALLOCATION_FIXTURES.length;
        for (let iL2 = 0; iL2 < cL2; iL2++) {
            const allocationFixture = ALLOCATION_FIXTURES[iL2];
            const svg = IdentiColor(allocationFixture.hash, allocationFixture.shapes);
            t.is(svg.split('<rect').length - 1, allocationFixture.shapes);
            t.true(svg.startsWith('<svg'));
            t.true(svg.endsWith('</svg>'));
            t.true(svg.includes('viewBox="0 0 100 100"'));
            t.false(svg.includes('undefined'));
            t.false(svg.includes('NaN'));
        }
    });
    test(bundleName + ' examples match committed SVG', (t) => {
        const cL2 = exampleFixtures.length;
        for (let iL2 = 0; iL2 < cL2; iL2++) {
            const exampleFixture = exampleFixtures[iL2];
            t.is(IdentiColor(exampleFixture.hash, exampleFixture.shapes), exampleFixture.svg);
        }
    });
    test(bundleName + ' unsupported hash length throws RangeError', (t) => {
        t.throws(() => IdentiColor(UNSUPPORTED_LENGTH_HASH), { instanceOf: RangeError, message: /^Unsupported hash length\. Use / });
    });
    test(bundleName + ' golden SVG matches the reference hash', (t) => {
        t.is(IdentiColor(REFERENCE_HASH), GOLDEN_SVG);
    });
}
