<template>
  <section class="app-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item>
          <el-input  v-model="filters.id" placeholder="ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.name" placeholder="分类名称"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getCategories">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      </el-form>
    </el-col>
    <!-- <el-button type="success" round @click="handleBack()">返回</el-button> -->
    <!--列表-->
    <el-table
      :data="categories"
      :default-sort="{prop: 'id', order: 'descending'}"
      @sort-change="handleSortChange"
      stripe
      highlight-current-row
      @selection-change="selsChange"
      style="min-width: 100%;"
      v-loading="loading"
    >
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column sortable="custom" prop="id" label="ID"></el-table-column>
      <el-table-column prop="name" label="分类名称" ></el-table-column>
      <el-table-column prop="menuId" label="菜单名称" :formatter="menuFormatter"></el-table-column>
      <el-table-column sortable="custom" prop="create_time" label="更新时间" width="120"></el-table-column>
      <el-table-column sortable="custom" prop="update_time" label="更新时间" width="120"></el-table-column>
      <el-table-column label="操作" width="350">
        <template slot-scope="scope">
          <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--工具条-->
    <el-col :span="24" class="toolbar">
      <el-pagination
        layout="total,prev, pager, next, jumper"
        @current-change="handleCurrentChange"
        :total="this.total"
        :page-size="10"
        style="float:right;"
      ></el-pagination>
    </el-col>

    <!--编辑界面-->
    <el-dialog
      :title="textMap[dialogStatus]"
      :visible.sync="dialogFormVisible"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="80px" :rules="editFormRules" ref="editForm">
        <el-form-item v-if="false" label="ID" prop="id">
          <el-input v-model="editForm.id" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item v-if="false" label="ID" prop="id">
          <el-input v-model="editForm.menuId" auto-complete="off"></el-input>
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="editForm.name" auto-complete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click.native="dialogFormVisible=false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">添加</el-button>
        <el-button v-else type="primary" @click="updateData">修改</el-button>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import {
  removeMenuFoodCat,
  batchRemoveMenuFoodCat,
  editMenuCategory,
  addMenuCategory,
  getMenuCategoryPage
} from "@/api/dishMenu";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

export default {
  name: "MenuCatManage",
  data() {
    return {
      menuName: this.$route.params.name,
      menuId:this.$route.params.id,
      restaurants: [],
      loading: true,
      options: [], // 级联选择器结果
      childrens: [], //所有的子节点
      selectedOptions: [], // 用户 edit时，回显的数据
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogFormVisible: false,
      filters: {
        id: null,
        name: "",
        menuId: this.menuId
      },
      key: "",
      categories: [],
      total: 0,
      totalPage: 0,
      page: 1,
      sortBy: "",
      desc: false,
      sels: [], // 列表选中列
      editFormRules: {},
      // 编辑界面数据
      editForm: {
        id: 0,
        name: "",
        menuId : this.menuId
      },

      addFormVisible: false, // 新增界面是否显示
      addFormRules: {},
      dialogImageUrl: "",
      dialogVisible: false,
      productImgs: [], // 文件列表
      isMultiple: true,
      imgLimit: 1, // 上传文件数量
      dialogStatus: "",
      selectedTag: {}
    };
  },
  methods: {
    selectResturant(restaurantId) {
      this.filters.restaurantId = restaurantId;
      this.getCategories();
    },
    filterStatus(value, row) {
      return row.status === value;
    },
    menuFormatter(row, column) {
      return this.menuName;
    },
    handleRemove(file, fileList) {
      //移除图片
      console.log(file, fileList);
    },
    handlePictureCardPreview(file) {
      //预览图片时调用
      console.log(file);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    beforeAvatarUpload(file) {
      //文件上传之前调用做一些拦截限制
      console.log(file);
      const isJPG = true;
      // const isJPG = file.type === 'image/jpeg';
      const isLt2M = file.size / 1024 / 1024 < 2;

      // if (!isJPG) {
      //   this.$message.error('上传头像图片只能是 JPG 格式!');
      // }
      if (!isLt2M) {
        this.$message.error("上传图片大小不能超过 2MB!");
      }
      return isJPG && isLt2M;
    },
    handleAvatarSuccess(res, file) {
      //图片上传成功
      this.editForm.pic = res;
    },
    handleExceed(files, fileList) {
      //图片上传超过数量限制
      this.$message.error("上传图片不能超过1张!");
      console.log(file, fileList);
    },
    imgUploadError(err, file, fileList) {
      //图片上传失败调用
      console.log(err);
      this.$message.error("上传图片失败!");
    },
    // 性别显示转换
    formatSex: function(row, column) {
      return row.sex === 1 ? "男" : row.sex === 0 ? "女" : "未知";
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getCategories();
    },
    // 处理filters的数据
    checkObj(para) {
      this.filters.menuId = this.menuId
      para.key = JSON.stringify(this.filters);
      getMenuCategoryPage(para)
        .then(res => {
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.categories = res.items;
          this.loading = false;
          this.filters = {}
        })
        .catch();
    },
    // 获取用户列表
    getCategories() {
      const para = {
        key: this.filters,
        page: this.page,
        sortBy: this.sortBy,
        desc: this.desc
      };
      this.checkObj(para);
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          removeMenuFoodCat(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getCategories();
          });
        })
        .catch(() => {});
    },
    // 显示编辑界面
    handleEdit(index, row) {
      this.dialogStatus = "update";
      this.dialogFormVisible = true;
      this.editForm = Object.assign({}, row);
    },
    // 显示新增界面
    handleAdd() {
      this.dialogStatus = "create";
      this.dialogFormVisible = true;
      this.editForm = {
        id: 0,
        name: "",
        menuId : this.menuId
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              const para = Object.assign({}, this.editForm);
              editMenuCategory(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectedOptions = [];
                this.getCategories();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 新增
    createData: function() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              const para = Object.assign({}, this.editForm);
              console.log(para);
              addMenuCategory(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.getCategories();
              });
            })
            .catch(e => {
              // 打印一下错误
              console.log(e);
            });
        }
      });
    },
    // 全选单选多选
    selsChange(sels) {
      this.sels = sels;
    },
    // 批量删除
    batchRemove() {
      var ids = this.sels.map(item => item.id).toString();
      this.$confirm("确认删除选中记录吗(会删除该分类下所有的菜品)？", "提示", {
        type: "warning"
      })
        .then(() => {
          const para = { ids: ids };
          batchRemoveMenuFoodCat(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getCategories();
          });
        })
        .catch(() => {});
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order === "ascending";
      this.getCategories();
    }
  },
  created: function () {
   
    },
  mounted() {
     this.getCategories();
  }
};
</script>
<style scoped>
.el-dropdown {
  vertical-align: top;
}
.el-dropdown + .el-dropdown {
  margin-left: 15px;
}
.el-icon-arrow-down {
  font-size: 12px;
}
</style>
