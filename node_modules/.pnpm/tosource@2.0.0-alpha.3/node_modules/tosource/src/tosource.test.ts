import toSource from './tosource';

// Various types
describe('toSource', () => {
  it('works on kitchen sink', () => {
    const date = new Date();
    const a = undefined;
    function foo(bar: any) {
      console.log('woo! a is ' + a);
      console.log('and bar is ' + bar);
    }
    const bar = () => 45;
    const v = toSource([
      0,
      -0,
      4,
      5,
      6,
      'hello',
      {
        0: 1,
        a: 2,
        b: 3,
        '1': 4,
        if: 5,
        yes: true,
        no: false,
        nan: NaN,
        infinity: Infinity,
        undefined: undefined,
        null: null,
        foo,
        bar,
        map: new Map<any, any>([
          ['hello', 45],
          [45, 'hello'],
        ]),
        set: new Set(['hello', 45]),
      },
      /we$/gi,
      new RegExp('/w/e/', 'ig'),
      /\/w\/e\//gim,
      date,
      new Date('Wed, 09 Aug 1995 00:00:00 GMT'),
    ]);

    expect(v).toEqual(
      `[ 0,
  -0,
  4,
  5,
  6,
  "hello",
  { 0:1,
    1:4,
    a:2,
    b:3,
    "if":5,
    yes:true,
    no:false,
    nan:NaN,
    infinity:Infinity,
    "undefined":undefined,
    "null":null,
    foo:function foo(bar) {
            console.log('woo! a is ' + a);
            console.log('and bar is ' + bar);
        },
    bar:() => 45,
    map:new Map([ [ "hello",
          45 ],
        [ 45,
          "hello" ] ]),
    set:new Set([ "hello",
        45 ]) },
  /we$/gi,
  /\\/w\\/e\\//gi,
  /\\/w\\/e\\//gim,
  new Date(${date.getTime()}),
  new Date(807926400000) ]`,
    );
  });

  it('zero', () => {
    expect(toSource(-0)).toEqual('-0');
    expect(toSource(0)).toEqual('0');
  });

  it('sparse array', () => {
    expect(toSource([1, , ,], undefined, false)).toEqual('[1,,]');
  });

  it('sparse array 2', () => {
    expect(toSource([1, , , 3], undefined, false)).toEqual('[1,,,3]');
  });

  it('negative Infinity', () => {
    expect(toSource(-Infinity)).toEqual('-Infinity');
  });

  it('filters parameter', () => {
    // Filter parameter (applies to every object recursively before serializing)
    expect(
      toSource([4, 5, 6, { bar: 3 }], function numbersToStrings(value) {
        return typeof value === 'number' ? '<' + value + '>' : value;
      }),
    ).toEqual(`[ "<4>",\n  "<5>",\n  "<6>",\n  { bar:"<3>" } ]`);
  });

  it('generates with no indent', () => {
    expect(toSource([4, 5, 6, { bar: 3 }], undefined, false)).toEqual(
      '[4,5,6,{bar:3}]',
    );
  });

  it('handles circular reference', () => {
    const object: any = { a: 1, b: 2 };
    object.c = object;

    expect(toSource(object)).toEqual(
      '{ a:1,\n' + '  b:2,\n' + '  c:{$circularReference:1} }',
    );
  });
  it('allows multiple references to the same object', () => {
    // Not a circular reference
    const foo = {};
    const object = { a: foo, b: foo };

    expect(toSource(object)).toEqual('{ a:{},\n' + '  b:{} }');
  });
});
