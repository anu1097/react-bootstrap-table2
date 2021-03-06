/* eslint eqeqeq: 0 */
/* eslint no-console: 0 */
import { FILTER_TYPE } from './const';
import { LIKE, EQ, NE, GT, GE, LT, LE } from './comparison';

export const filterByText = _ => (
  data,
  dataField,
  { filterVal: userInput = '', comparator = LIKE, caseSensitive },
  customFilterValue
) => {
  // make sure filter value to be a string
  const filterVal = userInput.toString();

  return (
    data.filter((row) => {
      let cell = _.get(row, dataField);
      if (customFilterValue) {
        cell = customFilterValue(cell, row);
      }
      const cellStr = _.isDefined(cell) ? cell.toString() : '';
      if (comparator === EQ) {
        return cellStr === filterVal;
      }
      if (caseSensitive) {
        return cellStr.includes(filterVal);
      }

      return cellStr.toLocaleUpperCase().indexOf(filterVal.toLocaleUpperCase()) !== -1;
    })
  );
};

export const filterByNumber = _ => (
  data,
  dataField,
  { filterVal: { comparator, number } },
  customFilterValue
) => (
  data.filter((row) => {
    if (number === '' || !comparator) return true;
    let valid = true;
    let cell = _.get(row, dataField);
    if (customFilterValue) {
      cell = customFilterValue(cell, row);
    }

    switch (comparator) {
      case EQ: {
        if (cell != number) {
          valid = false;
        }
        break;
      }
      case GT: {
        if (cell <= number) {
          valid = false;
        }
        break;
      }
      case GE: {
        if (cell < number) {
          valid = false;
        }
        break;
      }
      case LT: {
        if (cell >= number) {
          valid = false;
        }
        break;
      }
      case LE: {
        if (cell > number) {
          valid = false;
        }
        break;
      }
      case NE: {
        if (cell == number) {
          valid = false;
        }
        break;
      }
      default: {
        console.error('Number comparator provided is not supported');
        break;
      }
    }
    return valid;
  })
);

export const filterFactory = _ => (filterType) => {
  let filterFn;
  switch (filterType) {
    case FILTER_TYPE.TEXT:
    case FILTER_TYPE.SELECT:
      filterFn = filterByText(_);
      break;
    case FILTER_TYPE.NUMBER:
      filterFn = filterByNumber(_);
      break;
    default:
      filterFn = filterByText(_);
  }
  return filterFn;
};

export const filters = (store, columns, _) => (currFilters) => {
  const factory = filterFactory(_);
  let result = store.getAllData();
  let filterFn;
  Object.keys(currFilters).forEach((dataField) => {
    const filterObj = currFilters[dataField];
    filterFn = factory(filterObj.filterType);
    let filterValue;
    for (let i = 0; i < columns.length; i += 1) {
      if (columns[i].dataField === dataField) {
        filterValue = columns[i].filterValue;
        break;
      }
    }
    result = filterFn(result, dataField, filterObj, filterValue);
  });
  return result;
};
