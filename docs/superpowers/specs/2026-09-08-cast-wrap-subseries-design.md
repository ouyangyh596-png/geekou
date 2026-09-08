# Cast Wrap Vinyl Subseries Design

## Goal

Present Cast Wrap Vinyl as four clear product subseries, with the supplied English descriptions and model assignments.

## Catalogue rules

- Move `AF50100G` from `cast-wrap-vinyl` to `super-chrome-film`.
- Keep Cast Wrap Vinyl models in four display series only:
  - White Printable Film: `SF5501`, `SF5511`
  - Ultra Clear Printable Film: `SF5503`, `SF5513`
  - Reflective Printable Film: `SF9908`
  - Overlaminate Film: `SF5601`, `SF5602`, `SF5603`, `SF5606`, `SF5609`
- Use the user-provided descriptions verbatim for each display series.

## Rendering and validation

The existing product detail page derives its grouped table from catalogue series names. Catalogue entries will therefore use the four display series names directly. Content metadata will use the same names and descriptions so headers and table sections agree. Validation tests will assert the four names, descriptions and model memberships, and will assert that `AF50100G` belongs only to Super Chrome Film.
