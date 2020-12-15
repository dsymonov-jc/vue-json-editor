<template>
  <item-view
    v-model="currentData"
    :object-type="rootType"
    :parsed-data="currentData"
    class="json-editor"
  >
    <template #icon-add>
      <slot name="icon-add"> </slot>
    </template>
    <template #icon-delete>
      <slot name="icon-delete"> </slot>
    </template>
    <template #icon-drag>
      <slot name="icon-drag"> </slot>
    </template>
    <template #icon-collapse>
      <slot name="icon-collapse"> </slot>
    </template>
  </item-view>
</template>
<script>
import { getType } from '../helpers/types';
import { parseJson, buildJson } from '../helpers/transforms';
import ItemView from './item-view.vue';

export default {
  name: 'JsonEditor',
  components: {
    ItemView,
  },
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
    };
  },
  watch: {
    dataInput: {
      handler() {
        this.currentData = parseJson(this.dataInput, this.rootType);
      },
    },
    currentData: {
      deep: true,
      handler() {
        const newDataStr = JSON.stringify(this.currentData);

        if (newDataStr === JSON.stringify(this.cachedData)) return;

        this.cachedData = JSON.parse(newDataStr);

        this.$emit('data-output', buildJson(this.currentData, this.rootType));
      },
    },
  },
  computed: {
    rootType() {
      return getType(this.dataInput);
    },
  },
  mounted() {
    this.currentData = parseJson(this.dataInput, this.rootType);
    this.$emit('data-output', buildJson(this.currentData, this.rootType));
  },
};
</script>
