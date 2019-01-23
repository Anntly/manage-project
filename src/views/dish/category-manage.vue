<template>
  <category-table :data="categories" :columns="columns" border @reloadData="getCategories"></category-table>
</template>
<script>
import {
  getCategoriesPage,
} from '@/api/category'
import categoryTable from "./components/categoryTable";

export default {
  name: "CategoryManage",
  components: { categoryTable },
  data() {
    return {
      categories: [],
      columns: [
        {
          text: "分类名称",
          value: "name",
          width: 200
        },
        {
          text: "ID",
          value: "id"
        },
        {
          text: "父ID",
          value: "pid"
        },
        {
          text: "排序等级",
          value: "sort"
        },
        {
          text: "是否为父节点",
          value: "isParent"
        }
      ],
      filters: {}
    };
  },
  methods: {
       // 获取用户列表
    getCategories() {
      getCategoriesPage().then((res) => {
        this.categories = res
      }).catch()
    },
  },
  created (){
      this.getCategories()
  }
};
</script>
<style scoped>
</style>
