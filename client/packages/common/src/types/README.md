## common/types

### Overview

Common utility types

### Intentions

General types & common utilities used in multiple places:

For example, a useful type which ensures there is always at least one value:

`type AlwaysHasAtLeastOne<T> = [T, ...T[]]`

However, a type:

`type Item { .. }`

Would probably be more useful in `@common/system`, colocated with the `Item` domain objects related components

### Tips & Things to keep in mind

### Future considerations

