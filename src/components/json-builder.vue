<template>
  <textarea v-model="transformData" class="json-edit"> </textarea>
</template>
<script>
import { getType } from '../helpers/types';
import { parseJson, buildJson } from '../helpers/transforms';

export default {
  name: 'JsonBuilder',
  props: {
    dataInput: {
      type: Object | Array,
      required: true,
    },
    options: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
  },
  provide() {
    return {
      typesList: ['object', 'array', 'string', 'number', 'boolean', 'null'],
      options: this.options,
    };
  },
  data() {
    return {
      currentData: [],
      cachedData: {},
      transformData: {},
    };
  },
  watch: {
    dataInput: {
      handler() {
        this.currentData = parseJson(this.dataInput, this.rootType);
      },
    },
    transformData: {
      deep: true,
      handler() {
        const newDataStr = JSON.stringify(this.currentData);

        if (newDataStr === JSON.stringify(this.cachedData)) return;

        const json = buildJson(newDataStr, this.rootType);
        this.transformData = this.formatJson(json);
        this.cachedData = JSON.parse(newDataStr);

        this.$emit('data-output', buildJson(this.currentData, this.rootType));
      },
    },
    currentData: {
      deep: true,
      handler() {
        const newDataStr = JSON.stringify(this.currentData);

        if (newDataStr === JSON.stringify(this.cachedData)) return;

        this.transformData = this.formatJson(newDataStr);
        this.cachedData = JSON.parse(newDataStr);

        this.$emit('data-output', buildJson(this.currentData, this.rootType));
      },
    },
  },
  methods: {
    formatJson: function (txt, compress /*是否为压缩模式*/) {
      /* 格式化JSON源码(对象转换为JSON文本) */
      var indentChar = '  ';
      if (/^\s*$/.test(txt)) {
        console.error('数据为空,无法格式化! ');
        return;
      }
      try {
        var data = eval('(' + txt + ')');
      } catch (e) {
        throw ('数据源语法错误,格式化失败! 错误信息: ' + e.description, 'err');
        return;
      }
      var draw = [],
        last = false,
        This = this,
        line = compress ? '' : '\n',
        nodeCount = 0,
        maxDepth = 0;
      var notify = function (name, value, isLast, indent /*缩进*/, formObj) {
        nodeCount++; /*节点计数*/
        for (var i = 0, tab = ''; i < indent; i++) tab += indentChar; /* 缩进HTML */
        tab = compress ? '' : tab; /*压缩模式忽略缩进*/
        maxDepth = ++indent; /*缩进递增并记录*/
        if (value && value.constructor == Array) {
          /*处理数组*/
          draw.push(tab + (formObj ? '"' + name + '":' : '') + '[' + line); /*缩进'[' 然后换行*/
          for (var i = 0; i < value.length; i++)
            notify(i, value[i], i == value.length - 1, indent, false);
          draw.push(tab + ']' + (isLast ? line : ',' + line)); /*缩进']'换行,若非尾元素则添加逗号*/
        } else if (value && typeof value == 'object') {
          /*处理对象*/
          draw.push(tab + (formObj ? '"' + name + '":' : '') + '{' + line); /*缩进'{' 然后换行*/
          var len = 0,
            i = 0;
          for (var key in value) len++;
          for (var key in value) notify(key, value[key], ++i == len, indent, true);
          draw.push(tab + '}' + (isLast ? line : ',' + line)); /*缩进'}'换行,若非尾元素则添加逗号*/
        } else {
          if (typeof value == 'string') value = '"' + value + '"';
          draw.push(tab + (formObj ? '"' + name + '":' : '') + value + (isLast ? '' : ',') + line);
        }
      };
      var isLast = true,
        indent = 0;
      notify('', data, isLast, indent, false);
      return draw.join('');
    },
  },
  computed: {
    rootType() {
      return getType(this.dataInput);
    },
  },
  mounted() {
    this.currentData = parseJson(this.dataInput, this.rootType);
    this.transformData = buildJson(this.currentData, this.rootType);
    this.$emit('data-output', buildJson(this.currentData, this.rootType));
  },
};
</script>
