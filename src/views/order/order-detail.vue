<template>
  <section class="app-container">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" @submit.native.prevent>
        <el-form-item>
          <el-input v-model="filters.id" placeholder="ID"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="filters.name" placeholder="菜品名称"></el-input>
        </el-form-item>
        <el-form-item>售价
          <el-input-number v-model="filters.salePrice" :step="5" :precision="2" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" v-on:click="getDetails">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </el-form-item>
        <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
      </el-form>
    </el-col>
    <!--列表-->
    <el-table
      :data="details"
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
      <el-table-column prop="orderId" label="订单Id" :formatter="orderFormatter"></el-table-column>
      <el-table-column prop="foodId" label="菜品Id"></el-table-column>
      <el-table-column prop="name" label="菜品名称"></el-table-column>
      <el-table-column prop="price" label="菜单价格"></el-table-column>
      <el-table-column prop="amount" label="菜单数量"></el-table-column>
      <el-table-column prop="discount" label="折扣"></el-table-column>
      <el-table-column prop="salePrice" label="优惠价格"></el-table-column>
      <el-table-column label="操作" width="150">
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
        <el-form-item label="ID" prop="id">
          <el-input v-model="editForm.id" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="订单Id" prop="id">
          <el-input v-model="editForm.orderId" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="菜单选择" prop="menuId">
          <el-select v-model="selectMenu" clearable filterable placeholder="请选择菜单">
            <el-option
              :loading="loading"
              v-for="item in menus"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类选择" prop="mCid">
          <el-select
            v-model="selectCat"
            :disabled="catShow"
            clearable
            filterable
            placeholder="请选择分类"
          >
            <el-option
              :loading="loading"
              v-for="item in cats"
              :key="item.id"
              :label="item.label"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜品选择" prop="foodId">
          <el-select
            v-model="selectFood"
            :disabled="foodShow"
            clearable
            filterable
            placeholder="请选择菜品"
          >
            <el-option
              :loading="loading"
              v-for="item in mfoods"
              :key="item.id"
              :label="item.showName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="菜品Id" prop="id">
          <el-input v-model="editForm.foodId" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="editForm.name" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="单价" prop="price">
          <el-input-number v-model="editForm.price" :step="5" :precision="2" :min="0" :disabled="true"></el-input-number>
        </el-form-item>
        <el-form-item label="优惠价" prop="salePrice">
          <el-input-number v-model="editForm.salePrice" :step="5" :precision="2" :min="0" :disabled="true"></el-input-number>
        </el-form-item>
        <el-form-item label="数量" prop="amount">
          <el-input-number v-model="editForm.amount" :step="1" :precision="2" :min="0"></el-input-number>
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
  getOrderDetailPage,
  addOrderDetail,
  editOrderDetail,
  batchRemoveDetails,
  removeOrderDetail
} from "@/api/order";
import { getMenuNodes, getCatNodes, getMenuFoodNodes } from "@/api/dishMenu";
import QS from "qs";
import { Message, MessageBox } from "element-ui";

var token = `Bearer ${localStorage.JWT_TOKEN}`; // 要保证取到

export default {
  name: "OrderDetailManage",
  data() {
    return {
      catShow: true,
      foodShow: true,
      menus: [],
      cats: [],
      mfoods: [],
      selectMenu: null,
      selectCat: null,
      selectFood: null,
      myHeaders: { Authorization: token },
      orderId: this.$route.params.id,
      restaurantId: this.$route.params.restaurantId,
      loading: true,
      options: [], // 级联选择器结果
      childrens: [], //所有的子节点
      textMap: {
        update: "Edit",
        create: "Create"
      },
      dialogFormVisible: false,
      filters: {
        id: null,
        name: "",
        orderId: this.orderId,
        salePrice: null
      },
      key: "",
      details: [],
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
        orderId: this.orderId,
        foodId: null,
        name: "",
        price: 0,
        amount: 0,
        discount: 0,
        salePrice: 0
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
    orderFormatter(row, column) {
      return this.orderId;
    },
    statusCheck(status) {
      if (status) {
        return "success";
      } else {
        return "danger";
      }
    },
    statusFormatter(scope, val) {
      if (val) {
        return "未使用";
      } else {
        return "使用中";
      }
    },
    filterStatus(value, row) {
      return row.status === value;
    },
    restaurantFormatter(row, column) {
      return this.restaurantName;
    },
    roomFormatter(row, column) {
      return this.roomName;
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
      this.editForm.qrCode = res;
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
      this.getDetails();
    },
    // 处理filters的数据
    checkObj(para) {
      this.filters.orderId = this.orderId;
      para.key = JSON.stringify(this.filters);
      getOrderDetailPage(para)
        .then(res => {
          this.total = res.total;
          this.totalPage = res.totalPage;
          this.details = res.items;
          this.loading = false;
          this.filters = {};
        })
        .catch();
    },
    // 获取用户列表
    getDetails() {
      const para = {
        key: this.filters,
        page: this.page,
        sortBy: this.sortBy,
        desc: this.desc
      };
      this.checkObj(para);
    },
    // 获取菜单列表
    getMenus(restaurantId) {
      getMenuNodes(restaurantId).then(res => {
        this.menus = res;
      });
    },
    // 获取分类列表
    getCats(menuId) {
      getCatNodes(menuId).then(res => {
        this.cats = res;
        this.foodShow = false;
      });
    },
    // 获取菜品列表
    getFoods(mCid) {
      getMenuFoodNodes(mCid).then(res => {
        this.mfoods = res;
      });
    },
    // 删除
    handleDel(index, row) {
      this.$confirm("确认删除该记录吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          removeOrderDetail(row.id).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getDetails();
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
        orderId: this.orderId,
        foodId: null,
        name: "",
        price: 0,
        amount: 0,
        discount: 0,
        salePrice: 0
      };
    },
    // 编辑
    updateData() {
      this.$refs.editForm.validate(valid => {
        if (valid) {
          this.$confirm("确认提交吗？", "提示", {})
            .then(() => {
              const para = Object.assign({}, this.editForm);
              editOrderDetail(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectMenu = null;
                this.selectCat = null;
                this.selectFood = null;
                this.catShow = false;
                this.foodShow = false;
                this.getDetails();
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
              addOrderDetail(para).then(res => {
                this.$message({
                  message: "提交成功",
                  type: "success"
                });
                this.$refs["editForm"].resetFields();
                this.dialogFormVisible = false;
                this.selectMenu = null;
                this.selectCat = null;
                this.selectFood = null;
                this.catShow = false;
                this.foodShow = false;
                this.getDetails();
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
          batchRemoveDetails(para).then(res => {
            this.$message({
              message: "删除成功",
              type: "success"
            });
            this.getDetails();
          });
        })
        .catch(() => {});
    },
    // 排序
    handleSortChange(column) {
      this.sortBy = column.prop;
      this.desc = column.order === "ascending";
      this.getDetails();
    }
  },
  created: function() {},
  mounted() {
    this.getDetails();
    this.getMenus(this.restaurantId);
  },
  watch: {
    selectMenu: function(val) {
      if (val !== null) {
        this.catShow = false;
        this.getCats(val);
      }
    },
    selectCat: function(val) {
      if (val != null) {
        this.getFoods(val);
      }
    },
    selectFood: function(val) {
      if (val != null) {
        this.editForm.foodId = val;
        let foods = this.mfoods;
        for (var j = 0, len = foods.length; j < len; j++) {
          if (foods[j].id === val) {
            this.editForm.price = foods[j].price;
            this.editForm.discount = foods[j].discount;
            this.editForm.name = foods[j].showName;
            this.editForm.salePrice =
              (foods[j].price * foods[j].discount) / 100;
          }
        }
      }
    }
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
