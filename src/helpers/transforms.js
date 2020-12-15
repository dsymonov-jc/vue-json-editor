import { getType } from './types';

export function parseJson(dataInput, rootType) {
  const parseItem = (key, value, type) => {
    const item = {
      name: type === 'object' ? key : null,
      type: getType(value),
      remark: null,
      childParams: null,
    };

    switch (item.type) {
      case 'object':
      case 'array':
        item.childParams = parseTree(value, item.type);
        break;
      case 'transform':
        item.type = 'string';
        item.remark = value.toString();
        break;
      default:
        item.remark = value;
        break;
    }

    return item;
  };

  const parseTree = (object, type) => {
    return Object.entries(object).map(([key, value]) => parseItem(key, value, type));
  };

  return parseTree(dataInput, rootType);
}

export function buildJson(dataTree, rootType) {
  const buildTree = (data, type) => {
    const buildData = data.map((item, i) => {
      switch (item.type) {
        case 'array':
        case 'object':
          const value = buildTree(item.childParams, item.type);

          return item.name !== null ? [item.name, value] : value;
        default:
          return item.name !== null ? [item.name, item.remark] : item.remark;
      }
    });

    switch (type) {
      case 'array':
        return buildData;
      case 'object':
        return Object.fromEntries(buildData);
      default:
        return buildData[0];
    }
  };

  return buildTree(dataTree, rootType);
}
