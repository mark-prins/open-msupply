import { RouteBuilder } from './RouteBuilder';

describe('Formatters', () => {
  it('builds a route with an appended wildcard', () => {
    expect(
      RouteBuilder.create('distribution').addPart('outbound-shipment').addWildCard().build()
    ).toBe('/distribution/outbound-shipment/*');
  });

  it('builds a route', () => {
    expect(RouteBuilder.create('distribution').addPart('outbound-shipment').build()).toBe(
      '/distribution/outbound-shipment'
    );
  });

  it('can be used to create multiple routes from the same builder', () => {
    expect(RouteBuilder.create('distribution').build()).toBe('/distribution');
    expect(RouteBuilder.create('suppliers').build()).toBe('/suppliers');
  });

  it('adds a single query to url', () => {
    expect(
      RouteBuilder.create('distribution')
        .addPart('outbound-shipment')
        .addQuery({ param: 'test' })
        .build()
    ).toBe('/distribution/outbound-shipment?param=test');
  });

  it('adds multiple queries to url', () => {
    expect(
      RouteBuilder.create('distribution')
        .addPart('outbound-shipment')
        .addQuery({ param: 'test', more: 3, third: true })
        .addQuery({ extra: 'one' })
        .build()
    ).toBe('/distribution/outbound-shipment?param=test&more=3&third=true&extra=one');
  });
});
