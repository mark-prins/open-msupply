import { useTranslation } from '@common/intl';
import { RecordWithId } from '@common/types';
import { ArrayUtils } from '@common/utils';

// export type ColumnProperty = {
//   path: string[];
//   default?: string;
// };
type ColumnProperty<T> = {
  path: T[];
  default?: string;
};

export const useColumnUtils = () => {
  const t = useTranslation();

  /**
   * This method tries to extract a single common field value from the input data, using a list of given object paths.
   *
   * Data is only extracted from the first matching path, (a path matches if path[0] exists in the input data)
   *
   * If the path contains one or more arrays multiple field values are collected.
   * If all field values are the same this common field value is returned.
   * If field values differ the default value is returned instead.
   *
   * If a path points to a single field the matching field value is returned. If there is no match the default is returned.
   */
  const getValue = <T extends object>(
    row: T,
    property: ColumnProperty<KeysOfUnion<T>>
  ): unknown => {
    // const isPropOfT = (path: keyof T | K ): path is K => {
    //   return path in row;
    // };

    if (property.path.length === 0) {
      return undefined;
    }

    const path = property.path[0] as keyof T;
    if (path === undefined || path === null) return undefined;
    if (!(path in row)) return undefined;
    if (property.path.length < 2) return undefined;

    const key = property.path[1] as keyof T;
    const isObjectProperty = property.path.length > 2;

    if (Array.isArray(row[path])) {
      if (isObjectProperty) {
        const propertyKey = property.path[2];
        const arr = (row[path] as T[]).flatMap((line: T) => {
          const obj = line[key];
          return !!obj ? [obj] : [];
        });
        const isValid =
          arr.length === 0 ||
          arr[0] === undefined ||
          typeof arr[0] !== 'object' ||
          !(key in arr[0]);

        return isValid
          ? ArrayUtils.ifTheSameElseDefault(
              arr,
              propertyKey as keyof NonNullable<T[keyof T]>,
              property.default === undefined ? t('multiple') : property.default
            )
          : '';
      } else {
        return ArrayUtils.ifTheSameElseDefault(
          row[path] as T[],
          key,
          property.default === undefined ? t('multiple') : property.default
        );
      }
    } else {
      if (isObjectProperty) {
        return (
          row[path]?.[key as keyof NonNullable<T[keyof T]>] ??
          property.default ??
          ''
        );
      } else {
        return row[key] ?? property.default;
      }
    }
  };

  type KeysOfUnion<T extends object> = T extends T ? NestedKeyOf<T> : never;

  type NestedKeyOf<T> = {
    // eslint-disable-next-line @typescript-eslint/ban-types
    [Key in keyof T & string]: T[Key] extends Function
      ? never
      : T[Key] extends object
      ? `${Key}` | NestedKeyOf<T[Key]>
      : `${Key}`;
  }[keyof T & string];

  const getColumnProperty = <T extends RecordWithId>(
    row: T,
    props: ColumnProperty<KeysOfUnion<T>>[]
  ) => {
    return props.reduce(
      (result, prop) => result ?? getValue(row, prop),
      undefined as unknown
    );
  };

  const getColumnPropertyAsString = <T extends RecordWithId>(
    row: T,
    props: ColumnProperty<KeysOfUnion<T>>[]
  ) => {
    return String(getColumnProperty(row, props) ?? '');
  };

  return { getColumnProperty, getColumnPropertyAsString };
};
